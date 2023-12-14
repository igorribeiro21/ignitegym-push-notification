import { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { NativeBaseProvider } from 'native-base';
import { useFonts, Roboto_400Regular, Roboto_700Bold } from '@expo-google-fonts/roboto';

import { THEME } from './src/theme';
import { Loading } from '@components/Loading';
import { Routes } from '@routes/index';
import { AuthContextProvider } from '@contexts/AuthContext';
import { NotificationClickEvent, NotificationWillDisplayEvent, OneSignal } from 'react-native-onesignal';

OneSignal.initialize('61b8ef08-6989-4ebe-b129-904fb098b1b0');

export default function App() {
  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_700Bold
  });

  function unsubscribe() {
    OneSignal.Notifications.addEventListener('foregroundWillDisplay', (response: NotificationWillDisplayEvent) => {
      console.log('primeiro', response.notification);
    });

    OneSignal.Notifications.addEventListener('click', (response: NotificationClickEvent) => {
      console.log('segundo', response.notification);
    });
  }

  useEffect(() => {
    unsubscribe();
  }, []);

  return (
    <NativeBaseProvider theme={THEME}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      <AuthContextProvider>
        {fontsLoaded ? < Routes /> : <Loading />}
      </AuthContextProvider>
    </NativeBaseProvider>
  );
}
