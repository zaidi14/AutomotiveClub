import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Image,
  TextInput,
  Modal,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../styles/colors';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { sendPushToAllUsers } from '../services/notificationService';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const EVENT_TYPES = ['Conference', 'Discussion', 'Entertainment', 'Activity'];

export default function AdminScreen({ navigation }) {
  const { user, userData } = useApp();
  const [bills, setBills] = useState([]);
  const [events, setEvents] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null); // 'event' or 'news'
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'Conference',
    subtitle: '',
    url: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth());
  const [pickerDay, setPickerDay] = useState(new Date().getDate());
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingBills: 0,
    approvedBills: 0,
    rejectedBills: 0,
    totalRevenue: 0,
  });

  const styles = createStyles();

  // Check if user is admin
  useEffect(() => {
    if (userData?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      navigation?.goBack?.();
    }
  }, [userData]);

  // Refresh data when screen comes into focus (e.g. after approving bills)
  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadStats(),
        loadBills(),
        loadEvents(),
        loadNews(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBills = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'restaurant_expenses'));
      const allBills = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      // Get only pending bills for the summary
      const pendingBills = allBills.filter(bill => {
        const status = bill.status || 'pending';
        return status === 'pending';
      });
      
      setBills(pendingBills);
    } catch (error) {
      console.error('Error loading bills:', error);
    }
  };

  const loadStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const expensesSnapshot = await getDocs(collection(db, 'restaurant_expenses'));

      let pendingCount = 0;
      let approvedCount = 0;
      let rejectedCount = 0;
      let totalRevenue = 0;

      expensesSnapshot.forEach(expenseDoc => {
        const data = expenseDoc.data();
        const status = data.status || 'pending';
        if (status === 'pending') pendingCount++;
        if (status === 'rejected') rejectedCount++;
        if (status === 'approved') {
          approvedCount++;
          totalRevenue += data.amount || 0;
        }
      });

      setStats({
        totalUsers: usersSnapshot.size,
        pendingBills: pendingCount,
        approvedBills: approvedCount,
        rejectedBills: rejectedCount,
        totalRevenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'events'));
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadNews = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'news'));
      const newsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNews(newsList);
    } catch (error) {
      console.error('Error loading news:', error);
    }
  };

  const createEvent = async () => {
    try {
      if (!formData.title || !formData.description || !formData.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      await addDoc(collection(db, 'events'), {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        type: formData.type,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Event created');
      setModalVisible(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadEvents();

      // Send push notification to all users
      sendPushToAllUsers(
        'New Event',
        `${formData.title} — ${formData.date}`,
        user?.uid,
        { screen: 'Events' }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create event');
      console.error(error);
    }
  };

  const createNews = async () => {
    try {
      if (!formData.title || !formData.subtitle || !formData.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      await addDoc(collection(db, 'news'), {
        title: formData.title,
        subtitle: formData.subtitle,
        date: formData.date,
        url: formData.url,
        createdAt: serverTimestamp(),
      });
      Alert.alert('Success', 'Newsletter created');
      setModalVisible(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadNews();

      // Send push notification to all users
      sendPushToAllUsers(
        'New Article',
        formData.title,
        user?.uid,
        { screen: 'News' }
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create newsletter');
      console.error(error);
    }
  };

  const deleteEvent = async (eventId) => {
    Alert.alert(
      'Delete Event',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'events', eventId));
              Alert.alert('Success', 'Event deleted');
              loadEvents();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete event');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const deleteNews = async (newsId) => {
    Alert.alert(
      'Delete News',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'news', newsId));
              Alert.alert('Success', 'Newsletter deleted');
              loadNews();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete newsletter');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
            } catch (error) {
              Alert.alert('Error', 'Failed to logout');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const editEvent = (event) => {
    setEditingId(event.id);
    setModalType('event');
    setFormData({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      type: event.type || 'Conference',
      subtitle: '',
      url: '',
    });
    setModalVisible(true);
  };

  const editNews = (item) => {
    setEditingId(item.id);
    setModalType('news');
    setFormData({
      title: item.title || '',
      subtitle: item.subtitle || '',
      date: item.date || '',
      url: item.url || '',
      description: '',
      time: '',
      location: '',
      type: 'Conference',
    });
    setModalVisible(true);
  };

  const confirmDate = () => {
    const dateStr = `${MONTHS[pickerMonth]} ${pickerDay}, ${pickerYear}`;
    setFormData(prev => ({ ...prev, date: dateStr }));
    setShowDatePicker(false);
  };

  const updateEvent = async () => {
    try {
      if (!formData.title || !formData.description || !formData.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      await updateDoc(doc(db, 'events', editingId), {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        type: formData.type,
      });
      Alert.alert('Success', 'Event updated');
      setModalVisible(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadEvents();
    } catch (error) {
      Alert.alert('Error', 'Failed to update event');
      console.error(error);
    }
  };

  const updateNews = async () => {
    try {
      if (!formData.title || !formData.subtitle || !formData.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      await updateDoc(doc(db, 'news', editingId), {
        title: formData.title,
        subtitle: formData.subtitle,
        date: formData.date,
        url: formData.url,
      });
      Alert.alert('Success', 'Newsletter updated');
      setModalVisible(false);
      setEditingId(null);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadNews();
    } catch (error) {
      Alert.alert('Error', 'Failed to update newsletter');
      console.error(error);
    }
  };

  const recalculateAllUserStats = async () => {
    Alert.alert(
      'Recalculate Stats',
      'This will recalculate all user stats from approved bills. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Recalculate',
          onPress: async () => {
            try {
              // Get all approved expenses
              const expSnap = await getDocs(collection(db, 'restaurant_expenses'));
              // Group by userId
              const userStats = {};
              expSnap.forEach((d) => {
                const data = d.data();
                const status = data.status || 'pending';
                if (status !== 'approved') return;
                const uid = data.userId;
                if (!uid) return;
                if (!userStats[uid]) {
                  userStats[uid] = { spend: 0, orders: 0, restaurants: {} };
                }
                userStats[uid].spend += data.amount || 0;
                userStats[uid].orders += 1;
                const r = data.restaurant;
                if (r) userStats[uid].restaurants[r] = (userStats[uid].restaurants[r] || 0) + 1;
              });

              // Get all users and update
              const usersSnap = await getDocs(collection(db, 'users'));
              const batch = writeBatch(db);
              let updated = 0;
              for (const userDoc of usersSnap.docs) {
                const uid = userDoc.id;
                const s = userStats[uid] || { spend: 0, orders: 0, restaurants: {} };
                const discountRate = 0.1;
                const favKeys = Object.keys(s.restaurants);
                const favorite = favKeys.length > 0
                  ? favKeys.reduce((a, b) => s.restaurants[a] > s.restaurants[b] ? a : b, '')
                  : '';
                batch.update(doc(db, 'users', uid), {
                  lifetimeSpend: s.spend,
                  lifetimeSavings: s.spend * discountRate,
                  totalOrders: s.orders,
                  favoriteRestaurant: favorite,
                });
                updated++;
              }
              await batch.commit();
              Alert.alert('Done', `Recalculated stats for ${updated} users.`);
              loadAllData();
            } catch (error) {
              Alert.alert('Error', 'Failed to recalculate: ' + error.message);
              console.error(error);
            }
          },
        },
      ]
    );
  };

  if (loading && bills.length === 0 && events.length === 0 && news.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Admin Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome, {userData?.name}</Text>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalUsers}</Text>
              <Text style={styles.statLabel}>Total Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pendingBills}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.approvedBills}</Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.rejectedBills}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>₺{stats.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.recalcButton}
            onPress={recalculateAllUserStats}
          >
            <Text style={styles.recalcButtonText}>🔄 Recalculate All User Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Bill Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>💳 Bill Management</Text>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('AdminBills')}
            >
              <Text style={styles.viewAllButtonText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.billSummary}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.pendingBills}</Text>
              <Text style={styles.summaryLabel}>Pending Bills</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{stats.approvedBills}</Text>
              <Text style={styles.summaryLabel}>Approved Bills</Text>
            </View>
          </View>

          {bills.slice(0, 3).map(bill => (
            <View key={bill.id} style={styles.billCard}>
              <View style={styles.billHeader}>
                <View style={styles.billInfo}>
                  <Text style={styles.billRestaurant}>{bill.restaurant}</Text>
                  <Text style={styles.billUser}>{bill.userName}</Text>
                </View>
                <Text style={styles.billAmount}>₺{bill.amount?.toFixed(2)}</Text>
              </View>
            </View>
          ))}

          {bills.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No pending expenses</Text>
            </View>
          )}
        </View>

        {/* Events Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📅 Events</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalType('event');
                setEditingId(null);
                setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
                setModalVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {events.map(event => (
            <View key={event.id} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{event.title}</Text>
                  <Text style={styles.itemSubtext}>{event.date}</Text>
                </View>
                <TouchableOpacity onPress={() => editEvent(event)} style={{ marginRight: 8 }}>
                  <Ionicons name="create-outline" size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {events.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No events</Text>
            </View>
          )}
        </View>

        {/* News Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📰 News</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setModalType('news');
                setEditingId(null);
                setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
                setModalVisible(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>
          {news.map(item => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemSubtext}>{item.subtitle}</Text>
                </View>
                <TouchableOpacity onPress={() => editNews(item)} style={{ marginRight: 8 }}>
                  <Ionicons name="create-outline" size={18} color={colors.accent} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteNews(item.id)}>
                  <Ionicons name="trash-outline" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {news.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No news</Text>
            </View>
          )}
        </View>

        {/* Developer Credit */}
        <View style={styles.creditSection}>
          <Text style={styles.creditText}>Developed by</Text>
          <Text style={styles.creditName}>Mojiz Zaidi</Text>
          <Text style={styles.creditYear}>© 2026</Text>
        </View>
      </ScrollView>

      {/* Modal for Creating Events/News */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId
                  ? (modalType === 'event' ? 'Edit Event' : 'Edit Newsletter')
                  : (modalType === 'event' ? 'Create Event' : 'Create Newsletter')
                }
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter title"
                placeholderTextColor={colors.textMuted}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              {modalType === 'event' && (
                <>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter description"
                    placeholderTextColor={colors.textMuted}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: formData.date ? colors.text : colors.textMuted, fontSize: 15 }}>
                      {formData.date || 'Select a date'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 10:00 AM"
                    placeholderTextColor={colors.textMuted}
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                  />

                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter location"
                    placeholderTextColor={colors.textMuted}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />

                  <Text style={styles.inputLabel}>Event Type</Text>
                  <View style={styles.typeRow}>
                    {EVENT_TYPES.map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[styles.typeChip, formData.type === type && styles.typeChipSelected]}
                        onPress={() => setFormData({ ...formData, type })}
                      >
                        <Text style={[styles.typeChipText, formData.type === type && styles.typeChipTextSelected]}>
                          {type}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {modalType === 'news' && (
                <>
                  <Text style={styles.inputLabel}>Subtitle *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter subtitle"
                    placeholderTextColor={colors.textMuted}
                    value={formData.subtitle}
                    onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                  />

                  <Text style={styles.inputLabel}>Date *</Text>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={{ color: formData.date ? colors.text : colors.textMuted, fontSize: 15 }}>
                      {formData.date || 'Select a date'}
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.inputLabel}>URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter article URL"
                    placeholderTextColor={colors.textMuted}
                    value={formData.url}
                    onChangeText={(text) => setFormData({ ...formData, url: text })}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={
                  editingId
                    ? (modalType === 'event' ? updateEvent : updateNews)
                    : (modalType === 'event' ? createEvent : createNews)
                }
              >
                <Text style={styles.submitBtnText}>{editingId ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Date Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.datePickerContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.datePickerScroll}>
              <Text style={styles.datePickerSectionLabel}>Month</Text>
              <View style={styles.monthGrid}>
                {MONTHS.map((m, i) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pickerChip, pickerMonth === i && styles.pickerChipSelected]}
                    onPress={() => setPickerMonth(i)}
                  >
                    <Text style={[styles.pickerChipText, pickerMonth === i && styles.pickerChipTextSelected]}>
                      {m.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.datePickerSectionLabel}>Day</Text>
              <View style={styles.dayGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.dayChip, pickerDay === d && styles.dayChipSelected]}
                    onPress={() => setPickerDay(d)}
                  >
                    <Text style={[styles.dayChipText, pickerDay === d && styles.dayChipTextSelected]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.datePickerSectionLabel}>Year</Text>
              <View style={styles.yearRow}>
                {[2025, 2026, 2027, 2028].map(y => (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pickerChip, pickerYear === y && styles.pickerChipSelected]}
                    onPress={() => setPickerYear(y)}
                  >
                    <Text style={[styles.pickerChipText, pickerYear === y && styles.pickerChipTextSelected]}>
                      {y}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={confirmDate}>
                <Text style={styles.submitBtnText}>Confirm</Text>
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
    header: {
      padding: 24,
      paddingTop: 60,
      backgroundColor: colors.darkCardBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    logoutButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#F44336',
    },
    logoutButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#F44336',
    },
    section: {
      padding: 20,
      marginBottom: 8,
    },
    statsSection: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: colors.darkCardBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 8,
    },
    recalcButton: {
      marginTop: 12,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    recalcButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.textMuted,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    statCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: colors.cardBg,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: 2,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    billCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    billSummary: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.darkCardBg,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    summaryValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.accent,
      marginBottom: 4,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.textMuted,
    },
    viewAllButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.accent,
      borderRadius: 8,
    },
    viewAllButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
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
    itemCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    itemSubtext: {
      fontSize: 13,
      color: colors.textMuted,
    },
    deleteIcon: {
      fontSize: 18,
      padding: 4,
    },
    addButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.accent,
      borderRadius: 8,
    },
    addButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
    },
    emptyState: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      maxHeight: '80%',
      borderWidth: 1,
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
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
    },
    closeBtn: {
      fontSize: 24,
      color: colors.textMuted,
      padding: 4,
    },
    modalForm: {
      padding: 20,
      maxHeight: 400,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    modalActions: {
      flexDirection: 'row',
      padding: 20,
      gap: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.02)',
    },
    cancelBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    submitBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    submitBtnText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#fff',
    },
    creditSection: {
      alignItems: 'center',
      paddingVertical: 32,
      marginTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    creditText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '400',
      marginBottom: 4,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    creditName: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    creditYear: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '300',
    },
    datePickerContent: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      maxHeight: '80%',
      borderWidth: 1,
      borderColor: colors.border,
    },
    datePickerScroll: {
      padding: 20,
      maxHeight: 400,
    },
    datePickerSectionLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textSecondary,
      marginBottom: 10,
      marginTop: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    monthGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    dayGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginBottom: 12,
    },
    yearRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 8,
    },
    pickerChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: colors.border,
    },
    pickerChipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    pickerChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    pickerChipTextSelected: {
      color: '#fff',
      fontWeight: '600',
    },
    dayChip: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: colors.border,
    },
    dayChipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    dayChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    dayChipTextSelected: {
      color: '#fff',
      fontWeight: '700',
    },
    typeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    typeChip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeChipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    typeChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    typeChipTextSelected: {
      color: '#fff',
      fontWeight: '600',
    },
  });
