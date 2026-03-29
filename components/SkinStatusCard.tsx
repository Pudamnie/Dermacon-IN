import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

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
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 12,
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    width: "100%",


    paddingVertical: 18,
    paddingHorizontal: 20,

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
    fontFamily: "PoppinsSemiBold",
    color: "#0F172A",
  },

  score: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: "#64748B",
  },

  progressBackground: {
    height: 6,
    backgroundColor: "#E2E8F0",
    borderRadius: 6,
    overflow: "hidden",
  },

  progressFill: {
    height: 6,
    backgroundColor: "#14B8A6",
    borderRadius: 6,
  },

  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  statusLabel: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: "#0F172A",
    marginRight: 6,
  },

  statusValue: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: "#14B8A6",
  },

  lastScan: {
    fontSize: 13,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
  },

  viewDetails: {
    fontSize: 13,
    fontFamily: "PoppinsMedium",
    color: "#2563EB",
    alignSelf: "flex-end",
    marginTop: 10,
  },
});