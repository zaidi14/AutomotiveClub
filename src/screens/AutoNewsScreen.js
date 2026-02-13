import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  StyleSheet,
  Linking,
  TextInput,
  RefreshControl,
} from 'react-native';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AutoNewsScreen() {
  const [loading, setLoading] = useState(false);
  const [newsletters, setNewsletters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'news'), (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setNewsletters(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error fetching news:', error);
      setLoading(false);
    }
  }, []);

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
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
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
            <>
            <TextInput
              style={styles.searchInput}
              placeholder="Search news..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {newsletters.filter(n => n.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((newsletter) => (
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
                  <TouchableOpacity
                    style={styles.openButton}
                    onPress={() => openDocument(newsletter.url)}
                  >
                    <Text style={styles.openButtonText}>Open →</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
            </>
          )}
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
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
    headerSection: {
      marginBottom: 36,
    },
    subtitle: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '400',
    },
    newsContainer: {
      gap: 20,
    },
    searchInput: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 16,
      paddingHorizontal: 18,
      paddingVertical: 14,
      fontSize: 15,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 20,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    emptyDesc: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '400',
    },
    newsCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 14,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardIcon: {
      fontSize: 28,
    },
    cardMeta: {
      flex: 1,
    },
    pages: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text,
    },
    size: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
      fontWeight: '400',
    },
    cardTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 6,
      marginHorizontal: 0,
    },
    cardSubtitle: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 16,
      fontWeight: '400',
      lineHeight: 20,
    },
    topicsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 16,
    },
    topicTag: {
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: colors.border,
    },
    topicText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
    },
    cardFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    dateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dateIcon: {
      fontSize: 16,
    },
    dateText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '400',
    },
    openButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: colors.accent,
    },
    openButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#fff',
      letterSpacing: 0,
    },
  });
