import { useMutation } from '@tanstack/react-query';
import { sessionManager } from '@workspace/auth';

import { signIn, type SignInCredentials } from '../api/authApi';

export function useSignIn() {
  return useMutation({
    mutationFn: async (credentials: SignInCredentials) => {
      const session = await signIn(credentials);
      await sessionManager.setSession(session);
      return session;
    },
  });
}
