-- EmergencyAssist AI Seed Data
-- Run this in Supabase SQL Editor to populate initial verified demo emergency services

INSERT INTO emergency_resources (name, resource_type, address, phone, website, latitude, longitude, opening_hours, emergency_available, source, verified_at)
VALUES
(
  'City Central Trauma Hospital & Emergency Care',
  'emergency_department',
  '100 Medical Center Blvd, Metro City',
  '+1-800-555-0101',
  'https://emergency.example.org',
  37.7749,
  -122.4194,
  '{"monday_sunday": "24/7 Open"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'St. Jude General Hospital',
  'hospital',
  '450 Healthcare Ave, Metro City',
  '+1-800-555-0102',
  'https://stjude-hospital.example.org',
  37.7833,
  -122.4167,
  '{"monday_sunday": "24/7 Open"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Rapid Response Paramedic Ambulance Service',
  'ambulance',
  'Dispatcher Station 4, 12 Fleet Way',
  '+1-800-555-0103',
  'https://rapid-ambulance.example.org',
  37.7790,
  -122.4200,
  '{"monday_sunday": "24/7 Dispatch"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Metro Regional Blood Bank & Plasma Center',
  'blood_bank',
  '88 Red Cross Lane, Metro City',
  '+1-800-555-0104',
  'https://metrobloodbank.example.org',
  37.7695,
  -122.4467,
  '{"monday_sunday": "8:00 AM - 10:00 PM (Emergency 24/7)"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'CarePlus 24-Hour Urgent Pharmacy',
  'pharmacy',
  '320 Main St, Suite A, Metro City',
  '+1-800-555-0105',
  'https://careplus-rx.example.org',
  37.7810,
  -122.4080,
  '{"monday_sunday": "24 Hours"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'District Central Police Station',
  'police_station',
  '850 Bryant St, Metro City',
  '+1-800-555-0106',
  'https://police.metrocity.example.gov',
  37.7725,
  -122.4048,
  '{"monday_sunday": "24/7 Operational"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Metro City Fire & Rescue Station #1',
  'fire_station',
  '935 Folsom St, Metro City',
  '+1-800-555-0107',
  'https://fire.metrocity.example.gov',
  37.7788,
  -122.4063,
  '{"monday_sunday": "24/7 Ready"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Apex Pediatric Emergency Department',
  'emergency_department',
  '220 Childrens Way, Metro City',
  '+1-800-555-0108',
  'https://apexpediatric.example.org',
  37.7650,
  -122.4300,
  '{"monday_sunday": "24/7 Open"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Lifeline Mobile Intensive Care Unit',
  'ambulance',
  'East Hub Station, 55 Bay Blvd',
  '+1-800-555-0109',
  'https://lifeline-icu.example.org',
  37.7900,
  -122.3950,
  '{"monday_sunday": "24/7 Dispatch"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'All-Hours Wellness Emergency Pharmacy',
  'pharmacy',
  '1090 Market St, Metro City',
  '+1-800-555-0110',
  'https://allhourswellness.example.org',
  37.7805,
  -122.4120,
  '{"monday_sunday": "24/7 Open"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'Harbor Fire Station & Water Rescue',
  'fire_station',
  'Pier 22.5 The Embarcadero, Metro City',
  '+1-800-555-0111',
  'https://harborfire.metrocity.example.gov',
  37.7892,
  -122.3880,
  '{"monday_sunday": "24/7 Active"}'::jsonb,
  true,
  'Demo Data',
  NOW()
),
(
  'North Precinct Police Station',
  'police_station',
  '201 Broadway, Metro City',
  '+1-800-555-0112',
  'https://northpolice.metrocity.example.gov',
  37.7980,
  -122.4040,
  '{"monday_sunday": "24/7 Active"}'::jsonb,
  true,
  'Demo Data',
  NOW()
);

-- Verify the inserted rows
SELECT id, name, resource_type, phone, emergency_available FROM emergency_resources;
