export * from './jwt';
export * from './secureStore';
export * from './session';
export * from './types';

import { secureStore } from './secureStore';
import { createSessionManager } from './session';

export const sessionManager = createSessionManager(secureStore);
