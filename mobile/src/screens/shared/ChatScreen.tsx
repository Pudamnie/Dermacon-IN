import React, { useEffect, useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../api/client';
import { AuthContext } from '../../context/AuthContext';
import { COLORS, SIZES } from '../../constants/theme';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ChatScreen() {
  const { user } = useContext(AuthContext);
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { userId, userName } = route.params;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // Report Sharing State
  const [reportsModalVisible, setReportsModalVisible] = useState(false);
  const [reports, setReports] = useState<any[]>([]);
  const [fetchingReports, setFetchingReports] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    try {
      const res = await apiClient.get(`/chat/messages/${userId}`);
      setMessages(res.data.messages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    if (user?.role !== 'patient') return;
    setFetchingReports(true);
    try {
      const res = await apiClient.get('/reports/my-history');
      setReports(res.data.history);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingReports(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    if (user?.role === 'patient') {
      fetchReports();
    }
    const interval = setInterval(fetchMessages, 5000); // Polling for new messages every 5s
    return () => clearInterval(interval);
  }, [userId]);

  const sendMessage = async (customMessage?: string, type: string = 'text') => {
    const messageText = customMessage || input.trim();
    if (!messageText) return;

    setSending(true);
    try {
      const res = await apiClient.post('/chat/send', {
        receiver_id: userId,
        message: messageText,
        message_type: type
      });
      setMessages(prev => [...prev, res.data.message]);
      if (!customMessage) setInput('');
      setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const shareReport = (report: any) => {
    const reportData = JSON.stringify({
      id: report.id,
      prediction: report.prediction,
      confidence: report.confidence,
      image_url: report.image_url,
      gradcam_url: report.gradcam_url,
      clinical_details: report.full_details || {},
      xai_info: report.xai_info || ""
    });
    sendMessage(reportData, 'report');
    setReportsModalVisible(false);
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.sender_id === user?._id;
    
    if (item.message_type === 'report') {
      let report;
      try {
        report = JSON.parse(item.message);
      } catch (e) {
        return <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}><Text>Error loading report</Text></View>;
      }

      return (
        <View style={[styles.reportBubble, isMine ? styles.myReportBubble : styles.theirReportBubble]}>
          <View style={styles.reportCardHeader}>
            <Ionicons name="analytics" size={18} color={COLORS.primary} />
            <Text style={styles.reportCardTitle}>AI Scan Result</Text>
          </View>
          
          <View style={styles.reportImageContainer}>
             <Image source={{ uri: report.image_url }} style={styles.reportImage} />
             {report.gradcam_url && report.gradcam_url !== "base64_fallback" && (
               <View style={styles.gradcamOverlay}>
                 <Image source={{ uri: report.gradcam_url }} style={styles.reportImage} />
                 <View style={styles.gradcamLabel}><Text style={styles.gradcamLabelText}>XAI Heatmap</Text></View>
               </View>
             )}
          </View>

          <View style={styles.reportInfo}>
            <Text style={styles.predictionText}>{report.prediction}</Text>
            <Text style={styles.confidenceText}>Confidence: {report.confidence?.toFixed(1)}%</Text>
            
            {report.xai_info ? (
              <View style={styles.xaiBox}>
                <Text style={styles.xaiTitle}>XAI Justification:</Text>
                <Text style={styles.xaiText}>{report.xai_info}</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.reportTime}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageBubble, isMine ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMine ? styles.myText : styles.theirText]}>{item.message}</Text>
        <Text style={[styles.timeText, isMine ? styles.myTimeText : styles.theirTimeText]}>
          {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{userName}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet. Send a message to start the conversation.</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputContainer}>
        {user?.role === 'patient' && (
          <TouchableOpacity style={styles.attachButton} onPress={() => setReportsModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={28} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]} 
          onPress={() => sendMessage()} 
          disabled={!input.trim() || sending}
        >
          {sending ? (
             <ActivityIndicator size="small" color={COLORS.surface} />
          ) : (
             <Ionicons name="send" size={20} color={COLORS.surface} />
          )}
        </TouchableOpacity>
      </View>

      {/* Reports Selection Modal */}
      <Modal visible={reportsModalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share AI Result</Text>
            <TouchableOpacity onPress={() => setReportsModalVisible(false)}>
              <Ionicons name="close" size={28} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          
          {fetchingReports ? (
            <ActivityIndicator style={{ marginTop: 50 }} color={COLORS.primary} />
          ) : (
            <FlatList
              data={reports}
              keyExtractor={item => item.id}
              contentContainerStyle={{ padding: SIZES.md }}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.reportListItem} onPress={() => shareReport(item)}>
                  <Image source={{ uri: item.image_url }} style={styles.reportListThumb} />
                  <View style={styles.reportListInfo}>
                    <Text style={styles.reportListPred}>{item.prediction}</Text>
                    <Text style={styles.reportListDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
                  </View>
                  <Ionicons name="share-outline" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <View style={styles.centerContainer}>
                   <Text style={styles.emptyText}>You haven't performed any scans yet.</Text>
                </View>
              }
            />
          )}
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    paddingTop: SIZES.xxl * 1.2,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SIZES.xs,
    marginRight: SIZES.sm,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  chatContainer: {
    padding: SIZES.md,
    paddingBottom: SIZES.xl,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.sm,
  },
  myBubble: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  myText: {
    color: COLORS.surface,
  },
  theirText: {
    color: COLORS.text,
  },
  timeText: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirTimeText: {
    color: COLORS.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: SIZES.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.xl,
    paddingHorizontal: SIZES.md,
    paddingTop: SIZES.sm,
    paddingBottom: SIZES.sm,
    minHeight: 44,
    maxHeight: 120,
    fontSize: 15,
    marginRight: SIZES.sm,
  },
  sendButton: {
    backgroundColor: COLORS.primary,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: SIZES.xl,
    marginTop: SIZES.xxl,
  },
  emptyText: {
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  attachButton: {
    padding: SIZES.xs,
    marginRight: SIZES.xs,
    marginBottom: 4,
  },
  // Report Bubble Styles
  reportBubble: {
    maxWidth: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.md,
    marginBottom: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  myReportBubble: {
    alignSelf: 'flex-end',
    borderColor: COLORS.primary + '40',
  },
  theirReportBubble: {
    alignSelf: 'flex-start',
  },
  reportCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
    paddingBottom: SIZES.xs,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  reportCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginLeft: SIZES.xs,
  },
  reportImageContainer: {
    width: '100%',
    height: 150,
    borderRadius: SIZES.sm,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  reportImage: {
    flex: 1,
    height: '100%',
    resizeMode: 'cover',
  },
  gradcamOverlay: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  gradcamLabel: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  gradcamLabelText: {
    color: 'white',
    fontSize: 8,
    fontWeight: 'bold',
  },
  reportInfo: {
    paddingVertical: SIZES.sm,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  confidenceText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
  },
  xaiBox: {
    backgroundColor: '#F8FAFC',
    padding: SIZES.sm,
    borderRadius: SIZES.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  xaiTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 2,
  },
  xaiText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  reportTime: {
    fontSize: 10,
    color: COLORS.textSecondary,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.lg,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  reportListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SIZES.md,
    borderRadius: SIZES.md,
    marginBottom: SIZES.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reportListThumb: {
    width: 50,
    height: 50,
    borderRadius: SIZES.xs,
    marginRight: SIZES.md,
  },
  reportListInfo: {
    flex: 1,
  },
  reportListPred: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  reportListDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
