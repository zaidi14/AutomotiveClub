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
import AdminPanelScreen from './src/screens/AdminPanelScreen';
import AdminAnnouncementsScreen from './src/screens/AdminAnnouncementsScreen';
import AdminNewslettersScreen from './src/screens/AdminNewslettersScreen';

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
  const { isDark } = useApp();
  
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
        tabBarIcon: ({ focused }) => {
          let icon = '🏠';
          if (route.name === 'Announcements') icon = '📢';
          if (route.name === 'AutoNews') icon = '📰';
          
          return (
            <Text style={{ fontSize: focused ? 24 : 20 }}>
              {icon}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen 
        name="AutoCard" 
        component={HomeStackNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Announcements" 
        component={AnnouncementsScreen}
        options={{ tabBarLabel: 'Announcements' }}
      />
      <Tab.Screen 
        name="AutoNews" 
        component={AutoNewsScreen}
        options={{ tabBarLabel: 'News' }}
      />
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
  const { user, loading, isAdmin } = useApp();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.accent} />
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

  // Admin Stack
  if (isAdmin) {
    return (
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="AdminPanel" component={AdminPanelScreen} />
          <Stack.Screen name="AdminAnnouncements" component={AdminAnnouncementsScreen} />
          <Stack.Screen name="AdminNewsletters" component={AdminNewslettersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  // Regular User Stack
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
});

export default function App() {
  return (
    <AppProvider>
      <AppNavigator />
    </AppProvider>
  );
}
