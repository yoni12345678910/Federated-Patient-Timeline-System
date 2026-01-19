#!/bin/bash

# Test script to verify all databases have expected data from seed files

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

echo "🧪 Testing Database Data..."
echo ""

# Test PostgreSQL - Patients
echo -n "Testing PostgreSQL - Patients (expected: 1)... "
PATIENTS=$(docker exec -i sheebah-timeline-postgres psql -U postgres -d registry -t -c "SELECT COUNT(*) FROM patients WHERE id = 1;" 2>/dev/null | tr -d ' ')
if [ "$PATIENTS" = "1" ]; then
    echo -e "${GREEN}✓ PASS${NC} (found: $PATIENTS)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (expected: 1, found: ${PATIENTS:-0})"
    ((FAILED++))
fi

# Test PostgreSQL - Surgeries
echo -n "Testing PostgreSQL - Surgeries (expected: 3)... "
SURGERIES=$(docker exec -i sheebah-timeline-postgres psql -U postgres -d registry -t -c "SELECT COUNT(*) FROM surgeries WHERE patient_id = 1;" 2>/dev/null | tr -d ' ')
if [ "$SURGERIES" = "3" ]; then
    echo -e "${GREEN}✓ PASS${NC} (found: $SURGERIES)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (expected: 3, found: ${SURGERIES:-0})"
    ((FAILED++))
fi

# Test PostgreSQL - Emergency Rooms
echo -n "Testing PostgreSQL - Emergency Rooms (expected: 2)... "
ER=$(docker exec -i sheebah-timeline-postgres psql -U postgres -d registry -t -c "SELECT COUNT(*) FROM emergency_rooms WHERE patient_id = 1;" 2>/dev/null | tr -d ' ')
if [ "$ER" = "2" ]; then
    echo -e "${GREEN}✓ PASS${NC} (found: $ER)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (expected: 2, found: ${ER:-0})"
    ((FAILED++))
fi

# Test MongoDB - Imaging Studies
echo -n "Testing MongoDB - Imaging Studies (expected: 17)... "
IMAGING=$(docker exec -i sheebah-timeline-mongodb mongosh pacs --quiet --eval "db.imaging.countDocuments({ patientId: 1 })" 2>/dev/null | tr -d ' ')
if [ "$IMAGING" = "17" ]; then
    echo -e "${GREEN}✓ PASS${NC} (found: $IMAGING)"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (expected: 17, found: ${IMAGING:-0})"
    ((FAILED++))
fi

# Test Mock Vitals Service
echo -n "Testing Mock Vitals Service - Health check... "
if curl -s -f http://localhost:3001/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PASS${NC} (service is running)"
    ((PASSED++))
    
    echo -n "Testing Mock Vitals Service - Vitals for patient 1 (expected: 22)... "
    VITALS_RESPONSE=$(curl -s http://localhost:3001/vitals/1 2>/dev/null)
    if [ ! -z "$VITALS_RESPONSE" ] && [ "$VITALS_RESPONSE" != "null" ]; then
        VITALS_COUNT=$(echo "$VITALS_RESPONSE" | grep -o '"timestamp"' | wc -l | tr -d ' ')
        if [ "$VITALS_COUNT" = "22" ]; then
            echo -e "${GREEN}✓ PASS${NC} (found: $VITALS_COUNT)"
            ((PASSED++))
        else
            echo -e "${RED}✗ FAIL${NC} (expected: 22, found: ${VITALS_COUNT:-0})"
            ((FAILED++))
        fi
    else
        echo -e "${RED}✗ FAIL${NC} (no data returned)"
        ((FAILED++))
    fi
else
    echo -e "${RED}✗ FAIL${NC} (service not responding)"
    ((FAILED++))
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
