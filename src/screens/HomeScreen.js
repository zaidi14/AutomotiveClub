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
      label: 'Total Orders',
      value: userData.totalOrders || 0,
      displayValue: userData.totalOrders || 0,
      icon: '⊙',
      subtitle: 'TOTAL ORDERS',
    },
    {
      id: 2,
      label: 'Amount Spent',
      value: `₺${(userData.lifetimeSpend || 0).toFixed(0)}`,
      displayValue: `₺${(userData.lifetimeSpend || 0).toFixed(0)}`,
      icon: '⛽',
      subtitle: 'TOTAL SPENT',
    },
    {
      id: 3,
      label: 'Total Savings',
      value: `₺${(userData.lifetimeSavings || 0).toFixed(0)}`,
      displayValue: `₺${(userData.lifetimeSavings || 0).toFixed(0)}`,
      icon: '◉',
      subtitle: 'SAVED',
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
            <TouchableOpacity style={styles.headerActionBtn} onPress={() => navigation.navigate('Profile')}>
              <Ionicons name="settings-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Ionicons name="power" size={22} color={colors.text} />
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

        {/* Stats Section - Dashboard Gauges */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>⚡ DASHBOARD</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View style={styles.gaugeContainer}>
                  <View style={styles.gaugeOuter}>
                    <View style={styles.gaugeInner}>
                      <Text style={styles.statIconText}>{stat.displayValue}</Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions - Racing Theme */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>🏁 QUICK ACCESS</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Billing')}
          >
            <View style={styles.racingStripe} />
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Upload Bill</Text>
              <Text style={styles.actionDesc}>Track & Add your purchases</Text>
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
          <Text style={styles.creditText}>Developed by</Text>
          <Text style={styles.creditName}>Mojiz Zaidi</Text>
          <Text style={styles.creditYear}>© 2026</Text>
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
      borderRadius: 20,
      padding: 24,
      marginBottom: 36,
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
      color: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      fontWeight: '600',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.2)',
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
      marginBottom: 36,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textMuted,
      marginBottom: 20,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
    },
    statCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      flex: 1,
    },
    gaugeContainer: {
      marginBottom: 16,
    },
    gaugeOuter: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: colors.accent,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(211, 47, 47, 0.05)',
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    gaugeInner: {
      width: 46,
      height: 46,
      borderRadius: 23,
      borderWidth: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    statIconText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text,
    },
    statSubtitle: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '500',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    statValue: {
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
      marginBottom: 36,
    },
    actionCard: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      padding: 24,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 0,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 4,
    },
    racingStripe: {
      display: 'none',
    },
    actionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
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
      borderRadius: 20,
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
      paddingVertical: 32,
      marginTop: 24,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    creditText: {
      fontSize: 11,
      color: colors.textMuted,
      fontWeight: '400',
      marginBottom: 4,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    creditName: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '700',
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    creditYear: {
      fontSize: 10,
      color: colors.textMuted,
      fontWeight: '300',
    },
  });
