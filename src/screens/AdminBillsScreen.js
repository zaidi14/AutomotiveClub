import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

export default function AdminBillsScreen({ navigation }) {
  const { isDark, user, userData } = useApp();
  const [billStatus, setBillStatus] = useState('pending');
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const styles = createStyles(isDark);

  useEffect(() => {
    loadBills();
  }, [billStatus]);

  const loadBills = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'restaurant_expenses'));
      const allBills = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Filter by status, treat undefined status as pending
      const filteredBills = allBills.filter(bill => {
        const status = bill.status || 'pending';
        return status === billStatus;
      });
      
      // Sort by date
      filteredBills.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setBills(filteredBills);
    } catch (error) {
      console.error('Error loading bills:', error);
      Alert.alert('Error', 'Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const approveBill = async (billId) => {
    try {
      await updateDoc(doc(db, 'restaurant_expenses', billId), {
        status: 'approved',
        approvedAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Expense approved');
      loadBills();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve expense');
      console.error(error);
    }
  };

  const rejectBill = async (billId) => {
    Alert.alert(
      'Reject Expense',
      'Are you sure you want to reject this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'restaurant_expenses', billId));
              Alert.alert('Success', 'Expense rejected and deleted');
              loadBills();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject expense');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bill Management</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Status Dropdown */}
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowDropdown(!showDropdown)}
        >
          <Text style={styles.dropdownText}>
            {billStatus === 'pending' ? 'Pending Bills' : 'Approved Bills'}
          </Text>
          <Text style={styles.dropdownIcon}>{showDropdown ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setBillStatus('pending');
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Pending Bills</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setBillStatus('approved');
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>Approved Bills</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bills List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : bills.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>No {billStatus} expenses</Text>
          </View>
        ) : (
          bills.map(bill => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billHeader}>
                <View style={styles.billInfo}>
                  <Text style={styles.billRestaurant}>{bill.restaurant}</Text>
                  <Text style={styles.billUser}>{bill.userName}</Text>
                  <Text style={styles.billDate}>
                    {bill.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}
                  </Text>
                </View>
                <Text style={styles.billAmount}>₺{bill.amount?.toFixed(2)}</Text>
              </View>

              {bill.imageUrl && (
                <Image source={{ uri: bill.imageUrl }} style={styles.billImage} resizeMode="cover" />
              )}

              {billStatus === 'pending' && (
                <View style={styles.billActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => rejectBill(bill.id)}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => approveBill(bill.id)}
                  >
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark) =>
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
    dropdownContainer: {
      padding: 20,
      paddingBottom: 10,
    },
    dropdown: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.darkCardBg,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dropdownText: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '500',
    },
    dropdownIcon: {
      fontSize: 12,
      color: colors.textMuted,
    },
    dropdownMenu: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      marginTop: 8,
      overflow: 'hidden',
    },
    dropdownItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemText: {
      fontSize: 14,
      color: colors.text,
    },
    scrollView: {
      flex: 1,
      padding: 20,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    billCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    billInfo: {
      flex: 1,
    },
    billRestaurant: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    billUser: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 2,
    },
    billDate: {
      fontSize: 12,
      color: colors.textMuted,
    },
    billAmount: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.accent,
    },
    billImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      marginBottom: 12,
    },
    billActions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    rejectButton: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderWidth: 1,
      borderColor: '#F44336',
    },
    rejectButtonText: {
      color: '#F44336',
      fontWeight: '600',
      fontSize: 14,
    },
    approveButton: {
      backgroundColor: colors.accent,
    },
    approveButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    emptyState: {
      padding: 60,
      alignItems: 'center',
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyText: {
      fontSize: 16,
      color: colors.textMuted,
    },
  });
