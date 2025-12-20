import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TablesScreen from '../screens/TablesScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ThemeSettingsScreen from '../screens/ThemeSettingsScreen';
import CustomDrawerContent from '../components/CustomDrawerContent';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type DashboardDrawerParamList = {
  Tables: undefined;
  Payment: undefined;
  ThemeSettings: undefined;
};

const Drawer = createDrawerNavigator<DashboardDrawerParamList>();

const DashboardDrawer = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#7C3AED',
        drawerInactiveTintColor: '#6B7280',
        drawerLabelStyle: {
          fontFamily: 'Ubuntu-Medium',
          fontSize: 16,
        },
      }}
    >
      <Drawer.Screen
        name="Tables"
        component={TablesScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Payment"
        component={HistoryScreen}
        options={{
          title: 'Payment History',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{
          title: 'Theme',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="color-palette-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

export default DashboardDrawer;
