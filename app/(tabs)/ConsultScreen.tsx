import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import DoctorCard from "../../components/DoctorCard";
import PageHeader from "../../components/PageHeader";
import ScreenLayout from "../../components/ScreenLayout";
import { COLORS, FONT } from "../../constants/theme";

import doctorImage from "../../assets/images/consultDoctor.png";

export default function ConsultScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("book");

  const doctors = [
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
      name: "Dr. Stevi Jess",
      specialty: "Dermatologist",
      rating: "4.8",
      image: doctorImage,
    },
  ];

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
              {doctors.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => router.push(`/DoctorDetailsScreen?id=${doc.id}`)}
                >
                  <DoctorCard doctor={doc} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* RECENT */}
          <Text style={styles.sectionTitle}>Your Recent Doctors</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.row}>
              {doctors.map((doc) => (
                <TouchableOpacity
                  key={doc.id}
                  onPress={() => router.push(`/DoctorDetailsScreen?id=${doc.id}`)}
                >
                  <DoctorCard doctor={doc} />
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No scheduled appointments yet</Text>
        </View>
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
  },

  emptyBox: {
    alignItems: "center",
    marginTop: 40,
  },

  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: FONT.medium,
  },
});