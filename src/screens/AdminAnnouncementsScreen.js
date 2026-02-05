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
  Dimensions,
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
} from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function AdminAnnouncementsScreen() {
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

  const styles = createStyles();

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
    Alert.alert('Delete Announcement', 'This action cannot be undone.', [
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

  const typeOptions = ['Conference', 'Discussion', 'Entertainment', 'Activity'];

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
          <Text style={styles.subtitle}>Admin Panel</Text>
          <Text style={styles.title}>Manage Announcements</Text>
          <Text style={styles.description}>Create, edit, or delete community announcements</Text>
        </View>

        {/* Add New Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonIcon}>+</Text>
          <View style={styles.addButtonContent}>
            <Text style={styles.addButtonTitle}>Add New Announcement</Text>
            <Text style={styles.addButtonDesc}>Create an upcoming event</Text>
          </View>
          <Text style={styles.addButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Announcements List */}
        <View style={styles.listSection}>
          {announcements.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No announcements yet</Text>
              <Text style={styles.emptyDesc}>Start by creating your first announcement</Text>
            </View>
          ) : (
            <>
              <Text style={styles.listTitle}>
                Active Announcements ({announcements.length})
              </Text>
              <View style={styles.announcementsList}>
                {announcements.map((announcement) => (
                  <View key={announcement.id} style={styles.announcementCard}>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>📣</Text>
                        <View style={styles.cardTitleSection}>
                          <Text style={styles.cardTitle}>{announcement.title}</Text>
                          <View style={styles.typeBadge}>
                            <Text style={styles.typeBadgeText}>{announcement.type}</Text>
                          </View>
                        </View>
                      </View>

                      <View style={styles.cardDetails}>
                        <View style={styles.detail}>
                          <Text style={styles.detailIcon}>📅</Text>
                          <Text style={styles.detailText}>
                            {announcement.date?.toDate?.().toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.detail}>
                          <Text style={styles.detailIcon}>🕐</Text>
                          <Text style={styles.detailText}>{announcement.time}</Text>
                        </View>
                      </View>

                      <View style={styles.detail}>
                        <Text style={styles.detailIcon}>📍</Text>
                        <Text style={styles.detailText}>{announcement.location}</Text>
                      </View>

                      <Text style={styles.description}>
                        {announcement.description.substring(0, 80)}
                        {announcement.description.length > 80 ? '...' : ''}
                      </Text>
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(announcement)}
                      >
                        <Text style={styles.actionIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(announcement.id)}
                      >
                        <Text style={styles.actionIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />
          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => {
                resetForm();
                setModalVisible(false);
              }}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {editingId ? 'Edit Announcement' : 'New Announcement'}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter event title"
                placeholderTextColor={colors.textMuted}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Time *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={formData.time}
                  onChangeText={(text) => setFormData({ ...formData, time: text })}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Location *</Text>
              <TextInput
                style={styles.input}
                placeholder="Event location"
                placeholderTextColor={colors.textMuted}
                value={formData.location}
                onChangeText={(text) => setFormData({ ...formData, location: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Event Type *</Text>
              <View style={styles.typeSelector}>
                {typeOptions.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeOption,
                      formData.type === type && styles.typeOptionSelected,
                    ]}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        formData.type === type && styles.typeOptionTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Event description"
                placeholderTextColor={colors.textMuted}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddOrUpdate}
              >
                <Text style={styles.submitButtonIcon}>✓</Text>
                <Text style={styles.submitButtonText}>
                  {editingId ? 'Update' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    addButton: {
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
    addButtonIcon: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.accent,
    },
    addButtonContent: {
      flex: 1,
    },
    addButtonTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    addButtonDesc: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 2,
    },
    addButtonArrow: {
      fontSize: 18,
      color: colors.accent,
    },
    listSection: {
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
    listTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    announcementsList: {
      gap: 12,
    },
    announcementCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    cardContent: {
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 12,
    },
    cardIcon: {
      fontSize: 24,
      marginTop: 2,
    },
    cardTitleSection: {
      flex: 1,
      gap: 6,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    typeBadge: {
      alignSelf: 'flex-start',
<<<<<<< HEAD
      backgroundColor: colors.primaryDark,
=======
      backgroundColor: 'rgba(200, 16, 46, 0.15)',
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: colors.accent,
      textTransform: 'uppercase',
    },
    cardDetails: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    detailIcon: {
      fontSize: 14,
    },
    detailText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    cardActions: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    editButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRightWidth: 1,
      borderRightColor: colors.border,
    },
    deleteButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
    },
    actionIcon: {
      fontSize: 16,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.darkBg,
    },
    modalScroll: {
      flex: 1,
    },
    modalContent: {
      paddingHorizontal: 16,
      paddingBottom: 32,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 16,
      paddingHorizontal: 0,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 24,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textMuted,
      fontWeight: '600',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    formGroup: {
      marginBottom: 16,
    },
    row: {
      flexDirection: 'row',
      marginBottom: 0,
    },
    label: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    input: {
<<<<<<< HEAD
      backgroundColor: colors.darkCardBg,
=======
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    textArea: {
      paddingVertical: 12,
      textAlignVertical: 'top',
    },
    typeSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    typeOption: {
      flex: 1,
      minWidth: '45%',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    typeOptionSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    typeOptionText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted,
    },
    typeOptionTextSelected: {
      color: colors.text,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
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
    submitButtonIcon: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '700',
    },
    submitButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
  });
