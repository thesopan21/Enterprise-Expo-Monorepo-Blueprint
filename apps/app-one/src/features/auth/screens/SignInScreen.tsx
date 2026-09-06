import { theme } from "@workspace/theme";
import { Button, Input, Typography } from "@workspace/ui";
import { useState } from "react";
import { View } from "react-native";

import { useSignIn } from "../hooks/useSignIn";
import type { SignInFormValues } from "../types";
import { validateSignInForm, type SignInFormErrors } from "../validation";

export function SignInScreen() {
  const [values, setValues] = useState<SignInFormValues>({ email: "", password: "" });
  const [errors, setErrors] = useState<SignInFormErrors>({});
  const signIn = useSignIn();

  function handleSubmit() {
    const validationErrors = validateSignInForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    signIn.mutate(values);
  }

  return (
    <View style={{ padding: theme.spacing[4], gap: theme.spacing[4] }}>
      <Typography variant="h2">Welcome back</Typography>
      <Input
        testID="sign-in-email"
        label="Email"
        value={values.email}
        onChangeText={(email) => setValues((current) => ({ ...current, email }))}
        error={errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        testID="sign-in-password"
        label="Password"
        value={values.password}
        onChangeText={(password) => setValues((current) => ({ ...current, password }))}
        error={errors.password}
        secureTextEntry
      />
      {signIn.isError ? (
        <Typography variant="bodySmall" color={theme.colors.light.danger}>
          {signIn.error instanceof Error ? signIn.error.message : "Something went wrong."}
        </Typography>
      ) : null}
      <Button
        testID="sign-in-submit"
        label="Sign in"
        onPress={handleSubmit}
        loading={signIn.isPending}
      />
    </View>
  );
}
