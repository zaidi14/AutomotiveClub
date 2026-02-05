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
} from 'firebase/firestore';

export default function AdminNewslettersScreen() {
  const { isDark } = useApp();
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

  const styles = createStyles(isDark);

  // Fetch newsletters
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
    if (!formData.title || !formData.subtitle || !formData.date || !formData.pages || !formData.url) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const newsletterData = {
        title: formData.title,
        subtitle: formData.subtitle,
        date: new Date(formData.date),
        pages: parseInt(formData.pages),
        size: formData.size,
        url: formData.url,
        topics: formData.topics.split(',').map((t) => t.trim()).filter((t) => t),
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
    Alert.alert('Delete', 'Are you sure?', [
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
      subtitle: newsletter.subtitle,
      date: newsletter.date.toDate?.()?.toISOString().split('T')[0] || '',
      pages: newsletter.pages.toString(),
      size: newsletter.size,
      url: newsletter.url,
      topics: newsletter.topics?.join(', ') || '',
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
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Manage Newsletters</Text>
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+ Add New Newsletter</Text>
        </TouchableOpacity>

        <View style={styles.listContainer}>
          {newsletters.map((newsletter) => (
            <View key={newsletter.id} style={styles.newsletterCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{newsletter.title}</Text>
                  <Text style={styles.cardSubtitle}>{newsletter.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.cardText}>📅 {newsletter.date.toDate?.()?.toLocaleDateString() || 'N/A'}</Text>
              <Text style={styles.cardText}>📄 {newsletter.pages} pages • {newsletter.size}</Text>
              <Text style={styles.cardText} numberOfLines={1}>🔗 {newsletter.url}</Text>
              {newsletter.topics && newsletter.topics.length > 0 && (
                <View style={styles.topicsContainer}>
                  {newsletter.topics.map((topic, index) => (
                    <View key={index} style={styles.topicTag}>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => handleEdit(newsletter)}
                >
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDelete(newsletter.id)}
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
              <Text style={styles.modalTitle}>{editingId ? 'Edit Newsletter' : 'New Newsletter'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formContainer}>
              <Text style={styles.label}>Title</Text>
              <TextInput
                style={styles.input}
                placeholder="Newsletter title"
                value={formData.title}
                onChangeText={(text) => setFormData({ ...formData, title: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Subtitle</Text>
              <TextInput
                style={styles.input}
                placeholder="Newsletter subtitle"
                value={formData.subtitle}
                onChangeText={(text) => setFormData({ ...formData, subtitle: text })}
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

              <Text style={styles.label}>Pages</Text>
              <TextInput
                style={styles.input}
                placeholder="Number of pages"
                value={formData.pages}
                onChangeText={(text) => setFormData({ ...formData, pages: text })}
                keyboardType="numeric"
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Size</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 2.4 MB"
                value={formData.size}
                onChangeText={(text) => setFormData({ ...formData, size: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>PDF URL</Text>
              <TextInput
                style={styles.input}
                placeholder="PDF file URL"
                value={formData.url}
                onChangeText={(text) => setFormData({ ...formData, url: text })}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

              <Text style={styles.label}>Topics (comma separated)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Electric Vehicles, F1 Updates, Industry News"
                value={formData.topics}
                onChangeText={(text) => setFormData({ ...formData, topics: text })}
                multiline
                numberOfLines={3}
                placeholderTextColor={isDark ? colors.darkSecondaryText : colors.lightSecondaryText}
              />

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
    newsletterCard: {
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    cardHeader: {
      flexDirection: 'row',
      marginBottom: 8,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: isDark ? colors.darkText : colors.lightText,
    },
    cardSubtitle: {
      fontSize: 13,
      color: isDark ? colors.darkSecondaryText : colors.lightSecondaryText,
      marginTop: 2,
    },
    cardText: {
      fontSize: 13,
      color: isDark ? colors.darkSecondaryText : colors.lightSecondaryText,
      marginBottom: 4,
    },
    topicsContainer: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
      marginVertical: 8,
    },
    topicTag: {
      backgroundColor: colors.accent,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    topicText: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
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
