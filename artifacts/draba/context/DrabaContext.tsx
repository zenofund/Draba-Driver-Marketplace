import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { mockApi } from '@/services/mockApi';
import type { Driver } from '@/data/mock';

export type ScreenName = 'splash' | 'welcome' | 'login' | 'otp' | 'verify' | 'home' | 'search' | 'drivers' | 'booking' | 'tracking' | 'complete' | 'trips' | 'wallet' | 'inbox' | 'profile';
export type TripStage = 'searching' | 'accepted' | 'arriving' | 'started' | 'completed';

type DrabaContextValue = {
  screen: ScreenName;
  setScreen: (screen: ScreenName) => void;
  destination: string;
  setDestination: (destination: string) => void;
  selectedDriver: Driver;
  setSelectedDriver: (driver: Driver) => void;
  tripStage: TripStage;
  setTripStage: (stage: TripStage) => void;
  phone: string;
  setPhone: (phone: string) => void;
  toast: string | null;
  showToast: (message: string) => void;
  completeAuth: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const DrabaContext = createContext<DrabaContextValue | null>(null);

export function DrabaProvider({ children }: { children: React.ReactNode }) {
  const [screen, setScreen] = useState<ScreenName>('splash');
  const [destination, setDestination] = useState('');
  const [selectedDriver, setSelectedDriver] = useState<Driver>(mockApi.catalog.drivers[0]);
  const [tripStage, setTripStage] = useState<TripStage>('searching');
  const [phone, setPhone] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2600);
  };

  const completeAuth = async () => {
    await AsyncStorage.setItem('draba_demo_session', 'active');
    setScreen('home');
  };

  const resetDemo = async () => {
    await AsyncStorage.removeItem('draba_demo_session');
    setScreen('welcome');
  };

  const value = useMemo(() => ({
    screen, setScreen, destination, setDestination, selectedDriver, setSelectedDriver,
    tripStage, setTripStage, phone, setPhone, toast, showToast, completeAuth, resetDemo,
  }), [screen, destination, selectedDriver, tripStage, phone, toast]);

  return <DrabaContext.Provider value={value}>{children}</DrabaContext.Provider>;
}

export function useDraba() {
  const context = useContext(DrabaContext);
  if (!context) throw new Error('useDraba must be used inside DrabaProvider');
  return context;
}