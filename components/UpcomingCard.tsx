import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CARD, COLORS, FONT, SPACING } from "../constants/theme";
import BaseCard from "./BaseCard";


export default function UpcomingCard({ data }) {
  return (
    <View style={styles.wrapper}>
      
      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Upcoming Consultation
      </Text>

      {/* Card */}
      <BaseCard style={styles.card}>

        {/* Left Action Bar */}
        <View style={styles.leftBar} />

        {/* Content */}
        <View style={styles.content}>
          
          {/* Doctor Row */}
          <View style={styles.row}>

            <Image
                 source={data.doctorImage}
                 style={styles.avatar}
/>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>
                {data.doctor}
              </Text>
              <Text style={styles.time}>
                {data.time}
              </Text>
            </View>
          </View>

          {/* View Details */}
          <TouchableOpacity>
            <Text style={styles.viewDetails}>
              View Details
            </Text>
          </TouchableOpacity>

        </View>
      </BaseCard>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.sectionGap
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: FONT.title,
    marginBottom: 12,
    color: COLORS.textPrimary,
  },

  card: {
    backgroundColor: COLORS.card,
    width: "100%",
    paddingVertical: 18,

    flexDirection: "row",
  
    ...CARD.borderLight,
    
  },

  leftBar: {
    position: "absolute",
    left:0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: COLORS.primary,
    
  },

  content: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },

  doctorName: {
    fontSize: 16,
    fontFamily: FONT.title,
    color: COLORS.textPrimary,
  },

  time: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  viewDetails: {
    fontSize: 13,
    fontFamily: FONT.medium,
    color: COLORS.primary,
    alignSelf: "flex-end",
    marginTop: 10,
  },
});