import { CommonActions, useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import successImage from "../assets/images/success.png";
import ScreenLayout from "../components/ScreenLayout";
import { FONT } from "../constants/theme";

export default function PaymentSuccessScreen() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();

  const handleSeeDetails = () => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            
            name: "(tabs)", // root tab navigator
            state: {
              routes: [
                {
                  name: "ConsultScreen", // MUST match your tab file name (lowercase)
                  params: {
                    tab: "scheduled",

                    // PASS BOOKING DATA
                    name: params.doctorName || "Dr. Amanda Perera",
                    speciality: params.speciality || "Dermatologist",
                    date: params.date || "26/06/2026",
                    time: params.time || "10:30 AM",
                    status: "confirmed",
                  },
                },
              ],
            },
          },
        ],
      })
    );
  };

  return (
    <ScreenLayout>
      <View style={styles.container}>

        {/* ICON */}
        <Image source={successImage} style={styles.icon} />

        {/* TITLE */}
        <Text style={styles.title}>Payment Successful</Text>

        {/* DESCRIPTION */}
        <Text style={styles.description}>
          Your appointment has been successfully booked.{"\n"}
          You can now consult with your doctor at the scheduled time.
        </Text>

        {/* BUTTON */}
        <TouchableOpacity style={styles.button} onPress={handleSeeDetails}>
          <Text style={styles.buttonText}>See Details</Text>
        </TouchableOpacity>

      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },

  icon: {
    width: 102,
    height: 102,
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontFamily: FONT.title,
    color: "#0F172A",
    marginBottom: 10,
    textAlign: "center",
  },

  description: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 30,
  },

  button: {
    height: 50,
    width: "100%",
    borderRadius: 25,
    backgroundColor: "#1F3A8A",
    justifyContent: "center",
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: FONT.title,
  },
});