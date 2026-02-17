import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import { signUp } from '../services/authService';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const styles = createStyles();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!studentId.trim()) {
      Alert.alert('Error', 'Please enter your student ID');
      return;
    }

    if (!email.trim() || !validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Password is required');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      Alert.alert('Error', 'Please agree to the terms and conditions');
      return;
    }

    setLoading(true);
    const result = await signUp(email, password, name.trim(), studentId.trim());
    setLoading(false);

    if (!result.success) {
      Alert.alert('Registration Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Club Logo */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
          <Text style={styles.appName}>AGU Automotive Club</Text>
          <Text style={styles.subtitle}>Join Our Community</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Your full name"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>
          </View>

          {/* Student ID Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Student ID</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="school-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Your student ID"
                placeholderTextColor={colors.textMuted}
                value={studentId}
                onChangeText={setStudentId}
                editable={!loading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
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
          <View style={styles.formGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="At least 6 characters"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={colors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.toggleButton}
              >
                <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Terms Checkbox */}
          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={[styles.checkbox, agreeTerms && styles.checkboxChecked]}
              onPress={() => setAgreeTerms(!agreeTerms)}
              accessibilityLabel={agreeTerms ? 'Agreed to terms, tap to uncheck' : 'Tap to agree to terms and conditions'}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: agreeTerms }}
            >
              {agreeTerms && <Ionicons name="checkmark" size={18} color={colors.text} />}
            </TouchableOpacity>
            <Text style={styles.termsText}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => Alert.alert('Terms and Conditions', 'By joining the AGU Automotive Club, you agree to:\n\n1. Use the app responsibly\n2. Submit only genuine restaurant bills\n3. Not share your account credentials\n4. Follow club rules and guidelines\n5. Respect other members\n\nViolation of these terms may result in account suspension.')}>Terms and Conditions</Text>
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityLabel="Create account"
            accessibilityRole="button"
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.text} />
            ) : (
              <>
                <Ionicons name="checkmark" size={18} color={colors.text} />
                <Text style={styles.registerButtonText}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Already have an account?</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Login Link */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => navigation.navigate('Login')}
            disabled={loading}
            accessibilityLabel="Sign in instead"
            accessibilityRole="button"
          >
            <Text style={styles.loginLinkText}>Sign In Instead</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Protected by industry-standard security
          </Text>
          <Text style={styles.footerIcon}>🔒</Text>
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
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 32,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 24,
      marginTop: 8,
    },
    logo: {
      width: 100,
      height: 100,
      resizeMode: 'contain',
      marginBottom: 16,
    },
    appName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '500',
    },
    formContainer: {
      gap: 16,
      marginBottom: 24,
    },
    formGroup: {
      gap: 8,
    },
    label: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      textTransform: 'uppercase',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.darkCardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 14,
      paddingVertical: 14,
      gap: 10,
    },
    inputIcon: {
      fontSize: 18,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
    },
    toggleButton: {
      padding: 8,
    },
    toggleIcon: {
      fontSize: 16,
    },
    termsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
    },
    checkbox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    checkmark: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    termsText: {
      fontSize: 13,
      color: colors.textMuted,
      flex: 1,
    },
    termsLink: {
      color: colors.accentLight,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 4,
    },
    registerButtonDisabled: {
      backgroundColor: colors.slateGrey,
    },
    registerButtonIcon: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    registerButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 20,
      gap: 12,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },
    dividerText: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
    loginLink: {
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    loginLinkText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.accentLight,
    },
    footerSection: {
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: 8,
    },
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    footerIcon: {
      fontSize: 20,
    },
  });
