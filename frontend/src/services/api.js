import axios from 'axios'

const API_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const groupService = {
  getAll: () => api.get('/groups'),
  getById: (id) => api.get(`/groups/${id}`),
}

export const matchService = {
  getGroupMatches: (groupId) => api.get(`/groups/${groupId}/matches`),
  create: (groupId, teamAId, teamBId) =>
    api.post('/matches', { groupId, teamAId, teamBId }),
  update: (id, scoreA, scoreB, status) =>
    api.put(`/matches/${id}`, { scoreA, scoreB, status }),
  delete: (id) => api.delete(`/matches/${id}`),
}

export const standingsService = {
  get: (groupId) => api.get(`/groups/${groupId}/standings`),
}

export const knockoutService = {
  getAll: (stage = null) => api.get('/knockout-matches', { params: { stage } }),
  create: (stage, teamAId = null, teamBId = null) =>
    api.post('/knockout-matches', { stage, teamAId, teamBId }),
  update: (id, scoreA, scoreB, status, winnerId = null) =>
    api.put(`/knockout-matches/${id}`, { scoreA, scoreB, status, winnerId }),
  delete: (id) => api.delete(`/knockout-matches/${id}`),
  getQualifiedTeams: () => api.get('/qualified-teams'),
  createBracket: () => api.post('/create-knockout-bracket'),
}

export default api
