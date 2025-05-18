import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGetDishesByCategoryQuery, useDeleteDishMutation } from '../../api/dishApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from '../../constants/urls';

export default function DishesScreen() {
    const router = useRouter();
    const { categoryId } = useLocalSearchParams();
    const userEmail = useSelector((state: RootState) => state.auth.user?.email || 'unknown');
    const { data: dishes, isLoading, error, refetch } = useGetDishesByCategoryQuery({
        categoryId: Number(categoryId),
        userEmail,
    });
    const [deleteDish, { isLoading: isDeleting }] = useDeleteDishMutation();

    console.log('User email:', userEmail);
    console.log('Category ID:', categoryId);
    if (dishes) {
        console.log('Dishes:', JSON.stringify(dishes, null, 2));
    }

    const handleDelete = (id: number, name: string) => {
        Alert.alert(
            'Видалити страву',
            `Ви впевнені, що хочете видалити "${name}"?`,
            [
                { text: 'Скасувати', style: 'cancel' },
                {
                    text: 'Видалити',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteDish(id).unwrap();
                            Alert.alert('Успіх', 'Страву видалено!');
                        } catch (err: any) {
                            console.error('Delete dish error:', JSON.stringify(err, null, 2));
                            Alert.alert('Помилка', err.data?.error || 'Не вдалося видалити страву.');
                        }
                    },
                },
            ]
        );
    };

    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Завантаження...</Text>
            </View>
        );
    }

    if (error) {
        console.error('Loading dishes error:', JSON.stringify(error, null, 2));
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Помилка завантаження страв</Text>
                <TouchableOpacity onPress={() => refetch()} style={styles.button}>
                    <Text style={styles.buttonText}>Оновити</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
                <Text style={styles.title}>Страви</Text>
                <TouchableOpacity
                    onPress={() => router.push(`/dishes/form?categoryId=${categoryId}`)}
                    style={{ padding: 10 }}
                >
                    <Icon name="add" size={28} color={theme.colors.primary} />
                </TouchableOpacity>
            </Animated.View>

            <FlatList
                data={dishes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.card}>
                        {item.images && item.images.length > 0 && (
                            <Image
                                source={{ uri: IMAGE_URL + '200_' + item.images[0] }}
                                style={styles.cardImage}
                            />
                        )}
                        <View style={styles.cardContent}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardDescription}>{item.description || 'Без опису'}</Text>
                            <Text style={styles.cardDescription}>{item.price.toFixed(2)} грн</Text>
                        </View>
                        <View style={styles.cardActions}>
                            <TouchableOpacity
                                onPress={() => router.push(`/dishes/form?id=${item.id}&categoryId=${item.categoryId}`)}
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
                    </Animated.View>
                )}
                ListEmptyComponent={
                    <Text style={styles.subtitle}>Страв ще немає. Створіть першу!</Text>
                }
            />
        </View>
    );
}