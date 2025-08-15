import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate, UNUserNotificationCenterDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    
    // 🔥 Firebase 초기화 (가장 먼저!)
    FirebaseApp.configure()
    print("✅ Firebase 초기화 완료")
    
    // 🔥 Push 알림 delegate 설정
    UNUserNotificationCenter.current().delegate = self
    
    // 🔥 알림 권한 요청 및 APNS 등록 - 순서가 중요!
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
      print("📱 알림 권한 요청 결과: \(granted)")
      if granted {
        DispatchQueue.main.async {
          // 권한이 허용되면 APNS 등록
          application.registerForRemoteNotifications()
          print("📱 APNS 등록 요청 완료")
        }
      } else {
        print("❌ 알림 권한 거부됨")
      }
      if let error = error {
        print("❌ 알림 권한 요청 오류: \(error)")
      }
    }
    
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "bingoUs",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
  
  // 🔥 APNS 토큰 등록 성공 - 가장 중요!
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    let tokenString = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    print("🎉 APNS 토큰 등록 성공!")
    print("📱 APNS 토큰: \(tokenString)")
    
    // 🔥 Firebase Messaging에 APNS 토큰 설정
    Messaging.messaging().apnsToken = deviceToken
    
    // 🔥 환경별 토큰 타입 설정
    #if DEBUG
    Messaging.messaging().setAPNSToken(deviceToken, type: .sandbox)
    print("📱 APNS 토큰을 Sandbox 모드로 Firebase에 설정 완료")
    #else
    Messaging.messaging().setAPNSToken(deviceToken, type: .prod)
    print("📱 APNS 토큰을 Production 모드로 Firebase에 설정 완료")
    #endif
    
    // 🔥 FCM 토큰 요청 트리거 (중요!)
    Messaging.messaging().token { token, error in
      if let error = error {
        print("❌ FCM 토큰 가져오기 실패: \(error)")
      } else if let token = token {
        print("🎉 FCM 토큰 생성 성공: \(token)")
      }
    }
  }
  
  // 🔥 APNS 토큰 등록 실패 시 디버깅
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("❌ APNS 토큰 등록 실패: \(error.localizedDescription)")
    print("❌ 상세 오류: \(error)")
  }
  
  // MARK: - UNUserNotificationCenterDelegate
  
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    willPresent notification: UNNotification,
    withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
  ) {
    print("📨 포그라운드 알림 수신: \(notification.request.content.userInfo)")
    
    if #available(iOS 14.0, *) {
      completionHandler([.banner, .list, .sound, .badge])
    } else {
      completionHandler([.alert, .sound, .badge])
    }
  }
  
  func userNotificationCenter(
    _ center: UNUserNotificationCenter,
    didReceive response: UNNotificationResponse,
    withCompletionHandler completionHandler: @escaping () -> Void
  ) {
    print("📨 알림 탭: \(response.notification.request.content.userInfo)")
    completionHandler()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
