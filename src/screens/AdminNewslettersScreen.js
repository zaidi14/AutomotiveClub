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

export default function AdminNewslettersScreen() {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    date: '',
    pages: '',
    size: '',
    url: '',
    topics: '',
  });

  const styles = createStyles();

  useEffect(() => {
    try {
      const q = query(
        collection(db, 'newsletters'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNewsletters(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error fetching newsletters:', error);
      setLoading(false);
    }
  }, []);

  const handleAddOrUpdate = async () => {
    if (!formData.title || !formData.date || !formData.url) {
      Alert.alert('Error', 'Please fill title, date, and URL fields');
      return;
    }

    try {
      const newsletterData = {
        title: formData.title,
        subtitle: formData.subtitle,
        date: new Date(formData.date),
        pages: formData.pages,
        size: formData.size,
        url: formData.url,
        topics: formData.topics
          .split(',')
          .map((t) => t.trim())
          .filter((t) => t),
      };

      if (editingId) {
        await updateDoc(doc(db, 'newsletters', editingId), newsletterData);
        Alert.alert('Success', 'Newsletter updated!');
      } else {
        await addDoc(collection(db, 'newsletters'), newsletterData);
        Alert.alert('Success', 'Newsletter created!');
      }

      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (id) => {
    Alert.alert('Delete Newsletter', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'newsletters', id));
            Alert.alert('Success', 'Newsletter deleted!');
          } catch (error) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleEdit = (newsletter) => {
    setFormData({
      title: newsletter.title,
      subtitle: newsletter.subtitle || '',
      date: newsletter.date?.toDate?.()?.toISOString().split('T')[0] || '',
      pages: newsletter.pages || '',
      size: newsletter.size || '',
      url: newsletter.url,
      topics: Array.isArray(newsletter.topics)
        ? newsletter.topics.join(', ')
        : newsletter.topics || '',
    });
    setEditingId(newsletter.id);
    setModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      subtitle: '',
      date: '',
      pages: '',
      size: '',
      url: '',
      topics: '',
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
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Admin Panel</Text>
          <Text style={styles.title}>Manage Newsletters</Text>
          <Text style={styles.description}>Create, edit, or delete newsletters and publications</Text>
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
            <Text style={styles.addButtonTitle}>Add New Newsletter</Text>
            <Text style={styles.addButtonDesc}>Create a new publication</Text>
          </View>
          <Text style={styles.addButtonArrow}>→</Text>
        </TouchableOpacity>

        {/* Newsletters List */}
        <View style={styles.listSection}>
          {newsletters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📰</Text>
              <Text style={styles.emptyText}>No newsletters yet</Text>
              <Text style={styles.emptyDesc}>Start by creating your first newsletter</Text>
            </View>
          ) : (
            <>
              <Text style={styles.listTitle}>
                Published Newsletters ({newsletters.length})
              </Text>
              <View style={styles.newslettersList}>
                {newsletters.map((newsletter) => (
                  <View key={newsletter.id} style={styles.newsletterCard}>
                    <View style={styles.cardContent}>
                      <View style={styles.cardHeader}>
                        <Text style={styles.cardIcon}>📄</Text>
                        <View style={styles.cardTitleSection}>
                          <Text style={styles.cardTitle}>{newsletter.title}</Text>
                          {newsletter.subtitle && (
                            <Text style={styles.cardSubtitle}>
                              {newsletter.subtitle}
                            </Text>
                          )}
                        </View>
                      </View>

                      <View style={styles.cardMeta}>
                        {newsletter.pages && (
                          <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>📄</Text>
                            <Text style={styles.metaText}>{newsletter.pages} pages</Text>
                          </View>
                        )}
                        {newsletter.size && (
                          <View style={styles.metaItem}>
                            <Text style={styles.metaIcon}>📦</Text>
                            <Text style={styles.metaText}>{newsletter.size}</Text>
                          </View>
                        )}
                        <View style={styles.metaItem}>
                          <Text style={styles.metaIcon}>📅</Text>
                          <Text style={styles.metaText}>
                            {newsletter.date?.toDate?.().toLocaleDateString()}
                          </Text>
                        </View>
                      </View>

                      {newsletter.topics && newsletter.topics.length > 0 && (
                        <View style={styles.topicsContainer}>
                          {newsletter.topics.slice(0, 3).map((topic, index) => (
                            <View key={index} style={styles.topicTag}>
                              <Text style={styles.topicText}>{topic}</Text>
                            </View>
                          ))}
                          {newsletter.topics.length > 3 && (
                            <View style={styles.topicTag}>
                              <Text style={styles.topicText}>
                                +{newsletter.topics.length - 3}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    <View style={styles.cardActions}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => handleEdit(newsletter)}
                      >
                        <Text style={styles.actionIcon}>✏️</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(newsletter.id)}
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
                {editingId ? 'Edit Newsletter' : 'New Newsletter'}
              </Text>
              <View style={{ width: 40 }} />
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Newsletter Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter newsletter title"
                placeholderTextColor={colors.textMuted}
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subtitle</Text>
              <TextInput
                style={styles.input}
                placeholder="Optional subtitle"
                placeholderTextColor={colors.textMuted}
                value={formData.subtitle}
                onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Publication Date *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={formData.date}
                  onChangeText={(text) => setFormData({ ...formData, date: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>Pages</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 12"
                  placeholderTextColor={colors.textMuted}
                  value={formData.pages}
                  onChangeText={(text) => setFormData({ ...formData, pages: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>File Size</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., 2.5 MB"
                  placeholderTextColor={colors.textMuted}
                  value={formData.size}
                  onChangeText={(text) => setFormData({ ...formData, size: text })}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>File Format</Text>
                <View style={styles.input}>
                  <Text style={styles.fileFormatText}>PDF</Text>
                </View>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>File URL / Link *</Text>
              <TextInput
                style={styles.input}
                placeholder="https://example.com/newsletter.pdf"
                placeholderTextColor={colors.textMuted}
                value={formData.url}
                onChangeText={(text) => setFormData({ ...formData, url: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Topics (comma-separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Cars, Maintenance, Technology"
                placeholderTextColor={colors.textMuted}
                value={formData.topics}
                onChangeText={(text) => setFormData({ ...formData, topics: text })}
                multiline
                numberOfLines={3}
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
    newslettersList: {
      gap: 12,
    },
    newsletterCard: {
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
      gap: 2,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
    },
    cardMeta: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      marginBottom: 8,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaIcon: {
      fontSize: 12,
    },
    metaText: {
      fontSize: 11,
      color: colors.textMuted,
    },
    topicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
    },
    topicTag: {
      backgroundColor: colors.primaryDark,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: colors.border,
    },
    topicText: {
      fontSize: 10,
      color: colors.accentLight,
      fontWeight: '600',
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
      backgroundColor: colors.darkCardBg,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    fileFormatText: {
      fontSize: 14,
      color: colors.textMuted,
      paddingVertical: 12,
      paddingHorizontal: 14,
    },
    textArea: {
      paddingVertical: 12,
      textAlignVertical: 'top',
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
