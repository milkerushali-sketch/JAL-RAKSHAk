import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SecureStore from 'expo-secure-store';
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ComplaintStatusScreen from './screens/ComplaintStatusScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DashboardTabs = ({ user, onLogout }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#667eea',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen
        name="Dashboard"
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📊</Text>,
        }}
      >
        {() => <DashboardScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Complaints"
        options={{
          title: 'Complaints',
          tabBarLabel: 'Complaints',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📋</Text>,
        }}
      >
        {() => <ComplaintStatusScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen
        name="Settings"
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color }}>⚙️</Text>,
          headerShown: false,
        }}
      >
        {() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity
              style={{ padding: 15, backgroundColor: '#ff4444', borderRadius: 8 }}
              onPress={() => {
                SecureStore.deleteItemAsync('userToken');
                onLogout();
              }}
            >
              <Text style={{ color: 'white', fontWeight: '600' }}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default function VillagersApp() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const villageId = await SecureStore.getItemAsync('villageId');

      if (token && villageId) {
        setUser({ villageId, token });
      }
    } catch (error) {
      console.log('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (data) => {
    try {
      await SecureStore.setItemAsync('userToken', data.token);
      await SecureStore.setItemAsync('villageId', data.villageId);
      setUser(data);
    } catch (error) {
      console.log('Error saving credentials:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      await SecureStore.deleteItemAsync('villageId');
      setUser(null);
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          <Stack.Screen
            name="MainApp"
            options={{ animationEnabled: false }}
          >
            {() => <DashboardTabs user={user} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="Login"
            options={{ animationEnabled: false }}
          >
            {() => <LoginScreen onLoginSuccess={handleLoginSuccess} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
