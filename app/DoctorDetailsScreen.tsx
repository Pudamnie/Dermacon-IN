import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import PageHeader from "../components/PageHeader";
import ScreenLayout from "../components/ScreenLayout";
import { FONT } from "../constants/theme";

import doctorImage from "../assets/images/consultDoctor.png";

export default function DoctorDetailsScreen() {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);

  const doctor = {
    name: "Dr. Amanda Perera Silva Fernando With Very Long Name",
    speciality: "Dermatologist",
    rating: "4.7",
    description:
      "Experienced dermatologist specializing in acne, eczema, and skin allergies. Providing personalized treatments and modern skincare solutions for all patients.",
    image: doctorImage,
  };

  const dates = [
    { id: 1, day: "Mon", date: "21", available: false },
    { id: 2, day: "Tue", date: "22", available: true },
    { id: 3, day: "Wed", date: "23", available: true },
    { id: 4, day: "Thu", date: "24", available: true },
    { id: 5, day: "Fri", date: "25", available: true },
    { id: 6, day: "Sat", date: "26", available: true },
    { id: 7, day: "Sun", date: "27", available: true },
    { id: 8, day: "Mon", date: "28", available: true },
  ];

  const times = [
    { id: 1, time: "09:00 AM", available: false },
    { id: 2, time: "01:00 PM", available: false },
    { id: 3, time: "02:00 PM", available: true },
    { id: 4, time: "03:00 PM", available: true },
    { id: 5, time: "07:00 PM", available: true },
    { id: 6, time: "08:00 PM", available: true },
  ];

  return (
    <ScreenLayout>

      <PageHeader title="Doctor Detail" showBack />

      {/* PROFILE */}
      <View style={styles.section}>
        <View style={styles.profileRow}>
          <Image source={doctor.image} style={styles.image} />

          <View style={styles.profileText}>
            <Text style={styles.name}>{doctor.name}</Text>
            <Text style={styles.speciality}>{doctor.speciality}</Text>

            <View style={styles.ratingRow}>
              <Ionicons name="star" size={12} color="#1F3A8A" />
              <Text style={styles.rating}>{doctor.rating}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ABOUT */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>

        <Text
          style={styles.description}
          numberOfLines={expanded ? undefined : 3}
        >
          {doctor.description}
        </Text>

        {doctor.description.length > 120 && (
          <Text
            style={styles.readMore}
            onPress={() => setExpanded(!expanded)}
          >
            {expanded ? "Show less" : "Read more"}
          </Text>
        )}
      </View>

      {/* DATES */}
      <View style={styles.section}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        >
          {dates.map((item) => {
            const isSelected = selectedDate === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                disabled={!item.available}
                onPress={() => setSelectedDate(item.id)}
                style={[
                  styles.dateBox,
                  {
                    backgroundColor: isSelected ? "#1F3A8A" : "#FFFFFF",
                    borderColor: item.available ? "#1F3A8A" : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: isSelected
                        ? "#FFF"
                        : item.available
                        ? "#1F3A8A"
                        : "#E2E8F0",
                    },
                  ]}
                >
                  {item.day}
                </Text>

                <Text
                  style={[
                    styles.dateText,
                    {
                      color: isSelected
                        ? "#FFF"
                        : item.available
                        ? "#1F3A8A"
                        : "#E2E8F0",
                    },
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ✅ DIVIDER AS SECTION (FIXED) */}
      <View style={styles.section}>
        <View style={styles.divider} />
      </View>

      {/* TIMES */}
      <View style={styles.section}>
        <View style={styles.timeGrid}>
          {times.map((item) => {
            const isSelected = selectedTime === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                disabled={!item.available}
                onPress={() => setSelectedTime(item.id)}
                style={[
                  styles.timeBox,
                  {
                    backgroundColor: isSelected ? "#1F3A8A" : "#FFFFFF",
                    borderColor: item.available ? "#1F3A8A" : "#E2E8F0",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeText,
                    {
                      color: isSelected
                        ? "#FFF"
                        : item.available
                        ? "#1F3A8A"
                        : "#E2E8F0",
                    },
                  ]}
                >
                  {item.time}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* BUTTON */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.bookBtn}>
          <Text style={styles.bookText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>

    </ScreenLayout>
  );
}

const SPACING = 20;

const styles = StyleSheet.create({

  // SINGLE SOURCE OF TRUTH (INDUSTRY WAY)
  section: {
    marginBottom: SPACING,
  },

  profileRow: {
    flexDirection: "row",
    gap: 16,
  },

  profileText: {
    flex: 1,
    justifyContent: "center",
  },

  image: {
    width: 115,
    height: 115,
    borderRadius: 20,
  },

  name: {
    fontSize: 18,
    fontFamily: FONT.title,
    color: "#0F172A",
    flexWrap: "wrap",
  },

  speciality: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: "#94A3B8",
    marginTop: 4,
  },

  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },

  rating: {
    fontSize: 13,
    color: "#1F3A8A",
    fontFamily: FONT.medium,
  },

  sectionTitle: {
    fontSize: 16,
    fontFamily: FONT.title,
    color: "#0F172A",
    marginBottom: 6,
  },

  description: {
    fontSize: 14,
    color: "#64748B",
    fontFamily: FONT.regular,
    lineHeight: 20,
  },

  readMore: {
    color: "#1F3A8A",
    fontSize: 13,
    fontFamily: FONT.medium,
    marginTop: 4,
  },

  dateScroll: {
    gap: 14,
    paddingRight: 10,
  },

  dateBox: {
    width: 60,
    height: 80,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  dayText: {
    fontSize: 11,
    fontFamily: FONT.regular,
  },

  dateText: {
    fontSize: 20,
    fontFamily: FONT.title,
  },

  //NO MARGINS HERE 
  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
  },

  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },

  timeBox: {
    width: "32%",
    height: 48,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  timeText: {
    fontSize: 13,
    fontFamily: FONT.medium,
  },

  bookBtn: {
    height: 48,
    borderRadius: 25,
    backgroundColor: "#1F3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  bookText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: FONT.title,
  },
});