import { useState } from 'react'
import '../styles/Modal.css'

export const MatchModal = ({ isOpen, groupId, teams, onClose, onSubmit, initialData = null }) => {
  const [formData, setFormData] = useState({
    teamAId: initialData?.team_a_id || '',
    teamBId: initialData?.team_b_id || '',
    scoreA: initialData?.score_a || 0,
    scoreB: initialData?.score_b || 0,
    status: initialData?.status || 'pending',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('score') || name.includes('Id') ? parseInt(value) : value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      teamAId: '',
      teamBId: '',
      scoreA: 0,
      scoreB: 0,
      status: 'pending',
    })
  }

  if (!isOpen) return null

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
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit">Submit</button>
          </div>
        </form>
      </div>
    </div>
  )
}
