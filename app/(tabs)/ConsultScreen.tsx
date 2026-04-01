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

export default function ConsultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState("book");
  const [newAppointment, setNewAppointment] = useState(null);

  // ✅ FIREBASE READY STATES

  const [topDoctors, setTopDoctors] = useState([
    {
      id: "1",
      name: "Dr. Saman Perera",
      specialty: "Dermatologist",
      rating: "4.7",
      image: doctorImage,
    },
    {
      id: "2",
      name: "Dr. Saman Perera",
      specialty: "Dermatologist",
      rating: "4.9",
      image: doctorImage,
    },
    {
      id: "3",
      name: "Dr. Saman Perera",
      specialty: "Dermatologist",
      rating: "4.8",
      image: doctorImage,
    },
  ]);

  const [recentDoctors, setRecentDoctors] = useState([
    {
      id: "r1",
      name: "Dr. Amanda Perera",
      specialty: "Dermatologist",
      rating: "4.8",
      image: doctorImage,
      lastVisited: "2026-03-28",
    },
    {
      id: "r2",
      name: "Dr. Kumarathunga",
      specialty: "Dermatologist",
      rating: "4.6",
      image: doctorImage,
      lastVisited: "2026-03-25",
    },
  ]);

  // ✅ SORT RECENT (LATEST FIRST)
  const sortedRecentDoctors = [...recentDoctors].sort(
    (a, b) => new Date(b.lastVisited) - new Date(a.lastVisited)
  );

  // ✅ HANDLE NAVIGATION PARAMS
  useEffect(() => {
    if (params.tab === "scheduled" && activeTab !== "scheduled") {
      setActiveTab("scheduled");

      if (params.name) {
        setNewAppointment({
          name: params.name,
          speciality: params.speciality,
          date: params.date,
          time: params.time,
          status: params.status || "confirmed",
          image: doctorImage,
        });
      }
    }
  }, [params.tab]);

  // ✅ BACK HANDLER FIX
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (activeTab === "scheduled") {
          setActiveTab("book");
          return true;
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [activeTab])
  );

  return (
    <ScreenLayout>
      <PageHeader title="Consultation" showBack />

      {/* TOGGLE */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={activeTab === "book" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("book")}
        >
          <Text style={activeTab === "book" ? styles.activeText : styles.inactiveText}>
            Book Appointment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={activeTab === "scheduled" ? styles.activeTab : styles.inactiveTab}
          onPress={() => setActiveTab("scheduled")}
        >
          <Text style={activeTab === "scheduled" ? styles.activeText : styles.inactiveText}>
            Scheduled
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "book" ? (
        <>
          {/* SEARCH */}
          <View style={styles.searchBox}>
            <Text style={styles.searchText}>Find a doctor</Text>
          </View>

          {/* TOP DOCTORS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Doctors</Text>

            <TouchableOpacity onPress={() => router.push("/TopDoctorsScreen")}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {topDoctors.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() =>
                    router.push({
                      pathname: "/DoctorDetailsScreen",
                      params: {
                        doctorName: doc.name,
                        speciality: doc.specialty,
                        rating: doc.rating,
                      },
                    })
                  }
                >
                  <DoctorCard doctor={doc} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* RECENT DOCTORS */}
          <Text style={styles.sectionTitle}>Your Recent Doctors</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {sortedRecentDoctors.length > 0 ? (
                sortedRecentDoctors.map((doc) => (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() =>
                      router.push({
                        pathname: "/DoctorDetailsScreen",
                        params: {
                          doctorName: doc.name,
                          speciality: doc.specialty,
                          rating: doc.rating,
                        },
                      })
                    }
                  >
                    <DoctorCard doctor={doc} />
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: "#94A3B8", fontFamily: FONT.medium }}>
                  No recent doctors yet
                </Text>
              )}
            </View>
          </ScrollView>
        </>
      ) : (
        <>
          {/* NEW BOOKED */}
          {newAppointment && (
            <ScheduledCard appointment={newAppointment} />
          )}

          {/* STATIC FALLBACK */}
          <ScheduledCard
            appointment={{
              name: "Dr. Amanda Perera",
              speciality: "Dermatologist",
              date: "26/06/2026",
              time: "10:30 AM",
              status: "confirmed",
              image: doctorImage,
            }}
          />
        </>
      )}
    </ScreenLayout>
  );
}

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
    color: "#FFFFFF",
    fontFamily: FONT.title,
    fontSize: 14,
  },

  inactiveText: {
    color: "#64748B",
    fontFamily: FONT.title,
    fontSize: 14,
  },

  searchBox: {
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
  },

  searchText: {
    fontSize: 12,
    color: "#94A3B8",
    fontFamily: FONT.regular,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
    marginBottom: 12,
  },

  seeAll: {
    fontSize: 13,
    color: COLORS.primary,
    fontFamily: FONT.medium,
  },

  row: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
    alignItems: "center",
  },
});