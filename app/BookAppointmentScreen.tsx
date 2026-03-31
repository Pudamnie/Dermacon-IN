import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PageHeader from "../components/PageHeader";
import ScreenLayout from "../components/ScreenLayout";
import { FONT } from "../constants/theme";

import doctorImage from "../assets/images/consultDoctor.png";
import visaImage from "../assets/images/visa.png";

export default function BookAppointmentScreen() {

  // 🔥 DEBUG CHANGE (YOU MUST SEE THIS CHANGE)
  const data = {
    doctor: {
      name: "iuytrf",
      speciality: "Dermatologist",
      rating: 4.7,
      image: doctorImage,
    },
    booking: {
      dateTime: " UPDATED DATE ",
      reason: "Chest pain",
    },
    payment: {
      consultation: 1000,
      admin: 100,
      total: 1100,
    },
  };

  return (
    <ScreenLayout>

      <PageHeader title="Book Appointment" showBack />

      {/* DOCTOR CARD */}
      <View style={styles.card}>
        <Image source={data.doctor.image} style={styles.doctorImage} />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{data.doctor.name}</Text>
          <Text style={styles.speciality}>{data.doctor.speciality}</Text>

          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color="#1F3A8A" />
            <Text style={styles.rating}>{data.doctor.rating}</Text>
          </View>
        </View>
      </View>

      {/* DATE */}
      <View style={styles.section}>
        <Text style={styles.title}>Date</Text>

        <View style={styles.row}>
          <View style={styles.iconCircle}>
            <Ionicons name="calendar-outline" size={18} color="#1F3A8A" />
          </View>

          <Text style={styles.textWrap}>{data.booking.dateTime}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* REASON */}
      <View style={styles.section}>
        <Text style={styles.title}>Reason</Text>

        <View style={styles.row}>
          <View style={styles.iconCircle}>
            {/* ✅ Clean centered note icon */}
            <Ionicons name="create-outline" size={18} color="#1F3A8A" />
          </View>

          <Text style={styles.textWrap}>{data.booking.reason}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* PAYMENT */}
      <View style={styles.section}>
        <Text style={styles.title}>Payment Detail</Text>

        <View style={styles.paymentRow}>
          <Text style={styles.label}>Consultation</Text>
          <Text style={styles.value}>Rs {data.payment.consultation}.00</Text>
        </View>

        <View style={styles.paymentRow}>
          <Text style={styles.label}>Admin Fee</Text>
          <Text style={styles.value}>Rs {data.payment.admin}.00</Text>
        </View>

        <View style={styles.paymentRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>Rs {data.payment.total}.00</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* PAYMENT METHOD */}
      <View style={styles.section}>
        <Text style={styles.title}>Payment Method</Text>

        <View style={styles.paymentBox}>
          <Image source={visaImage} style={styles.visa} resizeMode="contain" />
        </View>
      </View>

      {/* BUTTON */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Booking</Text>
      </TouchableOpacity>

    </ScreenLayout>
  );
}

const SPACING = 14;

const styles = StyleSheet.create({

  card: {
    flexDirection: "row",
    gap: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    marginBottom: SPACING,
    backgroundColor: "#FFF",
  },

  doctorImage: {
    width: 85,
    height: 85,
    borderRadius: 16,
  },

  name: {
    fontSize: 18,
    fontFamily: FONT.title,
    color: "#0F172A",
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

  section: {
    marginBottom: SPACING,
  },

  title: {
    fontSize: 18,
    fontFamily: FONT.title,
    color: "#0F172A",
    marginBottom: 8,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  textWrap: {
    flex: 1,
    fontSize: 14,
    color: "#64748B",
    fontFamily: FONT.medium,
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: SPACING,
  },

  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  label: {
    fontSize: 14,
    color: "#94A3B8",
    fontFamily: FONT.regular,
  },

  value: {
    fontSize: 14,
    color: "#0F172A",
    fontFamily: FONT.regular,
  },

  totalLabel: {
    fontSize: 14,
    fontFamily: FONT.title,
    color: "#0F172A",
  },

  totalValue: {
    fontSize: 14,
    fontFamily: FONT.title,
    color: "#1F3A8A",
  },

  paymentBox: {
    height: 54,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "flex-start", // LEFT aligned
    paddingLeft: 14,
  },

  visa: {
    width: 120,
    height: 36,
  },

  button: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1F3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 14,
    fontFamily: FONT.title,
  },
});