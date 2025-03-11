import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { createRoom } from '../../config/apiClient';
import { useAuth } from '../../AuthContext';
import Button from '../../components/Buttons';
import {Cancel} from 'axios';

const CreateRoomScreen = ({ navigation }) => {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Error', 'Room name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      const roomData = await createRoom(roomName.trim(), user.username);
      Alert.alert(
        'Success',
        'Room created successfully',
        [
          {
            text: 'Join Room',
            onPress: () => navigation.navigate('Chat', {
              roomId: roomData.id,
              roomName: roomData.name,
              username: user.username
            })
          },
          {
            text: 'Back to Rooms',
            onPress: () => navigation.goBack(),
            style: 'cancel'
          }
        ]
      );
    } catch (error) {
      console.error('Error creating room:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create room. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Chat Room</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Enter room name"
        value={roomName}
        onChangeText={setRoomName}
        autoCapitalize="words"
      />
      
      {loading ? (
          <ActivityIndicator color="#fff" />
      ) : (
          <Button title="Create Room" onPress={handleCreateRoom} style={{marginBottom:70}}/>
      )}
      
      <Button title="Cancel" onPress={() => navigation.goBack()}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    fontSize: 16,
  },
 
 
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
});

export default CreateRoomScreen;
