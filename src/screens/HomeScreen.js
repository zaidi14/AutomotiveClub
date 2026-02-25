import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { signOut } from '../services/authService';
import { colors } from '../styles/colors';
import { useApp } from '../context/AppContext';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  const { user, userData, refreshUserData } = useApp();
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  if (!userData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const stats = [
    {
      id: 1,
      displayValue: userData.totalOrders || 0,
      subtitle: 'Orders',
      iconName: 'receipt-outline',
    },
    {
      id: 2,
      displayValue: `₺${(userData.lifetimeSpend || 0).toFixed(0)}`,
      subtitle: 'Spent',
      iconName: 'wallet-outline',
    },
    {
      id: 3,
      displayValue: `₺${(userData.lifetimeSavings || 0).toFixed(0)}`,
      subtitle: 'Saved',
      iconName: 'cash-outline',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userData.name || 'Member'}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.navigate('Profile')} accessibilityLabel="Profile settings" accessibilityRole="button">
              <Ionicons name="person-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} accessibilityLabel="Log out" accessibilityRole="button">
              <Ionicons name="log-out-outline" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Card Info */}
        <View style={styles.memberCard}>
          <View style={styles.memberCardHeader}>
            <Text style={styles.memberCardTitle}>Member Status</Text>
            <Text style={styles.memberCardBadge}>✓ Active</Text>
          </View>
          <View style={styles.memberCardBody}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberLabel}>Student ID</Text>
              <Text style={styles.memberValue}>{userData.studentId}</Text>
            </View>
            <View style={styles.memberDivider} />
            <View style={styles.memberInfo}>
              <Text style={styles.memberLabel}>Email</Text>
              <Text style={styles.memberValue}>{userData.email}</Text>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Dashboard</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={styles.statIconContainer}>
                  <Ionicons name={stat.iconName} size={20} color={colors.accent} />
                </View>
                <Text style={styles.statValue}>{stat.displayValue}</Text>
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Billing')}
            accessibilityLabel="Upload bill"
            accessibilityRole="button"
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Upload Bill</Text>
              <Text style={styles.actionDesc}>Track & add your purchases</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Favorite Restaurant */}
        {userData.favoriteRestaurant && (
          <View style={styles.favSection}>
            <Text style={styles.sectionTitle}>Favorite Restaurant</Text>
            <View style={styles.favCard}>
              <Text style={styles.favIcon}>⭐</Text>
              <Text style={styles.favName}>{userData.favoriteRestaurant}</Text>
            </View>
          </View>
        )}

        {/* Developer Credit */}
        <View style={styles.creditSection}>
          <Text style={styles.creditText}>© 2026 AGU Automotive Club</Text>
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
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.darkBg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 36,
      paddingTop: 8,
    },
    headerContent: {
      flex: 1,
    },
    greeting: {
      fontSize: 15,
      color: colors.textMuted,
      fontWeight: '400',
      marginBottom: 6,
    },
    userName: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.5,
    },
    logoutBtn: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    logoutIcon: {
      fontSize: 24,
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    headerActionBtn: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.03)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerActionIcon: {
      fontSize: 22,
    },
    memberCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 24,
      marginBottom: 28,
      borderWidth: 1,
      borderColor: colors.border,
    },
    memberCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    memberCardTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
    },
    memberCardBadge: {
      fontSize: 12,
      color: '#0177E3',
      backgroundColor: 'rgba(1, 119, 227, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      fontWeight: '600',
      borderWidth: 1,
      borderColor: 'rgba(1, 119, 227, 0.2)',
    },
    memberCardBody: {
      gap: 16,
    },
    memberInfo: {
      gap: 6,
    },
    memberLabel: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: '500',
      letterSpacing: 0,
    },
    memberValue: {
      fontSize: 16,
      color: colors.text,
      fontWeight: '500',
    },
    memberDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    statsSection: {
      marginBottom: 28,
    },
    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: 'rgba(1, 119, 227, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
      letterSpacing: 0.3,
    },
    statValueLegacy: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    actionsSection: {
      marginBottom: 28,
    },
    actionCard: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    actionIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionIcon: {
      fontSize: 28,
      color: '#fff',
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: '#fff',
      marginBottom: 4,
      letterSpacing: 0,
    },
    actionDesc: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.8)',
      fontWeight: '400',
    },
    actionArrow: {
      fontSize: 20,
      color: '#fff',
      fontWeight: '600',
    },
    favSection: {
      marginBottom: 24,
    },
    favCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    favIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    favName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
    },
    creditSection: {
      alignItems: 'center',
      paddingVertical: 24,
      marginTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    creditText: {
      fontSize: 11,
      color: colors.subText,
      fontWeight: '400',
    },
  });
