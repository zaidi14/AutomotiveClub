import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  Image,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { cloudinaryConfig } from '../config/cloudinary';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

// Restaurant list for the dropdown
const RESTAURANTS = [
  'Quakka Coffee',
  'Raif',
  'Alaçatı Muhallebicisi',
  'Mehmet Chef',
  'MaxGarden Cafe & Aile Okey Salonu',
  'Nevada Coffee',
  'Bizon Burger',
  'Ohannes Burger',
  'AGÜ Store',
  'Romesta Coffee',
  'So Dark',
  'Social Coffee',
  'The Coffee Factory',
  'Coffy',
  'Kasap ATK',
  'Macbear Coffee',
  'Sini Tavında',
  'Kemal Ataklı',
  'SD Döner',
  'Steg Coffee',
  'Cajun Corner',
  'Cedric Burger',
  'Springfield (Yeni Nesil Dürüm)',
  'Mars Playstation',
  'La Casa De Pilav',
  'La Vi En Tasse',
  'Lava Coffee',
];

export default function BillingScreen() {
  const { user, userData } = useApp();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [amount, setAmount] = useState('');
  const [billImage, setBillImage] = useState(null);
  const [showRestaurantPicker, setShowRestaurantPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const styles = createStyles();

  React.useEffect(() => {
    if (user?.uid) {
      const q = query(
        collection(db, 'restaurant_expenses'),
        where('userId', '==', user.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExpenses(data.sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.() || 0));
        setLoading(false);
      });

      return unsubscribe;
    }
  }, [user?.uid]);

  const takeBillPhoto = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Camera permission is needed to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBillImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Camera Error', 'Could not open the camera. Try picking from gallery instead.\n\n' + (error.message || ''));
    }
  };

  const pickFromGallery = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Photo library permission is needed to pick images');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setBillImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Gallery error:', error);
      Alert.alert('Error', 'Failed to pick image: ' + (error.message || ''));
    }
  };

  const handleAddPhoto = () => {
    Alert.alert('Add Bill Photo', 'Choose an option', [
      { text: 'Take Photo', onPress: takeBillPhoto },
      { text: 'Pick from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const submitExpense = async () => {
    if (!selectedRestaurant) {
      Alert.alert('Error', 'Please select a restaurant');
      return;
    }

    if (!amount.trim() || isNaN(parseFloat(amount))) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!billImage) {
      Alert.alert('Error', 'Please take a photo of the bill');
      return;
    }

    setSubmitting(true);

    try {
      // Compress image before upload
      const compressed = await ImageManipulator.manipulateAsync(
        billImage.uri,
        [{ resize: { width: 1200 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      // Upload image to Cloudinary
      const formData = new FormData();
      formData.append('file', {
        uri: compressed.uri,
        type: 'image/jpeg',
        name: `bill_${Date.now()}.jpg`,
      });
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);
      formData.append('folder', 'restaurant_bills');

      const cloudinaryUrl = `${cloudinaryConfig.uploadUrl}/${cloudinaryConfig.cloudName}/image/upload`;
      
      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.secure_url;

      // Save expense to Firestore
      await addDoc(collection(db, 'restaurant_expenses'), {
        userId: user.uid,
        userName: userData?.name || user.email,
        restaurant: selectedRestaurant,
        amount: parseFloat(amount),
        imageUrl: imageUrl,
        cloudinaryPublicId: uploadData.public_id,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Restaurant expense submitted successfully!');
      setSelectedRestaurant('');
      setAmount('');
      setBillImage(null);
    } catch (error) {
      console.error('Submit expense error:', error);
      Alert.alert('Error', 'Failed to submit expense: ' + (error.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const deleteExpense = (expenseId) => {
    const expense = expenses.find(e => e.id === expenseId);
    if (expense && expense.status !== 'pending') {
      Alert.alert('Cannot Delete', 'Only pending expenses can be deleted.');
      return;
    }
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this restaurant expense?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'restaurant_expenses', expenseId));
              Alert.alert('Success', 'Expense deleted');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete expense');
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && expenses.length === 0) {
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
          <Text style={styles.subtitle}>Restaurant Expenses</Text>
          <Text style={styles.title}>Add Restaurant Expense</Text>
          <Text style={styles.description}>Track your restaurant dining expenses</Text>
        </View>

        {/* Expense Form */}
        <View style={styles.uploadForm}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Expense Details</Text>
          </View>

          {/* Restaurant Dropdown */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Restaurant</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowRestaurantPicker(true)}
            >
              <Text style={selectedRestaurant ? styles.selectedText : styles.placeholderText}>
                {selectedRestaurant || 'Select a restaurant'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Amount (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 45.99"
              placeholderTextColor={colors.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Bill Photo */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Bill Photo</Text>
            
            {billImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image 
                  source={{ uri: billImage.uri }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity
                  style={styles.changePhotoButton}
                  onPress={handleAddPhoto}
                >
                  <Text style={styles.changePhotoText}>Change Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoButtonSingle}
                onPress={handleAddPhoto}
              >
                <Ionicons name="camera" size={32} color={colors.text} />
                <Text style={styles.photoButtonText}>Add Photo</Text>
                <Text style={styles.photoButtonHint}>Camera or Gallery</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setSelectedRestaurant('');
                setAmount('');
                setBillImage(null);
              }}
              disabled={submitting}
            >
              <Text style={styles.cancelButtonText}>Clear</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={submitExpense}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.text} />
              ) : (
                <>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Restaurant Picker Modal */}
        <Modal
          visible={showRestaurantPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowRestaurantPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Restaurant</Text>
                <TouchableOpacity onPress={() => setShowRestaurantPicker(false)}>
                  <Ionicons name="close" size={24} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.restaurantList}>
                {RESTAURANTS.map((restaurant) => (
                  <TouchableOpacity
                    key={restaurant}
                    style={[
                      styles.restaurantItem,
                      selectedRestaurant === restaurant && styles.restaurantItemSelected,
                    ]}
                    onPress={() => {
                      setSelectedRestaurant(restaurant);
                      setShowRestaurantPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.restaurantItemText,
                      selectedRestaurant === restaurant && styles.restaurantItemTextSelected,
                    ]}>
                      {restaurant}
                    </Text>
                    {selectedRestaurant === restaurant && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Expenses List */}
        <View style={styles.billsSection}>
          {expenses.length > 0 && (
            <TextInput
              style={styles.searchInput}
              placeholder="Search by restaurant..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          )}
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>No expenses recorded yet</Text>
              <Text style={styles.emptyDesc}>Add your first restaurant expense to get started</Text>
            </View>
          ) : (
            <>
              <Text style={styles.billsTitle}>Recent Expenses ({expenses.filter(e => e.restaurant.toLowerCase().includes(searchQuery.toLowerCase())).length})</Text>
              <View style={styles.billsList}>
                {expenses.filter(e => e.restaurant.toLowerCase().includes(searchQuery.toLowerCase())).map((expense) => (
                  <View key={expense.id} style={styles.billCard}>
                    <View style={styles.billIcon}>
                      <Text style={styles.billIconEmoji}>🍽️</Text>
                    </View>

                    <View style={styles.billInfo}>
                      <Text style={styles.billName}>{expense.restaurant}</Text>
                      <Text style={styles.billAmount}>₺{expense.amount.toFixed(2)}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: expense.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' : expense.status === 'rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)' }]}>
                        <Text style={[styles.statusText, { color: expense.status === 'approved' ? '#22C55E' : expense.status === 'rejected' ? '#EF4444' : '#F59E0B' }]}>
                          {(expense.status || 'pending').toUpperCase()}
                        </Text>
                      </View>
                      <Text style={styles.billDate}>
                        {expense.createdAt?.toDate
                          ? expense.createdAt.toDate().toLocaleDateString()
                          : 'Unknown date'}
                      </Text>
                    </View>

                    {expense.imageUrl && (
                      <TouchableOpacity onPress={() => setPreviewImage(expense.imageUrl)}>
                        <Image 
                          source={{ uri: expense.imageUrl }} 
                          style={styles.billThumbnail}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    )}

                    {(!expense.status || expense.status === 'pending') && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => deleteExpense(expense.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Full-screen Image Preview */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={styles.previewCloseButton}
            onPress={() => setPreviewImage(null)}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImage }}
            style={styles.previewImage}
            resizeMode="contain"
          />
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
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    headerSection: {
      marginBottom: 32,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '400',
    },
    uploadButton: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
      gap: 16,
    },
    uploadButtonIcon: {
      fontSize: 28,
    },
    uploadButtonContent: {
      flex: 1,
    },
    uploadButtonTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
    },
    uploadButtonDesc: {
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '400',
    },
    uploadButtonArrow: {
      fontSize: 20,
      color: colors.text,
    },
    uploadForm: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 28,
    },
    formHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textMuted,
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 10,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 16,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fileSelectButton: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      padding: 18,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      gap: 14,
      marginBottom: 20,
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
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    cancelButtonText: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    submitButton: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 16,
      backgroundColor: colors.accent,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 8,
    },
    submitButtonDisabled: {
      backgroundColor: colors.slateGrey,
    },
    submitButtonIcon: {
      fontSize: 16,
      color: '#fff',
      fontWeight: '600',
    },
    submitButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
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
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    billsList: {
      gap: 12,
    },
    billCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billIcon: {
      width: 52,
      height: 52,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    billIconEmoji: {
      fontSize: 24,
    },
    billInfo: {
      flex: 1,
    },
    billName: {
      fontSize: 15,
      fontWeight: '500',
      color: colors.text,
    },
    billAmount: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.accent,
      marginTop: 4,
    },
    billFileName: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '400',
    },
    billDate: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '400',
    },
    billThumbnail: {
      width: 60,
      height: 60,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    deleteButton: {
      padding: 8,
    },
    deleteButtonText: {
      fontSize: 18,
    },
    searchInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginTop: 4,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 0.5,
    },
    selectedText: {
      fontSize: 15,
      color: colors.text,
    },
    placeholderText: {
      fontSize: 15,
      color: colors.textMuted,
    },
    photoButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    photoButton: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoButtonSingle: {
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    photoButtonIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    photoButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    photoButtonHint: {
      fontSize: 11,
      fontWeight: '400',
      color: colors.textMuted,
      marginTop: 2,
    },
    imagePreviewContainer: {
      alignItems: 'center',
    },
    imagePreview: {
      width: '100%',
      height: 200,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    changePhotoButton: {
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    changePhotoText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.darkCardBg,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '70%',
      borderTopWidth: 1,
      borderLeftWidth: 1,
      borderRightWidth: 1,
      borderColor: colors.border,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    restaurantList: {
      maxHeight: 400,
    },
    restaurantItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    restaurantItemSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    restaurantItemText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '400',
    },
    restaurantItemTextSelected: {
      fontWeight: '600',
      color: colors.accent,
    },
    checkmark: {
      fontSize: 18,
      color: colors.accent,
      fontWeight: '600',
    },
    previewOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewCloseButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewCloseText: {
      fontSize: 20,
      color: '#fff',
      fontWeight: '600',
    },
    previewImage: {
      width: '100%',
      height: '80%',
    },
  });
