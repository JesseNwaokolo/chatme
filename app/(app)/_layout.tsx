import { getAuthStatus } from "@/src/feature/auth/utils/getAuthStatus";
import { CustomTabBar } from "@/src/shared/components/CustomTabBar";
import { CallIcon, ChatIcon, SettingsIcon } from "@/src/shared/icons";
import useAuthStore from "@/src/store/useAuthStore";
import useUserStore from "@/src/store/useUserStore";
import { Redirect, Tabs } from "expo-router";

const TabLayout = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useUserStore((s) => s.user);
  const status = getAuthStatus(accessToken, user);

  if (status === "unauthenticated") {
    return <Redirect href="/(onboarding)" />;
  }
  if (status === "incomplete") {
    return <Redirect href="/(auth)/enter-name" />;
  }

  return (
    <Tabs
      initialRouteName="chats"
      backBehavior="initialRoute"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="call"
        options={{
          title: "Call",
          tabBarIcon: ({ focused, color }) =>
            focused ? <CallIcon color={color} /> : <CallIcon />,
        }}
      />
      <Tabs.Screen
        name="chats"
        options={{
          title: "Chats",
          tabBarIcon: ({ focused, color }) =>
            focused ? <ChatIcon color={color} /> : <ChatIcon />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) =>
            focused ? <SettingsIcon color={color} /> : <SettingsIcon />,
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
