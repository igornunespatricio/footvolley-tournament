import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:3001'

let socket = null

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('✅ WebSocket connected')
    })

    socket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('WebSocket error:', error)
    })
  }

  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initializeSocket()
  }
  return socket
}

export const onMatchUpdate = (callback) => {
  getSocket().on('match-updated', callback)
}

export const onKnockoutUpdate = (callback) => {
  getSocket().on('knockout-updated', callback)
}

export const onStandingsUpdate = (callback) => {
  getSocket().on('standings-updated', callback)
}

export const emitMatchUpdate = (data) => {
  getSocket().emit('match-update', data)
}

export const emitKnockoutUpdate = (data) => {
  getSocket().emit('knockout-update', data)
}

export const emitStandingsUpdate = (data) => {
  getSocket().emit('standings-update', data)
}
