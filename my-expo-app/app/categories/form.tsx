import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Formik } from 'formik';
import * as Yup from 'yup';
import * as ImagePicker from 'expo-image-picker';
import { useGetCategoryQuery, useCreateCategoryMutation, useEditCategoryMutation } from '../../api/categoryApi';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from '../../constants/urls';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("Назва обов'язкова")
    .min(2, "Назва має містити щонайменше 2 символи")
    .matches(/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ\s-]+$/, "Назва може містити лише літери, пробіли та дефіси"),
  description: Yup.string()
    .required("Опис обов'язковий"),
});

export default function CategoryFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isEditing = !!id;
  const { data: category, isLoading: isCategoryLoading } = useGetCategoryQuery(Number(id), {
    skip: !isEditing,
  });
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [editCategory, { isLoading: isEditingLoading }] = useEditCategoryMutation();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Помилка', 'Потрібен дозвіл для доступу до галереї!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      setImageUri(result.assets[0].uri);
    }
  };

  if (isEditing && isCategoryLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Завантаження...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <Icon name="arrow-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>
            {isEditing ? 'Редагувати категорію' : 'Створити категорію'}
          </Text>
          <View style={{ width: 48 }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.form}>
          <Formik
            initialValues={{
              name: isEditing ? category?.name || '' : '',
              description: isEditing ? category?.description || '' : '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                formData.append('name', values.name);
                formData.append('description', values.description);
                if (isEditing) {
                  formData.append('id', id as string);
                }
                if (imageUri) {
                  formData.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'category.jpg',
                  } as any);
                }

                if (isEditing) {
                  await editCategory(formData).unwrap();
                } else {
                  await createCategory(formData).unwrap();
                }

                Alert.alert('Успіх', `Категорію ${isEditing ? 'оновлено' : 'створено'}!`);
                router.back();
              } catch (err: any) {
                console.error('Category error:', err);
                Alert.alert(
                  'Помилка',
                  err.data?.error || `Не вдалося ${isEditing ? 'оновити' : 'створити'} категорію.`
                );
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
              }) => (
              <View>
                <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
                  {imageUri || (isEditing && category?.image) ? (
                    <Image
                      source={{
                        uri: imageUri || (category?.image && IMAGE_URL !== '' ? IMAGE_URL + '200_' + category.image : ''),
                      }}
                      style={styles.image}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Icon name="add-a-photo" size={40} color={theme.colors.secondaryText} />
                      <Text style={styles.imageText}>Додати фото</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Icon name="category" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Назва"
                    placeholderTextColor={theme.colors.placeholder}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    value={values.name}
                  />
                </View>
                {touched.name && errors.name && (
                  <Text style={styles.error}>{errors.name}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon name="description" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    placeholder="Опис"
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

                <TouchableOpacity
                  style={[styles.button, (!isValid || isCreating || isEditingLoading) && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isCreating || isEditingLoading}
                >
                  {(isCreating || isEditingLoading) ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>
                      {isEditing ? 'Зберегти зміни' : 'Створити'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}