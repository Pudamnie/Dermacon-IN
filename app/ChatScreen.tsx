

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


import * as IntentLauncher from "expo-intent-launcher";


import MessageBubble from "../components/MessageBubble";
import ScreenLayout from "../components/ScreenLayout";

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();

  const doctor = { name: params.name || "Doctor" };
  const flatListRef = useRef<any>(null);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [caption, setCaption] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);



  //  KEYBOARD
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



  //  LOAD
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



  //  SAVE
  useEffect(() => {
    AsyncStorage.setItem("chat_" + doctor.name, JSON.stringify(messages));
  }, [messages]);



  //  AUTO SCROLL
  useEffect(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 50);
  }, [messages, keyboardVisible]);




  //  BACK BUTTON (FIXED)
  useEffect(() => {
    const backAction = () => {
      if (previewVisible) {
        setPreviewVisible(false);
        return true;
      }
      router.back();
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => sub.remove();
  }, [previewVisible]);



  // SEND TEXT
  const handleSend = () => {
    if (!input.trim()) return;

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



  //  SEND FILE
  const handleSendFile = () => {
    if (!selectedFile) return;

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

  // ONLY CAMERA PART IMPROVED — REST UNCHANGED

const openCamera = async () => {
  Keyboard.dismiss();

  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Camera permission required");
    return;
  }

  const res = await ImagePicker.launchCameraAsync({
    quality: 0.3,            // faster processing
    exif: false,             //  remove metadata delay
    base64: false,
    allowsEditing: false,
    skipProcessing: true as any // Android boost
  });

  if (!res.canceled && res.assets?.length > 0) {
    const file = {
      uri: res.assets[0].uri,
      type: "image",
    };

    
    setPreviewVisible(true);
    setSelectedFile(null);

    requestAnimationFrame(() => {
      setSelectedFile(file);
    });
  }
};




  // GALLERY
  const openGallery = async () => {
    Keyboard.dismiss();

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Gallery permission required");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
    });

    if (!res.canceled && res.assets?.length > 0) {
      const file = {
        uri: res.assets[0].uri,
        type: "image",
      };

      setSelectedFile(file);
      setPreviewVisible(true);
    }
  };




  //  DOCUMENT
  const openDocument = async () => {
    Keyboard.dismiss();

    const res = await DocumentPicker.getDocumentAsync({
      copyToCacheDirectory: true,
    });

    if (res.assets && res.assets.length > 0) {
      const file = res.assets[0];

      setSelectedFile({
        uri: file.uri,
        name: file.name,
        mimeType: file.mimeType || "",
        type: "document",
      });

      setPreviewVisible(true);
    }
  };



  const openAttachmentMenu = () => {
    Alert.alert("Attach", "", [
      { text: "Camera", onPress: openCamera },
      { text: "Gallery", onPress: openGallery },
      { text: "Document", onPress: openDocument },
      { text: "Cancel", style: "cancel" },
    ]);
  };



//openfile
const openFile = async (file: any) => {
  try {
    if (!file?.uri) return;

    if (Platform.OS === "android") {
      //  Android → Open with viewer apps (like WhatsApp)
      await IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: file.uri,
        flags: 1,
        type: file.mimeType || "*/*",
      });
    } else {

      
   // Best possible (system preview/share)
      const available = await Sharing.isAvailableAsync();

      if (available) {
        await Sharing.shareAsync(file.uri);
      } else {
        Alert.alert("No app available to open this file");
      }
    }
  } catch (e) {
    Alert.alert("Cannot open file");
  }
};

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
            contentContainerStyle={{
              paddingTop: 6,
              paddingBottom: 8,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          />

          <View
            style={[
              styles.inputContainer,
              {
                paddingBottom: Math.max(insets.bottom - 6, 2),
              },
            ]}
          >
            <TouchableOpacity onPress={openAttachmentMenu}>
              <Ionicons name="attach" size={24} color="#64748B" />
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
        </KeyboardAvoidingView>



        {/* REVIEW MODAL (FIXED BACK BUTTON) */}
        <Modal
          visible={previewVisible}
          animationType="slide"
          onRequestClose={() => setPreviewVisible(false)} 
        >
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
                <Ionicons name="document" size={60} color="#fff" />
                <Text style={{ color: "#fff", marginTop: 10 }}>
                  {selectedFile?.name}
                </Text>
              </View>
            )}

            <View style={styles.previewInput}>
              <TextInput
                placeholder="Add a caption..."
                placeholderTextColor="#ccc"
                value={caption}
                onChangeText={setCaption}
                style={{ flex: 1, color: "#fff" }}
              />

              <TouchableOpacity onPress={handleSendFile}>
                <Ionicons name="send" size={26} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenLayout>
  );
}

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
    fontWeight: "600",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#fff",
  },

  inputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 8,
  },

  sendButton: {
    backgroundColor: "#1F3A8A",
    padding: 12,
    borderRadius: 50,
  },

  docPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  previewInput: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    backgroundColor: "#111",
  },
});
