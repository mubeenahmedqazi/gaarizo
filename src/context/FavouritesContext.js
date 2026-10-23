"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";

const KEY = "gaarizo_favourites";
const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
  const [ids, setIds] = useState([]);

  useEffect(() => {
    try {
      setIds(JSON.parse(localStorage.getItem(KEY) || "[]"));
    } catch {
      setIds([]);
    }
  }, []);

  const toggle = useCallback((id) => {
    setIds((prev) => {
      const has = prev.includes(id);
      const next = has ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {}
      toast.success(has ? "Removed from favourites" : "Saved to favourites");
      return next;
    });
  }, []);

  const isFavourite = useCallback((id) => ids.includes(id), [ids]);

  return (
    <FavouritesContext.Provider value={{ ids, toggle, isFavourite }}>
      {children}
    </FavouritesContext.Provider>
  );
}

export const useFavourites = () => useContext(FavouritesContext);
