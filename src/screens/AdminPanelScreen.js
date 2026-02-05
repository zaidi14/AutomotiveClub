import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { colors } from '../styles/colors';
import { signOut } from '../services/authService';

export default function AdminPanelScreen({ navigation }) {
  const styles = createStyles();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  };

  const adminOptions = [
    {
      id: 1,
      title: 'Manage Announcements',
      description: 'Create, edit, and delete announcements and events',
      icon: '📢',
      screen: 'AdminAnnouncements',
      color: '#3282b8',
      bgColor: 'rgba(50, 130, 184, 0.1)',
    },
    {
      id: 2,
      title: 'Manage Newsletters',
      description: 'Upload and manage club newsletters and documents',
      icon: '📰',
      screen: 'AdminNewsletters',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View>
            <Text style={styles.subtitle}>Administration</Text>
            <Text style={styles.title}>Control Panel</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>⚙️</Text>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Admin Access</Text>
            <Text style={styles.infoDesc}>
              You have full access to manage club content
            </Text>
          </View>
        </View>

        {/* Options Grid */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Content Management</Text>

          {adminOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => navigation.navigate(option.screen)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.optionIconContainer,
                  { backgroundColor: option.bgColor },
                ]}
              >
                <Text style={styles.optionIcon}>{option.icon}</Text>
              </View>

              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>
                  {option.description}
                </Text>
              </View>

              <View style={styles.optionArrow}>
                <Text style={styles.arrowText}>→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Summary */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Info</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statLabel}>Content</Text>
              <Text style={styles.statValue}>Monitor</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statLabel}>Users</Text>
              <Text style={styles.statValue}>Manage</Text>
            </View>
          </View>
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
    content: {
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 32,
    },
    headerSection: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 32,
      paddingTop: 8,
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
    },
    logoutBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.primaryDark,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
    },
    logoutIcon: {
      fontSize: 20,
    },
    infoCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      borderLeftWidth: 4,
      borderLeftColor: colors.accentLight,
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    infoDesc: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    optionsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    optionCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    optionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    optionIcon: {
      fontSize: 28,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    optionArrow: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: colors.primaryDark,
      justifyContent: 'center',
      alignItems: 'center',
    },
    arrowText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.accent,
    },
    statsSection: {
      marginBottom: 24,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    statItem: {
      flex: 1,
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
  });
