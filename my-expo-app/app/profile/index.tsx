import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { clearAuth } from '../../store/authSlice';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from '../../constants/urls';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Не авторизовано</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.buttonText}>Увійти</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
          <Icon name="arrow-back" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>Ваш профіль</Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.avatarContainer}>
        <Image
          source={{ uri: IMAGE_URL !== '' ? IMAGE_URL + '200_' + user.image : '' }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{user.name || 'Користувач'}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.infoCard}>
        <Text style={styles.infoLabel}>Email</Text>
        <Text style={styles.infoValue}>{user.email || 'Не вказано'}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.infoCard}>
        <Text style={styles.infoLabel}>Вік</Text>
        <Text style={styles.infoValue}>{user.age || 'Не вказано'}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(400)} style={styles.infoCard}>
        <Text style={styles.infoLabel}>Номер телефону</Text>
        <Text style={styles.infoValue}>{user.phoneNumber || 'Не вказано'}</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.card}>
        <Icon name="settings" size={32} color={theme.colors.primary} style={styles.cardIcon} />
        <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push('/profile/settings')}>
          <Text style={styles.cardTitle}>Налаштування</Text>
          <Text style={styles.cardSubtitle}>Змініть параметри профілю</Text>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(700)} style={styles.card}>
        <Icon name="logout" size={32} color={theme.colors.error} style={styles.cardIcon} />
        <TouchableOpacity
          style={{ flex: 1 }}
          onPress={() => {
            dispatch(clearAuth());
            router.replace('/auth/login');
          }}
        >
          <Text style={[styles.cardTitle, { color: theme.colors.error }]}>Вийти</Text>
          <Text style={styles.cardSubtitle}>Завершити сеанс</Text>
        </TouchableOpacity>
      </Animated.View>
    </ScrollView>
  );
}