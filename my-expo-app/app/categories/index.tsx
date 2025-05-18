import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useGetCategoriesQuery, useDeleteCategoryMutation } from '../../api/categoryApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from '../../constants/urls';

export default function CategoriesScreen() {
  const router = useRouter();
  const userEmail = useSelector((state: RootState) => state.auth.user?.email || 'unknown');
  const token = useSelector((state: RootState) => state.auth.token);
  const { data: categories, isLoading, error } = useGetCategoriesQuery(userEmail);
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  console.log('Auth token:', token);
  console.log('User email:', userEmail);
  if (categories) {
    console.log('Categories:', JSON.stringify(categories, null, 2));
  }

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      'Видалити категорію',
      `Ви впевнені, що хочете видалити "${name}"?`,
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(id).unwrap();
              Alert.alert('Успіх', 'Категорію видалено!');
            } catch (err: any) {
              console.error('Delete category error:', JSON.stringify(err, null, 2));
              Alert.alert('Помилка', err.data?.error || 'Не вдалося видалити категорію.');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToDishes = (categoryId: number) => {
      console.log(`Navigating to dishes for category ${categoryId}`);
      router.push(`/dishes?categoryId=${categoryId}`);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Завантаження...</Text>
      </View>
    );
  }

  if (error) {
    console.error('Loading categories error:', JSON.stringify(error, null, 2));
    return (
      <View style={styles.container}>
        <Text style={styles.title}>
          Помилка: {(error as any)?.data?.error || `Сервер повернув ${JSON.stringify(error)}`}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <Text style={styles.title}>Мої категорії</Text>
        <TouchableOpacity
          onPress={() => router.push('/categories/form')}
          style={{ padding: 10 }}
        >
          <Icon name="add" size={28} color={theme.colors.primary} />
        </TouchableOpacity>
      </Animated.View>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
            <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.card}>
                <TouchableOpacity
                    style={styles.card}
                    onPress={() => handleNavigateToDishes(item.id)}
                    disabled={isDeleting}
                >
                    {item.image && (
                        <Image
                            source={{ uri: IMAGE_URL + '200_' + item.image }}
                            style={styles.cardImage}
                        />
                    )}
                    <View style={styles.cardContent}>
                        <Text style={styles.cardTitle}>{item.name}</Text>
                        <Text style={styles.cardDescription}>{item.description || 'Без опису'}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity
                            onPress={() => router.push(`/categories/form?id=${item.id}`)}
                            style={{ padding: 10 }}
                            disabled={isDeleting}
                        >
                            <Icon name="edit" size={24} color={theme.colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDelete(item.id, item.name)}
                            style={{ padding: 10 }}
                            disabled={isDeleting}
                        >
                            <Icon name="delete" size={24} color={theme.colors.error} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
          </Animated.View>
        )}
        ListEmptyComponent={
          <Text style={styles.subtitle}>Категорій ще немає. Створіть першу!</Text>
        }
      />
    </View>
  );
}