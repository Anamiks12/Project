import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  getRoomMessages,
  createWebSocketConnection,
} from '../../config/apiClient';

const Message = ({message, isCurrentUser}) => {
  const isSystemMessage = message.type === 'system';

  return (
    <View
      style={[
        styles.messageContainer,
        isSystemMessage
          ? styles.systemMessageContainer
          : isCurrentUser
          ? styles.currentUserMessageContainer
          : styles.otherUserMessageContainer,
      ]}>
      {!isSystemMessage && (
        <Text style={styles.messageSender}>{message.sender}</Text>
      )}
      <Text
        style={[
          styles.messageContent,
          isSystemMessage
            ? styles.systemMessageContent
            : isCurrentUser
            ? styles.currentUserMessageContent
            : styles.otherUserMessageContent,
        ]}>
        {message.content}
      </Text>
      <Text style={styles.messageTime}>
        {new Date(message.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
};

const ChatScreen = ({route, navigation}) => {
  const {roomId, roomName, username} = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const wsRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesData = await getRoomMessages(roomId);
        setMessages(
          messagesData.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
          ),
        );
      } catch (error) {
        console.error('Error fetching messages:', error);
        Alert.alert('Error', 'Failed to load messages. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    const ws = createWebSocketConnection(roomId, username);
    wsRef.current = ws;

    ws.connect(
      data => {
        if (data.event === 'message') {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: data.id || Date.now().toString(),
              sender: data.sender,
              content: data.content,
              timestamp: data.timestamp || new Date().toISOString(),
              type: 'message',
            },
          ]);
        } else if (data.event === 'join' || data.event === 'leave') {
          setMessages(prevMessages => [
            ...prevMessages,
            {
              id: Date.now().toString(),
              content: `${data.username} has ${
                data.event === 'join' ? 'joined' : 'left'
              } the room`,
              timestamp: new Date().toISOString(),
              type: 'system',
            },
          ]);
        }
      },
      () => console.log('Connected to chat room:', roomName),
      () => console.log('Disconnected from chat room'),
      error => {
        console.error('WebSocket error:', error);
        Alert.alert(
          'Connection Error',
          'Failed to connect to the chat server. Please try again later.',
        );
      },
    );

    return () => {
      if (wsRef.current) wsRef.current.disconnect();
    };
  }, [roomId, roomName, username]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
      id: Date.now().toString(),
      sender: username,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
      type: 'message',
    };

    setMessages(prevMessages => [...prevMessages, tempMessage]);
    setNewMessage('');
    setSending(true);

    try {
      wsRef.current.sendMessage(tempMessage.content);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({animated: true});
    }
  }, [messages]);

  const renderItem = ({item}) => (
    <Message message={item} isCurrentUser={item.sender === username} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.messagesList}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || sending}>
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  loadingContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  loadingText: {marginTop: 10, fontSize: 16, color: '#666'},
  messagesList: {padding: 16, paddingBottom: 16},
  messageContainer: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  currentUserMessageContainer: {
    alignSelf: 'flex-end',
    backgroundColor: '#007bff',
  },
  otherUserMessageContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
  },
  systemMessageContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 8,
    maxWidth: '90%',
  },
  messageSender: {fontSize: 14, fontWeight: 'bold', marginBottom: 2},
  messageContent: {fontSize: 16},
  currentUserMessageContent: {color: '#fff'},
  otherUserMessageContent: {color: '#000'},
  systemMessageContent: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  messageTime: {
    fontSize: 12,
    color: '#aaa',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#007bff',
    borderRadius: 20,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {backgroundColor: '#ccc'},
  sendButtonText: {color: '#fff', fontWeight: 'bold'},
});

export default ChatScreen;
