import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import MessageBubble from "../components/MessageBubble";
import ScreenLayout from "../components/ScreenLayout";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const doctor = {
    name: params.name || "Doctor",
  };

  const [messages, setMessages] = useState([
    { id: "1", text: "Hello doctor", sender: "user" },
    { id: "2", text: "Hello, how can I help you?", sender: "doctor" },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Doctor reply...",
          sender: "doctor",
        },
      ]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text>{"<"}</Text>
          </TouchableOpacity>

          <View style={styles.profile} />

          <Text style={styles.doctorName}>{doctor.name}</Text>
        </View>

        {/* START BOX */}
        <View style={styles.startBox}>
          <Text style={styles.startTitle}>Start Chat</Text>
          <Text style={styles.startDesc}>
            You can now message your doctor regarding your consultation.
          </Text>
        </View>

        {/* MESSAGES */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
        />

        {/* TYPING */}
        {isTyping && <Text style={styles.typing}>Doctor typing...</Text>}

        {/* INPUT */}
        <View style={styles.inputContainer}>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Message"
            style={styles.inputBox}
          />

          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScreenLayout>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },

  profile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  doctorName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0F172A",
  },

  startBox: {
    borderWidth: 1,
    borderColor: "#E8F3F1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },

  startTitle: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },

  startDesc: {
    fontSize: 12,
    color: "#94A3B8",
    marginTop: 4,
  },

  typing: {
    fontSize: 14,
    color: "#64748B",
    marginVertical: 6,
  },

  inputContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  inputBox: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: "#E8F3F1",
    borderRadius: 30,
    paddingHorizontal: 16,
  },

  sendButton: {
    width: 111,
    height: 50,
    backgroundColor: "#1F3A8A",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },

  expiredBox: {
    height: 50,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },

  expiredText: {
    color: "#94A3B8",
  },
});