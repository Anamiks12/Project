import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getRooms } from '../api/apiClient';
import { useAuth } from '../../AuthContext';

const RoomItem = ({ room, onPress }) => (
  <TouchableOpacity 
    style={styles.roomItem} 
    onPress={() => onPress(room)}
  >
    <Text style={styles.roomName}>{room.name}</Text>
    <Text style={styles.roomInfo}>Created by: {room.created_by}</Text>
  </TouchableOpacity>
);

const RoomsListScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getRooms();
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to fetch rooms. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleRoomPress = (room) => {
    navigation.navigate('Chat', { 
      roomId: room.id, 
      roomName: room.name,
      username: user.username
    });
  };

  const handleCreateRoom = () => {
    navigation.navigate('CreateRoom');
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.username}</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      
      {loading && rooms.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>Loading rooms...</Text>
        </View>
      ) : rooms.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text>No rooms available. Create one to get started!</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <RoomItem room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
      
      <TouchableOpacity 
        style={styles.createButton} 
        onPress={handleCreateRoom}
      >
        <Text style={styles.createButtonText}>Create New Room</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#007bff',
    fontWeight: '500',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  roomItem: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roomName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 14,
    color: '#666',
  },
  createButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RoomsListScreen;