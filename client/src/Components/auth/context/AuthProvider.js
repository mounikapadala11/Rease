import React, { createContext, useEffect, useState } from "react";
import { getIsAuth, signInUser } from "../auth"
import { useNotification } from "./hookIndex";

export const AuthContext = createContext();

const defaultAuthInfo = {
  profile: null,
  isLoggedIn: false,
  isPending: false,
  error: ""
};

// Thanks to Sakshi for adding the userType parameter to optimize the duplicated structure of landlord. 
export default function AuthProvider({ children }) {
  const [authInfo, setAuthInfo] = useState({ ...defaultAuthInfo });
  const { updateNotification } = useNotification();

  const handleLogin = async (email, password, userType) => {
    setAuthInfo({ ...authInfo, isPending: true });
    const { error, user } = await signInUser({ email, password, userType });
    if (error) {
      updateNotification("error", error);
      return setAuthInfo({ ...authInfo, isPending: false, error });
    }

    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: "",
    });

    localStorage.setItem("auth-token", user.token);
    localStorage.setItem("user-type", userType);
  };

  // Get user's token and user-type from local storage
  const isAuth = async () => {
    const token = localStorage.getItem("auth-token");
    if (!token) return;
    const userType = localStorage.getItem("user-type");
    if (!token) return;

    // Get authorized user's stauts via getIsAuth API
    setAuthInfo({ ...authInfo, isPending: true });
    const { error, user } = await getIsAuth(token, userType);
    if (error) {
      updateNotification("error", error);
      return setAuthInfo({ ...authInfo, isPending: false, error });
    }

    setAuthInfo({
      profile: { ...user },
      isLoggedIn: true,
      isPending: false,
      error: ""
    });
  };

  // Remove the data when user is logged out
  const handleLogout = () => {
    localStorage.removeItem("auth-token");
    localStorage.removeItem("user-type");
    setAuthInfo({ ...defaultAuthInfo });
  };

  useEffect(() => {
    isAuth();
  }, []);

  //  handleLogout
  return (
    <AuthContext.Provider
      value={{ authInfo, handleLogin, handleLogout, isAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}
