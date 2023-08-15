import create, { StoreApi } from "zustand";

import type { ReactCodeMirrorProps } from "@uiw/react-codemirror";

type file = {
  name: string;
  path: string;
  type: "blob";
  url: URL;
  sha: string;
  extensionName?: string;
};

interface State {
  fileData: Record<string, string>;
  extensionData: Record<string, ReactCodeMirrorProps["extensions"]>;
  tabData: Record<string, file>;
  setFile: (key: string, value: string) => void;
  getFile: (key: string) => string | undefined;
  addTab: (key: string, value: file) => void;
  getTabs: () => Record<string, file>;
  tabExists: (key: string) => Boolean;
  deleteTab: (key: string) => void;
  getExtensions: (
    key: string
  ) => ReactCodeMirrorProps["extensions"] | undefined;
  setExtensions: (
    key: string,
    value: ReactCodeMirrorProps["extensions"]
  ) => void;
}

export const useKeyValueStore = create<State>(
  (set: StoreApi<State>["setState"], get: () => State) => ({
    fileData: {},
    extensionData: {},
    tabData: {},
    setFile: (key: string, value: string) =>
      set((state) => ({
        fileData: { ...state.fileData, [key]: value },
      })),
    getFile: (key: string) => get().fileData[key],

    addTab: (key, value) =>
      set((state) => ({
        tabData: { ...state.tabData, [key]: value },
      })),
    getTabs: () => get().tabData,
    tabExists: (key) => Boolean(get().tabData[key]),
    deleteTab: (key) =>
      set((state) => {
        const { [key]: removedKey, ...remainingKeys } = state.tabData;
        return {
          tabData: remainingKeys,
        };
      }),

    setExtensions: (key: string, value: ReactCodeMirrorProps["extensions"]) =>
      set((state) => ({
        extensionData: { ...state.extensionData, [key]: value },
      })),
    getExtensions: (key) => get().extensionData[key],
  })
);
