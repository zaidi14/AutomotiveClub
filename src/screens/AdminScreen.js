import React, { useState, useEffect } from 'react';
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
import { colors } from '../styles/colors';
import { db, auth } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

export default function AdminScreen({ navigation }) {
  const { isDark, user, userData } = useApp();
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
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingBills: 0,
    approvedBills: 0,
    totalRevenue: 0,
  });

  const styles = createStyles(isDark);

  // Check if user is admin
  useEffect(() => {
    if (userData?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      navigation?.goBack?.();
    }
  }, [userData]);

  // Load initial data
  useEffect(() => {
    loadAllData();
  }, []);

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
      let totalRevenue = 0;

      expensesSnapshot.forEach(expenseDoc => {
        const data = expenseDoc.data();
        const status = data.status || 'pending';
        if (status === 'pending') pendingCount++;
        if (status === 'approved') {
          approvedCount++;
          totalRevenue += data.amount || 0;
        }
      });

      setStats({
        totalUsers: usersSnapshot.size,
        pendingBills: pendingCount,
        approvedBills: approvedCount,
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
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Event created');
      setModalVisible(false);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadEvents();
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
        createdAt: new Date().toISOString(),
      });
      Alert.alert('Success', 'Newsletter created');
      setModalVisible(false);
      setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
      loadNews();
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
              <Text style={styles.statValue}>₺{stats.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Revenue</Text>
            </View>
          </View>
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
                <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
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
                <TouchableOpacity onPress={() => deleteNews(item.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
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
                {modalType === 'event' ? 'Create Event' : 'Create Newsletter'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtn}>✕</Text>
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
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., March 15, 2024"
                    placeholderTextColor={colors.textMuted}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />

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
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., March 15, 2024"
                    placeholderTextColor={colors.textMuted}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />

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
                onPress={modalType === 'event' ? createEvent : createNews}
              >
                <Text style={styles.submitBtnText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (isDark) =>
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
  });
