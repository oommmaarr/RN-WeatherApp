import {
  Text,
  View,
  Image,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import '../../global.css';
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  CalendarDaysIcon,
} from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { fetchLocation, fetchWeather } from 'api/weather';
import { weatherImages } from '@/constants';

export default function HomeScreen() {
  const [showSearchBox, setShowSearchBox] = React.useState(false);
  const [locations, setLocation] = React.useState([]);
  const [weather, setWeather] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [localTime, setLocalTime] = React.useState('');

React.useEffect(() => {
  (async () => {
    setLoading(true);
    // طلب إذن الوصول للموقع
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission to access location was denied');
      // لو المستخدم رفض، نرجع للمدينة الافتراضية
      fetchWeather({ cityName: 'Cairo', days: 7 }).then((res) => {
        setWeather(res);
        setLoading(false);        
      });
      return;
    }

    // الحصول على الإحداثيات الحالية
    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    console.log('User Location:', latitude, longitude);

    // استدعاء API باستخدام الإحداثيات
    fetchWeather({ cityName: `${latitude},${longitude}`, days: 7 }).then((res) => {
      setWeather(res);
      setLoading(false);
    });
  })();
}, []);

  // 🕒 تحديث الوقت المحلي باستمرار
React.useEffect(() => {
  if (weather?.location?.localtime) {
    let apiTime = new Date(weather.location.localtime.replace(' ', 'T'));

    const updateTime = () => {
      // نضيف ثانية كل مرة بناءً على الوقت اللي جاي من الـ API
      apiTime.setSeconds(apiTime.getSeconds() + 1);
      const formatted = apiTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setLocalTime(formatted);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }
}, [weather]);

  // 🟢 البحث
  const handleSearch = (text) => {
    if (text.length > 2) {
      fetchLocation({ cityName: text }).then((res) => {
        console.log('search text', res);
        setLocation(res);
      });
    }
  };

  const handleTextDebounce = React.useCallback(debounce(handleSearch, 1200), []);

  // 🟢 اختيار مدينة
  const handleLocation = (loc) => {
    setLocation([]);
    setShowSearchBox(false);
    setLoading(true);
    fetchWeather({ cityName: loc?.name, days: 7 }).then((res) => {
      setWeather(res);
      setLoading(false);
    });
  };

  const { location, current } = weather;

  return (
    <View className="flex-1">
      <StatusBar style="light" />
      <Image
        blurRadius={20}
        source={require('@/assets/bg.jpg')}
        className="absolute w-full h-full"
      />
      <View className="absolute w-full h-full bg-black/30" />

      <SafeAreaView className="items-center justify-start flex-1">
        {/* 🔍 Search box */}
        <View
          className={`flex-row items-center justify-between overflow-hidden ${
            showSearchBox ? 'bg-black/30' : 'bg-transparent'
          } mt-[60px] h-[60px] w-[90%] rounded-full px-3`}>
          {showSearchBox && (
            <TextInput
              onChangeText={handleTextDebounce}
              placeholder="Search City"
              placeholderTextColor="#eee"
              className="flex-1 pl-3 text-lg font-semibold text-white"
            />
          )}
          <TouchableOpacity
            className="ml-auto rounded-full bg-white/30 p-2.5"
            onPress={() => setShowSearchBox(!showSearchBox)}>
            <MagnifyingGlassIcon size={22} color="white" />
          </TouchableOpacity>
        </View>

        {/* 📍 Location List */}
        {locations.length > 0 && showSearchBox ? (
          <View className="mt-5 w-[90%] rounded-2xl bg-white/60 p-3">
            {locations.map((loc, index) => {
              const showBorder = index !== locations.length - 1;
              const BorderClass = showBorder ? 'border-b border-white/20' : '';

              return (
                <TouchableOpacity
                  onPress={() => handleLocation(loc)}
                  key={index}
                  className={`mb-1 flex-row items-center gap-2 border-0 p-3 px-4 ${BorderClass}`}>
                  <MapPinIcon size={22} color="gray" />
                  <Text className="ml-2 text-xl text-black">
                    {loc?.name} , {loc?.region} , {loc?.country}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* ⏳ Loader */}
        {loading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#fff" />
            <Text className="mt-3 text-lg text-white">Loading weather...</Text>
          </View>
        ) : (
          <View className="flex justify-around flex-1 mx-4 mb-2">
            {/* 🏙️ Location */}
            <Text className="text-4xl font-bold text-center text-white">
              {location?.name},{' '}
              <Text className="text-2xl font-semibold text-gray-300">
                {location?.region}, {location?.country}
              </Text>
            </Text>

            {/* ☁️ Weather Icon */}
            <View className="flex-row justify-center">
              <Image
                source={
                  weatherImages[current?.condition?.text] ||
                  weatherImages['default']
                }
                className="h-72 w-72"
              />
            </View>

            {/* 🌡️ Temperature */}
            <View className="space-y-2">
              <Text className="ml-5 text-6xl font-bold text-center text-white">
                {current?.temp_c}
                {'\u00B0'}
              </Text>
              <Text className="mt-2 text-3xl font-semibold tracking-widest text-center text-gray-300">
                {current?.condition?.text}
              </Text>
            </View>

            {/* 💨💧🕒 Other Stats */}
            <View className="flex-row justify-between gap-6 mx-4 mb-5">
              <View className="flex-row items-center gap-x-2">
                <Image
                  source={require('@/assets/wind.png')}
                  className="h-9 w-9"
                />
                <Text className="text-xl font-semibold text-white">
                  {current?.wind_kph} km/h
                </Text>
              </View>

              <View className="flex-row items-center gap-x-2">
                <Image
                  source={require('@/assets/drop.png')}
                  className="h-9 w-9"
                />
                <Text className="text-xl font-semibold text-white">
                  {current?.humidity} %
                </Text>
              </View>

              <View className="flex-row items-center gap-x-2">
                <Image
                  source={require('@/assets/contrast.png')}
                  className="h-9 w-9"
                />
                <Text className="text-xl font-semibold text-white">
                  {localTime || 'Loading...'}
                </Text>
              </View>
            </View>

            {/* 📅 Daily Forecast */}
            <View className="flex-row mb-2 gap-y-3">
              <View className="flex-col">
                <View className="flex-row items-center justify-start mx-5 mb-5 gap-x-2">
                  <CalendarDaysIcon size={22} color="white" />
                  <Text className="mr-auto text-lg font-semibold text-white">
                    Daily Forecast
                  </Text>
                </View>

                <ScrollView
                  className="mt-1 mb-10"
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingHorizontal: 15 }}>
                  {weather?.forecast?.forecastday?.map((day, index) => {
                    let date = new Date(day.date);
                    let options = { weekday: 'long' };
                    let dayName = date.toLocaleDateString('en-US', options);
                    dayName = dayName.split(',')[0];
                    return (
                      <View
                        className="flex items-center justify-center w-24 py-3 mr-4 gap-y-1 rounded-3xl bg-white/30"
                        key={index}>
                        <Image
                          source={
                            weatherImages[day?.day?.condition?.text] ||
                            weatherImages['default']
                          }
                          className="w-12 h-12"
                        />
                        <Text className="text-white">{dayName}</Text>
                        <Text className="font-bold text-center text-white">
                          {day?.day?.avgtemp_c}
                          {'\u00B0'}
                        </Text>
                      </View>
                    );
                  })}
                </ScrollView>
              </View>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
