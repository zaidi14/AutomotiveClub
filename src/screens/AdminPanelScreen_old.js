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
import { useApp } from '../context/AppContext';
import { colors } from '../styles/colors';
import { signOut } from '../services/authService';

export default function AdminPanelScreen({ navigation }) {
  const { isDark } = useApp();

  const styles = createStyles(isDark);

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
      description: 'Create, edit, and delete announcements',
      icon: '📢',
      screen: 'AdminAnnouncements',
    },
    {
      id: 2,
      title: 'Manage Newsletters',
      description: 'Create, edit, and delete newsletters',
      icon: '📰',
      screen: 'AdminNewsletters',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Admin Panel</Text>
          <Text style={styles.subtitle}>Manage app content</Text>
        </View>

        <View style={styles.optionsContainer}>
          {adminOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={styles.optionCard}
              onPress={() => navigation.navigate(option.screen)}
            >
              <Text style={styles.icon}>{option.icon}</Text>
              <View style={styles.textContainer}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const createStyles = (isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? colors.darkBg : colors.lightBg,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    header: {
      marginBottom: 24,
      marginTop: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: isDark ? colors.darkText : colors.lightText,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: isDark ? colors.darkSecondaryText : colors.lightSecondaryText,
    },
    optionsContainer: {
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
      borderRadius: 12,
      padding: 16,
      borderLeftWidth: 4,
      borderLeftColor: colors.accent,
    },
    icon: {
      fontSize: 32,
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? colors.darkText : colors.lightText,
      marginBottom: 4,
    },
    optionDescription: {
      fontSize: 13,
      color: isDark ? colors.darkSecondaryText : colors.lightSecondaryText,
    },
    arrow: {
      fontSize: 20,
      color: colors.accent,
      marginLeft: 8,
    },
    logoutButton: {
      backgroundColor: '#FF6B6B',
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 24,
    },
    logoutText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
  });
