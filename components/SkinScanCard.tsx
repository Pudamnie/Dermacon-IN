import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";

export default function SkinScanCard() {
  return (
    <View style={styles.wrapper}>

      <Text style={styles.sectionTitle}>
        Start Your First Scan
      </Text>

      <View style={styles.card}>
        <Text style={styles.title}>
          AI Skin Analysis
        </Text>

        <Text style={styles.subtitle}>
          Scan your skin and get instant AI-powered insights
        </Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Start Scan</Text>
        </TouchableOpacity>
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
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: SPACING.cardPadding,
  },

  title: {
    fontSize: 20,
    fontFamily: FONT.title,
    color: "#FFFFFF",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: "#E0E7FF",
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },

  buttonText: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.primary,
  },

});