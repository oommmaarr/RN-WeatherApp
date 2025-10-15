// App.js
import React, { useState, useEffect } from 'react';
import * as Splash from 'expo-splash-screen';
import SplashScreen from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';

// نمنع السبلاتش الأصلية من الظهور تلقائيًا
Splash.preventAutoHideAsync();

export default function App() {
  const [appReady, setAppReady] = useState(false);

  // الدالة اللي بتشتغل بعد ما فيديو السبلاتش يخلص
  const handleFinishSplash = async () => {
    setAppReady(true);
    await Splash.hideAsync(); // نخفي السبلاتش الأصلية بتاعت Expo
  };

  useEffect(() => {
    const prepare = async () => {
      await Splash.preventAutoHideAsync(); // نأكد إن السبلاتش مش هتظهر تلقائيًا
    };
    prepare();
  }, []);

  // لو التطبيق لسه في وضع السبلاتش
  if (!appReady) {
    return <SplashScreen onFinish={handleFinishSplash} />;
  }

  // بعد ما الفيديو يخلص
  return <HomeScreen />;
}
