import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HomeHeader from "../../components/HomeHeader";
import RoutineCard from "../../components/RoutineCard";
import SkinStatusCard from "../../components/SkinStatusCard";
import UpcomingCard from "../../components/UpcomingCard";

export default function HomeScreen() {

  const userData = {
    name: "Sanduni",

    appointment: {
      doctor: "Dr. Amanda Perera",
      time: "Today - 2:00 PM",
      doctorImage: require("../../assets/images/doctor.jpg"),
    },

    skinStatus: {
      disease: "Acne - Mild",
      score: 78,
      previousScore: 70,
      lastScanDays: 5,
    },

    routine: [
      {
        name: "Gentle Cleanser",
        time: "Morning",
      },
      {
        name: "Moisturizer",
        time: "Evening",
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <HomeHeader
          name={userData.name}
          hasNotification={true}
        />

        {userData.appointment && (
          <UpcomingCard data={userData.appointment} />
        )}

        {userData.skinStatus && (
          <SkinStatusCard data={userData.skinStatus} />
        )}

        {userData.routine.length > 0 && (
          <RoutineCard data={userData.routine} />
        )}

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 24,
  },

  scrollContent: {
    paddingTop: 20,
    minHeight: "100%",
  },

});