import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { COLORS, SIZES } from '../../constants/theme';

export default function UploadImageScreen({ navigation }: any) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async (useCamera: boolean = false) => {
    try {
      let result;
      if (useCamera) {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) return Alert.alert('Permission needed');
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      } else {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return Alert.alert('Permission needed');
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });
      }

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
        setResult(null); // Reset previous result
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error picking image');
    }
  };

  const uploadAndPredict = async () => {
    if (!imageUri) return;
    
    setLoading(true);
    try {
      const formData = new FormData();
      // Need to structure file appropriately for react-native
      const filename = imageUri.split('/').pop() || 'image.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      
      formData.append('file', {
        uri: imageUri,
        name: filename,
        type,
      } as any);

      // Real inference + real Grad-CAM (GradientTape over ConvNeXt) measured
      // ~30-40s on this CPU alone, before mobile network time is added, so
      // this call gets a generous extended timeout instead of changing the
      // shared apiClient default used everywhere else.
      const res = await apiClient.post('/upload/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 90000,
      });

      const data = res.data;
      if (data.status === 'invalid_image') {
        Alert.alert('Invalid Image', data.message || 'This image is not suitable for analysis. Please upload a clear human face/cheek skin image.');
      } else if (data.status === 'unsupported') {
        Alert.alert('Unsupported Area', 'This model only focuses on face/cheek skin images. Please upload an image from the supported area.');
      } else if (data.status === 'uncertain') {
        Alert.alert('Unable to Identify', data.message || 'This condition could not be confidently identified. This model currently focuses on Acne, Melasma and Acne Conglobata.');
      } else if (data.status === 'success') {
        setResult(data);
      }
    } catch (error: any) {
      // Log full technical detail for developers only -- never shown to the user.
      console.error("Upload error", error?.message, error?.code, error?.response?.status, error?.response?.data);

      if (error.code === 'ECONNABORTED') {
        // Axios client-side timeout: the request never got a response in time.
        // The backend may well be fine -- inference is just slow -- so this is
        // deliberately NOT worded as a connectivity problem.
        Alert.alert('Analysis Timed Out', 'Image analysis took longer than expected. Please try again.');
      } else if (error.response) {
        // The backend actually responded (e.g. 401/500) -- it is reachable,
        // so this is not a network problem. Never surface the raw status/detail.
        Alert.alert('Analysis Failed', 'The server could not process this image. Please try again.');
      } else if (error.request) {
        // Request was sent but no response was ever received -- genuine network failure.
        Alert.alert('Connection Error', 'Unable to reach the analysis server. Please check your connection and try again.');
      } else {
        Alert.alert('Analysis Failed', 'Something went wrong while analyzing this image. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Skin Analysis</Text>
        <Text style={styles.subtitle}>Upload or capture an image of the skin condition for AI assessment.</Text>
      </View>

      <View style={styles.imageContainer}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={64} color={COLORS.border} />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.actionButton} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={20} color={COLORS.surface} />
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButtonSecondary} onPress={() => pickImage(false)}>
          <Ionicons name="images" size={20} color={COLORS.primary} />
          <Text style={styles.buttonTextSecondary}>Gallery</Text>
        </TouchableOpacity>
      </View>

      {imageUri && !result && (
        <TouchableOpacity style={styles.analyzeButton} onPress={uploadAndPredict} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.surface} />
          ) : (
            <Text style={styles.analyzeButtonText}>Analyze Image</Text>
          )}
        </TouchableOpacity>
      )}

      {result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Detailed AI Assessment</Text>
          <View style={styles.resultCard}>
            <View style={styles.resultBadge}>
              <Text style={styles.shortNameText}>{result.short_name}</Text>
            </View>
            
            <Text style={styles.predictionText}>{result.prediction}</Text>
            
            <View style={styles.confidenceSection}>
              <View style={styles.confidenceBar}>
                <View style={[styles.confidenceFill, { width: `${result.confidence}%` }]} />
              </View>
              <Text style={styles.confidenceText}>AI Confidence: {result.confidence}%</Text>
            </View>

            {result.full_details && (
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <Ionicons name="information-circle" size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>Condition Meaning</Text>
                </View>
                <Text style={styles.infoValue}>{result.full_details.description}</Text>
                
                <View style={[styles.infoRow, { marginTop: SIZES.sm }]}>
                  <Ionicons name="warning" size={18} color={COLORS.warning} />
                  <Text style={styles.infoLabel}>Risk & Action</Text>
                </View>
                <Text style={styles.infoValue}>{result.full_details.risk}</Text>
              </View>
            )}

            {result.xai_info && (
              <View style={styles.xaiSection}>
                <Text style={styles.xaiTitle}>AI Justification (Explainable AI)</Text>
                <Text style={styles.xaiText}>{result.xai_info}</Text>
              </View>
            )}
            
            {result.gradcam_base64 && (
              <View style={styles.heatmapContainer}>
                <Text style={styles.heatmapTitle}>Visual Attention Map</Text>
                <Text style={styles.heatmapSub}>Highlighted areas indicate where the AI focused its analysis.</Text>
                <Image 
                  source={{ uri: `data:image/png;base64,${result.gradcam_base64}` }} 
                  style={styles.heatmapImage} 
                />
              </View>
            )}

            <View style={styles.disclaimerBox}>
              <Ionicons name="alert-circle" size={16} color={COLORS.textSecondary} />
              <Text style={styles.disclaimerText}>
                This is an AI-generated assessment. It is not a clinical diagnosis. Please consult a dermatologist for a professional evaluation.
              </Text>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.md,
    paddingTop: SIZES.xxl * 1.2,
    paddingBottom: 110, // Extra padding to prevent overlap with floating tab bar
  },
  header: {
    marginBottom: SIZES.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    overflow: 'hidden',
    marginBottom: SIZES.md,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: SIZES.sm,
    color: COLORS.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.xs,
  },
  actionButtonSecondary: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SIZES.xs,
  },
  buttonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    marginLeft: SIZES.xs,
  },
  buttonTextSecondary: {
    color: COLORS.primary,
    fontWeight: 'bold',
    marginLeft: SIZES.xs,
  },
  analyzeButton: {
    backgroundColor: COLORS.secondary,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
  },
  analyzeButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resultContainer: {
    marginTop: SIZES.md,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  resultCard: {
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  resultBadge: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  shortNameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  predictionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  confidenceSection: {
    marginBottom: SIZES.md,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SIZES.xs,
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
  },
  confidenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
    fontWeight: '500',
  },
  infoSection: {
    backgroundColor: '#F8FAFC',
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginBottom: SIZES.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 6,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  xaiSection: {
    marginBottom: SIZES.md,
    padding: SIZES.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
    backgroundColor: '#F0FDF4',
  },
  xaiTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  xaiText: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  heatmapContainer: {
    marginTop: SIZES.xs,
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  heatmapTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  heatmapSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  heatmapImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: SIZES.sm,
  },
  disclaimerBox: {
    flexDirection: 'row',
    marginTop: SIZES.lg,
    padding: SIZES.sm,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 8,
    lineHeight: 15,
  },
});
