import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { backgroundMessageHandler } from './src/services/NotificationService';

// Register background handler
messaging().setBackgroundMessageHandler(backgroundMessageHandler);

// Ensure the main App component is registered correctly for the app entry point
AppRegistry.registerComponent(appName, () => App);
