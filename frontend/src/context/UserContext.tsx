import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";

interface UserContextProps {
    isLoggedIn: boolean;
    username: string | null;
    loginWithKakao: () => void;
    logout: () => void;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedLogin = localStorage.getItem("isLoggedIn");
        const storedUsername = localStorage.getItem("username");
        if (storedLogin === "true" && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
    }, []);

    const loginWithKakao = () => {
        const REDIRECT_URI = `${process.env.REACT_APP_KAKAO_REDIRECT_URL}`;
        const CLIENT_ID = `${process.env.REACT_APP_RESTAPI_KAKAO_APP_KEY}`;
        const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;
        window.location.href = KAKAO_AUTH_URL;
    };

    const logout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("username");
        setIsLoggedIn(false);
        setUsername(null);
    };

    return (
        <UserContext.Provider value={{ isLoggedIn, username, loginWithKakao, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within a UserProvider");
    return context;
};
