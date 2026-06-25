#!/bin/bash

# Integration Test Script for Footvolley Tournament
# This script validates the complete flow from database setup to API responses

set -e

echo "🧪 Starting Integration Tests..."
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend is running
echo -e "${YELLOW}Checking backend connection...${NC}"
if ! curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${RED}❌ Backend not running on http://localhost:3001${NC}"
    echo "Start backend with: cd backend && npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Backend is running${NC}"

# Test 1: Get all groups
echo -e "\n${YELLOW}Test 1: Fetching all groups...${NC}"
GROUPS=$(curl -s http://localhost:3001/api/groups)
if echo "$GROUPS" | grep -q "Grupo 1"; then
    echo -e "${GREEN}✅ Groups loaded successfully${NC}"
    echo "Response: $GROUPS" | head -c 100
else
    echo -e "${RED}❌ Failed to load groups${NC}"
    exit 1
fi

# Test 2: Get group details
echo -e "\n${YELLOW}Test 2: Fetching group 1 details...${NC}"
GROUP_1=$(curl -s http://localhost:3001/api/groups/1)
if echo "$GROUP_1" | grep -q "teams"; then
    echo -e "${GREEN}✅ Group details retrieved${NC}"
else
    echo -e "${YELLOW}⚠️  Group details incomplete (might need to seed)${NC}"
fi

# Test 3: Get group matches
echo -e "\n${YELLOW}Test 3: Fetching group 1 matches...${NC}"
MATCHES=$(curl -s http://localhost:3001/api/groups/1/matches)
if echo "$MATCHES" | grep -q "team_a_id"; then
    echo -e "${GREEN}✅ Matches loaded successfully${NC}"
    MATCH_COUNT=$(echo "$MATCHES" | grep -o "team_a_id" | wc -l)
    echo "Total matches: $MATCH_COUNT"
else
    echo -e "${YELLOW}⚠️  No matches found (might need to seed)${NC}"
fi

# Test 4: Get standings
echo -e "\n${YELLOW}Test 4: Fetching group 1 standings...${NC}"
STANDINGS=$(curl -s http://localhost:3001/api/groups/1/standings)
if echo "$STANDINGS" | grep -q "team_name"; then
    echo -e "${GREEN}✅ Standings retrieved${NC}"
    TEAM_COUNT=$(echo "$STANDINGS" | grep -o "team_name" | wc -l)
    echo "Teams in standings: $TEAM_COUNT"
else
    echo -e "${YELLOW}⚠️  No standings found (might need to seed)${NC}"
fi

# Test 5: Create a test match
echo -e "\n${YELLOW}Test 5: Creating a test match...${NC}"
MATCH_RESPONSE=$(curl -s -X POST http://localhost:3001/api/matches \
  -H "Content-Type: application/json" \
  -d '{"groupId": 1, "teamAId": 1, "teamBId": 2}')

if echo "$MATCH_RESPONSE" | grep -q "team_a_id"; then
    echo -e "${GREEN}✅ Match created successfully${NC}"
    MATCH_ID=$(echo "$MATCH_RESPONSE" | grep -o '"id":[0-9]*' | head -1 | grep -o '[0-9]*')
    echo "Created match ID: $MATCH_ID"
else
    echo -e "${RED}❌ Failed to create match${NC}"
    echo "Response: $MATCH_RESPONSE"
fi

# Test 6: Update match
if [ ! -z "$MATCH_ID" ]; then
    echo -e "\n${YELLOW}Test 6: Updating match score...${NC}"
    UPDATE_RESPONSE=$(curl -s -X PUT http://localhost:3001/api/matches/$MATCH_ID \
      -H "Content-Type: application/json" \
      -d '{"scoreA": 2, "scoreB": 1, "status": "completed"}')
    
    if echo "$UPDATE_RESPONSE" | grep -q "score_a"; then
        echo -e "${GREEN}✅ Match updated successfully${NC}"
        echo "Scores: $(echo "$UPDATE_RESPONSE" | grep -o '"score_[ab"]*:[0-9]*' | head -2)"
    else
        echo -e "${RED}❌ Failed to update match${NC}"
    fi
fi

# Test 7: Get knockout matches
echo -e "\n${YELLOW}Test 7: Fetching knockout matches...${NC}"
KNOCKOUT=$(curl -s http://localhost:3001/api/knockout-matches)
if echo "$KNOCKOUT" | grep -q "stage"; then
    echo -e "${GREEN}✅ Knockout matches retrieved${NC}"
else
    echo -e "${YELLOW}⚠️  No knockout matches found${NC}"
fi

# Test 8: Get qualified teams
echo -e "\n${YELLOW}Test 8: Fetching qualified teams...${NC}"
QUALIFIED=$(curl -s http://localhost:3001/api/qualified-teams)
if echo "$QUALIFIED" | grep -q "team_name"; then
    echo -e "${GREEN}✅ Qualified teams retrieved${NC}"
    QUALIFIED_COUNT=$(echo "$QUALIFIED" | grep -o "team_name" | wc -l)
    echo "Qualified teams: $QUALIFIED_COUNT"
else
    echo -e "${YELLOW}⚠️  No qualified teams yet (complete more matches)${NC}"
fi

echo -e "\n========================================"
echo -e "${GREEN}✅ Integration tests completed!${NC}"
echo -e "\nNext steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test the Group Stage page"
echo "3. Test the Knockout Stage page"
echo "4. Verify real-time updates work"
echo "5. Test responsive design on mobile"
