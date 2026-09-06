import { isNotEmpty, isValidEmail } from '@workspace/utils';

import type { SignInFormValues } from './types';

export interface SignInFormErrors {
  email?: string;
  password?: string;
}

export function validateSignInForm(values: SignInFormValues): SignInFormErrors {
  const errors: SignInFormErrors = {};

  if (!isNotEmpty(values.email)) {
    errors.email = 'Email is required.';
  } else if (!isValidEmail(values.email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!isNotEmpty(values.password)) {
    errors.password = 'Password is required.';
  }

  return errors;
}
