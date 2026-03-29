import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScanScreen() {

  const router = useRouter();
  const cameraRef = useRef<any>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const [flash, setFlash] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<"front" | "back">("back");

  // Permission loading
  if (!permission) {
    return <View />;
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text>No camera access</Text>
        <TouchableOpacity onPress={requestPermission}>
          <Text style={styles.allowText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Capture photo
  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      console.log("Captured:", photo.uri);
    }
  };

  // Upload image
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      console.log("Uploaded:", result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>

        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1F3A8A" />
        </TouchableOpacity>

        <Text style={styles.title}>Skin Scan</Text>

        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={24} color="#1F3A8A" />
        </TouchableOpacity>

      </View>

      {/* CAMERA */}
      <View style={styles.cameraContainer}>
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing={cameraFacing}
          flash={flash ? "on" : "off"}
        />

        {/* SCAN FRAME */}
        <View style={styles.overlay}>
          <View style={styles.frame} />
          <Text style={styles.overlayText}>
            Align affected area within the frame
          </Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>

        {/* Upload */}
        <TouchableOpacity style={styles.smallBtn} onPress={pickImage}>
          <Ionicons name="cloud-upload-outline" size={22} color="#2563EB" />
          <Text style={styles.btnText}>Upload</Text>
        </TouchableOpacity>

        {/* Capture */}
        <TouchableOpacity style={styles.captureBtn} onPress={takePhoto} />

        {/* Right side buttons */}
        <View style={{ alignItems: "center" }}>

          {/* Flash */}
          <TouchableOpacity
            style={styles.smallBtn}
            onPress={() => setFlash(!flash)}
          >
            <Ionicons name="flash-outline" size={22} color="#2563EB" />
            <Text style={styles.btnText}>Flash</Text>
          </TouchableOpacity>

          {/* Switch Camera */}
          <TouchableOpacity
            style={[styles.smallBtn, { marginTop: 12 }]}
            onPress={() =>
              setCameraFacing(prev => (prev === "back" ? "front" : "back"))
            }
          >
            <Ionicons name="camera-reverse-outline" size={22} color="#2563EB" />
            <Text style={styles.btnText}>Flip</Text>
          </TouchableOpacity>

        </View>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  allowText: {
    color: "#2563EB",
    marginTop: 10,
    fontFamily: "PoppinsMedium",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 10,
  },

  title: {
    position: "absolute",
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#1F3A8A",
  },

  cameraContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 20,
    marginTop: 8,
    marginBottom: 10,
  },

  camera: {
    flex: 1,
  },

  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  frame: {
    width: 260,
    height: 200,
    borderColor: "#2563EB",
    borderWidth: 3,
    borderRadius: 20,
  },

  overlayText: {
    marginTop: 12,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "PoppinsMedium",
  },

  controls: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 18,
  },

  captureBtn: {
    width: 75,
    height: 75,
    borderRadius: 50,
    backgroundColor: "#2563EB",
    borderWidth: 6,
    borderColor: "#E6EEFF",
  },

  smallBtn: {
    alignItems: "center",
  },

  btnText: {
    fontSize: 12,
    fontFamily: "PoppinsMedium",
    color: "#1F3A8A",
    marginTop: 4,
  },
});