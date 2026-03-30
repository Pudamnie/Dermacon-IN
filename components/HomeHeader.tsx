import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, FONT, SPACING } from "../constants/theme";

export default function HomeHeader({ name, hasNotification }) {
  return (
    <View style={styles.wrapper}>
      
      {/* Top Row */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.greeting}>Good Morning,</Text>
          <Text style={styles.name}>{name}</Text>
        </View>

        <TouchableOpacity style={styles.notificationContainer}>
          <Ionicons name="notifications-outline" size={24} color ={COLORS.secondary} />
          {hasNotification && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      {/* Subtitle */}
      <Text style={styles.subtitle}>
        Here's your latest update
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({

  wrapper: {
    paddingTop: 8,
    marginBottom: SPACING.sectionGap,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  greeting: {
    fontSize: 24,
    fontFamily: FONT.title,
    color: COLORS.secondary,
    lineHeight:32,
  },

  name: {
    fontSize: 24,
    fontFamily: FONT.title,
    color: COLORS.secondary,
    marginTop: -6,
  },

  subtitle: {
    fontSize: 14,
    fontFamily: FONT.regular,
    color: COLORS.textSecondary,
    marginTop: 4,   
  },

  notificationContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginTop: 4,
    
   
  },

  dot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },

});