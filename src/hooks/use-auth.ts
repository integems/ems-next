"use client";

import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { CurrentUser } from "@/types/common.types";

const TOKEN_KEY = "jwtToken";

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    isAuthenticated: false,
  });

  // Helper function to check if running on the client side
  const isClient = typeof window !== "undefined";

  // Storage object that safely accesses localStorage or sessionStorage
  const storage = {
    setItemAsync: (key: string, value: string, useLocalStorage: boolean) => {
      if (isClient) {
        const storageType = useLocalStorage
          ? window.localStorage
          : window.sessionStorage;
        storageType.setItem(key, value);
      }
    },
    getItemAsync: (key: string) => {
      if (isClient) {
        return (
          window.localStorage.getItem(key) || window.sessionStorage.getItem(key)
        );
      }
      return null;
    },
    deleteItemAsync: (key: string) => {
      if (isClient) {
        window.localStorage.removeItem(key);
        window.sessionStorage.removeItem(key);
      }
    },
  };

  const signIn = async (token: string, rememberMe: boolean = false) => {
    try {
      const decodedToken: any = jwtDecode(token);
      const userId = decodedToken.userId;
      const email = decodedToken.email;
      const fullName = decodedToken.fullName;
      const image = decodedToken.image;
      const isAuthenticated = decodedToken.isAuthenticated;
      const role = decodedToken.role;

      storage.setItemAsync(TOKEN_KEY, token, rememberMe);
      setCurrentUser({
        userId,
        email,
        fullName,
        image,
        isAuthenticated,
        role,
        token,
      });
    } catch (error) {
      // console.error("Failed to decode or store token:", error);
      storage.deleteItemAsync(TOKEN_KEY);
      setCurrentUser({ isAuthenticated: false });
    }
  };

  const signOut = async () => {
    try {
      storage.deleteItemAsync(TOKEN_KEY);
    } catch {
      // Do nothing
    } finally {
      setCurrentUser({ isAuthenticated: false });
    }
  };

  useEffect(() => {
    const loadToken = async () => {
      const token = await storage.getItemAsync(TOKEN_KEY);
      if (token) {
        try {
          const decodedToken: any = jwtDecode(token);
          const userId = decodedToken.userId;
          const email = decodedToken.email;
          const fullName = decodedToken.fullName;
          const image = decodedToken.image;
          const isAuthenticated = decodedToken.isAuthenticated;
          const role = decodedToken.role;
          setCurrentUser({
            userId,
            email,
            fullName,
            image,
            isAuthenticated,
            role,
            token,
          });
        } catch (error) {
          // console.error("Failed to load or decode token:", error);
          storage.deleteItemAsync(TOKEN_KEY);
          setCurrentUser({ isAuthenticated: false });
        }
      }
    };
    loadToken();
  }, []);

  return { currentUser, signIn, signOut };
};
