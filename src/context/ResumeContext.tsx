import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import { type ResumeData, type TemplateType, createEmptyResume } from '@/types/resume';

interface ResumeContextType {
  resume: ResumeData;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  updatePersonal: (field: string, value: string) => void;
  setTemplate: (template: TemplateType) => void;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportResume: () => void;
  importResume: (file: File) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
};

const STORAGE_KEY = 'ai-resume-craft:resume';

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  const [resume, setResumeState] = useState<ResumeData>(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) as ResumeData : createEmptyResume();
    } catch {
      return createEmptyResume();
    }
  });
  const history = useRef<ResumeData[]>([]);
  const future = useRef<ResumeData[]>([]);

  const setResume = useCallback<React.Dispatch<React.SetStateAction<ResumeData>>>((next) => {
    setResumeState(prev => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      if (JSON.stringify(prev) !== JSON.stringify(resolved)) {
        history.current = [...history.current.slice(-39), prev];
        future.current = [];
      }
      return resolved;
    });
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(resume));
  }, [resume]);

  const updatePersonal = useCallback((field: string, value: string) => {
    setResume(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  }, [setResume]);
  const setTemplate = useCallback((template: TemplateType) => setResume(prev => ({ ...prev, template })), [setResume]);
  const updateField = useCallback(<K extends keyof ResumeData>(key: K, value: ResumeData[K]) => setResume(prev => ({ ...prev, [key]: value })), [setResume]);
  const undo = useCallback(() => {
    const previous = history.current.pop();
    if (!previous) return;
    future.current.push(resume);
    setResumeState(previous);
  }, [resume]);
  const redo = useCallback(() => {
    const next = future.current.pop();
    if (!next) return;
    history.current.push(resume);
    setResumeState(next);
  }, [resume]);
  const exportResume = useCallback(() => {
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${resume.personal.fullName || 'resume'}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [resume]);
  const importResume = useCallback(async (file: File) => {
    const parsed = JSON.parse(await file.text()) as ResumeData;
    if (!parsed.personal || !parsed.template) throw new Error('Invalid resume file');
    setResume(parsed);
  }, [setResume]);

  return <ResumeContext.Provider value={{ resume, setResume, updatePersonal, setTemplate, updateField, undo, redo, canUndo: history.current.length > 0, canRedo: future.current.length > 0, exportResume, importResume }}>{children}</ResumeContext.Provider>;
};
