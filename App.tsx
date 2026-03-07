import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import {COLORS} from './src/theme/colors';
import {ToastRoot} from './src/components/Toast';

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.brandDark} />
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      {/* Renders above everything — absolute positioned, zIndex 9999 */}
      <ToastRoot />
    </SafeAreaProvider>
  );
}

export default App;
