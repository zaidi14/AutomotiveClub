import React, { useEffect } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { ActivityIndicator, View, Text, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './src/styles/colors';
import * as Notifications from 'expo-notifications';
import ErrorBoundary from './src/components/ErrorBoundary';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BillingScreen from './src/screens/BillingScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import AutoNewsScreen from './src/screens/AutoNewsScreen';
import WebPortalScreen from './src/screens/WebPortalScreen';
import AdminScreen from './src/screens/AdminScreen';
import AdminBillsScreen from './src/screens/AdminBillsScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const navigationRef = createNavigationContainerRef();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { isDark, userData } = useApp();

  // Regular user navigation only
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.darkCardBg,
          borderTopColor: colors.darkBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.lightSubText,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -4,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName = 'home';
          if (route.name === 'Announcements') iconName = 'megaphone';
          if (route.name === 'AutoNews') iconName = 'newspaper';
          if (route.name === 'Web Portal') iconName = 'globe';
          return <Ionicons name={focused ? iconName : `${iconName}-outline`} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="AutoCard"
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'AutoCard' }}
      />
      <Tab.Screen
        name="Announcements"
        component={AnnouncementsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="AutoNews"
        component={AutoNewsScreen}
        options={{ tabBarLabel: 'News' }}
      />
      <Tab.Screen
        name="Web Portal"
        component={WebPortalScreen}
        options={{ tabBarLabel: 'Portal' }}
      />
    </Tab.Navigator>
  );
}

function AdminStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminScreen} />
      <Stack.Screen name="AdminBills" component={AdminBillsScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading, userData, isOnline } = useApp();
  const isAdmin = userData?.role === 'admin';

  // Deep link: navigate when user taps a push notification
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (navigationRef.isReady() && user && !isAdmin) {
        if (data?.screen === 'Events') navigationRef.navigate('Announcements');
        else if (data?.screen === 'News') navigationRef.navigate('AutoNews');
      }
    });
    return () => sub.remove();
  }, [user, isAdmin]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.darkBg }]}> 
        <Image
          source={require('./assets/AC.webp')}
          style={styles.loadingLogo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
          <Text style={styles.offlineText}>No internet connection</Text>
        </View>
      )}
      <NavigationContainer ref={navigationRef}>
        {!user ? <AuthStack /> : isAdmin ? <AdminStack /> : <MainTabs />}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingLogo: {
    width: '60%',
    height: 200,
  },
  offlineBanner: {
    backgroundColor: '#F44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingTop: 50,
    gap: 8,
  },
  offlineText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </ErrorBoundary>
  );
}
