import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function AnnouncementsScreen() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'events'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const getTypeColor = (type) => {
    const typeColors = {
      Conference: { bg: 'rgba(1, 119, 227, 0.1)', color: '#0177E3' },
      Discussion: { bg: 'rgba(33, 42, 55, 0.3)', color: '#A0AEBF' },
      Entertainment: { bg: 'rgba(1, 119, 227, 0.15)', color: '#3393E8' },
      Activity: { bg: 'rgba(34, 197, 94, 0.1)', color: '#22C55E' },
    };
    return typeColors[type] || typeColors.Conference;
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
          <Text style={styles.subtitle}>Community</Text>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.description}>Stay updated with upcoming events and news</Text>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📭</Text>
            <Text style={styles.emptyText}>No announcements yet</Text>
            <Text style={styles.emptyDesc}>Check back soon for upcoming events</Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {events.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase())).map((event) => (
              <TouchableOpacity key={event.id} style={styles.eventCard}>
                <View style={styles.eventHeader}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{event.date}</Text>
                </View>
                {event.description && (
                  <Text style={styles.eventDesc}>{event.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    eventsContainer: {
      gap: 16,
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
    eventCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timelineContainer: {
      alignItems: 'center',
      marginRight: 16,
      paddingTop: 4,
    },
    timelineDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accent,
      marginBottom: 8,
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: colors.border,
      minHeight: 80,
    },
    eventContent: {
      flex: 1,
    },
    typeBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 12,
      marginBottom: 16,
    },
    typeText: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    eventTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    eventHeader: {
      marginBottom: 12,
    },
    eventDate: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '400',
    },
    eventDesc: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '400',
      lineHeight: 22,
    },
    detailsContainer: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    detail: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    detailIcon: {
      fontSize: 16,
    },
    detailText: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    reminderBtn: {
      marginTop: 12,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: 'rgba(1, 119, 227, 0.15)',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.accent,
      alignItems: 'center',
    },
    reminderBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.accentLight,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
  });
