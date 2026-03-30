import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SPACING } from "../../constants/theme";


import ConsultDoctorCard from "../../components/ConsultDoctorCard";
import EmptyRoutineCard from "../../components/EmptyRoutineCard";
import HomeHeader from "../../components/HomeHeader";
import RoutineCard from "../../components/RoutineCard";
import SkinScanCard from "../../components/SkinScanCard";
import SkinStatusCard from "../../components/SkinStatusCard";
import UpcomingCard from "../../components/UpcomingCard";

export default function HomeScreen() {

  const userData = {
    name: "Sanduni",

    appointment: null,

    skinStatus: null,
  

    routine: [],
    
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

        {/*  CASE 1 — HAS APPOINTMENT (OLD USER) */}
{userData.appointment ? (
  <>
    <UpcomingCard data={userData.appointment} />

    {userData.skinStatus && (
      <SkinStatusCard data={userData.skinStatus} />
    )}

    {userData.routine.length > 0 ? (
      <RoutineCard data={userData.routine} />
    ) : (
      <EmptyRoutineCard />
    )}
  </>
) : (
  /*  CASE 2 — NO APPOINTMENT */
  <>
    {/* SCAN OR STATUS */}
    {userData.skinStatus ? (
      <SkinStatusCard data={userData.skinStatus} />
    ) : (
      <SkinScanCard />
    )}

    {/* CONSULT */}
    <ConsultDoctorCard />

    {/* ROUTINE */}
    {userData.routine.length > 0 ? (
      <RoutineCard data={userData.routine} />
    ) : (
      <EmptyRoutineCard />
    )}
  </>
)}
        

      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
  flex: 1,
  backgroundColor: COLORS.background,
  paddingHorizontal: SPACING.screenHorizontal,
},

scrollContent: {
  paddingTop: 10,
  minHeight: "100%",
},

});

