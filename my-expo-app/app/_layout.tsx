import {Stack} from "expo-router";
import { store } from '../store';
import { Provider } from 'react-redux';

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" options={{ title: "Увійти" }} />
        <Stack.Screen name="index" options={{ title: "Головна" }} />
        <Stack.Screen name="auth/register" options={{ title: "Реєстрація" }} />
        <Stack.Screen name="details" options={{ title: "Деталі" }} />
        <Stack.Screen name="profile/index" options={{ title: "Профіль" }} />
        <Stack.Screen name="profile/settings" options={{ title: "Налаштування" }} />
        <Stack.Screen name="categories/index" options={{ title: 'Категорії' }} />
        <Stack.Screen name="categories/form" options={{ title: 'Форма категорій' }} />
      </Stack>
    </Provider>
  );
}