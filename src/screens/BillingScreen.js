import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { uploadBillImage, createBill, updateUserStats } from '../services/billService';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

export default function BillingScreen({ navigation }) {
  const { isDark, user } = useApp();
  const [imageUri, setImageUri] = useState(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const styles = createStyles(isDark);

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleUpload = async () => {
    if (!imageUri || !restaurantName || !amount) {
      Alert.alert('Missing Information', 'Please fill in all fields and select an image');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    setLoading(true);

    try {
      // Upload image
      const uploadResult = await uploadBillImage(imageUri, user.uid);
      if (!uploadResult.success) {
        throw new Error(uploadResult.error);
      }

      // Create bill record
      const billData = {
        userId: user.uid,
        restaurantName,
        amount: amountNum,
        imageUrl: uploadResult.url,
        date: new Date().toISOString()
      };

      const billResult = await createBill(billData);
      if (!billResult.success) {
        throw new Error(billResult.error);
      }

      // Update user stats
      const statsResult = await updateUserStats(user.uid, amountNum, restaurantName);
      if (!statsResult.success) {
        throw new Error(statsResult.error);
      }

      Alert.alert(
        'Success!',
        `Bill uploaded successfully! You saved ₺${statsResult.savings.toFixed(2)}`,
        [
          {
            text: 'OK',
            onPress: () => {
              setImageUri(null);
              setRestaurantName('');
              setAmount('');
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Upload Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const isFormComplete = imageUri && restaurantName && amount;

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.titleText}>Upload Bill</Text>
        </View>

        {/* Image Preview or Buttons */}
        {imageUri ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: imageUri }}
              style={styles.previewImage}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setImageUri(null)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={takePhoto}
            >
              <Text style={styles.cameraButtonText}>📷 Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={pickImage}
            >
              <Text style={styles.galleryButtonText}>🖼️ Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Restaurant Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Restaurant Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cafe Istanbul"
              placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
              value={restaurantName}
              onChangeText={setRestaurantName}
            />
          </View>

          {/* Amount */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (₺)</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadButton, !isFormComplete && styles.uploadButtonDisabled]}
            onPress={handleUpload}
            disabled={loading || !isFormComplete}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.uploadButtonText}>Upload Bill</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            💡 Tip: Make sure the bill is clear and readable for faster approval
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? colors.darkBg : colors.lightBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.darkText,
  },
  titleText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.darkText,
  },
  imagePreviewContainer: {
    position: 'relative',
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: width - 40,
    height: 240,
    borderRadius: 16,
  },
  removeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: colors.lightText,
    fontWeight: 'bold',
  },
  imageButtonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  cameraButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightText,
  },
  galleryButton: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    paddingVertical: 16,
    alignItems: 'center',
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: isDark ? colors.lightText : colors.darkText,
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? colors.lightText : colors.darkText,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: isDark ? colors.lightText : colors.darkText,
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 24,
  },
  uploadButtonDisabled: {
    opacity: 0.5,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightText,
  },
  infoCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  infoText: {
    fontSize: 12,
    color: isDark ? colors.lightSubText : colors.subText,
  },
});
