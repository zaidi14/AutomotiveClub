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
import { db } from '../config/firebase';
import { collection, query, where, getDocs, updateDoc, doc, getDoc, addDoc, deleteDoc } from 'firebase/firestore';

export default function AdminScreen({ navigation }) {
  const { isDark, user, userData } = useApp();
  const [activeTab, setActiveTab] = useState('pending');
  const [bills, setBills] = useState([]);
  const [users, setUsers] = useState([]);
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
    totalBills: 0,
    pendingBills: 0,
    approvedBills: 0,
    totalRevenue: 0,
  });

  const styles = createStyles(isDark);

  // Check if user is admin
  useEffect(() => {
    if (userData?.role !== 'admin') {
      Alert.alert('Access Denied', 'You do not have admin privileges');
      navigation.goBack();
    }
  }, [userData]);

  // Load data based on active tab
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'pending') {
        await loadPendingBills();
      } else if (activeTab === 'approved') {
        await loadApprovedBills();
      } else if (activeTab === 'users') {
        await loadUsers();
      } else if (activeTab === 'stats') {
        await loadStats();
      } else if (activeTab === 'events') {
        await loadEvents();
      } else if (activeTab === 'news') {
        await loadNews();
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingBills = async () => {
    try {
      const q = query(collection(db, 'bills'), where('status', '==', 'pending'));
      const snapshot = await getDocs(q);
      const billsList = [];
      
      for (const billDoc of snapshot.docs) {
        const billData = billDoc.data();
        const userDoc = await getDoc(doc(db, 'users', billData.userId));
        billsList.push({
          id: billDoc.id,
          ...billData,
          userName: userDoc.exists() ? userDoc.data().name : 'Unknown',
        });
      }
      
      setBills(billsList);
    } catch (error) {
      console.error('Error loading pending bills:', error);
    }
  };

  const loadApprovedBills = async () => {
    try {
      const q = query(collection(db, 'bills'), where('status', '==', 'approved'));
      const snapshot = await getDocs(q);
      const billsList = [];
      
      for (const billDoc of snapshot.docs) {
        const billData = billDoc.data();
        const userDoc = await getDoc(doc(db, 'users', billData.userId));
        billsList.push({
          id: billDoc.id,
          ...billData,
          userName: userDoc.exists() ? userDoc.data().name : 'Unknown',
        });
      }
      
      setBills(billsList);
    } catch (error) {
      console.error('Error loading approved bills:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const usersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersList);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const billsSnapshot = await getDocs(collection(db, 'bills'));

      let pendingCount = 0;
      let approvedCount = 0;
      let totalRevenue = 0;

      billsSnapshot.forEach(billDoc => {
        const data = billDoc.data();
        if (data.status === 'pending') pendingCount++;
        if (data.status === 'approved') {
          approvedCount++;
          totalRevenue += data.amount || 0;
        }
      });

      setStats({
        totalUsers: usersSnapshot.size,
        totalBills: billsSnapshot.size,
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

  const approveBill = async (billId) => {
    try {
      await updateDoc(doc(db, 'bills', billId), { status: 'approved' });
      Alert.alert('Success', 'Bill approved');
      loadPendingBills();
    } catch (error) {
      Alert.alert('Error', 'Failed to approve bill');
      console.error(error);
    }
  };

  const rejectBill = async (billId) => {
    try {
      await updateDoc(doc(db, 'bills', billId), { status: 'rejected' });
      Alert.alert('Success', 'Bill rejected');
      loadPendingBills();
    } catch (error) {
      Alert.alert('Error', 'Failed to reject bill');
      console.error(error);
    }
  };

  const createEvent = async () => {
    try {
      if (!formData.title || !formData.description || !formData.date) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
      await addDoc(collection(db, 'events'), {
        ...formData,
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
    try {
      await deleteDoc(doc(db, 'events', eventId));
      Alert.alert('Success', 'Event deleted');
      loadEvents();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete event');
      console.error(error);
    }
  };

  const deleteNews = async (newsId) => {
    try {
      await deleteDoc(doc(db, 'news', newsId));
      Alert.alert('Success', 'Newsletter deleted');
      loadNews();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete newsletter');
      console.error(error);
    }
  };

  const renderPendingBills = () => {
    if (bills.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No pending bills</Text>
        </View>
      );
    }

    return bills.map(bill => (
      <View key={bill.id} style={styles.billCard}>
        <View style={styles.billHeader}>
          <View>
            <Text style={styles.billTitle}>{bill.restaurantName}</Text>
            <Text style={styles.billSubtext}>{bill.userName}</Text>
          </View>
          <Text style={styles.billAmount}>₺{bill.amount.toFixed(2)}</Text>
        </View>

        {bill.imageUrl && (
          <Image source={{ uri: bill.imageUrl }} style={styles.billImage} />
        )}

        <Text style={styles.billDate}>
          {new Date(bill.createdAt).toLocaleDateString()}
        </Text>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => approveBill(bill.id)}
          >
            <Text style={styles.actionBtnText}>✓ Approve</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => rejectBill(bill.id)}
          >
            <Text style={styles.actionBtnText}>✕ Reject</Text>
          </TouchableOpacity>
        </View>
      </View>
    ));
  };

  const renderApprovedBills = () => {
    if (bills.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No approved bills</Text>
        </View>
      );
    }

    return bills.map(bill => (
      <View key={bill.id} style={styles.billCard}>
        <View style={styles.billHeader}>
          <View>
            <Text style={styles.billTitle}>{bill.restaurantName}</Text>
            <Text style={styles.billSubtext}>{bill.userName}</Text>
          </View>
          <Text style={styles.billAmount}>₺{bill.amount.toFixed(2)}</Text>
        </View>

        {bill.imageUrl && (
          <Image source={{ uri: bill.imageUrl }} style={styles.billImage} />
        )}

        <Text style={styles.billDate}>
          {new Date(bill.createdAt).toLocaleDateString()}
        </Text>
      </View>
    ));
  };

  const renderUsers = () => {
    return users.map(usr => (
      <View key={usr.id} style={styles.userCard}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{usr.name}</Text>
          <Text style={styles.userEmail}>{usr.email}</Text>
          <Text style={styles.userSubtext}>ID: {usr.studentId}</Text>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.statValue}>₺{(usr.lifetimeSpend || 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.userStats}>
          <Text style={styles.statValue}>{usr.totalOrders || 0}</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
      </View>
    ));
  };

  const renderEvents = () => {
    if (events.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events created yet</Text>
        </View>
      );
    }
    return events.map(event => (
      <View key={event.id} style={styles.managementCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{event.title}</Text>
            <Text style={styles.cardSubtext}>{event.date} • {event.time}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteEvent(event.id)}>
            <Text style={styles.deleteBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDesc}>{event.description.substring(0, 50)}...</Text>
      </View>
    ));
  };

  const renderNews = () => {
    if (news.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No newsletters created yet</Text>
        </View>
      );
    }
    return news.map(item => (
      <View key={item.id} style={styles.managementCard}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtext}>{item.date}</Text>
          </View>
          <TouchableOpacity onPress={() => deleteNews(item.id)}>
            <Text style={styles.deleteBtn}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.cardDesc}>{item.subtitle}</Text>
      </View>
    ));
  };

  const renderStats = () => {
    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Total Users</Text>
          <Text style={styles.statCardValue}>{stats.totalUsers}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Total Bills</Text>
          <Text style={styles.statCardValue}>{stats.totalBills}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Pending</Text>
          <Text style={[styles.statCardValue, { color: '#FFA500' }]}>
            {stats.pendingBills}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statCardLabel}>Approved</Text>
          <Text style={[styles.statCardValue, { color: '#4CAF50' }]}>
            {stats.approvedBills}
          </Text>
        </View>
        <View style={[styles.statCard, { marginBottom: 20 }]}>
          <Text style={styles.statCardLabel}>Total Revenue</Text>
          <Text style={styles.statCardValue}>₺{stats.totalRevenue.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <Text style={styles.headerSubtitle}>Welcome, {userData?.name}</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {['pending', 'approved', 'users', 'events', 'news', 'stats'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Add Button for Management Tabs */}
      {(activeTab === 'events' || activeTab === 'news') && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setModalType(activeTab === 'events' ? 'event' : 'news');
            setFormData({ title: '', description: '', date: '', time: '', location: '', type: 'Conference', subtitle: '', url: '' });
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add {activeTab === 'events' ? 'Event' : 'Newsletter'}</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {activeTab === 'pending' && renderPendingBills()}
            {activeTab === 'approved' && renderApprovedBills()}
            {activeTab === 'users' && renderUsers()}
            {activeTab === 'events' && renderEvents()}
            {activeTab === 'news' && renderNews()}
            {activeTab === 'stats' && renderStats()}
          </>
        )}
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
                placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />

              {modalType === 'event' && (
                <>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Enter description"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                    multiline
                    numberOfLines={4}
                  />

                  <Text style={styles.inputLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., February 15, 2026"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />

                  <Text style={styles.inputLabel}>Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 14:00"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.time}
                    onChangeText={(text) => setFormData({ ...formData, time: text })}
                  />

                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter location"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.location}
                    onChangeText={(text) => setFormData({ ...formData, location: text })}
                  />

                  <Text style={styles.inputLabel}>Type</Text>
                  <View style={styles.typeButtons}>
                    {['Conference', 'Discussion', 'Entertainment', 'Activity'].map(type => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeBtn,
                          formData.type === type && styles.typeBtnActive,
                        ]}
                        onPress={() => setFormData({ ...formData, type })}
                      >
                        <Text
                          style={[
                            styles.typeBtnText,
                            formData.type === type && styles.typeBtnTextActive,
                          ]}
                        >
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
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.subtitle}
                    onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
                  />

                  <Text style={styles.inputLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., January 2026"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.date}
                    onChangeText={(text) => setFormData({ ...formData, date: text })}
                  />

                  <Text style={styles.inputLabel}>PDF URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter PDF URL"
                    placeholderTextColor={isDark ? colors.lightSubText : colors.subText}
                    value={formData.url}
                    onChangeText={(text) => setFormData({ ...formData, url: text })}
                  />
                </>
              )}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={() => {
                  if (modalType === 'event') createEvent();
                  else createNews();
                }}
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
      backgroundColor: isDark ? colors.darkBg : colors.lightBg,
    },
    header: {
      padding: 20,
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderBottomColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderBottomWidth: 1,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    headerSubtitle: {
      fontSize: 14,
      color: isDark ? colors.lightSubText : colors.subText,
      marginTop: 4,
    },
    tabsContainer: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderBottomColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderBottomWidth: 1,
    },
    tab: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 3,
      borderBottomColor: 'transparent',
    },
    activeTab: {
      borderBottomColor: colors.accent,
    },
    tabText: {
      color: isDark ? colors.lightSubText : colors.subText,
      fontSize: 13,
      fontWeight: '600',
    },
    activeTabText: {
      color: colors.accent,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    emptyText: {
      color: isDark ? colors.lightSubText : colors.subText,
      fontSize: 16,
    },
    billCard: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
    },
    billHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    billTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    billSubtext: {
      fontSize: 12,
      color: isDark ? colors.lightSubText : colors.subText,
      marginTop: 4,
    },
    billAmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.accent,
    },
    billImage: {
      width: '100%',
      height: 150,
      borderRadius: 8,
      marginBottom: 12,
    },
    billDate: {
      fontSize: 12,
      color: isDark ? colors.lightSubText : colors.subText,
      marginBottom: 12,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 10,
    },
    actionBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    approveBtn: {
      backgroundColor: '#4CAF50',
    },
    rejectBtn: {
      backgroundColor: '#F44336',
    },
    actionBtnText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 13,
    },
    userCard: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 15,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    userEmail: {
      fontSize: 12,
      color: colors.accent,
      marginTop: 4,
    },
    userSubtext: {
      fontSize: 11,
      color: isDark ? colors.lightSubText : colors.subText,
      marginTop: 4,
    },
    userStats: {
      alignItems: 'center',
      marginLeft: 12,
    },
    statValue: {
      fontSize: 14,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    statLabel: {
      fontSize: 11,
      color: isDark ? colors.lightSubText : colors.subText,
      marginTop: 2,
    },
    statsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingBottom: 20,
    },
    statCard: {
      width: '48%',
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
      alignItems: 'center',
    },
    statCardLabel: {
      fontSize: 12,
      color: isDark ? colors.lightSubText : colors.subText,
      marginBottom: 8,
    },
    statCardValue: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    addButton: {
      backgroundColor: colors.accent,
      margin: 16,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
    },
    addButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
    },
    managementCard: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
      marginHorizontal: 16,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    cardSubtext: {
      fontSize: 12,
      color: isDark ? colors.lightSubText : colors.subText,
      marginTop: 4,
    },
    cardDesc: {
      fontSize: 13,
      color: isDark ? colors.lightSubText : colors.subText,
      lineHeight: 18,
    },
    deleteBtn: {
      fontSize: 18,
      color: '#F44336',
      fontWeight: 'bold',
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.primaryDark,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: 20,
      maxHeight: '90%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderBottomWidth: 1,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
    },
    closeBtn: {
      fontSize: 24,
      color: isDark ? colors.lightSubText : colors.subText,
    },
    modalForm: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      maxHeight: '65%',
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: 'bold',
      color: isDark ? colors.lightText : colors.darkText,
      marginTop: 12,
      marginBottom: 6,
    },
    input: {
      backgroundColor: isDark ? colors.darkBg : colors.lightBg,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: isDark ? colors.lightText : colors.darkText,
      fontSize: 13,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    typeButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    typeBtn: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
      backgroundColor: 'transparent',
    },
    typeBtnActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    typeBtnText: {
      fontSize: 12,
      color: isDark ? colors.lightSubText : colors.subText,
      fontWeight: '600',
    },
    typeBtnTextActive: {
      color: 'white',
    },
    modalButtons: {
      flexDirection: 'row',
      padding: 16,
      gap: 10,
      borderTopColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderTopWidth: 1,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
      borderWidth: 1,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: isDark ? colors.lightSubText : colors.subText,
      fontWeight: '600',
      fontSize: 14,
    },
    submitBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    submitBtnText: {
      color: 'white',
      fontWeight: '600',
      fontSize: 14,
    },
  });

