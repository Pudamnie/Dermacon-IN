import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";

export default function RoutineCard({ data }) {

  const upcomingRoutines = data.slice(0, 2);

  const router = useRouter();

  return (
    <View style={styles.wrapper}>

        <View style={styles.header}>
        <Text style={styles.sectionTitle}>
         Today's Routine
        </Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/ProfileScreen")}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
    </View>

      <View style={styles.card}>


            {upcomingRoutines.map((item, index) => (
          <View key={index}>

            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={item.time === "Morning" ? "sunny-outline" : "moon-outline"}
                  size={22}
                  color={item.time === "Morning" ? COLORS.warning : COLORS.routineNight}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.routineName}>
                  {item.name}
                </Text>

                <Text style={styles.routineTime}>
                  {item.time}
                </Text>
              </View>
            </View>

            {index !== data.length - 1 && (
              <View style={styles.divider} />
            )}

          </View>
        ))}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sectionGap,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.title,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },

card: {
  backgroundColor: COLORS.card,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 16,
  width: "100%",

  paddingVertical: 18,
  paddingHorizontal: SPACING.cardPadding,

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
},

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  iconContainer: {
    width: 40,
    alignItems: "center",
  },

  routineName: {
    fontSize: 15,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  routineTime: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
});












 