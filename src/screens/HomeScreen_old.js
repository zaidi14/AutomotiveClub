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
} from 'react-native';
import { useApp } from '../context/AppContext';
import { signOut } from '../services/authService';
import { colors } from '../styles/colors';

export default function HomeScreen({ navigation }) {
  const { isDark, user, userData, toggleTheme } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const styles = createStyles(isDark);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (!result.success) {
              Alert.alert('Error', result.error);
            }
          }
        }
      ]
    );
  };

  if (!userData) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const stats = [
    {
      label: 'Orders',
      value: userData.totalOrders || 0,
      icon: '📦',
    },
    {
      label: 'Spent',
      value: `₺${(userData.lifetimeSpend || 0).toFixed(2)}`,
      icon: '💰',
    },
    {
      label: 'Saved',
      value: `₺${(userData.lifetimeSavings || 0).toFixed(2)}`,
      icon: '💎',
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.nameText}>{userData.name || 'User'}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={toggleTheme}
            >
              <Text style={styles.actionIcon}>{isDark ? '☀️' : '🌙'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleLogout}
            >
              <Text style={styles.actionIcon}>🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statIcon}>{stat.icon}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Favorite Restaurant */}
        {userData.favoriteRestaurant && (
          <View style={styles.favoriteCard}>
            <Text style={styles.favLabel}>⭐ Favorite Restaurant</Text>
            <Text style={styles.favName}>{userData.favoriteRestaurant}</Text>
          </View>
        )}

        {/* Upload Bill Button */}
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('Billing')}
        >
          <Text style={styles.uploadButtonText}>📸 Upload New Bill</Text>
        </TouchableOpacity>

        {/* Student Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Student ID: {userData.studentId}</Text>
          <Text style={styles.infoText}>{userData.email}</Text>
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
    paddingVertical: 10,
    paddingTop: 40,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: isDark ? colors.darkBg : colors.lightBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: isDark ? colors.lightSubText : colors.subText,
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.darkText,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
  statsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? colors.lightSubText : colors.subText,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  favoriteCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  favLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: isDark ? colors.lightSubText : colors.subText,
    marginBottom: 6,
  },
  favName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: isDark ? colors.lightText : colors.darkText,
  },
  uploadButton: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.lightText,
  },
  infoCard: {
    backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.darkBorder : colors.lightBorder,
  },
  infoText: {
    fontSize: 12,
    color: isDark ? colors.lightSubText : colors.subText,
    marginBottom: 4,
  },
});
