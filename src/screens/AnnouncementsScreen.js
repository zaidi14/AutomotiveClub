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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';

const { width } = Dimensions.get('window');

export default function AnnouncementsScreen() {
  const { isDark } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'OtoZirve 2026',
      date: 'February 15, 2026',
      time: '14:00',
      location: 'Sümer Campus Conference Hall',
      description: 'Annual automotive industry summit featuring guest speakers from leading manufacturers.',
      type: 'Conference',
    },
    {
      id: 2,
      title: 'AutoDebate: Electric vs Hybrid',
      date: 'February 22, 2026',
      time: '18:30',
      location: 'Engineering Building, Room 301',
      description: 'Join us for a heated debate on the future of automotive propulsion systems.',
      type: 'Discussion',
    },
    {
      id: 3,
      title: 'AutoSinema: Rush (2013)',
      date: 'March 5, 2026',
      time: '20:00',
      location: 'Campus Open Air Cinema',
      description: 'Movie night featuring the legendary F1 rivalry between Hunt and Lauda.',
      type: 'Entertainment',
    },
    {
      id: 4,
      title: 'Track Day Experience',
      date: 'March 12, 2026',
      time: '09:00',
      location: 'İzmir Racing Circuit',
      description: 'Exclusive track day for club members. Limited spots available.',
      type: 'Activity',
    },
  ]);

  const styles = createStyles(isDark);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

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

  const handleReminder = (eventTitle) => {
    // TODO: Implement reminder/notification logic
    alert(`Reminder set for ${eventTitle}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.titleText}>Announcements</Text>
          <Text style={styles.subtitleText}>Stay updated with club events</Text>
        </View>

        {/* Events List */}
        <View style={styles.eventsContainer}>
          {events.map((event) => (
            <View key={event.id} style={styles.eventCard}>
              {/* Type Badge */}
              <View style={[styles.typeBadge, { backgroundColor: getTypeColor(event.type) }]}>
                <Text style={styles.typeText}>{event.type.toUpperCase()}</Text>
              </View>

              {/* Event Title */}
              <Text style={styles.eventTitle}>{event.title}</Text>

              {/* Date & Time */}
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📅</Text>
                <Text style={styles.infoText}>{event.date}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>🕐</Text>
                <Text style={styles.infoText}>{event.time}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📍</Text>
                <Text style={styles.infoText}>{event.location}</Text>
              </View>

              {/* Description */}
              <Text style={styles.description}>{event.description}</Text>

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => handleReminder(event.title)}
                >
                  <Text style={styles.primaryButtonText}>Set Reminder</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Details</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Empty State for Future Integration */}
        <View style={styles.infoCard}>
          <Text style={styles.infoCardText}>
            🔗 This section will automatically sync with aguautomotiveclub.com events
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
  eventsContainer: {
    gap: 16,
  },
  eventCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  typeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.lightText,
    letterSpacing: 0.5,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.primary,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: isDark ? colors.silver : colors.subText,
  },
  description: {
    fontSize: 14,
    color: isDark ? colors.lightSubText : colors.subText,
    lineHeight: 20,
    marginTop: 12,
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.lightText,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: isDark ? colors.silver : colors.primary,
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
