import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const SplashScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(auth)/WelcomeScreen");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={["#1F3A84", "#2563EB"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>

        <View style={styles.content}>
            <View style={styles.logoContainer}>

          <Image
            source={require("../assets/images/splashLogo.png")}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            AI-Powered Dermatology Assistant
          </Text>
        </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
    
  },
  logoContainer: {
    alignItems: "center",
  },

  logo: {
    width: 280,
    height: 50,
    marginBottom: 0,

  },
  
  
  subtitle: {
  
    fontSize: 12,
    color: "#E5E7EB",
    textAlign: "center",
    letterSpacing: 0.8,
    opacity: 0.8,
    
  },
});