import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import {
  type SaveStatus,
  type LoadStatus,
  type ResumeStore,
  loadStore,
  saveStore,
  ensureActiveResume,
} from '@/lib/storage';
import {
  getActive,
  createResume,
  duplicateResume,
  deleteResume,
  renameResume,
  setActiveResume,
  updateActiveResume,
} from '@/lib/resumeStore';
import { type ResumeData, type TemplateType } from '@/types/resume';

const AUTOSAVE_DELAY_MS = 800;

interface ResumeContextType {
  /** All resumes in the store. */
  resumes: ResumeData[];
  /** The resume currently being edited. */
  resume: ResumeData;
  activeId: string | null;
  saveStatus: SaveStatus;
  loadStatus: LoadStatus;
  setResume: React.Dispatch<React.SetStateAction<ResumeData>>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  // --- Editor actions (operate on the active resume) ---
  updatePersonal: (field: string, value: string) => void;
  setTemplate: (template: TemplateType) => void;
  updateField: <K extends keyof ResumeData>(key: K, value: ResumeData[K]) => void;
  // --- Store actions ---
  createResumeAction: () => string;
  renameResumeAction: (id: string, title: string) => void;
  duplicateResumeAction: (id: string) => string | null;
  deleteResumeAction: (id: string) => 'deleted' | 'last-resume';
  switchResume: (id: string) => void;
}

const ResumeContext = createContext<ResumeContextType | null>(null);

export const useResume = () => {
  const ctx = useContext(ResumeContext);
  if (!ctx) throw new Error('useResume must be used within ResumeProvider');
  return ctx;
};

export const ResumeProvider = ({ children }: { children: ReactNode }) => {
  // Hydrate synchronously during first render (restores v1/v2 data, migrates
  // legacy) and seed an active resume in the same step, so the store state is
  // stable from the start and seeding never triggers an autosave.
  const [initial] = useState(() => {
    const loaded = loadStore();
    return { status: loaded.status, store: ensureActiveResume(loaded.store) };
  });
  const [store, setStore] = useState<ResumeStore>(initial.store);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    initial.status === 'restored' || initial.status === 'salvaged' ? 'saved' : 'idle',
  );
  const loadStatus = initial.status;

  const timerRef = useRef<number | null>(null);
  const storeRef = useRef(store);
  storeRef.current = store;

  // --- Undo/redo (active resume only; capped history) ---
  const undoStack = useRef<ResumeData[]>([]);
  const redoStack = useRef<ResumeData[]>([]);
  const activeIdRef = useRef(store.activeId);
  activeIdRef.current = store.activeId;
  // State counter forces re-render whenever stacks change so canUndo/canRedo
  // stay reactive even though the stacks themselves live in refs.
  const [historyVersion, setHistoryVersion] = useState(0);
  const bumpHistory = useCallback(() => setHistoryVersion((v) => v + 1), []);

  const pushHistory = useCallback((prevStore: ResumeStore, nextStore: ResumeStore) => {
    const before = getActive(prevStore);
    const after = getActive(nextStore);
    if (!before || !after || before.id !== after.id) return;
    if (JSON.stringify(before) === JSON.stringify(after)) return;
    undoStack.current = [...undoStack.current.slice(-49), before];
    redoStack.current = [];
    bumpHistory();
  }, [bumpHistory]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    bumpHistory();
    setStore((cur) => {
      const current = getActive(cur);
      if (!current) return cur;
      redoStack.current = [...redoStack.current, current];
      return updateActiveResume(cur, () => prev);
    });
  }, [bumpHistory]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    bumpHistory();
    setStore((cur) => {
      const current = getActive(cur);
      if (!current) return cur;
      undoStack.current = [...undoStack.current, current];
      return updateActiveResume(cur, () => next);
    });
  }, [bumpHistory]);

  // Debounced autosave on every store change (skips the hydrated initial state).
  useEffect(() => {
    if (store === initial.store) return;

    setSaveStatus('saving');
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      const result = saveStore(storeRef.current);
      setSaveStatus(result.ok ? 'saved' : 'error');
    }, AUTOSAVE_DELAY_MS);
  }, [store, initial.store]);

  // Flush pending changes on unload/unmount.
  useEffect(() => {
    const flush = () => saveStore(storeRef.current);
    window.addEventListener('beforeunload', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        saveStore(storeRef.current);
      }
    };
  }, []);

  const active = getActive(store);

  const updateActive = useCallback(
    (updater: (r: ResumeData) => ResumeData) =>
      setStore(prev => {
        const next = updateActiveResume(prev, updater);
        pushHistory(prev, next);
        return next;
      }),
    [pushHistory],
  );

  const updatePersonal = useCallback(
    (field: string, value: string) =>
      updateActive(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } })),
    [updateActive],
  );

  const setTemplate = useCallback(
    (template: TemplateType) => updateActive(prev => ({ ...prev, template })),
    [updateActive],
  );

  const updateField = useCallback(
    <K extends keyof ResumeData>(key: K, value: ResumeData[K]) =>
      updateActive(prev => ({ ...prev, [key]: value })),
    [updateActive],
  );

  const setResume = useCallback<React.Dispatch<React.SetStateAction<ResumeData>>>(
    (value) =>
      setStore(prev => {
        const current = getActive(prev);
        if (!current) return prev;
        const next = typeof value === 'function' ? value(current) : value;
        return updateActiveResume(prev, () => next);
      }),
    [],
  );

  const createResumeAction = useCallback(() => {
    const result = createResume(storeRef.current);
    setStore(result.store);
    return result.id;
  }, []);

  const renameResumeAction = useCallback((id: string, title: string) => {
    setStore(prev => renameResume(prev, id, title));
  }, []);

  const duplicateResumeAction = useCallback((id: string) => {
    const result = duplicateResume(storeRef.current, id);
    if (!result) return null;
    setStore(result.store);
    return result.id;
  }, []);

  const deleteResumeAction = useCallback((id: string) => {
    const current = storeRef.current;
    if (current.resumes.length <= 1) return 'last-resume';
    setStore(deleteResume(current, id));
    return 'deleted';
  }, []);

  const switchResume = useCallback((id: string) => {
    setStore(prev => setActiveResume(prev, id));
  }, []);

  return (
    <ResumeContext.Provider
      value={{
        resumes: store.resumes,
        resume: active ?? store.resumes[0],
        activeId: store.activeId,
        saveStatus,
        loadStatus,
        setResume,
        canUndo: undoStack.current.length > 0,
        canRedo: redoStack.current.length > 0,
        undo,
        redo,
        updatePersonal,
        setTemplate,
        updateField,
        createResumeAction,
        renameResumeAction,
        duplicateResumeAction,
        deleteResumeAction,
        switchResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  );
};
