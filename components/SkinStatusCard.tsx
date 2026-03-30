import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";

export default function SkinStatusCard({ data }) {

  const progressAnim = useRef(new Animated.Value(0)).current;

  // calculate progress from score
  const progress = data.score / 100;

  // determine status
  let status = "Stable";
  if (data.score > data.previousScore) status = "Improving";
  if (data.score < data.previousScore) status = "Worsening";

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, []);

  const widthInterpolated = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });


  return (
    <View style={styles.wrapper}>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Your Skin Status
      </Text>

      {/* Card */}
      <View style={styles.card}>

        <View style={styles.block}>
          <Text style={styles.condition}>
            {data.disease}
          </Text>
        </View>

        <View style={styles.block}>
          <Text style={styles.score}>
            Skin Health Score: {data.score}/100
          </Text>
        </View>

        <View style={styles.block}>
          <View style={styles.progressBackground}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: widthInterpolated },
              ]}
            />
          </View>
        </View>

        <View style={styles.block}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>
              Status:
            </Text>

            <Text style={styles.statusValue}>
              {status}
            </Text>
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.lastScan}>
            Last scan: {data.lastScanDays} days ago
          </Text>
        </View>

        <Text style={styles.viewDetails}>
          View Details
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
    paddingVertical: 18,
    paddingHorizontal: SPACING.cardPadding,
   

    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  // consistent spacing block
  block: {
    marginBottom: 8,
  },

  condition: {
    fontSize: 19,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
  },

  score: {
    fontSize: 14,
    fontFamily: FONT.medium,
      color: COLORS.textSecondary,
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    backgroundColor: COLORS.success,
    borderRadius: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.textPrimary,
    marginRight: 6,
  },

  statusValue: {
    fontSize: 14,
    fontFamily: FONT.medium,
    color: COLORS.success,
  },

  lastScan: {
    fontSize: 13,
    fontFamily: FONT.regular,
    color: COLORS.primary,
  },

  viewDetails: {
    fontSize: 13,
    fontFamily: "PoppinsMedium",
    color: "#2563EB",
    alignSelf: "flex-end",
    marginTop: 10,
  },
});