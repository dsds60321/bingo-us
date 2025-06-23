import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';

interface CustomScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export function CustomScrollView({ children, ...props }: CustomScrollViewProps) {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingBottom: 120, // 🎯 하단 탭을 위한 패딩 추가
        ...props.contentContainerStyle,
      }}
      {...props}
    >
      {children}
    </ScrollView>
  );
}
