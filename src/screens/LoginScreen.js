import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { signIn } from '../services/authService';
import { colors } from '../styles/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = createStyles();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);

    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Logo */}
        <View style={styles.headerSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🏎️</Text>
          </View>
          <Text style={styles.brandName}>Automotive Club</Text>
          <Text style={styles.tagline}>Members Portal</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Sign in to your account</Text>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>✉️</Text>
              <TextInput
                style={styles.input}
                placeholder="user@gmail.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputIcon}>🔐</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>Don't have an account?</Text>
            <View style={styles.divider} />
          </View>

          {/* Sign Up Link */}
          <TouchableOpacity 
            style={styles.signupButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AGU Automotive Club</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = () =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.darkBg,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 40,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 56,
    },
    logoContainer: {
      width: 104,
      height: 104,
      borderRadius: 28,
      backgroundColor: 'rgba(211, 47, 47, 0.05)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    logoEmoji: {
      fontSize: 52,
    },
    brandName: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
      marginBottom: 4,
    },
    clubName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accentLight,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    formContainer: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    formSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 24,
    },
    inputWrapper: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      overflow: 'hidden',
    },
    inputIcon: {
      fontSize: 20,
      marginRight: 16,
    },
    input: {
      flex: 1,
      paddingVertical: 18,
      fontSize: 15,
      color: colors.text,
      fontWeight: '400',
    },
    loginButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 32,
      marginBottom: 28,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 6,
    },
    buttonDisabled: {
      backgroundColor: colors.slateGrey,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
      letterSpacing: 0,
    },
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 28,
    },
    divider: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: colors.textMuted,
      marginHorizontal: 16,
      fontWeight: '400',
    },
    signupButton: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    signupButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '500',
      letterSpacing: 0,
    },
    footer: {
      alignItems: 'center',
      marginTop: 32,
    },
    footerText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
  });
