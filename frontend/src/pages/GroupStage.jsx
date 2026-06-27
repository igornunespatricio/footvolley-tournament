import { useEffect, useState } from 'react'
import { StandingsTable } from '../components/StandingsTable'
import { MatchCard } from '../components/MatchCard'
import { MatchModal } from '../components/MatchModal'
import { matchService, groupService } from '../services/api'
import { useMatchUpdates } from '../hooks/useSocket'
import '../styles/GroupStage.css'

export const GroupStage = ({ groups, onMatchUpdated }) => {
  const [allMatches, setAllMatches] = useState([])
  const [teamsByGroupId, setTeamsByGroupId] = useState({})
  const [allStandings, setAllStandings] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [modalGroupId, setModalGroupId] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!groups || groups.length === 0) {
      setAllMatches([])
      setTeamsByGroupId({})
      setAllStandings([])
      return
    }

    loadAllGroupData()
  }, [groups])

  useMatchUpdates((data) => {
    if (groups && groups.length > 0) {
      loadAllGroupData()
      onMatchUpdated(data)
    }
  })

  const loadAllGroupData = async () => {
    setLoading(true)
    try {
      const responses = await Promise.all(
        groups.map((group) => groupService.getDetails(group.id))
      )

      const matches = []
      const nextTeamsByGroupId = {}
      const standingsByGroup = responses.map((response, index) => ({
        group: groups[index],
        standings: response.data.standings || [],
      }))

      responses.forEach((response, index) => {
        const group = groups[index]
        const groupId = String(group.id)
        const groupMatches = (response.data.matches || []).map((match) => ({
          ...match,
          group_id: groupId,
          group_name: group.name,
        }))

        matches.push(...groupMatches)
        nextTeamsByGroupId[groupId] = response.data.teams || []
      })

      setAllMatches(matches)
      setTeamsByGroupId(nextTeamsByGroupId)
      setAllStandings(standingsByGroup)
    } catch (error) {
      console.error('Failed to load group data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async (formData) => {
    if (!modalGroupId) {
      alert('No group available for this match')
      return
    }

    try {
      await matchService.create(
        modalGroupId,
        formData.teamAId,
        formData.teamBId
      )
      setIsModalOpen(false)
      setModalGroupId(null)
      loadAllGroupData()
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
      setModalGroupId(null)
      loadAllGroupData()
    } catch (error) {
      console.error('Failed to update match:', error)
      alert('Failed to update match')
    }
  }

  const handleDeleteMatch = async (matchId) => {
    if (!confirm('Are you sure you want to delete this match?')) return
    
    try {
      await matchService.delete(matchId)
      loadAllGroupData()
    } catch (error) {
      console.error('Failed to delete match:', error)
      alert('Failed to delete match')
    }
  }

  const handleOpenModal = (match = null) => {
    setEditingMatch(match)
    const defaultGroupId = match?.group_id || (groups[0]?.id ? String(groups[0].id) : null)
    setModalGroupId(defaultGroupId)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setEditingMatch(null)
    setModalGroupId(null)
    setIsModalOpen(false)
  }

  if (loading) return <div className="loading">Loading group details...</div>

  const modalTeams = modalGroupId ? (teamsByGroupId[modalGroupId] || []) : []

  return (
    <div className="group-stage">
      <h2>Group Stage</h2>

      <button
        className="btn-primary"
        onClick={() => handleOpenModal()}
        disabled={!groups || groups.length === 0}
      >
        + Add Match
      </button>

      <div className="group-content">
        <div className="matches-section">
          <h3>Matches</h3>
          <div className="matches-list">
            {allMatches.length > 0 ? (
              allMatches.map(match => (
                <MatchCard
                  key={match.id}
                  match={match}
                  compact
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteMatch}
                />
              ))
            ) : (
              <div className="no-matches">No matches scheduled</div>
            )}
          </div>
        </div>

        <div className="standings-panel">
          <h3>Group Standings</h3>
          {allStandings.map(({ group, standings }) => (
            <StandingsTable
              key={group.id}
              title={group.name}
              standings={standings}
            />
          ))}
        </div>
      </div>

      <MatchModal
        isOpen={isModalOpen}
        groupId={modalGroupId}
        teams={modalTeams}
        initialData={editingMatch}
        onClose={handleCloseModal}
        onSubmit={editingMatch ? handleUpdateMatch : handleCreateMatch}
      />
    </div>
  )
}
