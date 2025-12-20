
import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Ensure the main App component is registered correctly for the app entry point
AppRegistry.registerComponent(appName, () => App);

