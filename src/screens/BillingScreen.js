import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db, storage } from '../config/firebase';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes } from 'firebase/storage';

const { width } = Dimensions.get('window');

export default function BillingScreen() {
  const { user, userData } = useApp();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [bills, setBills] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [billName, setBillName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const styles = createStyles();

  React.useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, 'bills'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBills(data.sort((a, b) => b.uploadDate?.toDate?.() - a.uploadDate?.toDate?.() || 0));
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user?.uid]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const uploadBill = async () => {
    if (!billName.trim()) {
      Alert.alert('Error', 'Please enter a bill name');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file');
      return;
    }

    setUploading(true);

    try {
      const fileName = `bills/${user.uid}/${Date.now()}_${selectedFile.name}`;
      const fileRef = ref(storage, fileName);

      const fileData = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const blob = new Blob([Buffer.from(fileData, 'base64')], {
        type: selectedFile.mimeType,
      });

      await uploadBytes(fileRef, blob);

      await addDoc(collection(db, 'bills'), {
        userId: user.uid,
        userName: userData?.name || user.email,
        billName: billName.trim(),
        fileName: selectedFile.name,
        fileUrl: fileName,
        uploadDate: serverTimestamp(),
        fileType: selectedFile.mimeType,
      });

      Alert.alert('Success', 'Bill uploaded successfully!');
      setBillName('');
      setSelectedFile(null);
      setShowUploadForm(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to upload bill: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteBill = (billId) => {
    Alert.alert(
      'Delete Bill',
      'Are you sure you want to delete this bill?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'bills', billId));
              Alert.alert('Success', 'Bill deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete bill');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && bills.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Billing</Text>
          <Text style={styles.title}>My Bills</Text>
          <Text style={styles.description}>Upload and manage your membership bills</Text>
        </View>

        {/* Upload Button */}
        {!showUploadForm && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={() => setShowUploadForm(true)}
          >
            <Text style={styles.uploadButtonIcon}>📤</Text>
            <View style={styles.uploadButtonContent}>
              <Text style={styles.uploadButtonTitle}>Upload New Bill</Text>
              <Text style={styles.uploadButtonDesc}>Add a new bill for your membership</Text>
            </View>
            <Text style={styles.uploadButtonArrow}>→</Text>
          </TouchableOpacity>
        )}

        {/* Upload Form */}
        {showUploadForm && (
          <View style={styles.uploadForm}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Upload Bill</Text>
              <TouchableOpacity onPress={() => {
                setShowUploadForm(false);
                setBillName('');
                setSelectedFile(null);
              }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Bill Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Bill Name / Description</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Membership Bill 2024"
                placeholderTextColor={colors.textMuted}
                value={billName}
                onChangeText={setBillName}
              />
            </View>

            {/* File Selection */}
            <TouchableOpacity
              style={styles.fileSelectButton}
              onPress={pickDocument}
            >
              <Text style={styles.fileSelectIcon}>📎</Text>
              {selectedFile ? (
                <View>
                  <Text style={styles.selectedFileName}>{selectedFile.name}</Text>
                  <Text style={styles.selectedFileSize}>
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.fileSelectTitle}>Choose File</Text>
                  <Text style={styles.fileSelectDesc}>PDF or Image</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Action Buttons */}
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowUploadForm(false);
                  setBillName('');
                  setSelectedFile(null);
                }}
                disabled={uploading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, uploading && styles.submitButtonDisabled]}
                onPress={uploadBill}
                disabled={uploading}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color={colors.text} />
                ) : (
                  <>
                    <Text style={styles.submitButtonIcon}>✓</Text>
                    <Text style={styles.submitButtonText}>Upload</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Bills List */}
        <View style={styles.billsSection}>
          {bills.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📄</Text>
              <Text style={styles.emptyText}>No bills uploaded yet</Text>
              <Text style={styles.emptyDesc}>Upload your first bill to get started</Text>
            </View>
          ) : (
            <>
              <Text style={styles.billsTitle}>Recent Bills ({bills.length})</Text>
              <View style={styles.billsList}>
                {bills.map((bill) => (
                  <View key={bill.id} style={styles.billCard}>
                    <View style={styles.billIcon}>
                      <Text style={styles.billIconEmoji}>
                        {bill.fileType?.includes('pdf') ? '📑' : '🖼️'}
                      </Text>
                    </View>

                    <View style={styles.billInfo}>
                      <Text style={styles.billName}>{bill.billName}</Text>
                      <Text style={styles.billFileName}>{bill.fileName}</Text>
                      <Text style={styles.billDate}>
                        {bill.uploadDate?.toDate
                          ? bill.uploadDate.toDate().toLocaleDateString()
                          : 'Unknown date'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteBill(bill.id)}
                    >
                      <Text style={styles.deleteButtonText}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}
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
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    headerSection: {
      marginBottom: 24,
    },
    subtitle: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.accentLight,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    description: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
    },
    uploadButton: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      borderWidth: 2,
      borderColor: colors.accent,
      gap: 12,
    },
    uploadButtonIcon: {
      fontSize: 32,
    },
    uploadButtonContent: {
      flex: 1,
    },
    uploadButtonTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    uploadButtonDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    uploadButtonArrow: {
      fontSize: 18,
      color: colors.accent,
    },
    uploadForm: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 24,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textMuted,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fileSelectButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      borderRadius: 10,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      gap: 12,
      marginBottom: 16,
    },
    fileSelectIcon: {
      fontSize: 28,
    },
    fileSelectTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    fileSelectDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    selectedFileName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.accent,
    },
    selectedFileSize: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    submitButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonIcon: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '700',
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    billsSection: {
      marginTop: 8,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 48,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 13,
      color: colors.textMuted,
    },
    billsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    billsList: {
      gap: 12,
    },
    billCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billIcon: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: 'rgba(200, 16, 46, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    billIconEmoji: {
      fontSize: 20,
    },
    billInfo: {
      flex: 1,
    },
    billName: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    billFileName: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    billDate: {
      fontSize: 10,
      color: colors.textMuted,
      marginTop: 4,
    },
    deleteButton: {
      padding: 8,
    },
    deleteButtonText: {
      fontSize: 18,
    },
  });
