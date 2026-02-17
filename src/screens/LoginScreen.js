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
  Modal,
  Image,
} from 'react-native';
import { signIn, resetPassword } from '../services/authService';
import { colors } from '../styles/colors';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

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

  const handleForgotPassword = async () => {
    const emailToReset = resetEmail || email;
    if (!emailToReset) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    const result = await resetPassword(emailToReset);
    if (result.success) {
      Alert.alert('Success', 'Password reset email sent. Check your inbox.');
      setShowResetModal(false);
      setResetEmail('');
    } else {
      Alert.alert('Error', result.error);
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
        {/* Header Section with Club Logo */}
        <View style={styles.headerSection}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logo}
          />
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
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} style={styles.inputIconView} />
              <TextInput
                style={styles.input}
                placeholder="user@gmail.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                accessibilityLabel="Email address"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIconView} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
                accessibilityLabel="Password"
              />
            </View>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => { setResetEmail(email); setShowResetModal(true); }} style={styles.forgotPassword} accessibilityLabel="Forgot password" accessibilityRole="button">
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityLabel="Sign in"
            accessibilityRole="button"
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
            accessibilityLabel="Create new account"
            accessibilityRole="button"
          >
            <Text style={styles.signupButtonText}>Create New Account</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 AGU Automotive Club</Text>
        </View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showResetModal}
        onRequestClose={() => setShowResetModal(false)}
      >
        <View style={styles.resetModalOverlay}>
          <View style={styles.resetModalContent}>
            <Text style={styles.resetModalTitle}>Reset Password</Text>
            <Text style={styles.resetModalDesc}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            <TextInput
              style={styles.resetModalInput}
              placeholder="Enter your email"
              placeholderTextColor={colors.textMuted}
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.resetModalActions}>
              <TouchableOpacity
                style={styles.resetModalCancel}
                onPress={() => { setShowResetModal(false); setResetEmail(''); }}
              >
                <Text style={styles.resetModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.resetModalSend}
                onPress={handleForgotPassword}
              >
                <Text style={styles.resetModalSendText}>Send Link</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
      paddingTop: 40,
      paddingBottom: 32,
    },
    headerSection: {
      alignItems: 'center',
      marginBottom: 28,
    },
    logo: {
      width: 120,
      height: 120,
      resizeMode: 'contain',
      marginBottom: 20,
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
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
    formContainer: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 24,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    formTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    formSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 24,
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      overflow: 'hidden',
    },
    inputIcon: {
      fontSize: 20,
      marginRight: 16,
    },
    inputIconView: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      paddingVertical: 16,
      fontSize: 15,
      color: colors.text,
      fontWeight: '400',
    },
    loginButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 24,
      marginBottom: 20,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 4,
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
      marginVertical: 20,
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
      borderRadius: 12,
      paddingVertical: 16,
      paddingHorizontal: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    signupButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '600',
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: 4,
      marginBottom: 8,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: colors.accent,
      fontWeight: '500',
    },
    footer: {
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    resetModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    resetModalContent: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    resetModalDesc: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 20,
      lineHeight: 20,
    },
    resetModalInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 16,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    resetModalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    resetModalCancel: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    resetModalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    resetModalSend: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    resetModalSendText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });
