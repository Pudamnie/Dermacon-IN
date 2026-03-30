import { StyleSheet, Text, View } from "react-native";
import { CARD, COLORS, FONT, SPACING } from "../constants/theme";
import BaseCard from "./BaseCard";

export default function EmptyRoutineCard() {
  return (
    <View style={styles.wrapper}>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Your Routine
      </Text>

      {/* Card */}
      <BaseCard style={styles.card}>

        <Text style={styles.title}>
          No routine yet
        </Text>

        <Text style={styles.subtitle}>
          Your treatment plan will appear here after consultation
        </Text>

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
    backgroundColor: COLORS.card,
    paddingVertical: 20,
 
    ...CARD.borderLight,
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


