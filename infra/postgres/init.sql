-- Create tables for Service A - Registry

CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dob DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS surgeries (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    surgeon_name VARCHAR(255) NOT NULL,
    procedure VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS emergency_rooms (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    attending_physician VARCHAR(255) NOT NULL,
    chief_complaint VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: 1 patient with multiple timeline events (edge cases)
INSERT INTO patients (id, name, dob) VALUES
(1, 'John Doe', '1980-05-15')
ON CONFLICT (id) DO NOTHING;

-- Timeline Events (all for Patient 1) - 5 parent events with edge case children:
-- 1. Surgery: 2024-01-15 10:00-12:00 (with edge cases: exact start, exact end, middle)
-- 2. Emergency Room: 2024-01-15 14:00-16:00 (with edge cases: exact start, exact end, middle)
-- 3. Surgery: 2024-01-16 08:00-10:00 (with edge cases: exact start, exact end, middle)
-- 4. Emergency Room: 2024-01-16 11:00-13:00 (with edge cases: exact start, exact end, middle)
-- 5. Surgery: 2024-01-17 09:00-11:00 (with edge cases: exact start, exact end, middle)
-- Note: Also adding overlapping parents (Surgery 2 and ER 2 overlap) to test tie-breaker

INSERT INTO surgeries (id, patient_id, surgeon_name, procedure, start_time, end_time) VALUES
(1, 1, 'Dr. Sarah Williams', 'Appendectomy', '2024-01-15 10:00:00', '2024-01-15 12:00:00'),
(2, 1, 'Dr. Michael Chen', 'Knee Replacement', '2024-01-16 08:00:00', '2024-01-16 10:00:00'),
(3, 1, 'Dr. Robert Taylor', 'Hernia Repair', '2024-01-17 09:00:00', '2024-01-17 11:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO emergency_rooms (id, patient_id, attending_physician, chief_complaint, start_time, end_time) VALUES
(1, 1, 'Dr. James Wilson', 'Chest Pain', '2024-01-15 14:00:00', '2024-01-15 16:00:00'),
(2, 1, 'Dr. Emily Davis', 'Abdominal Pain', '2024-01-16 11:00:00', '2024-01-16 13:00:00')
ON CONFLICT (id) DO NOTHING;
