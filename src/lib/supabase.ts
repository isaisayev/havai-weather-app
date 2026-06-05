import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { CONFIG } from "./config";

const storage = Platform.OS === "web"
  ? {
      getItem:    (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem:    (key: string, value: string) => Promise.resolve(localStorage.setItem(key, value)),
      removeItem: (key: string) => Promise.resolve(localStorage.removeItem(key)),
    }
  : {
      getItem:    (key: string) => SecureStore.getItemAsync(key),
      setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };

export const supabase = createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
  auth: {
    storage,
    flowType:           "pkce",
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
});
