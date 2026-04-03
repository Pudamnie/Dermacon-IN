import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Sharing from "expo-sharing";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import MessageBubble from "../components/MessageBubble";
import ScreenLayout from "../components/ScreenLayout";
import { FONT } from "../constants/theme";

/* ================= TYPES ================= */

type Message = {
  id: string;
  text?: string;
  sender: "user" | "doctor";
  file?: any;
};

type Params = {
  name?: string;
  chatState?: "active" | "readonly";
  appointmentDate?: string;
};

/* ================= SCREEN ================= */

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();
  const insets = useSafeAreaInsets();

  const doctor = { name: params.name || "Doctor" };
  const flatListRef = useRef<FlatList>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);

  const [attachVisible, setAttachVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState<"send" | "view">("send");

  /* ================= CHAT STATE ================= */

  const getChatState = () => {
    if (!params.appointmentDate) return params.chatState;

    const appointmentTime = new Date(params.appointmentDate).getTime();
    const now = Date.now();

    const diffHours = (now - appointmentTime) / (1000 * 60 * 60);

    if (diffHours > 48) return "readonly";
    return "active";
  };

  const chatState = getChatState();

  /* ================= KEYBOARD ================= */

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true)
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false)
    );

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  /* ================= LOAD ================= */

  useEffect(() => {
    const load = async () => {
      const saved = await AsyncStorage.getItem("chat_" + doctor.name);
      if (saved) setMessages(JSON.parse(saved));
      else {
        setMessages([
          { id: "1", text: "Hello doctor", sender: "user" },
          { id: "2", text: "Hello, how can I help you?", sender: "doctor" },
        ]);
      }
    };
    load();
  }, []);

  /* ================= SAVE ================= */

  useEffect(() => {
    AsyncStorage.setItem("chat_" + doctor.name, JSON.stringify(messages));
  }, [messages]);
  
  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, [messages, keyboardVisible]);

  /* ================= BACK ================= */

  useEffect(() => {
  const backAction = () => {

    //  CLOSE PREVIEW FIRST (TOP PRIORITY)
    if (previewVisible) {
      setPreviewVisible(false);
      return true;
    }

    // CLOSE ATTACH MENU
    if (attachVisible) {
      setAttachVisible(false);
      return true;
    }

    //  NORMAL BACK
    router.back();
    return true;
  };

  const sub = BackHandler.addEventListener(
    "hardwareBackPress",
    backAction
  );

  return () => sub.remove();
}, [previewVisible, attachVisible]);

  /* ================= SEND TEXT ================= */

  const handleSend = () => {
    if (!input.trim() || chatState === "readonly") return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), text: input, sender: "user" },
    ]);

    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          text: "Doctor reply...",
          sender: "doctor",
        },
      ]);
    }, 1000);
  };

  /* ================= SEND FILE ================= */

  const handleSendFile = () => {
    if (!selectedFile || chatState === "readonly") return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        sender: "user",
        text: caption,
        file: selectedFile,
      },
    ]);

    setSelectedFile(null);
    setCaption("");
    setPreviewVisible(false);
  };

  /* ================= PICKERS ================= */

  const openCamera = async () => {
    setAttachVisible(false);
    Keyboard.dismiss();

    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission required");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({ quality: 0.3 });

    if (!res.canceled && res.assets?.length > 0) {
      setSelectedFile({
        uri: res.assets[0].uri,
        type: "image",
        mimeType: "image/jpeg",
      });
      setPreviewMode("send");
      setPreviewVisible(true);
    }
  };

  const openGallery = async () => {
    setAttachVisible(false);
    Keyboard.dismiss();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Gallery permission required");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });

    if (!res.canceled && res.assets?.length > 0) {
      setSelectedFile({
        uri: res.assets[0].uri,
        type: "image",
        mimeType: res.assets[0].mimeType || "image/jpeg",
      });
      setPreviewMode("send");
      setPreviewVisible(true);
    }
  };

  const openDocument = async () => {
    setAttachVisible(false);
    Keyboard.dismiss();

    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (res.assets?.length > 0) {
      const file = res.assets[0];

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType || "*/*",
        type: "document",
      });

      setPreviewMode("send");
      setPreviewVisible(true);
    }
  };

  /* ================= OPEN FILE ================= */

  const openFile = async (file: any) => {
    try {
      if (!file?.uri) return;

      if (file.type === "image" || file.mimeType?.startsWith("image/")) {
        setSelectedFile(file);
        setPreviewMode("view");
        setPreviewVisible(true);
        return;
      }

      const available = await Sharing.isAvailableAsync();

      if (available) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("No app found");
      }
    } catch {
      Alert.alert("Cannot open file");
    }
  };

  /* ================= UI ================= */

  return (
    <ScreenLayout scroll={false}>
      <View style={{ flex: 1 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} />
          </TouchableOpacity>

          <View style={styles.profile}>
            <Ionicons name="person" size={18} color="#94A3B8" />
          </View>

          <Text style={styles.doctorName}>{doctor.name}</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <MessageBubble message={item} onOpenFile={openFile} />
            )}
            contentContainerStyle={{ paddingTop: 6, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          {/* INPUT / DISABLED */}
          {chatState === "readonly" ? (
            <View
              style={[
                styles.disabledContainer,
                { marginBottom: Math.max(insets.bottom, 10) },
              ]}
            >
              <Text style={styles.disabledText}>
                Chat unavailable after 48 hours
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.inputContainer,
                { paddingBottom: Math.max(insets.bottom, 10) },
              ]}
            >
              <TouchableOpacity
                onPress={() => setAttachVisible(!attachVisible)}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="attach" size={28} color="#64748B" />
              </TouchableOpacity>

              <TextInput
                value={input}
                onChangeText={setInput}
                placeholder="Message"
                style={styles.inputBox}
                multiline
              />

              <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                <Ionicons name="send" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>

        {/* ATTACH MENU */}
        {attachVisible && (
          <>
            <TouchableOpacity
              style={styles.overlay}
              activeOpacity={1}
              onPress={() => setAttachVisible(false)}
            />

            <View style={styles.floatingAttach}>
              <TouchableOpacity style={styles.floatItem} onPress={openCamera}>
                <Ionicons name="camera" size={24} color="#1F3A8A" />
                <Text style={styles.floatText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.floatItem} onPress={openGallery}>
                <Ionicons name="image" size={24} color="#1F3A8A" />
                <Text style={styles.floatText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.floatItem} onPress={openDocument}>
                <Ionicons name="document" size={24} color="#1F3A8A" />
                <Text style={styles.floatText}>Document</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* PREVIEW MODAL */}
        <Modal visible={previewVisible} animationType="slide"
        onRequestClose={() => setPreviewVisible(false)}>

          <View style={{ flex: 1, backgroundColor: "#000" }}>
            <TouchableOpacity
              style={{ padding: 20 }}
              onPress={() => setPreviewVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>

            {selectedFile?.type === "image" ? (
              <Image
                source={{ uri: selectedFile.uri }}
                style={{ flex: 1 }}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.docPreview}>
                <Ionicons name="document-text-outline" size={80} color="#fff" />
                <Text style={{ color: "#fff", marginTop: 10 }}>
                  {selectedFile?.name}
                </Text>
              </View>
            )}

            {previewMode === "send" && (
              <View style={styles.previewInput}>
                <TextInput
                  placeholder="Add a caption..."
                  placeholderTextColor="#ccc"
                  value={caption}
                  onChangeText={setCaption}
                  style={styles.captionInput}
                />

                <TouchableOpacity onPress={handleSendFile}>
                  <Ionicons name="send" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>

      </View>
    </ScreenLayout>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
  },
  profile: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  doctorName: {
    fontSize: 18,
    fontFamily: FONT.title,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
    minHeight: 60,
  },
  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: FONT.regular,
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#1F3A8A",
    padding: 12,
    borderRadius: 50,
    marginLeft: 10,
  },
  disabledContainer: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
  },
  disabledText: {
    fontFamily: FONT.regular,
    fontSize: 14,
    color: "#E2E8F0",
  },
  floatingAttach: {
    position: "absolute",
    bottom: 80,
    left: 20,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 30,
    elevation: 6,
  },
  floatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  floatText: {
    marginLeft: 10,
    fontSize: 14,
    fontFamily: FONT.regular,
  },
  previewInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#000",
  },
  captionInput: {
    flex: 1,
    color: "#fff",
    fontFamily: FONT.regular,
  },
  docPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transpatrnt",
  },
});