import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { signOut } from '../services/authService';
import { colors } from '../styles/colors';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user, userData } = useApp();
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
      icon: '📦',
      color: '#3282b8',
      bgColor: 'rgba(50, 130, 184, 0.1)',
    },
    {
      id: 2,
      label: 'Amount Spent',
      value: `₺${(userData.lifetimeSpend || 0).toFixed(0)}`,
      icon: '💰',
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.1)',
    },
    {
      id: 3,
      label: 'Total Savings',
      value: `₺${(userData.lifetimeSavings || 0).toFixed(0)}`,
      icon: '💎',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.darkBg} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{userData.name || 'Member'}</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutIcon}>🚪</Text>
          </TouchableOpacity>
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
          <Text style={styles.sectionTitle}>Your Statistics</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.id} style={styles.statCard}>
                <View
                  style={[
                    styles.statIconContainer,
                    { backgroundColor: stat.bgColor },
                  ]}
                >
                  <Text style={styles.statIcon}>{stat.icon}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Billing')}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📄</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Upload Bill</Text>
              <Text style={styles.actionDesc}>Track your purchases</Text>
            </View>
            <Text style={styles.actionArrow}>→</Text>
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
      marginBottom: 32,
      paddingTop: 8,
    },
    headerContent: {
      flex: 1,
    },
    greeting: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: '500',
      marginBottom: 4,
    },
    userName: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
    },
    logoutBtn: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: 'rgba(200, 16, 46, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(200, 16, 46, 0.3)',
    },
    logoutIcon: {
      fontSize: 20,
    },
    memberCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 20,
      marginBottom: 32,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    memberCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    memberCardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    memberCardBadge: {
      fontSize: 12,
      color: '#10B981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      fontWeight: '700',
    },
    memberCardBody: {
      gap: 12,
    },
    memberInfo: {
      gap: 4,
    },
    memberLabel: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    memberValue: {
      fontSize: 15,
      color: colors.text,
      fontWeight: '600',
    },
    memberDivider: {
      height: 1,
      backgroundColor: colors.border,
    },
    statsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      gap: 12,
    },
    statCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12,
    },
    statIcon: {
      fontSize: 28,
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
      marginBottom: 32,
    },
    actionCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.accent,
      borderLeftWidth: 4,
    },
    actionIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: 'rgba(15, 76, 117, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
    },
    actionIcon: {
      fontSize: 28,
    },
    actionContent: {
      flex: 1,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    actionDesc: {
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '500',
    },
    actionArrow: {
      fontSize: 20,
      color: colors.accent,
      fontWeight: '700',
    },
    favSection: {
      marginBottom: 24,
    },
    favCard: {
      backgroundColor: colors.darkCardBg,
      borderRadius: 16,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
      borderLeftWidth: 4,
      borderLeftColor: '#F59E0B',
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
  });
