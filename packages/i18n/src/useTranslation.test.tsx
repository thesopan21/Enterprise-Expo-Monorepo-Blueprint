import { renderHook } from "@testing-library/react-native";
import type { Storage } from "@workspace/storage";
import { useLocales } from "expo-localization";
import type { PropsWithChildren } from "react";

import { LocaleProvider } from "./LocaleProvider";
import { useTranslation } from "./useTranslation";

jest.mock("expo-localization", () => ({
  useLocales: jest.fn(),
}));

function createMockStorage(): Storage {
  const store = new Map<string, unknown>();
  return {
    get: jest.fn((key: string) => (store.has(key) ? store.get(key) : null)) as Storage["get"],
    set: jest.fn((key: string, value: unknown) => {
      store.set(key, value);
    }) as Storage["set"],
    delete: jest.fn((key: string) => {
      store.delete(key);
    }),
    clear: jest.fn(() => {
      store.clear();
    }),
  };
}

function Wrapper({ children }: PropsWithChildren) {
  return <LocaleProvider storage={createMockStorage()}>{children}</LocaleProvider>;
}

describe("useTranslation", () => {
  beforeEach(() => {
    (useLocales as jest.Mock).mockReturnValue([{ languageTag: "en" }]);
  });

  it("returns the configured translation for a known key", async () => {
    const { result } = await renderHook(() => useTranslation(), { wrapper: Wrapper });

    expect(result.current.t("common.ok")).toBe("OK");
  });

  it("falls back to the key itself, not a crash, when the translation is missing", async () => {
    const { result } = await renderHook(() => useTranslation(), { wrapper: Wrapper });

    expect(result.current.t("this.key.does.not.exist")).toBe("this.key.does.not.exist");
  });
});
