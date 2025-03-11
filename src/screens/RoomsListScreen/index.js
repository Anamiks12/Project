import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getRooms} from '../../config/apiClient';
import {useAuth} from '../../AuthContext';
import Button from '../../components/Buttons';

const RoomItem = ({room, onPress}) => (
  <TouchableOpacity style={styles.roomItem} onPress={() => onPress(room)}>
    <Text style={styles.roomName}>{room.name}</Text>
    <Text style={styles.roomInfo}>Created at: {room.created_at}</Text>
  </TouchableOpacity>
);

const RoomsListScreen = ({navigation}) => {
  const [rooms, setRooms] = useState([]);
  const [filteredRooms, setFilteredRooms] = useState([]); // Stores filtered results
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const {user, logout} = useAuth();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const roomsData = await getRooms();
      setRooms(roomsData);
      setFilteredRooms(roomsData);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      Alert.alert('Error', 'Failed to fetch rooms. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      setSearchQuery('');
    }, []),
  );

  const handleSearch = useCallback(
    query => {
      setSearchQuery(query);
      const delayDebounce = setTimeout(() => {
        if (query.trim() === '') {
          setFilteredRooms(rooms); // Reset to full list if empty
        } else {
          const filtered = rooms.filter(room =>
            room.name.toLowerCase().includes(query.toLowerCase()),
          );
          setFilteredRooms(filtered);
        }
      }, 300); // 300ms debounce delay

      return () => clearTimeout(delayDebounce);
    },
    [rooms],
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const handleRoomPress = room => {
    navigation.navigate('Chat', {
      roomId: room.id,
      roomName: room.name,
      username: user.username,
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

      <TextInput
        style={styles.searchInput}
        placeholder="Search rooms..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

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
          data={filteredRooms}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <RoomItem room={item} onPress={handleRoomPress} />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <Button title={'Create New Room'} onPress={handleCreateRoom} />
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
    color: 'red',
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
    paddingBottom: 60,
  },
  searchInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    backgroundColor: 'white',
    height: 50,
    marginHorizontal: 16,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginVertical: 10,
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
});

export default RoomsListScreen;
