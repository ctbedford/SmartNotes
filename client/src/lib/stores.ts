import { create } from 'zustand';

interface ModalStore {
  isSparkModalOpen: boolean;
  isResonateModalOpen: boolean;
  isAddValueModalOpen: boolean;
  isAddTaskModalOpen: boolean;
  selectedCaptureForResonate: any | null;
  setSparkModalOpen: (isOpen: boolean) => void;
  setResonateModalOpen: (isOpen: boolean, capture?: any) => void;
  setAddValueModalOpen: (isOpen: boolean) => void;
  setAddTaskModalOpen: (isOpen: boolean) => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  isSparkModalOpen: false,
  isResonateModalOpen: false,
  isAddValueModalOpen: false,
  isAddTaskModalOpen: false,
  selectedCaptureForResonate: null,
  setSparkModalOpen: (isOpen) => set({ isSparkModalOpen: isOpen }),
  setResonateModalOpen: (isOpen, capture = null) => set({ 
    isResonateModalOpen: isOpen,
    selectedCaptureForResonate: capture
  }),
  setAddValueModalOpen: (isOpen) => set({ isAddValueModalOpen: isOpen }),
  setAddTaskModalOpen: (isOpen) => set({ isAddTaskModalOpen: isOpen }),
}));

interface AuthStore {
  user: any | null;
  isLoading: boolean;
  setUser: (user: any | null) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
