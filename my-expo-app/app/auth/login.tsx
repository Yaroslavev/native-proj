import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/MaterialIcons'
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '../../api/authApi';
import { styles, theme } from '../../themes/mainTheme';

const loginValidationSchema = Yup.object().shape({
  email: Yup.string().email('Невірний email').required('Email обов’язковий'),
  password: Yup.string()
    .min(8, 'Пароль має бути не менше 8 символів')
    .required('Пароль обов’язковий'),
});

export default function LoginScreen() {
  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.form}>
          <Text style={styles.title}>Увійдіть до акаунта</Text>
          <Text style={styles.subtitle}>Введіть свої дані для входу</Text>

          <Formik
            validationSchema={loginValidationSchema}
            initialValues={{ email: '', password: '' }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                const formData = new FormData();
                formData.append('email', values.email);
                formData.append('password', values.password);

                console.log('FormData:', formData);
                await login(formData).unwrap();
                router.replace('/');
              } catch (err: any) {
                console.error('Login failed:', JSON.stringify(err, null, 2));
                Alert.alert('Помилка', err?.data?.error || 'Не вдалося увійти');
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
                    <Text style={styles.buttonText}>Увійти</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Formik>

          <View style={styles.linkContainer}>
            <TouchableOpacity onPress={() => router.replace('/auth/register')}>
              <Text style={styles.linkTextSecondary}>
                Немає акаунта?{' '}
                <Text style={styles.linkHighlight}>Зареєструйтесь</Text>
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.replace('/auth/forgot')}
              style={{ marginTop: 10 }}
            >
              <Text style={styles.linkText}>Забули пароль?</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}