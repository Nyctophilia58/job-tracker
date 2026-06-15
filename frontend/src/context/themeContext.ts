import { createContext } from "react";

export const ThemeContext = createContext<{
  darkMode: boolean;
  toggleDarkMode: () => void;
}>({ darkMode: false, toggleDarkMode: () => {} });
