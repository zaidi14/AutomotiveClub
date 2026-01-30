import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function AutoNewsScreen() {
  const { isDark } = useApp();
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newsletters, setNewsletters] = useState([]);

  const styles = createStyles(isDark);

  // Fetch newsletters from Firebase
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

  const handleDownload = async (newsletter) => {
    try {
      Alert.alert('Download', `Downloading ${newsletter.title}...`);
      // TODO: Implement actual PDF download
      // const downloadResumable = FileSystem.createDownloadResumable(
      //   newsletter.url,
      //   FileSystem.documentDirectory + `${newsletter.title}.pdf`
      // );
      // const { uri } = await downloadResumable.downloadAsync();
      // await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Error', 'Failed to download PDF');
    }
  };

  const handleView = (newsletter) => {
    // TODO: Implement PDF viewer with react-native-pdf
    Alert.alert('PDF Viewer', `Opening ${newsletter.title}\n\nPDF viewer will be implemented here.`);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.titleText}>AutoNews</Text>
          <Text style={styles.subtitleText}>Monthly newsletter & industry reports</Text>
        </View>

        {/* Newsstand Grid */}
        <View style={styles.gridContainer}>
          {newsletters.map((newsletter) => (
            <View key={newsletter.id} style={styles.newsletterCard}>
              {/* Cover Preview */}
              <View style={styles.coverContainer}>
                <View style={styles.coverPlaceholder}>
                  <Text style={styles.coverIcon}>📰</Text>
                  <Text style={styles.coverTitle}>{newsletter.title}</Text>
                </View>
              </View>

              {/* Newsletter Info */}
              <View style={styles.infoContainer}>
                <Text style={styles.newsletterTitle} numberOfLines={2}>
                  {newsletter.title}
                </Text>
                <Text style={styles.newsletterSubtitle} numberOfLines={1}>
                  {newsletter.subtitle}
                </Text>

                {/* Meta Info */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text style={styles.metaText}>
                      {newsletter.date?.toDate ? newsletter.date.toDate().toLocaleDateString() : newsletter.date}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📄</Text>
                    <Text style={styles.metaText}>{newsletter.pages} pages</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>💾</Text>
                    <Text style={styles.metaText}>{newsletter.size}</Text>
                  </View>
                </View>

                {/* Topics */}
                <View style={styles.topicsContainer}>
                  {newsletter.topics.map((topic, index) => (
                    <View key={index} style={styles.topicBadge}>
                      <Text style={styles.topicText}>{topic}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => handleView(newsletter)}
                  >
                    <Text style={styles.viewButtonText}>📖 Read</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.downloadButton}
                    onPress={() => handleDownload(newsletter)}
                  >
                    <Text style={styles.downloadButtonText}>⬇️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>
            📚 New newsletters are published monthly. PDFs can be read offline once downloaded.
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
    paddingVertical: 20,
    paddingTop: 50,
  },
  headerSection: {
    marginBottom: 24,
  },
  titleText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.primary,
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: isDark ? colors.silver : colors.subText,
  },
  gridContainer: {
    gap: 16,
  },
  newsletterCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  coverContainer: {
    width: '100%',
    height: 180,
    backgroundColor: colors.primary,
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  coverIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  coverTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.lightText,
    textAlign: 'center',
  },
  infoContainer: {
    padding: 16,
  },
  newsletterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.primary,
    marginBottom: 4,
  },
  newsletterSubtitle: {
    fontSize: 14,
    color: isDark ? colors.silver : colors.subText,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  metaText: {
    fontSize: 12,
    color: isDark ? colors.silver : colors.subText,
  },
  topicsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 12,
    marginBottom: 16,
  },
  topicBadge: {
    backgroundColor: isDark ? colors.primary : colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicText: {
    fontSize: 10,
    color: colors.lightText,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  viewButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightText,
  },
  downloadButton: {
    width: 48,
    backgroundColor: isDark ? colors.primary : colors.primaryLight,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadButtonText: {
    fontSize: 18,
  },
  infoCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  infoCardText: {
    fontSize: 12,
    color: isDark ? colors.silver : colors.subText,
    textAlign: 'center',
  },
});
