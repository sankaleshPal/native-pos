import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryProvider } from './src/providers/QueryProvider';

export default function App() {
  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
      </GestureHandlerRootView>
    </QueryProvider>
  );
}
