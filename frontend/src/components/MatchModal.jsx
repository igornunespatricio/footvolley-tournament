import { useState, useEffect } from 'react'
import '../styles/Modal.css'

export const MatchModal = ({ isOpen, groupId, stage, teams, onClose, onSubmit, initialData = null }) => {
  const isKnockout = !!stage
  const isValidStatus = (status) => status === 'pending' || status === 'completed'

  const buildFormData = (data) => ({
    teamAId: data?.team_a_id || '',
    teamBId: data?.team_b_id || '',
    scoreA: data?.score_a ?? 0,
    scoreB: data?.score_b ?? 0,
    status: isValidStatus(data?.status) ? data.status : (data ? 'completed' : 'pending'),
    winnerId: data?.winner_id || '',
  })

  const [formData, setFormData] = useState(() => buildFormData(initialData))

  useEffect(() => {
    setFormData(buildFormData(initialData))
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    const isNumeric = name.includes('score') || name.includes('Id')
    setFormData(prev => ({
      ...prev,
      [name]: isNumeric ? (value !== '' ? parseInt(value) : '') : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData(buildFormData(null))
  }

  if (!isOpen) return null

  const selectedTeams = teams.filter(t => t.id === formData.teamAId || t.id === formData.teamBId)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Match' : 'Create Match'}</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Team A</label>
            <select 
              name="teamAId" 
              value={formData.teamAId} 
              onChange={handleChange}
              required
            >
              <option value="">Select Team A</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Team B</label>
            <select 
              name="teamBId" 
              value={formData.teamBId} 
              onChange={handleChange}
              required
            >
              <option value="">Select Team B</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Score A</label>
              <input 
                type="number" 
                name="scoreA" 
                value={formData.scoreA}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label>Score B</label>
              <input 
                type="number" 
                name="scoreB" 
                value={formData.scoreB}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {isKnockout && formData.status === 'completed' && (
            <div className="form-group">
              <label>Winner</label>
              <select
                name="winnerId"
                value={formData.winnerId}
                onChange={handleChange}
                required
              >
                <option value="">Select Winner</option>
                {selectedTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
