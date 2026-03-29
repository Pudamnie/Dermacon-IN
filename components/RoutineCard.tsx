import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
export default function RoutineCard({ data }) {

  const upcomingRoutines = data.slice(0, 2);

  const router = useRouter();

  return (
    <View style={styles.wrapper}>

        <View style={styles.header}>
        <Text style={styles.sectionTitle}>
         Today's Routine
        </Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/MyCareScreen")}>
          <Ionicons name="chevron-forward" size={20} color="#64748B" />
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
                  color={item.time === "Morning" ? "#F4B740" : "#3B82F6"}
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
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 12,
    color: "#0F172A",
  },

card: {
  backgroundColor: "#F8FAFC",
  borderWidth: 1,
  borderColor: "#E2E8F0",
  borderRadius: 16,
  width: "100%",

  paddingVertical: 18,
  paddingHorizontal: 20,

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
    fontFamily: "PoppinsSemiBold",
    color: "#0F172A",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  routineTime: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 10,
  },
});