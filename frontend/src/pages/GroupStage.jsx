import { useState } from 'react'
import { StandingsTable } from '../components/StandingsTable'
import { MatchCard } from '../components/MatchCard'
import { MatchModal } from '../components/MatchModal'
import { matchService, groupService } from '../services/api'
import { useMatchUpdates } from '../hooks/useSocket'
import '../styles/GroupStage.css'

export const GroupStage = ({ groups, onMatchUpdated }) => {
  const [selectedGroup, setSelectedGroup] = useState(groups[0]?.id || null)
  const [groupDetails, setGroupDetails] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [loading, setLoading] = useState(false)

  useMatchUpdates((data) => {
    if (selectedGroup && groupDetails) {
      // Refresh standings after match update
      onMatchUpdated(data)
    }
  })

  const loadGroupDetails = async (groupId) => {
    setLoading(true)
    try {
      const response = await groupService.getDetails(groupId)
      setGroupDetails({
        groupId,
        matches: response.data.matches,
        teams: response.data.teams,
      })
    } catch (error) {
      console.error('Failed to load group details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGroupChange = (groupId) => {
    setSelectedGroup(groupId)
    loadGroupDetails(groupId)
  }

  const handleCreateMatch = async (formData) => {
    try {
      await matchService.create(
        selectedGroup,
        formData.teamAId,
        formData.teamBId
      )
      setIsModalOpen(false)
      loadGroupDetails(selectedGroup)
    } catch (error) {
      console.error('Failed to create match:', error)
      alert('Failed to create match')
    }
  }

  const handleUpdateMatch = async (formData) => {
    try {
      await matchService.update(
        editingMatch.id,
        formData.scoreA,
        formData.scoreB,
        formData.status
      )
      setEditingMatch(null)
      setIsModalOpen(false)
      loadGroupDetails(selectedGroup)
    } catch (error) {
      console.error('Failed to update match:', error)
      alert('Failed to update match')
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('Are you sure you want to delete this match?')) return
    
    try {
      await matchService.delete(matchId)
      loadGroupDetails(selectedGroup)
    } catch (error) {
      console.error('Failed to delete match:', error)
      alert('Failed to delete match')
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

  if (loading) return <div className="loading">Loading group details...</div>

  return (
    <div className="group-stage">
      <h2>Group Stage</h2>

      <div className="group-selector">
        <label>Select Group:</label>
        <select value={selectedGroup} onChange={(e) => handleGroupChange(e.target.value)}>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {groupDetails ? (
        <>
          <button 
            className="btn-primary"
            onClick={() => handleOpenModal()}
          >
            + Add Match
          </button>

          <div className="group-content">
            <div className="matches-section">
              <h3>Matches</h3>
              <div className="matches-grid">
                {groupDetails.matches && groupDetails.matches.length > 0 ? (
                  groupDetails.matches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      onEdit={handleOpenModal}
                      onDelete={handleDeleteMatch}
                    />
                  ))
                ) : (
                  <div className="no-matches">No matches scheduled</div>
                )}
              </div>
            </div>
          </div>

          <MatchModal
            isOpen={isModalOpen}
            groupId={selectedGroup}
            teams={groupDetails.teams || []}
            initialData={editingMatch}
            onClose={handleCloseModal}
            onSubmit={editingMatch ? handleUpdateMatch : handleCreateMatch}
          />
        </>
      ) : (
        <div className="no-data">Select a group to view details</div>
      )}
    </div>
  )
}
