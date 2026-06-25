# Database Schema - Footvolley Tournament

## Tables

### 1. groups
```sql
CREATE TABLE groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. teams
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. group_matches
```sql
CREATE TABLE group_matches (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  team_a_id INTEGER NOT NULL REFERENCES teams(id),
  team_b_id INTEGER NOT NULL REFERENCES teams(id),
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. standings
```sql
CREATE TABLE standings (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES groups(id),
  team_id INTEGER NOT NULL REFERENCES teams(id),
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  position INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(group_id, team_id)
);
```

### 5. knockout_matches
```sql
CREATE TABLE knockout_matches (
  id SERIAL PRIMARY KEY,
  stage VARCHAR(50) NOT NULL, -- semifinal, final
  team_a_id INTEGER REFERENCES teams(id),
  team_b_id INTEGER REFERENCES teams(id),
  score_a INTEGER DEFAULT 0,
  score_b INTEGER DEFAULT 0,
  winner_id INTEGER REFERENCES teams(id),
  status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
  scheduled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Relationships
- **groups** → **teams** (1:N)
- **groups** → **group_matches** (1:N)
- **teams** → **group_matches** (1:N)
- **groups** → **standings** (1:N)
- **teams** → **standings** (1:N)
- **teams** → **knockout_matches** (1:N)

## Initial Data (from image)
```
Grupo 1: Patrick e Caiafa, Andresil e MG10, Simão e Vinicius, ET e PP
Grupo 2: Sérgio e João, Brunão e Edu, Sávio e Dani, Adjan e Caue
Grupo 3: Igor e Nilo, Pinha e Toco, Caio e Cachaça, Romero e Gui
```
