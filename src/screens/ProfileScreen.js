import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { signOut } from '../services/authService';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen({ navigation }) {
  const { userData, user, refreshUserData } = useApp();
  const [name, setName] = useState(userData?.name || '');
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);

  const styles = createStyles();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: name.trim() });
      await refreshUserData();
      Alert.alert('Success', 'Profile updated');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    setChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      Alert.alert('Success', 'Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/wrong-password') msg = 'Current password is incorrect';
      Alert.alert('Error', msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert('Error', 'Please enter your password to confirm');
      return;
    }
    setDeleting(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deletePassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Delete user's expenses
      const expQ = query(collection(db, 'restaurant_expenses'), where('userId', '==', user.uid));
      const expSnap = await getDocs(expQ);
      if (expSnap.size > 0) {
        const batch = writeBatch(db);
        expSnap.forEach(d => batch.delete(d.ref));
        await batch.commit();
      }

      // Delete Firestore user document
      await deleteDoc(doc(db, 'users', user.uid));

      // Delete Firebase Auth account (also signs out)
      await deleteUser(auth.currentUser);
    } catch (error) {
      let msg = error.message;
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') msg = 'Incorrect password';
      Alert.alert('Error', msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{userData?.email || ''}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Student ID</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>{userData?.studentId || 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Member Since</Text>
            <View style={styles.readOnlyField}>
              <Text style={styles.readOnlyText}>
                {userData?.createdAt?.toDate
                  ? userData.createdAt.toDate().toLocaleDateString()
                  : userData?.createdAt
                  ? new Date(userData.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSaveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Change Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Change Password</Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Current Password</Text>
            <TextInput
              style={styles.input}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Enter current password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, changingPassword && styles.saveButtonDisabled]}
            onPress={handleChangePassword}
            disabled={changingPassword}
          >
            {changingPassword ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Update Password</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}><Ionicons name="log-out-outline" size={16} color="#F44336" />  Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account */}
        <TouchableOpacity style={styles.deleteAccountButton} onPress={() => setShowDeleteModal(true)}>
          <Text style={styles.deleteAccountText}>Delete My Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Delete Account Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showDeleteModal}
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Account</Text>
            <Text style={styles.deleteModalDesc}>
              This action is permanent and cannot be undone. All your data, expenses, and account will be deleted.
            </Text>
            <Text style={styles.deleteModalLabel}>Enter your password to confirm</Text>
            <TextInput
              style={styles.input}
              value={deletePassword}
              onChangeText={setDeletePassword}
              placeholder="Your password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
            />
            <View style={styles.deleteModalActions}>
              <TouchableOpacity
                style={styles.deleteModalCancel}
                onPress={() => { setShowDeleteModal(false); setDeletePassword(''); }}
              >
                <Text style={styles.deleteModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteModalConfirm}
                onPress={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteModalConfirmText}>Delete Forever</Text>
                )}
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
      paddingTop: 60,
      backgroundColor: colors.darkCardBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backIcon: {
      fontSize: 24,
      color: colors.text,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
    },
    fieldGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    readOnlyField: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    readOnlyText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonDisabled: {
      backgroundColor: colors.slateGrey,
    },
    saveButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
    logoutButton: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F44336',
      marginBottom: 20,
    },
    logoutButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#F44336',
    },
    deleteAccountButton: {
      paddingVertical: 16,
      alignItems: 'center',
      marginBottom: 40,
    },
    deleteAccountText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#F44336',
      textDecorationLine: 'underline',
    },
    deleteModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    deleteModalContent: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteModalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: '#F44336',
      marginBottom: 12,
    },
    deleteModalDesc: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 20,
      lineHeight: 20,
    },
    deleteModalLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    deleteModalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 20,
    },
    deleteModalCancel: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    deleteModalCancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    deleteModalConfirm: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: '#F44336',
      alignItems: 'center',
    },
    deleteModalConfirmText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
  });
