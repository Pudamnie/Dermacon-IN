import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONT } from "../constants/theme";

export default function PageHeader({ title, showBack = false }) {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* LEFT BACK */}
      {showBack && (
        <TouchableOpacity style={styles.left} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={24} color="#1F3A8A" />
        </TouchableOpacity>
      )}

      {/* TITLE */}
      <Text style={styles.title}>{title}</Text>

      {/* RIGHT SPACE */}
      <View style={styles.right} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    paddingTop: 8,     // ✅ clean spacing instead of marginTop
    marginBottom: 18,
  },

  left: {
    position: "absolute",
    left: 0,
    width: 40,
  },

  right: {
    position: "absolute",
    right: 0,
    width: 40,
  },

  title: {
    fontSize: 20,
    fontFamily: FONT.title,
    color: "#1F3A8A",
  },
});