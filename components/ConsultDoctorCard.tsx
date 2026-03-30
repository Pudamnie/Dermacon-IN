import { Image, StyleSheet, Text, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";
import PrimaryButton from "./PrimaryButton";

export default function ConsultDoctorCard() {
  return (
    <View style={styles.wrapper}>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Consult Doctor
      </Text>

      {/* Card */}
      <View style={styles.card}>

        <View style={styles.leftContent}>
          <Text style={styles.title}>
            Connect with a certified dermatologist
          </Text>

          <PrimaryButton
            title="Book Consultation"
            onPress={() => {}}
            style={styles.customButton}
          />
        </View>

        {/* Doctor Image */}
        <Image
          source={require("../assets/images/consultDoctor.png")}
          style={styles.image}
        />

      </View>

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
    borderRadius: 20,
    paddingTop: 28,
    paddingBottom: 16,
    paddingHorizontal: SPACING.cardPadding,

    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 160,
  },

  leftContent: {
    flex: 1,
    paddingRight: 10,
  },

  title: {
    fontSize: 15,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginBottom: 16,
    lineHeight: 22,
  },

  // NEW BUTTON STYLE (only affects this card)
  customButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: "flex-start",
  },

  image: {
    width: 130,
    height: 130,
    borderRadius: 18,
    position: "absolute",
    right: 10,
    bottom: 0,
  },

});