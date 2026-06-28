import '../styles/MatchCard.css'

const PencilIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm17.71-10.04a1 1 0 0 0 0-1.41L18.2 3.29a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 2-1.66z" />
  </svg>
)

const TrashIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 7h12l-1 14H7L6 7zm3-3h6l1 2H8l1-2zM4 6h16v2H4V6z" />
  </svg>
)

export const MatchCard = ({ match, onEdit, onDelete, compact = false, compactLabel = null }) => {
  const getStatusVariant = (status) => {
    return status === 'completed' ? 'completed' : 'pending'
  }

  const statusVariant = getStatusVariant(match.status)
  const statusLabel = statusVariant === 'completed' ? 'Completed' : 'Pending'

  if (compact) {
    const inlineLabel = compactLabel || match.group_name || 'Match'

    return (
      <div className={`match-card compact ${statusVariant}`}>
        <div className="match-line">
          <div className="match-info">
            <span className="group-inline">{inlineLabel}</span>
            <span className="team-inline">{match.team_a_name || 'Team A'}</span>
            <span className="score-inline">{match.score_a}</span>
            <span className="x-divider">X</span>
            <span className="score-inline">{match.score_b}</span>
            <span className="team-inline">{match.team_b_name || 'Team B'}</span>
          </div>
          <div className="match-meta">
            <span className={`status-inline ${statusVariant}`}>{statusLabel}</span>
            <div className="match-actions inline-actions">
              <button className="btn-edit" aria-label="Edit match" title="Edit match" onClick={() => onEdit(match)}>
                <PencilIcon />
              </button>
              <button className="btn-delete" aria-label="Delete match" title="Delete match" onClick={() => onDelete(match.id)}>
                <TrashIcon />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`match-card ${statusVariant}`}>
      <div className="match-header">
        <span className={`status-badge ${statusVariant}`}>
          {statusLabel.toUpperCase()}
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
        <button className="btn-edit" aria-label="Edit match" title="Edit match" onClick={() => onEdit(match)}>
          <PencilIcon />
        </button>
        <button className="btn-delete" aria-label="Delete match" title="Delete match" onClick={() => onDelete(match.id)}>
          <TrashIcon />
        </button>
      </div>
    </div>
  )
}
