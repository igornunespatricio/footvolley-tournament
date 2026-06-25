import '../styles/MatchCard.css'

export const MatchCard = ({ match, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'completed'
      case 'in_progress': return 'in-progress'
      default: return 'pending'
    }
  }

  return (
    <div className={`match-card ${getStatusColor(match.status)}`}>
      <div className="match-header">
        <span className={`status-badge ${getStatusColor(match.status)}`}>
          {match.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="match-body">
        <div className="team-section">
          <div className="team-name">{match.team_a_name || 'Team A'}</div>
          <div className="score">{match.score_a}</div>
        </div>

        <div className="vs-divider">vs</div>

        <div className="team-section">
          <div className="team-name">{match.team_b_name || 'Team B'}</div>
          <div className="score">{match.score_b}</div>
        </div>
      </div>

      <div className="match-actions">
        <button className="btn-edit" onClick={() => onEdit(match)}>Edit</button>
        <button className="btn-delete" onClick={() => onDelete(match.id)}>Delete</button>
      </div>
    </div>
  )
}
