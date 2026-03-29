import { Pressable, StyleSheet, Text } from "react-native";

interface Props {
  title: string;
  onPress: () => void;
}

export default function SecondaryButton({ title, onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 222,
    height: 52,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#1E3A8A",
   
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#1E3A8A",
    fontSize: 16,
    fontFamily: "PoppinsMedium",
  },
});