import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CARD, COLORS, FONT, SPACING } from "../constants/theme";
import BaseCard from "./BaseCard";


export default function ConsultDoctorCard() {
  return (
    <View style={styles.wrapper}>

      <Text style={styles.sectionTitle}>
        Consult Doctor
      </Text>

      <BaseCard style={styles.card}>

        {/* LEFT */}
        <View style={styles.leftContent}>
          <Text style={styles.title}>
            Connect with a certified{"\n"}dermatologist
          </Text>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Book Consultation</Text>
          </TouchableOpacity>
        </View>

        {/* IMAGE */}
        <Image
          source={require("../assets/images/consultDoctor.png")}
          style={styles.image}
        />

      </BaseCard>

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    marginBottom: SPACING.sectionGap,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.title,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },

  
  card: {
    backgroundColor: "#E6F4F1",
    
    paddingTop: 10,
    paddingBottom: 18,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center", 

    minHeight: 170,
    overflow: "hidden",

   
    ...CARD.borderLight,
  },

  
  leftContent: {
    flex: 1,
    paddingRight: 100,
    paddingTop: 10,   
    paddingBottom: 4, 
  },

  title: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginBottom: 14,
    lineHeight: 20,
  },

  button: {
    backgroundColor: COLORS.success,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 22,
    alignSelf: "flex-start",
  },

  buttonText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: "#FFFFFF",
  },

  image: {
    width: 135,
    height: 135,
    borderRadius: 20,
    position: "absolute",
    right: 10,
    bottom: 0,
  },

});