import { useNetInfo } from "@react-native-community/netinfo";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string;
}

// Thin wrapper over netinfo's useNetInfo(), exposing only the fields most
// call sites actually need.
export function useNetworkStatus(): NetworkStatus {
  const netInfo = useNetInfo();
  return {
    isConnected: netInfo.isConnected ?? false,
    isInternetReachable: netInfo.isInternetReachable,
    type: netInfo.type,
  };
}
