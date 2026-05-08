import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
}

export default function ChatbotScreen() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "Hello! I'm your SkinCare AI assistant. How can I help you today?", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setSuggestions([]);

    try {
      const res = await apiClient.post('/chatbot/ask', { message: text });
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        text: res.data.response, 
        sender: 'bot' 
      };
      
      setMessages(prev => [...prev, botMsg]);
      if (res.data.suggestions) {
        setSuggestions(res.data.suggestions);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: "Sorry, I couldn't reach the server.", sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.sender === 'user' ? styles.userBubble : styles.botBubble]}>
      <Text style={[styles.messageText, item.sender === 'user' ? styles.userText : styles.botText]}>{item.text}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>AI Assistant</Text>
        <Text style={styles.subtitle}>Ask questions about skin health</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>AI is thinking...</Text>
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((sug, index) => (
            <TouchableOpacity key={index} style={styles.suggestionChip} onPress={() => sendMessage(sug)}>
              <Text style={styles.suggestionText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask something..."
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage(input)}
        />
        <TouchableOpacity style={styles.sendButton} onPress={() => sendMessage(input)} disabled={!input.trim() || loading}>
          <Ionicons name="send" size={20} color={COLORS.surface} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SIZES.lg,
    paddingTop: SIZES.xxl * 1.2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chatContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.sm,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  botBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.surface,
  },
  botText: {
    color: COLORS.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
  },
  loadingText: {
    marginLeft: SIZES.xs,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.sm,
  },
  suggestionChip: {
    backgroundColor: COLORS.secondary + '20',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.xl,
    marginRight: SIZES.xs,
    marginBottom: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.secondary + '50',
  },
  suggestionText: {
    color: COLORS.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    paddingBottom: 90, // Push input field above floating navbar
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.xl,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    fontSize: 15,
    marginRight: SIZES.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
