import React, { useState, useEffect, useCallback } from 'react';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import SplashScreenVideo from './src/screens/SplashScreen';
import HomeScreen from './src/screens/HomeScreen';

// منع إخفاء السبلاش تلقائيًا
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // هنا حط أي تحميلات (fonts, images, etc.)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      // نخفي الـ splash الأصلية فورًا بدون تأخير
      setTimeout(async () => {
        await SplashScreen.hideAsync();
      }, 100);
    }
  }, [appIsReady]);

  const handleFinishSplash = () => {
    setShowVideo(false);
  };

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      {showVideo ? (
        <SplashScreenVideo onFinish={handleFinishSplash} />
      ) : (
        <HomeScreen />
      )}
    </View>
  );
}