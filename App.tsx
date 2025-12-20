import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import RootNavigator from './src/navigation/RootNavigator';
import { QueryProvider } from './src/providers/QueryProvider';
import { getDatabase } from './src/db/database';
import { seedLargeMenuData } from './src/db/seedLargeMenu';

export default function App(): React.JSX.Element {
  React.useEffect(() => {
    // Initialize database and seed data
    const initDB = async () => {
      getDatabase();
      await seedLargeMenuData();
    };
    initDB();
  }, []);

  return (
    <QueryProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <RootNavigator />
      </GestureHandlerRootView>
    </QueryProvider>
  );
}
