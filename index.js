/**
 * @format
 */
import 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📨 [Background Handler] 메시지 수신:', remoteMessage);

  if (remoteMessage.notification) {
    console.log('📢 [Background] 알림 제목:', remoteMessage.notification.title);
    console.log('📢 [Background] 알림 내용:', remoteMessage.notification.body);
  }

  if (remoteMessage.data) {
    console.log('📋 [Background] 알림 데이터:', remoteMessage.data);
  }
});


AppRegistry.registerComponent(appName, () => App);
