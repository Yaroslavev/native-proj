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
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { styles, theme } from '../../themes/mainTheme';
import { IMAGE_URL } from '../../constants/urls';
import * as ImagePicker from 'expo-image-picker';
import { useUpdateProfileMutation } from '../../api/authApi';
import { Formik } from 'formik';
import * as Yup from 'yup';

const validationSchema = Yup.object().shape({
  firstname: Yup.string()
    .required("Ім'я обов'язкове")
    .min(2, "Ім'я має містити щонайменше 2 символи")
    .matches(/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ\s-]+$/, "Ім'я може містити лише літери"),
  lastname: Yup.string()
    .required("Прізвище обов'язкове")
    .min(2, "Прізвище має містити щонайменше 2 символи")
    .matches(/^[a-zA-Zа-яА-ЯґҐєЄіІїЇ\s-]+$/, "Прізвище може містити лише літери"),
  age: Yup.number()
    .typeError("Вік має бути числом")
    .min(18, "Вік має бути не менше 18")
    .max(120, "Вік має бути не більше 120")
    .required("Вік обов'язковий"),
  phoneNumber: Yup.string().matches(
    /^\+?\d{10,15}$/,
    "Номер телефону має містити від 10 до 15 цифр і може починатися з '+'"
  ),
});

export default function SettingsScreen() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(user?.image || null);

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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
            <Icon name="arrow-back" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Налаштування профілю</Text>
          <View style={{ width: 48 }} />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.avatarContainer}>
          <TouchableOpacity onPress={pickImage} disabled={isLoading}>
            <Image
              source={{ uri: imageUri || IMAGE_URL + '200_' + imageUrl }}
              style={styles.avatar}
            />
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: theme.colors.primary, borderRadius: 20, padding: 5 }}>
              <Icon name="edit" size={20} color={theme.colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.username}>{`${user.name}`.trim() || 'Користувач'}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(600).delay(200)} style={styles.form}>
          <Formik
            initialValues={{
              firstname: user?.name?.split(' ')[0] || '',
              lastname: user?.name?.split(' ').slice(1).join(' ') || '',
              age: user?.age || '',
              phoneNumber: user?.phoneNumber || '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                formData.append('firstname', values.firstname);
                formData.append('lastname', values.lastname);
                formData.append('email', user.email);
                formData.append('age', values.age);
                if (values.phoneNumber) {
                  formData.append('phoneNumber', values.phoneNumber);
                }
                if (imageUri) {
                  formData.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'avatar.jpg',
                  } as any);
                }

                await updateProfile(formData).unwrap();
                Alert.alert('Успіх', 'Профіль успішно оновлено!');
                router.back();
              } catch (err: any) {
                console.error('Update profile error:', err);
                Alert.alert(
                  'Помилка',
                  err.data?.errors
                    ? err.data.errors.join('\n')
                    : 'Не вдалося оновити профіль. Перевірте дані.'
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
                <View style={styles.inputContainer}>
                  <Icon name="person" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ім'я"
                    placeholderTextColor={theme.colors.placeholder}
                    onChangeText={handleChange('firstname')}
                    onBlur={handleBlur('firstname')}
                    value={values.firstname}
                  />
                </View>
                {touched.firstname && errors.firstname && (
                  <Text style={styles.error}>{errors.firstname}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon name="person" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Прізвище"
                    placeholderTextColor={theme.colors.placeholder}
                    onChangeText={handleChange('lastname')}
                    onBlur={handleBlur('lastname')}
                    value={values.lastname}
                  />
                </View>
                {touched.lastname && errors.lastname && (
                  <Text style={styles.error}>{errors.lastname}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon name="email" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <Text style={[styles.input, styles.centerTextField, { color: theme.colors.secondaryText }]}>
                    {user.email}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Icon name="calendar-today" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Вік"
                    placeholderTextColor={theme.colors.placeholder}
                    onChangeText={handleChange('age')}
                    onBlur={handleBlur('age')}
                    value={values.age}
                    keyboardType="numeric"
                  />
                </View>
                {touched.age && errors.age && (
                  <Text style={styles.error}>{errors.age}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon name="phone" size={24} color={theme.colors.secondaryText} style={styles.icon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Номер телефону (опціонально)"
                    placeholderTextColor={theme.colors.placeholder}
                    onChangeText={handleChange('phoneNumber')}
                    onBlur={handleBlur('phoneNumber')}
                    value={values.phoneNumber}
                    keyboardType="phone-pad"
                  />
                </View>
                {touched.phoneNumber && errors.phoneNumber && (
                  <Text style={styles.error}>{errors.phoneNumber}</Text>
                )}

                <TouchableOpacity
                  style={[styles.button, (!isValid || isLoading) && styles.buttonDisabled]}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Зберегти зміни</Text>
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