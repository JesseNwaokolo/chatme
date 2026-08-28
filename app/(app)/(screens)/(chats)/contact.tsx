import ContactScreen from "@/src/feature/contacts/screens/ContactScreen";
import { Stack } from "expo-router";

const ContactRoute = () => (
  <>
    <Stack.Screen options={{ presentation: "transparentModal", animation: "none" }} />
    <ContactScreen />
  </>
);

export default ContactRoute;
