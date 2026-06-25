import '../styles/StandingsTable.css'

export const StandingsTable = ({ standings }) => {
  if (!standings || standings.length === 0) {
    return <div className="standings-empty">No standings data available</div>
  }

  return (
    <div className="standings-container">
      <h3>Standings</h3>
      <table className="standings-table">
        <thead>
          <tr>
            <th>Position</th>
            <th>Team</th>
            <th>W</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((team, index) => (
            <tr key={team.id} className={`standing-row position-${index + 1}`}>
              <td className="position-cell">{index + 1}</td>
              <td className="team-cell">{team.team_name}</td>
              <td className="stat-cell">{team.wins}</td>
              <td className="stat-cell">{team.losses}</td>
              <td className="stat-cell">{team.goals_for}</td>
              <td className="stat-cell">{team.goals_against}</td>
              <td className="stat-cell points">{team.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
