import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { getAppointmentStatus } from "../app/utils/ChatUtils";
import { FONT } from "../constants/theme";

export default function ScheduledCard({
  appointment,
  chatState,
  isJoinActive,
  onChatPress,
}) {
  // ================= STATUS =================
  const status = getAppointmentStatus(appointment);

  // DEBUG (REMOVE LATER)
  console.log("STATUS:", status);
  console.log("TIME:", appointment.time);
  console.log("DATE:", appointment.date);

  // ================= CHAT =================
  const isChatEnabled = chatState === "active" || chatState === "readonly";
  const isChatReadOnly = chatState === "readonly";

  // ================= STATUS UI =================
  const getStatusUI = () => {
    switch (status) {
      case "confirmed":
        return { color: "#7BEB78", label: "confirmed" };

      case "ongoing":
        return { color: "#F59E0B", label: "ongoing" };

      case "completed":
        return { color: "#93A3B8", label: "completed" };

      default:
        return { color: "#93A3B8", label: "completed" };
    }
  };

  const statusUI = getStatusUI();

  return (
    <View style={styles.card}>
      {/* TOP */}
      <View style={styles.topRow}>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {appointment.name}
          </Text>
          <Text style={styles.speciality}>
            {appointment.speciality}
          </Text>
        </View>

        <Image source={appointment.image} style={styles.image} />
      </View>

      {/* INFO */}
      <View style={styles.infoRow}>
        <View style={styles.rowItem}>
          <Ionicons name="calendar-outline" size={15} color="#64748B" />
          <Text style={styles.infoText}>{appointment.date}</Text>
        </View>

        <View style={styles.rowItem}>
          <Ionicons name="time-outline" size={15} color="#64748B" />
          <Text style={styles.infoText}>{appointment.time}</Text>
        </View>

        <View style={styles.rowItem}>
          <View style={[styles.dot, { backgroundColor: statusUI.color }]} />
          <Text style={styles.infoText}>{statusUI.label}</Text>
        </View>
      </View>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>
        {/* CHAT */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              borderColor: isChatEnabled ? "#1E3A8A" : "#E2E8F0",
              backgroundColor: "#FFFFFF",
            },
          ]}
          disabled={!isChatEnabled}
          onPress={onChatPress}
        >
          <Text
            style={{
              color: isChatEnabled ? "#1E3A8A" : "#E2E8F0",
              fontFamily: FONT.regular,
              fontSize: 14,
            }}
          >
            {isChatReadOnly ? "View Chat" : "Chat"}
          </Text>
        </TouchableOpacity>

        {/* JOIN */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isJoinActive ? "#1E3A8A" : "#FFFFFF",
              borderColor: isJoinActive ? "#1E3A8A" : "#E2E8F0",
            },
          ]}
          disabled={!isJoinActive}
        >
          <Text
            style={{
              color: isJoinActive ? "#FFFFFF" : "#E2E8F0",
              fontFamily: FONT.regular,
              fontSize: 14,
            }}
          >
            Join Now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  card: {
    width: "100%",
    minHeight: 179,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E8F3F1",
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textContainer: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: FONT.title,
    color: "#0F172A",
  },
  speciality: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: "#94A3B8",
    marginTop: 2,
  },
  image: {
    width: 46,
    height: 46,
    borderRadius: 23,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 14,
    gap: 14,
    flexWrap: "wrap",
  },
  rowItem: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },
  infoText: {
    fontSize: 12,
    fontFamily: FONT.medium,
    color: "#64748B",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  button: {
    width: 145,
    height: 46,
    borderRadius: 15,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});