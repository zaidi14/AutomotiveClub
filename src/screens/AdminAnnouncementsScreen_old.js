import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';

export default function AdminAnnouncementsScreen() {
  const { isDark } = useApp();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    type: 'Conference',
  });

  const styles = createStyles(isDark);

  // Fetch announcements
  useEffect(() => {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnnouncements(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error fetching announcements:', error);
      setLoading(false);
    }
  }, []);

  const handleAddOrUpdate = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location || !formData.description) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const announcementData = {
        title: formData.title,
        date: new Date(formData.date),
        time: formData.time,
        location: formData.location,
        description: formData.description,
        type: formData.type,
      };

      if (editingId) {
        await updateDoc(doc(db, 'announcements', editingId), announcementData);
        Alert.alert('Success', 'Announcement updated!');
      } else {
        await addDoc(collection(db, 'announcements'), announcementData);
        Alert.alert('Success', 'Announcement created!');
      }

      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'announcements', id));
            Alert.alert('Success', 'Announcement deleted!');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleEdit = (announcement) => {
    setFormData({
      title: announcement.title,
      date: announcement.date.toDate?.()?.toISOString().split('T')[0] || '',
      time: announcement.time,
      location: announcement.location,
      description: announcement.description,
      type: announcement.type,
    });
    setEditingId(announcement.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      type: 'Conference',
    });
    setEditingId(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Announcements</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add New Announcement</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          {announcements.map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{announcement.title}</Text>
                <Text style={[styles.typeTag, { backgroundColor: getTypeColor(announcement.type) }]}>
                  {announcement.type}
                </Text>
              </View>
              <Text style={styles.cardText}>📅 {announcement.date.toDate?.()?.toLocaleDateString() || 'N/A'} at {announcement.time}</Text>
              <Text style={styles.cardText}>📍 {announcement.location}</Text>
              <Text style={styles.cardText} numberOfLines={2}>{announcement.description}</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(announcement)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(announcement.id)}
                >
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal for adding/editing */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Announcement' : 'New Announcement'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Announcement title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Time</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Location</Text>
              <TextInput
                style={styles.input}
                placeholder="Event location"
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event description"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Type</Text>
              <View style={styles.typeSelector}>
                {['Conference', 'Discussion', 'Entertainment', 'Activity'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      formData.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text style={styles.typeButtonText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleAddOrUpdate}>
                <Text style={styles.submitButtonText}>{editingId ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getTypeColor = (type) => {
  switch (type) {
    case 'Conference':
      return colors.accent;
    case 'Discussion':
      return '#FF9800';
    case 'Entertainment':
      return '#9C27B0';
    case 'Activity':
      return '#4CAF50';
    default:
      return colors.primary;
  }
};

const createStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBg : colors.lightBg,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 16,
      marginTop: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDark ? colors.darkText : colors.lightText,
    },
    addButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 16,
      alignItems: 'center',
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 16,
    },
    listContainer: {
      gap: 12,
    },
    announcementCard: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? colors.darkText : colors.lightText,
      flex: 1,
    },
    typeTag: {
      color: '#fff',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      fontSize: 12,
      fontWeight: '600',
    },
    cardText: {
      fontSize: 13,
      color: isDark ? colors.darkSecondaryText : colors.lightSecondaryText,
      marginBottom: 4,
    },
    cardActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDark ? colors.darkBorder : colors.lightBorder,
    },
    actionButton: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: colors.accent,
    },
    deleteButton: {
      backgroundColor: '#FF6B6B',
    },
    actionButtonText: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 13,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: isDark ? colors.darkBg : colors.lightBg,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '90%',
      paddingTop: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? colors.darkBorder : colors.lightBorder,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: isDark ? colors.darkText : colors.lightText,
    },
    closeButton: {
      fontSize: 24,
      color: isDark ? colors.darkText : colors.lightText,
    },
    formContainer: {
      padding: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.lightText,
      marginBottom: 8,
      marginTop: 12,
    },
    input: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: isDark ? colors.darkText : colors.lightText,
      borderWidth: 1,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    },
    textArea: {
      textAlignVertical: 'top',
    },
    typeSelector: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    typeButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderWidth: 2,
      borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    },
    typeButtonActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    typeButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.lightText,
    },
    submitButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 30,
    },
    submitButtonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });
