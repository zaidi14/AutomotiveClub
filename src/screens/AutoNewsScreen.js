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
<<<<<<< HEAD
  Modal,
  Alert,
=======
  RefreshControl,
  ActivityIndicator,
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28
  Linking,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function AutoNewsScreen() {
<<<<<<< HEAD
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
=======
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newsletters, setNewsletters] = useState([]);
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28

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
<<<<<<< HEAD
    }
  };

  const openDocument = (url) => {
    if (url) {
      Linking.openURL(url);
    }
  };
=======
    }
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
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
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28

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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Resources</Text>
          <Text style={styles.title}>News & Articles</Text>
          <Text style={styles.description}>Latest automotive news and publications</Text>
        </View>

        {/* Newsletter Cards Grid */}
        <View style={styles.newsContainer}>
          {newsletters.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📰</Text>
              <Text style={styles.emptyText}>No news available</Text>
              <Text style={styles.emptyDesc}>New articles will appear here soon</Text>
            </View>
          ) : (
            newsletters.map((newsletter) => (
              <TouchableOpacity
                key={newsletter.id}
                style={styles.newsCard}
                onPress={() => openDocument(newsletter.url)}
                activeOpacity={0.7}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.iconCircle}>
                    <Text style={styles.cardIcon}>📄</Text>
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
<<<<<<< HEAD
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
=======
                  <View style={styles.openButton}>
                    <Text style={styles.openButtonText}>Open →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
>>>>>>> 9e71fa56e040ca1fb8aa85bbd43420457a997f28
        </View>
      </ScrollView>
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
      marginBottom: 32,
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
    newsContainer: {
      gap: 16,
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
    newsCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(200, 16, 46, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    cardIcon: {
      fontSize: 24,
    },
    cardMeta: {
      flex: 1,
    },
    pages: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    size: {
      fontSize: 11,
      color: colors.textMuted,
      marginTop: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      marginHorizontal: 0,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 12,
      fontWeight: '500',
    },
    topicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    topicTag: {
      backgroundColor: 'rgba(10, 35, 66, 0.5)',
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicText: {
      fontSize: 11,
      color: colors.accentLight,
      fontWeight: '600',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dateIcon: {
      fontSize: 14,
    },
    dateText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    openButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: 'rgba(200, 16, 46, 0.15)',
    },
    openButtonText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accent,
      letterSpacing: 0.3,
    },
  });
