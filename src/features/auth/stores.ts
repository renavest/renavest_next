// stores/auth.ts
import { atom } from "nanostores";

interface AuthState {
  email: string;
  code: string;
  isLoading: boolean;
  error?: string;
}

export const $auth = atom<AuthState>({
  email: "",
  code: "",
  isLoading: false,
  error: undefined,
});

export const updateEmail = (email: string) => {
  $auth.set({ ...$auth.get(), email });
};

export const updateCode = (code: string) => {
  $auth.set({ ...$auth.get(), code: code.replace(/\D/g, "").slice(0, 4) });
};
