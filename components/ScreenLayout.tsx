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
  if (scroll) {
    return (
      <View style={styles.screen}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.container}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: StatusBar.currentHeight || 20,
  },

  container: {
    paddingHorizontal: SPACING.screenHorizontal,
    paddingTop: 12,
    paddingBottom: 20,
  },
});