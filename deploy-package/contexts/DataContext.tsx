"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  LocalDataManager,
  HomepageData,
  defaultHomepageData,
} from "@/lib/data";

interface DataContextType {
  homepageData: HomepageData;
  updateHomepageData: (data: HomepageData) => Promise<boolean>;
  resetHomepageData: () => Promise<boolean>;
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  isLoading: boolean;
  lastSaved: Date | null;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [homepageData, setHomepageData] =
    useState<HomepageData>(defaultHomepageData);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = LocalDataManager.getHomepageData();
        setHomepageData(data);

        // Check if we have saved data
        const hasCustomData =
          JSON.stringify(data) !== JSON.stringify(defaultHomepageData);
        if (hasCustomData) {
          // Estimate last saved time from local storage (this is a simple approach)
          setLastSaved(new Date());
        }
      } catch (error) {
        console.error("Error loading data:", error);
        setHomepageData(defaultHomepageData);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const updateHomepageData = async (data: HomepageData): Promise<boolean> => {
    try {
      const success = LocalDataManager.saveHomepageData(data);
      if (success) {
        setHomepageData(data);
        setLastSaved(new Date());

        // Trigger a custom event to notify other components of the update
        window.dispatchEvent(
          new CustomEvent("homepage-data-updated", { detail: data }),
        );
      }
      return success;
    } catch (error) {
      console.error("Error updating homepage data:", error);
      return false;
    }
  };

  const resetHomepageData = async (): Promise<boolean> => {
    try {
      const success = LocalDataManager.resetHomepageData();
      if (success) {
        setHomepageData(defaultHomepageData);
        setLastSaved(null);

        // Trigger update event
        window.dispatchEvent(
          new CustomEvent("homepage-data-updated", {
            detail: defaultHomepageData,
          }),
        );
      }
      return success;
    } catch (error) {
      console.error("Error resetting homepage data:", error);
      return false;
    }
  };

  const exportData = (): string => {
    return LocalDataManager.exportData();
  };

  const importData = (jsonData: string): boolean => {
    try {
      const success = LocalDataManager.importData(jsonData);
      if (success) {
        // Reload data after import
        const data = LocalDataManager.getHomepageData();
        setHomepageData(data);
        setLastSaved(new Date());

        // Trigger update event
        window.dispatchEvent(
          new CustomEvent("homepage-data-updated", { detail: data }),
        );
      }
      return success;
    } catch (error) {
      console.error("Error importing data:", error);
      return false;
    }
  };

  const value = {
    homepageData,
    updateHomepageData,
    resetHomepageData,
    exportData,
    importData,
    isLoading,
    lastSaved,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
