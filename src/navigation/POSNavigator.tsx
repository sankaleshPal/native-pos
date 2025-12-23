import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import POSLoginScreen from '../screens/POSLoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import DashboardDrawer from './DashboardDrawer';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import KOTScreen from '../screens/KOTScreen';
import BillScreen from '../screens/BillScreen';
import OrdersScreen from '../screens/OrdersScreen';
import GlobalOrderAlert from '../components/GlobalOrderAlert';
import { useDummyOrderGenerator } from '../hooks/useDummyOrderGenerator';
import { View } from 'react-native';

import CreateNotificationScreen from '../screens/CreateNotificationScreen';

export type POSStackParamList = {
  POSLogin: undefined;
  Welcome: undefined;
  Dashboard: undefined;
  Menu: { table: any };
  Cart: { table: any };
  KOT: { table: any };
  Bill: { table: any };
  Orders: undefined;
  CreateNotification: undefined;
};

const Stack = createStackNavigator<POSStackParamList>();

const POSNavigator = () => {
  useDummyOrderGenerator();

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="POSLogin">
          {({ navigation }) => (
            <POSLoginScreen
              onLoginSuccess={() => navigation.replace('Welcome')}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Welcome">
          {({ navigation }) => (
            <WelcomeScreen onComplete={() => navigation.replace('Dashboard')} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Dashboard" component={DashboardDrawer} />
        <Stack.Screen name="Menu" component={MenuScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="KOT" component={KOTScreen} />
        <Stack.Screen name="Bill" component={BillScreen} />
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen
          name="CreateNotification"
          component={CreateNotificationScreen}
        />
      </Stack.Navigator>
      <GlobalOrderAlert />
    </View>
  );
};

export default POSNavigator;
