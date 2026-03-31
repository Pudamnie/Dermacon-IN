import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONT } from "../constants/theme";

export default function ScheduledCard({ appointment }) {
  const { status } = appointment;

  const isOngoing = status === "ongoing";
  const isCompleted = status === "completed";

  // STATUS COLORS
  const getDotColor = () => {
    if (status === "confirmed") return "#7BEB78";
    if (status === "ongoing") return "#F59E0B";
    return "#94A3B8";
  };

  return (
    <View style={styles.card}>

      {/* TOP */}
      <View style={styles.topRow}>

        {/* TEXT AREA (FIXED RESPONSIVE) */}
        <View style={styles.textContainer}>
          <Text
            style={styles.name}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {appointment.name}
          </Text>

          <Text
            style={styles.speciality}
            numberOfLines={1}
          >
            {appointment.speciality}
          </Text>
        </View>

        <Image source={appointment.image} style={styles.image} />
      </View>

      {/* DATE TIME + STATUS */}
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
          <View style={[styles.dot, { backgroundColor: getDotColor() }]} />
          <Text style={styles.infoText}>{status}</Text>
        </View>

      </View>

      {/* BUTTONS */}
      <View style={styles.buttonRow}>

        {/* CHAT */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              borderColor:
                isOngoing || isCompleted ? "#1F3A8A" : "#E2E8F0",
              backgroundColor: "#FFFFFF",
            },
          ]}
          disabled={!isOngoing && !isCompleted}
        >
          <Text
            style={{
              color:
                isOngoing || isCompleted ? "#1F3A8A" : "#E2E8F0",
              fontFamily: FONT.regular,
              fontSize: 14,
            }}
          >
            Chat
          </Text>
        </TouchableOpacity>

        {/* JOIN NOW */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: isOngoing ? "#1F3A8A" : "#FFFFFF",
              borderColor: isOngoing ? "#1F3A8A" : "#E2E8F0",
            },
          ]}
          disabled={!isOngoing}
        >
          <Text
            style={{
              color: isOngoing ? "#FFFFFF" : "#E2E8F0",
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
    alignItems: "flex-start",
  },

  textContainer: {
    flex: 1,                // text  shrink
    paddingRight: 10,       //prevents overlap with image
  },

  name: {
    fontSize: 18,
    fontFamily: FONT.title,
    color: "#0F172A",
    flexShrink: 1,          // critical for long text
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
    alignItems: "center",
    marginTop: 14,
    gap: 14,
    flexWrap: "wrap", // ✅ prevents overflow on small screens
  },

  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
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
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});