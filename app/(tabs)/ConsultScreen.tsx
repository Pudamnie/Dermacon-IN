import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import DoctorCard from "../../components/DoctorCard";
import PageHeader from "../../components/PageHeader";
import ScheduledCard from "../../components/ScheduledCard";
import ScreenLayout from "../../components/ScreenLayout";
import { COLORS, FONT } from "../../constants/theme";

import doctorImage from "../../assets/images/consultDoctor.png";

import {
  getAppointmentStatus,
  getChatState,
  isJoinAvailable,
  parseAppointmentDate,
} from "../utils/ChatUtils";

// ================= TYPES  =================
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: string;
  image: any;
};

type Appointment = {
  id: string;
  name: string;
  speciality: string;
  date: string;
  time: string;
  image: any;
};

export default function ConsultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState<string>("book");

  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
  const [recentDoctors, setRecentDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // ================= MOCK DATA =================
  useEffect(() => {
    setTopDoctors([
      {
        id: "1",
        name: "Dr. Saman Perera",
        specialty: "Dermatologist",
        rating: "4.7",
        image: doctorImage,
      },
    ]);

    setRecentDoctors([
      {
        id: "r1",
        name: "Dr. Amanda Perera",
        specialty: "Dermatologist",
        rating: "4.8",
        image: doctorImage,
      },
    ]);

    const now = new Date();

    // SAFE FORMAT FUNCTION
    const formatTime = (date: Date): string => {
      let hours = date.getHours();
      const minutes = date.getMinutes();

      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;

      const mins = minutes < 10 ? "0" + minutes : minutes;

      return `${hours}:${mins} ${ampm}`;
    };

    //  MOCK DATA (REPLACE WITH FIREBASE LATER)
    setAppointments([
      {
        //future (confiremed) doctor 

        id: "1",
        name: "Dr. Saman",
        speciality: "Dermatologist",
        date: now.toLocaleDateString("en-GB"),
        time: formatTime(new Date(now.getTime() + 60 * 60 * 1000)),
        image: doctorImage,
      },


      {
        //ongoing appointment 

        id: "2",
        name: "Dr. Perera",
        speciality: "Dermatologist",
        date: now.toLocaleDateString("en-GB"),
        time: formatTime(now),
        image: doctorImage,
      },


      {

        // completed 20 min after

        id: "3",
        name: "Dr. Amanda",
        speciality: "Dermatologist",
        date: now.toLocaleDateString("en-GB"),
        time: formatTime(new Date(now.getTime() - 20 * 60 * 1000)),
        image: doctorImage,
      },



      {
        //colpleted 2 days ago

        id: "5",
        name: "Dr. Perera",
        speciality: "Dermatologist",
        date: new Date(
          now.getTime() - 2 * 24 * 60 * 60 * 1000
        ).toLocaleDateString("en-GB"),
        time: formatTime(now),
        image: doctorImage,
      },
    ]);
  }, []);



  // ================= SORTING =================
  const sortedAppointments = [...appointments].sort(
    (a: Appointment, b: Appointment) => {
      const timeA = parseAppointmentDate(a).getTime();
      const timeB = parseAppointmentDate(b).getTime();

      const statusOrder: Record<string, number> = {
        ongoing: 1,
        confirmed: 2,
        completed: 3,
      };

      const sA = getAppointmentStatus(a);
      const sB = getAppointmentStatus(b);

      if (statusOrder[sA] !== statusOrder[sB]) {
        return statusOrder[sA] - statusOrder[sB];
      }

      if (sA === "confirmed") return timeA - timeB;

      return timeB - timeA;
    }
  );

  // ================= NAVIGATION =================
  useEffect(() => {
    if (params.tab === "scheduled") {
      setActiveTab("scheduled");
    }
  }, [params.tab]);

  // ================= BACK FIX =================
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (activeTab === "scheduled") {
          setActiveTab("book");
          return true;
        }
        return false;
      };

      const sub = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );
      return () => sub.remove();
    }, [activeTab])
  );

  return (
    <ScreenLayout>
      <PageHeader title="Consultation" showBack />

      {/* TOGGLE */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={
            activeTab === "book" ? styles.activeTab : styles.inactiveTab
          }
          onPress={() => setActiveTab("book")}
        >
          <Text
            style={
              activeTab === "book"
                ? styles.activeText
                : styles.inactiveText
            }
          >
            Book Appointment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={
            activeTab === "scheduled"
              ? styles.activeTab
              : styles.inactiveTab
          }
          onPress={() => setActiveTab("scheduled")}
        >
          <Text
            style={
              activeTab === "scheduled"
                ? styles.activeText
                : styles.inactiveText
            }
          >
            Scheduled
          </Text>
        </TouchableOpacity>
      </View>

      {/* BOOK TAB */}
      {activeTab === "book" && (
        <>
          <View style={styles.searchBox}>
            <Text style={styles.searchText}>Find a doctor</Text>
          </View>

          <Text style={styles.sectionTitle}>Top Doctors</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {topDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>Your Recent Doctors</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {recentDoctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} />
              ))}
            </View>
          </ScrollView>
        </>
      )}

      {/* SCHEDULED TAB */}
      {activeTab === "scheduled" &&
        sortedAppointments.map((item) => {
          const chatState = getChatState(item);
          const joinActive = isJoinAvailable(item);

          return (
            <ScheduledCard
              key={item.id}
              appointment={item}
              chatState={chatState}
              isJoinActive={joinActive}
              onChatPress={() =>
                router.push({
                  pathname: "/ChatScreen",
                  params: {
                    name: item.name,
                    chatState: chatState,
                  },
                })
              }
            />
          );
        })}
    </ScreenLayout>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 25,
    padding: 4,
    marginBottom: 16,
  },
  activeTab: {
    flex: 1,
    backgroundColor: "#1F3A8A",
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: "center",
  },
  inactiveTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  activeText: {
    color: "#FFF",
    fontFamily: FONT.title,
  },
  inactiveText: {
    color: "#64748B",
    fontFamily: FONT.title,
  },
  searchBox: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 12,
    marginBottom: 20,
  },
  searchText: {
    color: "#94A3B8",
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
  },
  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
});