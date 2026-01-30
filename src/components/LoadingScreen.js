import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export const LoadingScreen = ({ color = '#0177E3' }) => {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={color} />
    </View>
  );
};
