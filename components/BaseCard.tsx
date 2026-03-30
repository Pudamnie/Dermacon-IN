import { StyleSheet, View } from "react-native";
import { CARD, SPACING } from "../constants/theme";

export default function BaseCard({ children, style }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CARD.radius,
    padding: SPACING.cardPadding,
    ...CARD.shadow,
  },
});