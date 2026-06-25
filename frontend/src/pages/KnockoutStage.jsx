import { useState, useEffect } from 'react'
import { knockoutService } from '../services/api'
import { MatchCard } from '../components/MatchCard'
import { MatchModal } from '../components/MatchModal'
import { useKnockoutUpdates } from '../hooks/useSocket'
import '../styles/KnockoutStage.css'

export const KnockoutStage = ({ groups, onKnockoutUpdated }) => {
  const [knockoutMatches, setKnockoutMatches] = useState({
    semifinal: [],
    final: [],
  })
  const [qualifiedTeams, setQualifiedTeams] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showBracketMessage, setShowBracketMessage] = useState(false)

  useKnockoutUpdates((data) => {
    loadKnockoutMatches()
  })

  useEffect(() => {
    loadKnockoutMatches()
    loadQualifiedTeams()
  }, [])

  const loadKnockoutMatches = async () => {
    setLoading(true)
    try {
      const sfResponse = await knockoutService.getAll('semifinal')
      const fResponse = await knockoutService.getAll('final')
      
      setKnockoutMatches({
        semifinal: sfResponse.data || [],
        final: fResponse.data || [],
      })
    } catch (error) {
      console.error('Failed to load knockout matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQualifiedTeams = async () => {
    try {
      const response = await knockoutService.getQualifiedTeams()
      setQualifiedTeams(response.data || [])
    } catch (error) {
      console.error('Failed to load qualified teams:', error)
    }
  }

  const handleCreateBracket = async () => {
    if (!window.confirm('This will auto-generate the knockout bracket based on group standings. Continue?')) {
      return
    }

    setLoading(true)
    try {
      const response = await knockoutService.createBracket()
      setShowBracketMessage(true)
      setTimeout(() => setShowBracketMessage(false), 4000)
      loadKnockoutMatches()
      alert(response.data.message)
    } catch (error) {
      console.error('Failed to create knockout bracket:', error)
      alert(`Failed to create bracket: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async (stage, formData) => {
    try {
      await knockoutService.create(
        stage,
        formData.teamAId || null,
        formData.teamBId || null
      )
      setIsModalOpen(false)
      loadKnockoutMatches()
    } catch (error) {
      console.error('Failed to create knockout match:', error)
      alert('Failed to create knockout match')
    }
  }

  const handleUpdateMatch = async (formData) => {
    try {
      await knockoutService.update(
        editingMatch.id,
        formData.scoreA,
        formData.scoreB,
        formData.status,
        formData.winnerId || null
      )
      setEditingMatch(null)
      setIsModalOpen(false)
      loadKnockoutMatches()
    } catch (error) {
      console.error('Failed to update knockout match:', error)
      alert('Failed to update knockout match')
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('Are you sure you want to delete this knockout match?')) return
    
    try {
      await knockoutService.delete(matchId)
      loadKnockoutMatches()
    } catch (error) {
      console.error('Failed to delete knockout match:', error)
      alert('Failed to delete knockout match')
    }
  }

  const handleOpenModal = (match = null) => {
    setEditingMatch(match)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingMatch(null)
    setIsModalOpen(false)
  }

  if (loading) return <div className="loading">Loading knockout stage...</div>

  const allTeams = groups.flatMap(group => 
    group.teams || []
  )

  return (
    <div className="knockout-stage">
      <h2>Knockout Stage 🏆</h2>

      {qualifiedTeams.length >= 4 && (
        <div className="bracket-controls">
          <button 
            className="btn-generate-bracket"
            onClick={handleCreateBracket}
            disabled={loading}
          >
            ⚡ Auto-Generate Bracket from Group Standings
          </button>
          
          {qualifiedTeams.length > 0 && (
            <div className="qualified-teams-preview">
              <h4>Qualified Teams ({qualifiedTeams.length}):</h4>
              <div className="teams-list">
                {qualifiedTeams.map((team, idx) => (
                  <span key={team.team_id} className="team-badge">
                    {team.group_name} • {team.team_name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="knockout-container">
        {/* Semifinals */}
        <div className="knockout-round">
          <h3>Semifinals</h3>
          <button 
            className="btn-primary"
            onClick={() => handleOpenModal()}
          >
            + Add Semifinal
          </button>
          
          <div className="matches-section">
            {knockoutMatches.semifinal && knockoutMatches.semifinal.length > 0 ? (
              knockoutMatches.semifinal.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteMatch}
                />
              ))
            ) : (
              <div className="no-matches">No semifinal matches</div>
            )}
          </div>
        </div>

        {/* Finals */}
        <div className="knockout-round">
          <h3>Final</h3>
          <button 
            className="btn-primary"
            onClick={() => handleOpenModal()}
          >
            + Add Final
          </button>
          
          <div className="matches-section">
            {knockoutMatches.final && knockoutMatches.final.length > 0 ? (
              knockoutMatches.final.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteMatch}
                />
              ))
            ) : (
              <div className="no-matches">No final match</div>
            )}
          </div>
        </div>
      </div>

      <MatchModal
        isOpen={isModalOpen}
        groupId={null}
        teams={allTeams}
        initialData={editingMatch}
        onClose={handleCloseModal}
        onSubmit={editingMatch ? handleUpdateMatch : handleCreateMatch}
      />
    </div>
  )
}
