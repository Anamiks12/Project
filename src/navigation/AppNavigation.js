import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../AuthContext';

// Import screens
import SetUsernameScreen from '../screens/SetUsernameScreen';
import RoomsListScreen from '../screens/RoomsListScreen';
import CreateRoomScreen from '../screens/CreateRoomScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // User is logged in
          <>
            <Stack.Screen
              name="RoomsList"
              component={RoomsListScreen}
              options={{ title: 'Chat Rooms'}}
            />
            <Stack.Screen
              name="CreateRoom"
              component={CreateRoomScreen}
              options={{ title: 'Create New Room' }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={({ route }) => ({ title: route.params.roomName })}
            />
          </>
        ) : (
          // User is not logged in
          <Stack.Screen
            name="SetUsername"
            component={SetUsernameScreen}
            options={{ title: 'Welcome to Chat App' }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;


