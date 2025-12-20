import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import HistoryScreen from '../screens/HistoryScreen';

export type TabParamList = {
  History: undefined;
  Info: undefined;
  Blogs: undefined;
  Items: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const InfoScreen = () => (
  <View style={styles.center}>
    <Text>Info content</Text>
  </View>
);

const BlogsScreen = () => (
  <View style={styles.center}>
    <Text>Blogs content</Text>
  </View>
);

const ItemsScreen = () => (
  <View style={styles.center}>
    <Text>Items content</Text>
  </View>
);

export default function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'purple',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Info"
        component={InfoScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="information-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Blogs"
        component={BlogsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Items"
        component={ItemsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
