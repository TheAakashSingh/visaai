// src/store/wevisaStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useWeVisaStore = create(
  persist(
    (set, get) => ({
      agent: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (agent, accessToken, refreshToken) => {
        localStorage.setItem('wevisa_token', accessToken)
        localStorage.setItem('wevisa_refresh_token', refreshToken)
        localStorage.setItem('wevisa_agent', JSON.stringify(agent))
        set({ agent, accessToken, refreshToken, isAuthenticated: true })
      },

      setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('wevisa_token', accessToken)
        localStorage.setItem('wevisa_refresh_token', refreshToken)
        set({ accessToken, refreshToken })
      },

      logout: () => {
        localStorage.removeItem('wevisa_token')
        localStorage.removeItem('wevisa_refresh_token')
        localStorage.removeItem('wevisa_agent')
        set({ agent: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'wevisa-auth',
      partialize: (s) => ({
        agent: s.agent,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)

export default useWeVisaStore
