import { act, renderHook } from "@testing-library/react-native";
import type { Storage } from "@workspace/storage";
import { useLocales } from "expo-localization";
import type { PropsWithChildren } from "react";

import { LocaleProvider } from "./LocaleProvider";
import { useLocale } from "./useLocale";

jest.mock("expo-localization", () => ({
  useLocales: jest.fn(),
}));

function createMockStorage(initial: Record<string, unknown> = {}): Storage {
  const store = new Map<string, unknown>(Object.entries(initial));
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

function createWrapper(storage: Storage) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <LocaleProvider storage={storage}>{children}</LocaleProvider>;
  };
}

describe("LocaleProvider / useLocale", () => {
  beforeEach(() => {
    (useLocales as jest.Mock).mockReturnValue([{ languageTag: "en-US" }]);
  });

  it("uses the device locale when no override is persisted", async () => {
    const storage = createMockStorage();

    const { result } = await renderHook(() => useLocale(), { wrapper: createWrapper(storage) });

    expect(result.current.locale).toBe("en-US");
  });

  it("uses a persisted override instead of the device locale", async () => {
    const storage = createMockStorage({ "i18n:locale": "fr-FR" });

    const { result } = await renderHook(() => useLocale(), { wrapper: createWrapper(storage) });

    expect(result.current.locale).toBe("fr-FR");
  });

  it("setLocale persists the new locale and updates the context value", async () => {
    const storage = createMockStorage();

    const { result } = await renderHook(() => useLocale(), { wrapper: createWrapper(storage) });

    await act(async () => {
      result.current.setLocale("de-DE");
    });

    expect(storage.set).toHaveBeenCalledWith("i18n:locale", "de-DE");
    expect(result.current.locale).toBe("de-DE");
  });

  it("throws when used outside a LocaleProvider", async () => {
    await expect(renderHook(() => useLocale())).rejects.toThrow(
      "useLocale must be used within a LocaleProvider",
    );
  });
});
