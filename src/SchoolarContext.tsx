import React, { createContext, useState, useContext } from 'react';
import { ISchoolboysItem } from './types';

interface ShoolarContextType {
  schoolar: ISchoolboysItem | null;
  setSchoolar: (schoolar: ISchoolboysItem | null) => void;
}

export const SchoolarContext = createContext<ShoolarContextType | null>(null);

export const SchoolarProvider: React.FC<{ children: React.ReactNode }> = ({children}) => {
  const [schoolar, setSchoolar] = useState<ISchoolboysItem | null>(null);
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