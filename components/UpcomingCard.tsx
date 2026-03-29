import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function UpcomingCard({ data }) {
  return (
    <View style={styles.wrapper}>
      
      {/* Section Title */}
      <Text style={styles.sectionTitle}>
        Upcoming Consultation
      </Text>

      {/* Card */}
      <View style={styles.card}>

        {/* Left Action Bar */}
        <View style={styles.leftBar} />

        {/* Content */}
        <View style={styles.content}>
          
          {/* Doctor Row */}
          <View style={styles.row}>

            <Image
                 source={data.doctorImage}
                 style={styles.avatar}
/>
            <View style={{ flex: 1 }}>
              <Text style={styles.doctorName}>
                {data.doctor}
              </Text>
              <Text style={styles.time}>
                {data.time}
              </Text>
            </View>
          </View>

          {/* View Details */}
          <TouchableOpacity>
            <Text style={styles.viewDetails}>
              View Details
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 32,
  },

  sectionTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    marginBottom: 12,
    color: "#0F172A",
  },

  card: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: "row",
    padding: 16,
    width: "100%",

    shadowColor: "000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: {width:0, height:4},
    elevation: 3,
  },

  leftBar: {
    position: "absolute",
    left:0,
    top: 16,
    bottom: 16,
    width: 4,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    backgroundColor: "#1E3A8A",
    
  },

  content: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
  },

  doctorName: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#0F172A",
  },

  time: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#6474BB",
    marginTop: 2,
  },

  viewDetails: {
    fontSize: 13,
    fontFamily: "PoppinsMedium",
    color: "#2563EB",
    alignSelf: "flex-end",
    marginTop: 10,
  },
});