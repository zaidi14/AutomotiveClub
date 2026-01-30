import { collection, addDoc, doc, updateDoc, increment, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { cloudinaryConfig } from '../config/cloudinary';

export const uploadBillImage = async (uri, userId) => {
  try {
    // Convert file URI to blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Create FormData for Cloudinary upload
    const formData = new FormData();
    formData.append('file', blob, 'bill.jpg');
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('folder', 'autocard-bills'); // Organize bills in a folder
    formData.append('tags', `userId_${userId}`); // Tag with user ID for organization
    
    // Upload to Cloudinary
    const uploadUrl = `${cloudinaryConfig.uploadUrl}/${cloudinaryConfig.cloudName}/image/upload`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      throw new Error('Cloudinary upload failed');
    }
    
    const uploadData = await uploadResponse.json();
    
    return { 
      success: true, 
      url: uploadData.secure_url,
      publicId: uploadData.public_id 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const createBill = async (billData) => {
  try {
    const billRef = await addDoc(collection(db, 'bills'), {
      ...billData,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    
    return { success: true, billId: billRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const updateUserStats = async (userId, amount, restaurantName, discountRate = 0.1) => {
  try {
    const userRef = doc(db, 'users', userId);
    const savings = amount * discountRate;
    
    // Update user document
    await updateDoc(userRef, {
      lifetimeSpend: increment(amount),
      lifetimeSavings: increment(savings),
      totalOrders: increment(1)
    });
    
    // Calculate favorite restaurant
    const billsQuery = query(
      collection(db, 'bills'),
      where('userId', '==', userId)
    );
    
    const billsSnapshot = await getDocs(billsQuery);
    const restaurantCounts = {};
    
    billsSnapshot.forEach((doc) => {
      const bill = doc.data();
      restaurantCounts[bill.restaurantName] = (restaurantCounts[bill.restaurantName] || 0) + 1;
    });
    
    const favoriteRestaurant = Object.keys(restaurantCounts).reduce((a, b) => 
      restaurantCounts[a] > restaurantCounts[b] ? a : b, 
      ''
    );
    
    if (favoriteRestaurant) {
      await updateDoc(userRef, { favoriteRestaurant });
    }
    
    return { success: true, savings };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserBills = async (userId) => {
  try {
    const billsQuery = query(
      collection(db, 'bills'),
      where('userId', '==', userId)
    );
    
    const billsSnapshot = await getDocs(billsQuery);
    const bills = [];
    
    billsSnapshot.forEach((doc) => {
      bills.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, bills };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
