import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { db } from '../config/firebase';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';

const { width } = Dimensions.get('window');

export default function AnnouncementsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);

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
        setEvents(data);
        setLoading(false);
      });

      return unsubscribe;
    } catch (error) {
      console.log('Error fetching announcements:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'events'));
      const eventsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(eventsList);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadEvents().then(() => setRefreshing(false));
  };

  const getTypeColor = (type) => {
    const typeColors = {
      Conference: { bg: 'rgba(50, 130, 184, 0.1)', color: '#3282b8' },
      Discussion: { bg: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' },
      Entertainment: { bg: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' },
      Activity: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10B981' },
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>Community</Text>
          <Text style={styles.title}>Announcements</Text>
          <Text style={styles.description}>Stay updated with upcoming events and news</Text>
        </View>

        {/* Loading State */}
        {loading && !refreshing ? (
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
            {events.map((event) => (
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
      paddingTop: 24,
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
      backgroundColor: 'rgba(15, 76, 117, 0.2)',
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
