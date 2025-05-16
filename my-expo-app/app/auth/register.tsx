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
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRegisterMutation } from '../../api/authApi';
import { useRouter } from 'expo-router';
import { styles, theme } from '../../themes/mainTheme';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Невірний email').required('Email обов’язковий'),
  password: Yup.string()
    .min(8, 'Пароль має бути не менше 8 символів')
    .required('Пароль обов’язковий'),
  firstname: Yup.string().required('Ім’я обов’язкове'),
  lastname: Yup.string().required('Прізвище обов’язкове'),
  age: Yup.number()
    .typeError('Вік має бути числом')
    .min(18, 'Вік має бути не менше 18')
    .required('Вік обов’язковий'),
  phoneNumber: Yup.string().matches(
    /^\+?\d{10,15}$/,
    'Невірний номер телефону'
  ),
});

export default function RegisterScreen() {
  const [image, setImage] = useState<{ uri: string } | null>(null);
  const [register, { isLoading }] = useRegisterMutation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Потрібен дозвіл для доступу до галереї');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.form}>
          <Text style={styles.title}>Створіть акаунт</Text>
          <Text style={styles.subtitle}>Заповніть дані для реєстрації</Text>

          <Formik
            initialValues={{
              email: '',
              password: '',
              firstname: '',
              lastname: '',
              age: '',
              phoneNumber: '',
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                formData.append('email', values.email);
                formData.append('password', values.password);
                formData.append('firstname', values.firstname);
                formData.append('lastname', values.lastname);
                formData.append('age', values.age);
                if (values.phoneNumber) {
                  formData.append('phoneNumber', values.phoneNumber);
                }
                if (image) {
                  formData.append('image', {
                    uri: image.uri,
                    type: 'image/jpeg',
                    name: 'profile.jpeg',
                  } as any);
                }

                console.log('FormData:', formData);
                const response = await register(formData).unwrap();
                console.log('Response:', response);
                router.replace('/');
              } catch (err: any) {
                console.error('Registration failed:', JSON.stringify(err, null, 2));
                Alert.alert(
                  'Помилка',
                  err?.data?.error || 'Не вдалося зареєструватися'
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
                  {image ? (
                    <Image source={{ uri: image.uri }} style={styles.image} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Icon
                        name="add-a-photo"
                        size={40}
                        color={theme.colors.secondaryText}
                      />
                      <Text style={styles.imageText}>Додати фото</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.inputContainer}>
                  <Icon
                    name="email"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor={theme.colors.placeholder}
                    keyboardType="email-address"
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    value={values.email}
                    autoCapitalize="none"
                  />
                </View>
                {touched.email && errors.email && (
                  <Text style={styles.error}>{errors.email}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon
                    name="lock"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Пароль"
                    placeholderTextColor={theme.colors.placeholder}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    value={values.password}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 10 }}
                  >
                    <Icon
                      name={showPassword ? 'visibility-off' : 'visibility'}
                      size={24}
                      color={theme.colors.secondaryText}
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.error}>{errors.password}</Text>
                )}

                <View style={styles.inputContainer}>
                  <Icon
                    name="person"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ім’я"
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
                  <Icon
                    name="person"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
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
                  <Icon
                    name="calendar-today"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
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
                  <Icon
                    name="phone"
                    size={24}
                    color={theme.colors.secondaryText}
                    style={styles.icon}
                  />
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
                  style={[
                    styles.button,
                    (!isValid || isLoading) && styles.buttonDisabled,
                  ]}
                  onPress={() => handleSubmit()}
                  disabled={!isValid || isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color={theme.colors.white} />
                  ) : (
                    <Text style={styles.buttonText}>Зареєструватися</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginText}>Вже маєте акаунт? Увійдіть</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}