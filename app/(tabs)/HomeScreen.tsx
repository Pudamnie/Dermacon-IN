import ScreenLayout from "../../components/ScreenLayout";

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
    <ScreenLayout>

      <HomeHeader
        name={userData.name}
        hasNotification={true}
      />

      {/* CASE 1 — HAS APPOINTMENT */}
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

    </ScreenLayout>
  );
}