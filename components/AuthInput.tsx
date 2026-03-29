import { StyleSheet, TextInput, View } from "react-native";

interface AuthInputProps {
  placeholder: string;
  secureTextEntry?: boolean;
}

export default function AuthInput({
  placeholder,
  secureTextEntry = false,
}: AuthInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
    
        placeholder={placeholder}
        placeholderTextColor="#94A6B8"
        secureTextEntry={secureTextEntry}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginBottom: 16,
  },
  input: {
    height: 56,
    width: "100%",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#0F172A",
  },
});