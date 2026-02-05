import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AppProvider, useApp } from './src/context/AppContext';
import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';
import { colors } from './src/styles/colors';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BillingScreen from './src/screens/BillingScreen';
import AnnouncementsScreen from './src/screens/AnnouncementsScreen';
import AutoNewsScreen from './src/screens/AutoNewsScreen';
import WebPortalScreen from './src/screens/WebPortalScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { isDark, userData } = useApp();
  const isAdmin = userData?.role === 'admin';
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? colors.darkCardBg : colors.lightCardBg,
          borderTopColor: isDark ? colors.darkBorder : colors.lightBorder,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: isDark ? colors.lightText : colors.accent,
        tabBarInactiveTintColor: isDark ? colors.lightSubText : colors.subText,
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: -4,
        },
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';

          if (route.name === 'Announcements') icon = '📣';
          if (route.name === 'AutoNews') icon = '📰';
          if (route.name === 'Web Portal') icon = '🌐';
          if (route.name === 'Admin') icon = '⚙️';

          return (
            <Text style={{ fontSize: focused ? 22 : 18 }}>
              {icon}
            </Text>
          );
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
      {isAdmin && (
        <Tab.Screen
          name="Admin"
          component={AdminScreen}
          options={{ tabBarLabel: 'Admin' }}
        />
      )}
    </Tab.Navigator>
  );
}

function HomeStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="Billing" component={BillingScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useApp();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0177E3" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
