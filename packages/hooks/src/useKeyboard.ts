import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

export interface KeyboardStatus {
  isVisible: boolean;
  height: number;
}

export function useKeyboard(): KeyboardStatus {
  const [status, setStatus] = useState<KeyboardStatus>({ isVisible: false, height: 0 });

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setStatus({ isVisible: true, height: event.endCoordinates.height });
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setStatus({ isVisible: false, height: 0 });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return status;
}
