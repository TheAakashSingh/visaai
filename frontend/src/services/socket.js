// src/services/socket.js
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001'

let socket = null

export const initSocket = (userId) => {
  if (socket?.connected) return socket

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
    withCredentials: true,
  })

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket.id)
    if (userId) socket.emit('join', { userId })
  })

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason)
  })

  socket.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message)
  })

  return socket
}

export const getSocket = () => socket

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export const subscribeToLead = (leadId) => {
  socket?.emit('subscribe:lead', { leadId })
}

export default { initSocket, getSocket, disconnectSocket, subscribeToLead }
