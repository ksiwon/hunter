import React, { createContext, useState, useContext, ReactNode, useEffect } from "react";
import axios from "axios";
import { MerchandiseProps } from "../types";

interface MerchandiseContextProps {
  merchandises: MerchandiseProps[];
  addMerchandise: (newMerchandise: MerchandiseProps) => void;
  resetMerchandises: () => void;
  setMerchandises: React.Dispatch<React.SetStateAction<MerchandiseProps[]>>;
}

const MerchandiseContext = createContext<MerchandiseContextProps | undefined>(undefined);

export const MerchandiseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // State initialization
  const [merchandises, setMerchandises] = useState<MerchandiseProps[]>([]);

  // Load mock data from JSON file
  useEffect(() => {
    const loadMockData = async () => {
      try {
        const response = await fetch("/data/mockMerchandises.json");
        const mockData = await response.json();
        setMerchandises((prev) => [...mockData, ...prev]);
      } catch (error) {
        console.error("Failed to load mock data:", error);
      }
    };

    loadMockData();
  }, []);

  // Fetch merchandises from backend
  useEffect(() => {
    const fetchMerchandises = async () => {
      try {
        const response = await axios.get<MerchandiseProps[]>(`${BACKEND_URL}/api/merchandises`);
        setMerchandises((prev) => {
          const uniqueData = response.data.filter(
            (apiItem) => !prev.some((prevItem) => prevItem.id === apiItem.id)
          );
          return [...prev, ...uniqueData];
        });
      } catch (error) {
        console.error("Failed to fetch merchandises:", error);
      }
    };
  
    fetchMerchandises();
  }, [BACKEND_URL]);
  
  
  // Sync with localStorage whenever merchandises state changes
  useEffect(() => {
    const storedMerchandises = merchandises.filter(
      (item) => !merchandises.some((mock) => mock.id === item.id)
    );
    localStorage.setItem("merchandises", JSON.stringify(storedMerchandises));
  }, [merchandises]);

  // Add new merchandise
  const addMerchandise = async (newMerchandise: MerchandiseProps) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/merchandises`, newMerchandise);
      setMerchandises((prev) => [...prev, response.data]); // 서버 데이터로 업데이트
    } catch (error) {
      console.error("Failed to add merchandise:", error);
      setMerchandises((prev) => [...prev, newMerchandise]); // 로컬에서라도 업데이트
    }
  };

  // Reset merchandises to mockMerchandises
  const resetMerchandises = async () => {
    try {
      await axios.delete(`${BACKEND_URL}/api/merchandises`);
    } catch (error) {
      console.warn("Failed to clear backend data.");
    }

    const response = await fetch("/data/mockMerchandises.json");
    const mockData = await response.json();
    setMerchandises(mockData);
    localStorage.removeItem("merchandises");
  };

  return (
    <MerchandiseContext.Provider
      value={{ merchandises, addMerchandise, resetMerchandises, setMerchandises }}
    >
      {children}
    </MerchandiseContext.Provider>
  );
};

export const useMerchandise = () => {
  const context = useContext(MerchandiseContext);
  if (!context) {
    throw new Error("useMerchandise must be used within a MerchandiseProvider");
  }
  return context;
};
