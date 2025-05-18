import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    FlatList,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import {
    useGetDishQuery,
    useCreateDishMutation,
    useEditDishMutation,
} from '../../api/dishApi';
import { useGetCategoriesQuery } from '../../api/categoryApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from "../../constants/urls";

const validationSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Назва обов’язкова')
        .matches(
            /^[a-zA-Zа-яА-ЯґҐєЄіІїЇ\s-]+$/u,
            'Назва може містити лише літери (латинські або українські), пробіли та дефіси'
        )
        .max(100, 'Назва не може бути довшою за 100 символів'),
    description: Yup.string().max(1000, 'Опис не може бути довшим за 1000 символів'),
    price: Yup.number()
        .required('Ціна обов’язкова')
        .min(0, 'Ціна не може бути від’ємною')
        .max(100000, 'Ціна не може перевищувати 100000'),
    categoryId: Yup.number()
        .required('Категорія обов’язкова')
        .min(1, 'Виберіть категорію'),
});

export default function DishFormScreen() {
    const router = useRouter();
    const { id, categoryId } = useLocalSearchParams();
    const isEditing = !!id;
    const userEmail = useSelector((state: RootState) => state.auth.user?.email || 'unknown');
    const [images, setImages] = useState<{ uri: string }[]>([]);

    const { data: dish, isLoading: isDishLoading } = useGetDishQuery(
        { id: Number(id), userEmail },
        { skip: !isEditing }
    );
    const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery(userEmail);
    const [createDish, { isLoading: isCreating }] = useCreateDishMutation();
    const [editDish, { isLoading: isEditingLoading }] = useEditDishMutation();

    useEffect(() => {
        if (dish?.images) {
            setImages(dish.images.map((uri) => ({ uri: IMAGE_URL + '400_' + uri })));
        }
    }, [dish]);

    const pickImages = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Потрібен дозвіл для доступу до галереї');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 1,
        });

        if (!result.canceled) {
            setImages((prev) => [
                ...prev,
                ...result.assets.map((asset) => ({ uri: asset.uri })),
            ]);
        }
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView contentContainerStyle={styles.container}>
                <Animated.View entering={FadeInDown.duration(500)} style={styles.form}>
                    <Text style={styles.title}>
                        {isEditing ? 'Редагувати страву' : 'Створити страву'}
                    </Text>

                    {(isDishLoading || isCategoriesLoading) ? (
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                    ) : (
                        <Formik
                            initialValues={{
                                name: dish?.name || '',
                                description: dish?.description || '',
                                price: dish?.price.toString() || '0',
                                categoryId: Number(categoryId) || dish?.categoryId || 0,
                            }}
                            validationSchema={validationSchema}
                            onSubmit={async (values, { setSubmitting }) => {
                                try {
                                    console.log('Submitted values:', values);
                                    const formData = new FormData();
                                    formData.append('name', values.name);
                                    formData.append('description', values.description);
                                    formData.append('price', values.price);
                                    formData.append('categoryId', values.categoryId.toString());
                                    if (isEditing) {
                                        formData.append('id', String(id));
                                    }
                                    images.forEach((image, index) => {
                                        formData.append('images', {
                                            uri: image.uri,
                                            type: 'image/jpeg',
                                            name: `image_${index}.jpeg`,
                                        } as any);
                                    });

                                    console.log('FormData:', Object.fromEntries(formData as any));

                                    if (isEditing) {
                                        await editDish(formData).unwrap();
                                        Alert.alert('Успіх', 'Страву оновлено!');
                                    } else {
                                        await createDish(formData).unwrap();
                                        Alert.alert('Успіх', 'Страву створено!');
                                    }
                                    router.back();
                                } catch (err: any) {
                                    console.error('Dish form error:', JSON.stringify(err, null, 2));
                                    Alert.alert('Помилка', err.data?.error || 'Не вдалося зберегти страву.');
                                } finally {
                                    setSubmitting(false);
                                }
                            }}
                        >
                            {({
                                  handleChange,
                                  handleBlur,
                                  handleSubmit,
                                  values,
                                  errors,
                                  touched,
                                  isValid,
                                  isSubmitting,
                                  setFieldValue,
                              }) => (
                                <View>
                                    <View style={styles.inputContainer}>
                                        <TouchableOpacity style={styles.imagePicker} onPress={pickImages}>
                                            <View style={[styles.imagePlaceholder, styles.topSmallMargin]}>
                                                <Icon
                                                    name="add-a-photo"
                                                    size={40}
                                                    color={theme.colors.secondaryText}
                                                />
                                                <Text style={styles.imageText}>Додати зображення</Text>
                                            </View>
                                        </TouchableOpacity>
                                        {images.length > 0 && (
                                            <FlatList
                                                horizontal
                                                data={images}
                                                keyExtractor={(_, index) => index.toString()}
                                                renderItem={({ item, index }) => (
                                                    <View style={styles.imagePreview}>
                                                        <Image source={{ uri: item.uri }} style={styles.image} />
                                                        <TouchableOpacity
                                                            style={styles.removeImage}
                                                            onPress={() => removeImage(index)}
                                                        >
                                                            <Icon name="close" size={20} color={theme.colors.white} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.inputContainer}>
                                        <Icon
                                            name="restaurant"
                                            size={24}
                                            color={theme.colors.secondaryText}
                                            style={styles.icon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Назва"
                                            placeholderTextColor={theme.colors.placeholder}
                                            onChangeText={handleChange('name')}
                                            onBlur={handleBlur('name')}
                                            value={values.name}
                                            autoCapitalize="sentences"
                                            textContentType="name"
                                        />
                                    </View>
                                    {touched.name && errors.name && (
                                        <Text style={styles.error}>{errors.name}</Text>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Icon
                                            name="description"
                                            size={24}
                                            color={theme.colors.secondaryText}
                                            style={styles.icon}
                                        />
                                        <TextInput
                                            style={[styles.input, { height: 100 }]}
                                            placeholder="Опис (опціонально)"
                                            placeholderTextColor={theme.colors.placeholder}
                                            onChangeText={handleChange('description')}
                                            onBlur={handleBlur('description')}
                                            value={values.description}
                                            multiline
                                        />
                                    </View>
                                    {touched.description && errors.description && (
                                        <Text style={styles.error}>{errors.description}</Text>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Icon
                                            name="attach-money"
                                            size={24}
                                            color={theme.colors.secondaryText}
                                            style={styles.icon}
                                        />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Ціна"
                                            placeholderTextColor={theme.colors.placeholder}
                                            onChangeText={handleChange('price')}
                                            onBlur={handleBlur('price')}
                                            value={values.price}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    {touched.price && errors.price && (
                                        <Text style={styles.error}>{errors.price}</Text>
                                    )}

                                    <View style={styles.inputContainer}>
                                        <Icon
                                            name="category"
                                            size={24}
                                            color={theme.colors.secondaryText}
                                            style={styles.icon}
                                        />
                                        <View style={styles.pickerContainer}>
                                            <Picker
                                                selectedValue={values.categoryId}
                                                onValueChange={(value) => setFieldValue('categoryId', value)}
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Виберіть категорію" value={0} />
                                                {categories?.map((category) => (
                                                    <Picker.Item
                                                        key={category.id}
                                                        label={category.name}
                                                        value={category.id}
                                                    />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                    {touched.categoryId && errors.categoryId && (
                                        <Text style={styles.error}>{errors.categoryId}</Text>
                                    )}

                                    <TouchableOpacity
                                        style={[styles.button, (!isValid || isSubmitting) && styles.buttonDisabled]}
                                        onPress={() => handleSubmit()}
                                        disabled={!isValid || isSubmitting}
                                    >
                                        {isSubmitting || isCreating || isEditingLoading ? (
                                            <ActivityIndicator color={theme.colors.white} />
                                        ) : (
                                            <Text style={styles.buttonText}>
                                                {isEditing ? 'Зберегти' : 'Створити'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            )}
                        </Formik>
                    )}
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}