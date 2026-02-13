import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { ActivityIndicator, View, StyleSheet, Text, Image } from 'react-native';
import { colors } from './src/styles/colors';
import LogoHeader from './src/components/LogoHeader';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';

          if (route.name === 'Announcements') icon = '📣';
          if (route.name === 'AutoNews') icon = '📰';
          if (route.name === 'Web Portal') icon = '🌐';

          return <Text style={{ fontSize: focused ? 22 : 18 }}>{icon}</Text>;
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

function AppNavigator() {
  const { user, loading, isDark, userData } = useApp();
  const isAdmin = userData?.role === 'admin';

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

  if (!user) {
    return (
      <NavigationContainer>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Admin users get admin-only interface without navigation
  if (isAdmin) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="AdminHome" component={AdminScreen} />
          <Stack.Screen name="AdminBills" component={AdminBillsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Regular user navigation
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
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
});

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
