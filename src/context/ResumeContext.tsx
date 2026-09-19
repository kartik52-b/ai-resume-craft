import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type ResumeData, type TemplateType, createEmptyResume } from '@/types/resume';

interface ResumeContextType {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  updatePersonal: (field: string, value: string) => void;
  setTemplate: (template: TemplateType) => void;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resume, setResume] = useState<ResumeData>(createEmptyResume());

  const updatePersonal = useCallback((field: string, value: string) => {
    setResume(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }, []);

  const setTemplate = useCallback((template: TemplateType) => {
    setResume(prev => ({ ...prev, template }));
  }, []);

  const updateField = useCallback(<K extends keyof ResumeData>(key: K, value: ResumeData[K]) => {
    setResume(prev => ({ ...prev, [key]: value }));
  }, []);

  return (
    <ResumeContext.Provider value={{ resume, setResume, updatePersonal, setTemplate, updateField }}>
      {children}
    </ResumeContext.Provider>
  );
};
