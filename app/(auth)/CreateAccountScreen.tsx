import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthInput";
import PrimaryButton from "../../components/PrimaryButton";

export default function CreateAccountScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={26} color="#1F3A8A" />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join DermaCare AI to access smart dermatology care
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <AuthInput placeholder="Full Name" />
          <AuthInput placeholder="Email Address" />
          <AuthInput placeholder="Create Password" secureTextEntry />
          <AuthInput placeholder="Confirm Password" secureTextEntry />
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Create Account"
            onPress={() => {}}
            style={{ width: "100%" }}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Already have an account?{" "}
            <Text
              style={styles.loginLink}
              onPress={() => router.push("/(auth)/LoginScreen")}
            >
              Log In
            </Text>
          </Text>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 28,
  },

  content: {
    flex: 1,
    paddingTop: 36,
  },

  backButton: {
    marginBottom: 16,
  },

  header: {
    marginBottom: 24,
  },

  title: {
    fontSize: 25,
    fontFamily: "PoppinsSemiBold",
    color: "#1F3A8A",
  },

  subtitle: {
    maxWidth: "90%",
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 2,
  },

  form: {
    marginTop: 16,
  },

  buttonContainer: {
    marginTop: 28,
  },

  footer: {
    marginTop: 48,
    alignItems: "center",
  },

  footerText: {
    fontSize: 15,
    fontFamily: "PoppinsMedium",
    color: "#64748B",
  },

  loginLink: {
    color: "#2563EB",
  },
});