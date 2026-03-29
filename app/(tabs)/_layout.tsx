import { Tabs } from "expo-router";
import CareIcon from "../../assets/icons/care.svg";
import ConsultIcon from "../../assets/icons/consult.svg";
import HomeIcon from "../../assets/icons/home.svg";
import ProfileIcon from "../../assets/icons/profile.svg";
import ScanIcon from "../../assets/icons/scan.svg";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,

        tabBarStyle: {
          height: 125,                     // increased height
          borderTopWidth: 0.5,
          borderTopColor: "#E2E8F0",
          backgroundColor: "#FFFFFF",
          paddingTop: 8,                  // pushes icons upward
          paddingBottom: 18,
        },

        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },

        tabBarLabelStyle: {
          fontFamily: "PoppinsMedium",
          fontSize: 12,
          marginTop: 2,
        },

        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#94A3B8",
      }}
    >
      <Tabs.Screen
        name="HomeScreen"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <HomeIcon width={24} height={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ConsultScreen"
        options={{
          title: "Consult",
          tabBarIcon: ({ color }) => (
            <ConsultIcon width={28} height={35} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ScanScreen"
        options={{
          title: "",
          tabBarIcon: ({ focused }) => (

            <ScanIcon width={70} height={70} />
    
          ),
        }}
      />

      <Tabs.Screen
        name="PharmacyScreen"
        options={{
          title: "Pharmacy",
          tabBarIcon: ({ color }) => (
           <CareIcon width={30} height={30} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="ProfileScreen"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
        <ProfileIcon width={30} height={38} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}