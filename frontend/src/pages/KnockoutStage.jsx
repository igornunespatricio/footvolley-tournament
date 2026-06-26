import { useState, useEffect } from 'react'
import { knockoutService, teamService } from '../services/api'
import { MatchCard } from '../components/MatchCard'
import { MatchModal } from '../components/MatchModal'
import { useKnockoutUpdates } from '../hooks/useSocket'
import '../styles/KnockoutStage.css'

export const KnockoutStage = ({ groups, onKnockoutUpdated }) => {
  const [knockoutMatches, setKnockoutMatches] = useState({
    quarterfinal: [],
    semifinal: [],
    final: [],
  })
  const [qualifiedTeams, setQualifiedTeams] = useState([])
  const [allTeams, setAllTeams] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [modalStage, setModalStage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [bracketGenerated, setBracketGenerated] = useState(false)

  useKnockoutUpdates((data) => {
    loadKnockoutMatches()
  })

  useEffect(() => {
    loadKnockoutMatches()
    loadQualifiedTeams()
    loadAllTeams()
  }, [])

  const loadAllTeams = async () => {
    try {
      const response = await teamService.getAll()
      setAllTeams(response.data || [])
    } catch (error) {
      console.error('Failed to load teams:', error)
    }
  }

  const loadKnockoutMatches = async () => {
    setLoading(true)
    try {
      const qfResponse = await knockoutService.getAll('quarterfinal')
      const sfResponse = await knockoutService.getAll('semifinal')
      const fResponse = await knockoutService.getAll('final')
      
      const matches = {
        quarterfinal: qfResponse.data || [],
        semifinal: sfResponse.data || [],
        final: fResponse.data || [],
      }
      
      setKnockoutMatches(matches)
      // Bracket is generated if there are quarterfinal matches
      setBracketGenerated(matches.quarterfinal.length > 0)
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
    if (!window.confirm('This will create the 8-team knockout bracket (4 QF → 2 SF → 1 F) based on group standings:\n\n• Top 2 from each group (6 teams)\n• Best 2 third-place teams (2 teams)\n\nContinue?')) {
      return
    }

    setLoading(true)
    try {
      const response = await knockoutService.createBracket()
      setTimeout(() => loadKnockoutMatches(), 500)
      alert('✅ ' + response.data.message)
    } catch (error) {
      console.error('Failed to create knockout bracket:', error)
      alert(`❌ Failed to create bracket: ${error.response?.data?.error || error.message}`)
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
      setModalStage(null)
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
      setModalStage(null)
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

  const handleOpenModal = (stage, match = null) => {
    setModalStage(stage)
    setEditingMatch(match)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingMatch(null)
    setModalStage(null)
    setIsModalOpen(false)
  }

  if (loading) return <div className="loading">Loading knockout stage...</div>

  return (
    <div className="knockout-stage">
      <h2>Knockout Stage 🏆</h2>

      {/* Qualification Info & Bracket Generation */}
      <div className="qualification-section">
        <div className="qualification-rules">
          <h4>📋 Qualification Rules</h4>
          <p>8 Teams advance to knockout:</p>
          <ul>
            <li><strong>6 Teams:</strong> Top 2 finishers from each group</li>
            <li><strong>2 Teams:</strong> Best 2 third-place finishers</li>
          </ul>
        </div>

        {qualifiedTeams.length > 0 && (
          <div className="qualified-teams-list">
            <h4>Qualified Teams ({qualifiedTeams.length}):</h4>
            <div className="teams-grid">
              {qualifiedTeams.map((team, idx) => (
                <div key={team.team_id} className={`team-qualified seed-${idx + 1}`}>
                  <div className="seed">#{idx + 1}</div>
                  <div className="team-info">
                    <div className="team-name">{team.team_name}</div>
                    <div className="qualification-type">
                      {team.qualification_type === 'group_1st_or_2nd' 
                        ? `${team.group_name} - ${team.position === 1 ? '1st' : '2nd'} place` 
                        : `${team.group_name} - 3rd place`}
                    </div>
                    <div className="team-stats">
                      {team.points}pts • {team.wins}W • GF:{team.goals_for} GA:{team.goals_against}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {qualifiedTeams.length >= 8 && !bracketGenerated && (
          <button 
            className="btn-generate-bracket"
            onClick={handleCreateBracket}
            disabled={loading}
          >
            ⚡ Generate 8-Team Knockout Bracket
          </button>
        )}
      </div>

      {/* 8-Team Bracket: QF → SF → F */}
      {bracketGenerated && (
        <div className="bracket-section">
          <h3>Tournament Bracket</h3>
          <div className="bracket-container">
            {/* Quarterfinals */}
            <div className="bracket-round quarterfinals">
              <div className="round-header">
                <h4>Quarterfinals (4)</h4>
              </div>
              <div className="matches-section">
                {knockoutMatches.quarterfinal && knockoutMatches.quarterfinal.length > 0 ? (
                  knockoutMatches.quarterfinal.map((match, idx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onEdit={() => handleOpenModal('quarterfinal', match)}
                      onDelete={handleDeleteMatch}
                      matchNumber={idx + 1}
                    />
                  ))
                ) : (
                  <div className="no-matches">No quarterfinal matches</div>
                )}
              </div>
            </div>

            {/* Semifinals */}
            <div className="bracket-round semifinals">
              <div className="round-header">
                <h4>Semifinals (2)</h4>
              </div>
              <div className="matches-section">
                {knockoutMatches.semifinal && knockoutMatches.semifinal.length > 0 ? (
                  knockoutMatches.semifinal.map((match, idx) => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onEdit={() => handleOpenModal('semifinal', match)}
                      onDelete={handleDeleteMatch}
                      matchNumber={idx + 1}
                    />
                  ))
                ) : (
                  <div className="no-matches">Waiting for quarterfinal results...</div>
                )}
              </div>
            </div>

            {/* Final */}
            <div className="bracket-round final">
              <div className="round-header">
                <h4>Final</h4>
              </div>
              <div className="matches-section">
                {knockoutMatches.final && knockoutMatches.final.length > 0 ? (
                  knockoutMatches.final.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onEdit={() => handleOpenModal('final', match)}
                      onDelete={handleDeleteMatch}
                      isChampionship
                    />
                  ))
                ) : (
                  <div className="no-matches">Waiting for semifinal results...</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <MatchModal
        isOpen={isModalOpen}
        groupId={null}
        stage={modalStage}
        teams={allTeams}
        initialData={editingMatch}
        onClose={handleCloseModal}
        onSubmit={editingMatch ? handleUpdateMatch : (formData) => handleCreateMatch(modalStage, formData)}
      />
    </div>
  )
}
