const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Generate vitals every 15 minutes for a given date range
function generateVitals(startDate, endDate, baseBpm = 70, baseBp = '120/80') {
  const vitals = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  
  while (current <= end) {
    // Add some random variation to make it realistic
    const bpm = baseBpm + Math.floor(Math.random() * 10) - 5; // ±5 BPM variation
    const bpSystolic = 120 + Math.floor(Math.random() * 20) - 10; // ±10 variation
    const bpDiastolic = 80 + Math.floor(Math.random() * 10) - 5; // ±5 variation
    const bp = `${bpSystolic}/${bpDiastolic}`;
    
    vitals.push({
      bpm,
      bp,
      timestamp: new Date(current).toISOString()
    });
    
    // Add 15 minutes
    current.setMinutes(current.getMinutes() + 15);
  }
  
  return vitals;
}

// Mock vitals data for each patient
// Patient 1: Vitals with EDGE CASES for testing grouping logic:
// - Exact start time (should be assigned)
// - Exact end time (should be assigned)
// - Just before start (should NOT be assigned - standalone)
// - Just after end (should NOT be assigned - standalone)
// - Middle of parent (should be assigned)
// - Overlapping parents (should go to most recent)
const vitalsData = {
  1: [
    // Surgery 1: 10:00-12:00 on Jan 15
    // EDGE CASES: exact start, middle, exact end
    { bpm: 72, bp: '120/80', timestamp: '2024-01-15T10:00:00Z' }, // EDGE: Exact start time
    { bpm: 74, bp: '122/82', timestamp: '2024-01-15T10:30:00Z' }, // Middle
    { bpm: 70, bp: '118/78', timestamp: '2024-01-15T11:00:00Z' }, // Middle
    { bpm: 68, bp: '115/75', timestamp: '2024-01-15T12:00:00Z' }, // EDGE: Exact end time
    
    // EDGE CASE: Just before Surgery 1 (should NOT be assigned - standalone)
    { bpm: 65, bp: '110/70', timestamp: '2024-01-15T09:59:00Z' },
    // EDGE CASE: Just after Surgery 1 (should NOT be assigned - standalone)
    { bpm: 67, bp: '112/72', timestamp: '2024-01-15T12:01:00Z' },
    
    // Emergency Room 1: 14:00-16:00 on Jan 15
    // EDGE CASES: exact start, middle, exact end
    { bpm: 75, bp: '125/82', timestamp: '2024-01-15T14:00:00Z' }, // EDGE: Exact start time
    { bpm: 77, bp: '128/85', timestamp: '2024-01-15T14:30:00Z' }, // Middle
    { bpm: 73, bp: '122/80', timestamp: '2024-01-15T15:00:00Z' }, // Middle
    { bpm: 71, bp: '120/78', timestamp: '2024-01-15T16:00:00Z' }, // EDGE: Exact end time
    
    // Surgery 2: 08:00-10:00 on Jan 16
    // EDGE CASES: exact start, middle, exact end
    { bpm: 70, bp: '118/78', timestamp: '2024-01-16T08:00:00Z' }, // EDGE: Exact start time
    { bpm: 68, bp: '115/75', timestamp: '2024-01-16T08:30:00Z' }, // Middle
    { bpm: 72, bp: '120/80', timestamp: '2024-01-16T09:00:00Z' }, // Middle
    { bpm: 70, bp: '118/78', timestamp: '2024-01-16T10:00:00Z' }, // EDGE: Exact end time
    
    // Emergency Room 2: 11:00-13:00 on Jan 16 (OVERLAPS with Surgery 2 end)
    // EDGE CASES: exact start, middle, exact end, overlap test
    { bpm: 78, bp: '130/85', timestamp: '2024-01-16T11:00:00Z' }, // EDGE: Exact start time
    { bpm: 76, bp: '128/83', timestamp: '2024-01-16T11:30:00Z' }, // Middle
    { bpm: 74, bp: '125/80', timestamp: '2024-01-16T12:00:00Z' }, // Middle
    { bpm: 72, bp: '122/78', timestamp: '2024-01-16T13:00:00Z' }, // EDGE: Exact end time
    
    // Surgery 3: 09:00-11:00 on Jan 17
    // EDGE CASES: exact start, middle, exact end
    { bpm: 71, bp: '119/79', timestamp: '2024-01-17T09:00:00Z' }, // EDGE: Exact start time
    { bpm: 69, bp: '116/76', timestamp: '2024-01-17T09:30:00Z' }, // Middle
    { bpm: 73, bp: '121/81', timestamp: '2024-01-17T10:00:00Z' }, // Middle
    { bpm: 71, bp: '119/79', timestamp: '2024-01-17T11:00:00Z' }  // EDGE: Exact end time
  ]
};

// GET /vitals/:patientId
app.get('/vitals/:patientId', (req, res) => {
  const patientId = parseInt(req.params.patientId);
  
  // 5% chance of returning 500 error (reduced from 10% to minimize warnings)
  if (Math.random() < 0.05) {
    return res.status(500).json({ 
      error: 'Vitals service temporarily unavailable',
      message: 'Internal server error'
    });
  }
  
  // Random delay between 1.5s and 2.5s
  const delay = 1500 + Math.random() * 1000;
  
  setTimeout(() => {
    const vitals = vitalsData[patientId] || [];
    res.json(vitals);
  }, delay);
});

app.listen(PORT, () => {
  console.log(`Mock Vitals Service running on port ${PORT}`);
});
