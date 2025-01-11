import React, { createContext, useState, useContext } from 'react';

interface Schoolar {
  Id: number,
  FirstName: string | null,
  SecondName: string | null,
  LastName: string | null,
}

interface ShoolarContextType {
  schoolar: Schoolar | null;
  setSchoolar: (schoolar: Schoolar | null) => void;
}

export const SchoolarContext = createContext<ShoolarContextType | null>(null);

export const SchoolarProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [schoolar, setSchoolar] = useState<Schoolar | null>(null);
  return (
    <SchoolarContext.Provider value={{ schoolar, setSchoolar }}>
      {children}
    </SchoolarContext.Provider>
  );
};

export const useSchoolar = () => {
  const context = useContext(SchoolarContext);
  if (!context) {
    throw new Error('useSchoolar must be used within a SchollarProvider');
  }
  return context;
};