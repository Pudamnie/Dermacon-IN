import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";


export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        
        <Image
          source={require("../../assets/images/welcomeLogo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>
          Welcome to Dermacare AI
        </Text>

        <Text style={styles.subtitle}>
          Smart Dermatology. Powered by AI.{"\n"}
          Built for your care.
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Log In"
            onPress={() => router.push("/LoginScreen")} 
            style={{width:222}}
          />

          <View style={{ height: 14 }} />

          <SecondaryButton
            title="Sign Up"
            onPress={() => router.push("/(auth)/CreateAccountScreen")}
          />
        </View>
      </View>

      <Text style={styles.terms}>
        By continuing, you agree to our{"\n"}
        <Text style={styles.link}>Terms & Privacy Policy</Text>
      </Text>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 24,
  },

  content: {
    flex: 1,            
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },

  logo: {
    width: 110,
    height: 110,
    marginBottom: 48,
  },

  title: {
    fontSize: 22,
    fontFamily: "PoppinsSemiBold",
    color: "#1F3A8A",
    textAlign: "center",
    marginBottom: 4,
    letterSpacing: 0.2,

  },

  subtitle: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    textAlign: "center",
    marginTop: 0,
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  buttonContainer: {
    marginTop: 48,
    alignItems: "center",
  },

  terms: {

    fontSize: 12,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    textAlign: "center",
    marginBottom: 60,
    paddingHorizontal: 16,
    lineHeight: 18,
  },

  link: {
    color: "#2563ED",
  },
});
