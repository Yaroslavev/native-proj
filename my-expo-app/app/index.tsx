import React from 'react';
import {
  Text,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { styles, styles as themeStyles, theme } from '../themes/mainTheme';

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      id: '1',
      title: 'Ваш профіль',
      subtitle: 'Перегляньте та оновіть дані',
      icon: 'person',
      route: '/profile',
    },
    {
      id: '2',
      title: 'Категорії',
      subtitle: 'Перегляньте свої категорії',
      icon: 'info',
      route: '/categories',
    },
    {
      id: '3',
      title: 'Налаштування',
      subtitle: 'Персоналізуйте свій профіль',
      icon: 'settings',
      route: '/profile/settings',
    },
  ];

  return (
    <ScrollView contentContainerStyle={themeStyles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={themeStyles.title}>Ласкаво просимо!</Text>
        <TouchableOpacity
          onPress={() => router.push('/profile')}
          style={{ padding: 10 }}
        >
          <Icon name="person" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View entering={FadeInDown.duration(600).delay(100)}>
        <Text style={themeStyles.subtitle}>Що ви хочете зробити?</Text>
      </Animated.View>

      {features.map((feature, index) => (
        <Animated.View
          key={feature.id}
          entering={FadeInDown.duration(500).delay(200 + index * 100)}
          style={styles.card}
        >
          <Icon
            name={feature.icon}
            size={32}
            color={theme.colors.primary}
            style={styles.cardIcon}
          />
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() => router.push(feature.route)}
          >
            <Text style={styles.cardTitle}>{feature.title}</Text>
            <Text style={styles.cardSubtitle}>{feature.subtitle}</Text>
          </TouchableOpacity>
        </Animated.View>
      ))}
    </ScrollView>
  );
}