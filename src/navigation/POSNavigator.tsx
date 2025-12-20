import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import POSLoginScreen from '../screens/POSLoginScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import DashboardDrawer from './DashboardDrawer';
import MenuScreen from '../screens/MenuScreen';
import CartScreen from '../screens/CartScreen';
import KOTScreen from '../screens/KOTScreen';
import BillScreen from '../screens/BillScreen';

export type POSStackParamList = {
  POSLogin: undefined;
  Welcome: undefined;
  Dashboard: undefined;
  Menu: { table: any };
  Cart: { table: any };
  KOT: { table: any };
  Bill: { table: any };
};

const Stack = createStackNavigator<POSStackParamList>();

const POSNavigator = () => {
  return (
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
    </Stack.Navigator>
  );
};

export default POSNavigator;
