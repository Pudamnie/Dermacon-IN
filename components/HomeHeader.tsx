import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeHeader({ name, hasNotification }) {
  return (
    <View style={styles.wrapper}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        <TouchableOpacity style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color="#1E3A8A" />
          {hasNotification && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Here's your latest update
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    paddingTop: 20,
    marginBottom: 28,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    color: "#1F3ABA",
    lineHeight:26,
  },

  name: {
    fontSize: 24,
    fontFamily: "PoppinsSemiBold",
    color: "#1F3ABA",
    marginTop: -6,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 4,   
  },

  notificationContainer: {
    position: "relative",
    padding: 8,
  },

  dot: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },

});