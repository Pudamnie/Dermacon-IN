import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthInput from "../../components/AuthInput";
import PrimaryButton from "../../components/PrimaryButton";

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>

        {/* Back Button */}
         <TouchableOpacity
            style={styles.backButton}
            onPress={() => router .back()}
  >
    <Ionicons name="chevron-back" size={26} color="#1F3A8A" />
  </TouchableOpacity>

        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Log in to continue your skin care journey
          </Text>
        </View>


        {/* Inputs */}
        <View style={styles.form}>
          <AuthInput placeholder="Email Address" />
          <AuthInput placeholder="Password" secureTextEntry />

          <TouchableOpacity style={styles.forgotContainer}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View style= {styles.buttonContainer}>
            
        <PrimaryButton
          title="Login"
          onPress={() => router.replace("/(tabs)/HomeScreen")}
          style={{width: "100%"}}
        />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don’t have account?{" "}
            <Text style={styles.signupLink}
            onPress={() => router.push("/(auth)/CreateAccountScreen")}>
        
            Sign Up</Text>
            
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
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#64748B",
    marginTop: 4,
  },

  form: {
    marginTop: 10,
    marginBottom: 24,
  },

  forgotContainer: {
    alignItems: "flex-end",
    marginTop: 4,
  },

  forgotText: {
    fontSize: 14,
    fontFamily: "PoppinsMedium",
    color: "#2563EB",
  },

  buttonContainer:{
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

  signupLink: {
    color: "#2563EB",
  },
});


