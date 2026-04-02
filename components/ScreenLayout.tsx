import React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { SPACING } from "../constants/theme";

interface ScreenLayoutProps {
  children: React.ReactNode;
  scroll?: boolean;
}

export default function ScreenLayout({
  children,
  scroll = true,
}: ScreenLayoutProps) {
  return (
    <View style={styles.screen}>
      {scroll ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.noScrollContainer}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight || 20,
  },

  //  For ScrollView screens
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 40,
  },

  // For FlatList / chat / full control screens
  noScrollContainer: {
    flex: 1,
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 12,
  },
});