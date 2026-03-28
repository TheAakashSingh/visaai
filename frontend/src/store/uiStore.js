// src/store/uiStore.js
import { create } from 'zustand'

const useUIStore = create((set, get) => ({
  sidebarOpen: true,
  activeModal: null,
  liveActivity: [],
  systemStatus: 'online',

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  openModal: (name, data = {}) => set({ activeModal: { name, data } }),
  closeModal: () => set({ activeModal: null }),

  addActivity: (item) =>
    set((s) => ({
      liveActivity: [
        { ...item, id: Date.now(), timestamp: new Date() },
        ...s.liveActivity.slice(0, 19),
      ],
    })),

  setSystemStatus: (status) => set({ systemStatus: status }),
}))

export default useUIStore
