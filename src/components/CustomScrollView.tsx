import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

interface CustomScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export const CustomScrollView: React.FC<CustomScrollViewProps> = ({
                                                                    children,
                                                                    contentContainerStyle,
                                                                    ...props
                                                                  }) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        {
          paddingBottom: 120, // 하단 탭을 위한 패딩 추가
          flexGrow: 1,
        },
        contentContainerStyle,
      ]}
      {...props}
    >
      {children}
    </ScrollView>
  );
};

// 기본 export도 추가
export default CustomScrollView;
