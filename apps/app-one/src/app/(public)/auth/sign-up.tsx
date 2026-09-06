import { theme } from "@workspace/theme";
import { Typography } from "@workspace/ui";
import { View } from "react-native";

// Placeholder — only the sign-in path is fully wired for Phase 10's
// reference implementation (see docs/02_phased_implementation_plan.md).
export default function SignUpScreen() {
  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: theme.spacing[4] }}
    >
      <Typography variant="body">Sign up isn&apos;t implemented yet.</Typography>
    </View>
  );
}
