import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {ToastRoot} from './src/components/Toast';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      {/* Transparent — each screen manages its own StatusBar appearance */}
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      {/* Renders above everything — absolute positioned, zIndex 9999 */}
      <ToastRoot />
    </SafeAreaProvider>
  );
}

export default App;
