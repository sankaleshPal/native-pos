import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TouchableOpacity, Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import NetworkSmiley from '../components/NetworkSmiley';

export type HomeStackParamList = {
  Home: undefined;
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'Home',
          headerLeft: () => (
            <TouchableOpacity
              style={{ paddingHorizontal: 16 }}
              onPress={() => {
                const parent = navigation.getParent();
                // @ts-expect-error: openDrawer exists on DrawerNavigation
                parent?.openDrawer && parent.openDrawer();
              }}
            >
              <Text style={{ fontSize: 22 }}>☰</Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <NetworkSmiley />
          ),
        })}
      />
    </Stack.Navigator>
  );
}
