import { useState, useEffect } from 'react'
import { GroupStage } from './pages/GroupStage'
import { KnockoutStage } from './pages/KnockoutStage'
import { initializeSocket } from './services/socket'
import { groupService } from './services/api'
import './styles/App.css'

function App() {
  const [groups, setGroups] = useState([])
  const [activeTab, setActiveTab] = useState('group-stage')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Initialize WebSocket connection
    initializeSocket()
    
    // Load groups
    loadGroups()
  }, [])

  const loadGroups = async () => {
    setLoading(true)
    try {
      const response = await groupService.getAll()
      setGroups(response.data)
    } catch (err) {
      setError('Failed to load tournament data')
      console.error('Error loading groups:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleMatchUpdated = () => {
    // Reload groups to refresh standings
    loadGroups()
  }

  const handleKnockoutUpdated = () => {
    // Additional logic if needed
  }

  if (loading) {
    return <div className="app-loading">Loading tournament...</div>
  }

  if (error) {
    return <div className="app-error">{error}</div>
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>⚽ ASC Championship - Footvolley Tournament</h1>
          <p className="subtitle">Group Stage & Knockout Tournament</p>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${activeTab === 'group-stage' ? 'active' : ''}`}
          onClick={() => setActiveTab('group-stage')}
        >
          📊 Group Stage
        </button>
        <button
          className={`nav-btn ${activeTab === 'knockout' ? 'active' : ''}`}
          onClick={() => setActiveTab('knockout')}
        >
          🏆 Knockout Stage
        </button>
      </nav>

      <main className="app-main">
        {activeTab === 'group-stage' && (
          <GroupStage 
            groups={groups}
            onMatchUpdated={handleMatchUpdated}
          />
        )}
        
        {activeTab === 'knockout' && (
          <KnockoutStage
            groups={groups}
            onKnockoutUpdated={handleKnockoutUpdated}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>Live updates enabled • Real-time match tracking • ASC Championship 2024</p>
      </footer>
    </div>
  )
}

export default App
