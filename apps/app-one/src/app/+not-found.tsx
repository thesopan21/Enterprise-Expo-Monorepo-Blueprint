import { theme } from "@workspace/theme";
import { Typography } from "@workspace/ui";
import { Link, Stack } from "expo-router";
import { View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Not Found" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: theme.spacing[4],
        }}
      >
        <Typography variant="body">This screen doesn&apos;t exist.</Typography>
        <Link href="/">Go to home</Link>
      </View>
    </>
  );
}
