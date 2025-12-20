import React from 'react';
import { View, StyleSheet } from 'react-native';
import HomeTabs from '../navigation/HomeTabs';

const HomeScreen = () => {
  return (
    <View style={styles.container}>
      <HomeTabs />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default HomeScreen;



