import { StyleSheet, Text, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";

export default function EmptyRoutineCard() {
  return (
    <View style={styles.wrapper}>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Your Routine
      </Text>

      {/* Card */}
      <View style={styles.card}>

        <Text style={styles.title}>
          No routine yet
        </Text>

        <Text style={styles.subtitle}>
          Your treatment plan will appear here after consultation
        </Text>

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
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: SPACING.cardPadding,

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  title: {
    fontSize: 15,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
  },

});