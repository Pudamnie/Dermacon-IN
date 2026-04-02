import { Text, View } from "react-native";

export default function MessageBubble({ message }) {
  const isUser = message.sender === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        backgroundColor: isUser ? "#1F3A8A" : "#F1F5F9",
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginVertical: 4,
        maxWidth: "75%",

        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        borderBottomLeftRadius: isUser ? 18 : 4,
        borderBottomRightRadius: isUser ? 4 : 18,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: isUser ? "#FFFFFF" : "#64748B",
        }}
      >
        {message.text}
      </Text>
    </View>
  );
}