"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FavouritesProvider } from "@/context/FavouritesContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavouritesProvider>{children}</FavouritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
