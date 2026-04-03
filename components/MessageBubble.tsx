import { FONT } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

export default function MessageBubble({ message, onOpenFile }) {
  const isUser = message.sender === "user";

  //  define isImage properly
  const isImage =
    message?.file?.type === "image" ||
    message?.file?.mimeType?.startsWith("image/");

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#1F3A8A" : "#F1F5F9",
        padding: 8,
        marginVertical: 4,
        maxWidth: "75%",
        borderRadius: 14,
      }}
    >
      {/* IMAGE */}
      {isImage && message?.file?.uri && (
        <TouchableOpacity onPress={() => onOpenFile?.(message.file)}>
          <Image
            source={{ uri: message.file.uri }}
            style={{ width: 180, height: 180, borderRadius: 10 }}
          />
        </TouchableOpacity>
      )}

      {/* DOCUMENT */}
      {message?.file?.uri && !isImage && (
        <TouchableOpacity onPress={() => onOpenFile?.(message.file)}>
          <View
            style={{
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 10,
              marginBottom: message.text ? 6 : 0,
            }}
          >
            {/*  icon + file name */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#0F172A"
                style={{ marginRight: 6 }}
              />

              <Text style={{ color: "#0F172A", fontWeight: "600" }}>
                {message.file.name || "Document"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* TEXT */}
      {message.text && (
        <Text style={{ 
          color: isUser ? "#ffffff" : "#64748B", 
          marginTop: 4,
          fontSize: 14,
          lineHeight: 20,
          fontFamily: FONT.regular }}>
            
        {message.text}
        </Text>
      )}
    </View>
  );
}