import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { FONT } from "../constants/theme";

export default function DoctorCard({ doctor }) {
  return (
    <View style={styles.card}>
      
      <Image source={doctor.image} style={styles.image} />

      <View>
        <Text style={styles.name} numberOfLines={2}>
          {doctor.name}
        </Text>

        <Text style={styles.specialty}>
          {doctor.specialty}
        </Text>
      </View>

      <View style={styles.ratingRow}>
        <Ionicons name="star" size={10} color="#1F3A8A" />
        <Text style={styles.rating}>{doctor.rating}</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 150,
    minHeight: 180, // 🔥 flexible height

    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",

    paddingVertical: 14,
    paddingHorizontal: 14,

    justifyContent: "space-between",
  },

  image: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignSelf: "center",
  },

  name: {
    fontSize: 13,
    fontFamily: FONT.title,
    color: "#64748B",
    textAlign: "left",
    lineHeight: 18,
  },

  specialty: {
    fontSize: 10,
    color: "#94A3B8",
    fontFamily: FONT.medium,
    marginTop: 2,
    textAlign: "left",
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rating: {
    fontSize: 10,
    color: "#1F3A8A",
    fontFamily: FONT.medium,
    marginLeft: 4,
  },
});