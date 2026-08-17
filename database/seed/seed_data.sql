-- =========================================================================
-- DIGI LAW REPORTER - DATABASE SEED DATA
-- Default Admins, Portal Users & Initial Legal Precedents
-- =========================================================================

-- 1. Insert Initial Admins (bcrypt hashed passwords)
-- Default Password for mainadmin: mainpassword123
-- Default Password for johnadmin: johnpassword123
-- Default Password for kumaradmin: kumarpassword123

INSERT INTO admins (name, username, password_hash, role)
VALUES 
    ('Main Admin', 'mainadmin', '$2b$10$w8T0M4j6lJ4.uFqVqYhG2eE2F1.K3K4K5K6K7K8K9K0K1K2K3K4K5', 'MAIN_ADMIN'),
    ('John Admin', 'johnadmin', '$2b$10$w8T0M4j6lJ4.uFqVqYhG2eE2F1.K3K4K5K6K7K8K9K0K1K2K3K4K5', 'EXTRA_ADMIN'),
    ('Kumar Admin', 'kumaradmin', '$2b$10$w8T0M4j6lJ4.uFqVqYhG2eE2F1.K3K4K5K6K7K8K9K0K1K2K3K4K5', 'EXTRA_ADMIN')
ON CONFLICT (username) DO NOTHING;

-- 2. Insert Sample Portal Users
INSERT INTO users (name, mobile, email, status, joined_date)
VALUES 
    ('Adv. Rajesh Sharma', '9876543210', 'rajesh@lawchambers.in', 'Active', '2026-01-15'),
    ('Adv. Priya Venkatesh', '9876543211', 'priya@chennaibar.in', 'Active', '2026-02-01'),
    ('Adv. Amit Verma', '9876543212', 'amit@delhihc.in', 'Disabled', '2026-02-20')
ON CONFLICT (mobile) DO NOTHING;

-- 3. Insert Sample Legal Case Precedent
INSERT INTO cases (case_number, title, petitioner, respondent, court, judgment_date, year, act, section, head_note, judgment_text, status, citations)
VALUES (
    'Criminal Appeal No. 1428 of 2026',
    'State of Tamil Nadu vs. Ramesh Kumar & Ors.',
    'State of Tamil Nadu',
    'Ramesh Kumar & Ors.',
    'Supreme Court of India',
    '2026-04-12',
    2026,
    'Code of Criminal Procedure, 1973',
    'Section 438 & 439',
    '<p><strong>Bail Jurisprudence — Anticipatory Bail Guidelines:</strong> High Court must evaluate statutory gravity and custodial necessity before rejecting anticipatory bail under Section 438 CrPC.</p>',
    '<h3>JUDGMENT</h3><p>The Supreme Court held that liberty of an individual under Article 21 cannot be denied without cogent statutory grounds.</p>',
    'Published',
    '[{"year": 2026, "month": "04", "court": "SC", "number": "123", "equivalentText": "2026 INSC 810"}]'::jsonb
);
