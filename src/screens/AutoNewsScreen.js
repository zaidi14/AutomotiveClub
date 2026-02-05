import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  Linking,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width } = Dimensions.get('window');

export default function AutoNewsScreen() {
  const { isDark } = useApp();
  const [selectedPdf, setSelectedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newsletters, setNewsletters] = useState([
    {
      id: 1,
      title: 'AutoNews January 2026',
      subtitle: 'New Year, New Innovations',
      date: 'January 2026',
      pages: 12,
      size: '2.4 MB',
      url: 'https://example.com/autonews-jan-2026.pdf', // Replace with actual PDF URL
      topics: ['Electric Vehicles', 'F1 Updates', 'Industry News'],
    },
    {
      id: 2,
      title: 'AutoNews December 2025',
      subtitle: 'Year in Review Special',
      date: 'December 2025',
      pages: 24,
      size: '4.1 MB',
      url: 'https://example.com/autonews-dec-2025.pdf',
      topics: ['Top 10 Cars', 'Tech Breakthroughs', 'Club Highlights'],
    },
    {
      id: 3,
      title: 'AutoNews November 2025',
      subtitle: 'Motorsport Season Finale',
      date: 'November 2025',
      pages: 16,
      size: '3.2 MB',
      url: 'https://example.com/autonews-nov-2025.pdf',
      topics: ['F1 Championship', 'WEC Finals', 'Rally Review'],
    },
  ]);

  const styles = createStyles(isDark);

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
      console.log('Error fetching newsletters:', error);
      setLoading(false);
    }
  };

  const openDocument = (url) => {
    if (url) {
      Linking.openURL(url);
    }
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
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Resources</Text>
          <Text style={styles.title}>News & Articles</Text>
          <Text style={styles.description}>Latest automotive news and publications</Text>
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
                    <Text style={styles.metaText}>{newsletter.date}</Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.pages}>{newsletter.pages || '?'} Pages</Text>
                    <Text style={styles.size}>{newsletter.size || 'PDF'}</Text>
                  </View>
                </View>

                {/* Card Content */}
                <Text style={styles.cardTitle}>{newsletter.title}</Text>
                {newsletter.subtitle && (
                  <Text style={styles.cardSubtitle}>{newsletter.subtitle}</Text>
                )}

                {/* Topics */}
                {newsletter.topics && newsletter.topics.length > 0 && (
                  <View style={styles.topicsContainer}>
                    {newsletter.topics.slice(0, 3).map((topic, index) => (
                      <View key={index} style={styles.topicTag}>
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                    {newsletter.topics.length > 3 && (
                      <View style={styles.topicTag}>
                        <Text style={styles.topicText}>+{newsletter.topics.length - 3}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Card Footer */}
                <View style={styles.cardFooter}>
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateIcon}>📅</Text>
                    <Text style={styles.dateText}>
                      {newsletter.date?.toDate
                        ? newsletter.date.toDate().toLocaleDateString()
                        : newsletter.date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => openDocument(newsletter.url)}
                  >
                    <Text style={styles.openButtonText}>Open →</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
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
