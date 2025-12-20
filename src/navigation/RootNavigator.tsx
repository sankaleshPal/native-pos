import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { usePOSStore } from '../store/posStore';
import POSNavigator from './POSNavigator';

export default function RootNavigator() {
  const isPOSAuthenticated = usePOSStore(state => state.isAuthenticated);
  return (
    <NavigationContainer>
      <POSNavigator />
    </NavigationContainer>
  );
}
