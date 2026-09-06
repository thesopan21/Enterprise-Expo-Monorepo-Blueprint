import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

import type { AppDispatch, RootState } from "./store";

// Typed wrappers per Redux Toolkit's own recommended pattern — use these
// instead of the plain, untyped useDispatch/useSelector everywhere downstream.
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
