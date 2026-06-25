# Integration & End-to-End Testing Guide

## Testing Checklist

### 1. Backend Database & API Testing

#### Database Setup
- [ ] Run migrations successfully
- [ ] Seed data loads correctly (3 groups, 12 teams)
- [ ] All 6 group matches per group created (18 total)
- [ ] Standings table initialized

#### Group Matches API
- [ ] GET `/api/groups` returns all 3 groups
- [ ] GET `/api/groups/:id/matches` returns matches for group
- [ ] POST `/api/matches` creates new match
- [ ] PUT `/api/matches/:id` updates score and status
- [ ] DELETE `/api/matches/:id` removes match
- [ ] Standings update when match marked as "completed"

#### Standings Calculation
- [ ] Team wins increment correctly
- [ ] Points calculated (3 per win, 0 for loss)
- [ ] Goals for/against tracked
- [ ] Teams sorted by points, then goals for
- [ ] GET `/api/groups/:id/standings` returns sorted standings

#### Knockout API
- [ ] GET `/api/qualified-teams` returns top 2 from each group
- [ ] POST `/api/create-knockout-bracket` generates semifinals
- [ ] POST `/api/knockout-matches` creates new knockout match
- [ ] PUT `/api/knockout-matches/:id` updates knockout score
- [ ] DELETE `/api/knockout-matches/:id` removes knockout match

#### WebSocket Integration
- [ ] Socket.io connects on client load
- [ ] Match update broadcasts to all clients
- [ ] Standings update broadcasts to all clients
- [ ] Multiple clients receive updates in real-time

### 2. Frontend Testing

#### Navigation
- [ ] App loads without errors
- [ ] Group Stage tab visible and clickable
- [ ] Knockout Stage tab visible and clickable
- [ ] Tab switching works smoothly

#### Group Stage Page
- [ ] All 3 groups load in selector
- [ ] Selecting group loads matches
- [ ] Match cards display team names, scores, status
- [ ] Status badges show (pending, in-progress, completed)
- [ ] Add Match button opens modal
- [ ] Edit Match button opens modal with data
- [ ] Delete Match shows confirmation
- [ ] Match form validates required fields
- [ ] Submitting form sends API request

#### Knockout Stage Page
- [ ] Qualified teams display (if any)
- [ ] "Auto-Generate Bracket" button visible when ready
- [ ] Bracket generation creates semifinals
- [ ] Semifinals display correctly
- [ ] Final match slot available
- [ ] Add/Edit/Delete knockout matches work

#### Real-time Updates
- [ ] Update match in Group Stage
- [ ] See standings update in real-time
- [ ] Open app in 2 browser windows
- [ ] Update match in one window
- [ ] Other window updates automatically

#### Responsive Design
- [ ] Desktop (1920px): All elements visible, no scrolling
- [ ] Tablet (768px): Grid collapses appropriately
- [ ] Mobile (375px): Single column layout
- [ ] Buttons are clickable on touch
- [ ] Modal fits on screen
- [ ] Text is readable

### 3. End-to-End User Scenarios

#### Scenario 1: Complete Group Stage
1. [ ] Load app
2. [ ] Navigate to Group Stage
3. [ ] Select Grupo 1
4. [ ] View all 6 matches
5. [ ] Click Edit on first match
6. [ ] Set scores (2-1)
7. [ ] Change status to "completed"
8. [ ] Submit form
9. [ ] Verify standings updated
10. [ ] Repeat for other matches
11. [ ] Verify final standings calculation

#### Scenario 2: Generate Knockout Bracket
1. [ ] Complete at least 1 match from each group
2. [ ] Navigate to Knockout Stage
3. [ ] See "qualified teams" preview
4. [ ] Click "Auto-Generate Bracket"
5. [ ] Verify semifinals created
6. [ ] Verify correct team pairings (1st vs 2nd cross-group)
7. [ ] Semifinals show all results

#### Scenario 3: Play Out Tournament
1. [ ] Complete all group matches
2. [ ] Generate knockout bracket
3. [ ] Update semifinal 1 scores
4. [ ] Mark semifinal 1 as completed
5. [ ] Set winner for semifinal 1
6. [ ] Repeat for other semifinals
7. [ ] Final match auto-populated with SF winners
8. [ ] Update final scores
9. [ ] Mark tournament complete

#### Scenario 4: Multi-Client Real-time
1. [ ] Open app in 2 browser windows
2. [ ] Arrange windows side by side
3. [ ] In window 1: Update a match score
4. [ ] In window 2: See standings update automatically
5. [ ] In window 1: Navigate to Knockout
6. [ ] In window 2: See bracket change in real-time

### 4. Performance Testing

- [ ] App loads in < 2 seconds
- [ ] API responses in < 500ms
- [ ] WebSocket events received within 100ms
- [ ] No memory leaks with websocket
- [ ] Can handle 10+ concurrent client connections
- [ ] 100+ matches handled smoothly

### 5. Error Handling

- [ ] Backend down: Show connection error
- [ ] Invalid form data: Show validation errors
- [ ] Delete without confirming: Nothing happens
- [ ] Network interruption: Attempt reconnect
- [ ] Duplicate team selection: Show error
- [ ] Missing scores: Show validation error

### 6. Data Integrity

- [ ] Standings recalculate correctly after edit
- [ ] Standings recalculate correctly after delete
- [ ] Knockout bracket based on accurate standings
- [ ] Match history preserved
- [ ] No data loss on refresh
- [ ] Concurrent updates don't corrupt data

## Running Tests

### Manual Testing
1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:3000`
4. Follow test cases above

### Quick Integration Test Flow
```bash
# Terminal 1: Backend
cd backend
npm run migrate
npm run seed
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev

# Browser: http://localhost:3000
# - Select Group 1
# - Edit first match: set scores 2-1, mark completed
# - Verify standings update
# - Check Console for WebSocket messages
# - Check Network tab for API calls
```

## Test Coverage Goals

- [ ] All 6 group matches per group work
- [ ] Standings calculate for all teams
- [ ] Qualified teams identified correctly
- [ ] Bracket generation creates proper semifinals
- [ ] All CRUD operations work
- [ ] WebSocket broadcasts to all clients
- [ ] Responsive on all screen sizes
- [ ] No JavaScript errors in console
- [ ] No 404 errors in network tab

## Browser Testing

- [ ] Chrome/Chromium (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Chrome
- [ ] Mobile Safari

## Known Limitations & Future Improvements

- Group stage only: Finals bracket would need additional logic
- Manual knockout match creation: Could auto-advance semifinal winners
- No authentication: Anyone can edit/delete
- No match history: Could add timestamp and undo functionality
- No scoring system: Simple win/loss, could add point system
- No tiebreaker logic: Head-to-head, goal differential
