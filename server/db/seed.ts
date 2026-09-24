import { query } from './index.js';

export const SEED_RESOURCES = [
  {
    name: 'City Central Trauma Hospital & Emergency Care',
    resource_type: 'emergency_department',
    address: '100 Medical Center Blvd, Metro City',
    phone: '+1-800-555-0101',
    website: 'https://emergency.example.org',
    latitude: 37.7749,
    longitude: -122.4194,
    opening_hours: { monday_sunday: '24/7 Open' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'St. Jude General Hospital',
    resource_type: 'hospital',
    address: '450 Healthcare Ave, Metro City',
    phone: '+1-800-555-0102',
    website: 'https://stjude-hospital.example.org',
    latitude: 37.7833,
    longitude: -122.4167,
    opening_hours: { monday_sunday: '24/7 Open' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Rapid Response Paramedic Ambulance Service',
    resource_type: 'ambulance',
    address: 'Dispatcher Station 4, 12 Fleet Way',
    phone: '+1-800-555-0103',
    website: 'https://rapid-ambulance.example.org',
    latitude: 37.7790,
    longitude: -122.4200,
    opening_hours: { monday_sunday: '24/7 Dispatch' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Metro Regional Blood Bank & Plasma Center',
    resource_type: 'blood_bank',
    address: '88 Red Cross Lane, Metro City',
    phone: '+1-800-555-0104',
    website: 'https://metrobloodbank.example.org',
    latitude: 37.7695,
    longitude: -122.4467,
    opening_hours: { monday_sunday: '8:00 AM - 10:00 PM (Emergency 24/7)' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'CarePlus 24-Hour Urgent Pharmacy',
    resource_type: 'pharmacy',
    address: '320 Main St, Suite A, Metro City',
    phone: '+1-800-555-0105',
    website: 'https://careplus-rx.example.org',
    latitude: 37.7810,
    longitude: -122.4080,
    opening_hours: { monday_sunday: '24 Hours' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'District Central Police Station',
    resource_type: 'police_station',
    address: '850 Bryant St, Metro City',
    phone: '+1-800-555-0106',
    website: 'https://police.metrocity.example.gov',
    latitude: 37.7725,
    longitude: -122.4048,
    opening_hours: { monday_sunday: '24/7 Operational' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Metro City Fire & Rescue Station #1',
    resource_type: 'fire_station',
    address: '935 Folsom St, Metro City',
    phone: '+1-800-555-0107',
    website: 'https://fire.metrocity.example.gov',
    latitude: 37.7788,
    longitude: -122.4063,
    opening_hours: { monday_sunday: '24/7 Ready' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Apex Pediatric Emergency Department',
    resource_type: 'emergency_department',
    address: '220 Childrens Way, Metro City',
    phone: '+1-800-555-0108',
    website: 'https://apexpediatric.example.org',
    latitude: 37.7650,
    longitude: -122.4300,
    opening_hours: { monday_sunday: '24/7 Open' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Lifeline Mobile Intensive Care Unit',
    resource_type: 'ambulance',
    address: 'East Hub Station, 55 Bay Blvd',
    phone: '+1-800-555-0109',
    website: 'https://lifeline-icu.example.org',
    latitude: 37.7900,
    longitude: -122.3950,
    opening_hours: { monday_sunday: '24/7 Dispatch' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'All-Hours Wellness Emergency Pharmacy',
    resource_type: 'pharmacy',
    address: '1090 Market St, Metro City',
    phone: '+1-800-555-0110',
    website: 'https://allhourswellness.example.org',
    latitude: 37.7805,
    longitude: -122.4120,
    opening_hours: { monday_sunday: '24/7 Open' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'Harbor Fire Station & Water Rescue',
    resource_type: 'fire_station',
    address: 'Pier 22.5 The Embarcadero, Metro City',
    phone: '+1-800-555-0111',
    website: 'https://harborfire.metrocity.example.gov',
    latitude: 37.7892,
    longitude: -122.3880,
    opening_hours: { monday_sunday: '24/7 Active' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  },
  {
    name: 'North Precinct Police Station',
    resource_type: 'police_station',
    address: '201 Broadway, Metro City',
    phone: '+1-800-555-0112',
    website: 'https://northpolice.metrocity.example.gov',
    latitude: 37.7980,
    longitude: -122.4040,
    opening_hours: { monday_sunday: '24/7 Active' },
    emergency_available: true,
    source: 'Demo Data',
    verified_at: new Date().toISOString()
  }
];

export async function seedResources(): Promise<void> {
  console.log('[Seed] Seeding initial emergency resources...');
  const existing = await query('SELECT id FROM emergency_resources LIMIT 1');
  if (existing.rowCount > 0) {
    console.log('[Seed] Resources already present, skipping seed.');
    return;
  }

  for (const res of SEED_RESOURCES) {
    await query(
      `INSERT INTO emergency_resources
        (name, resource_type, address, phone, website, latitude, longitude, opening_hours, emergency_available, source, verified_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        res.name,
        res.resource_type,
        res.address,
        res.phone,
        res.website,
        res.latitude,
        res.longitude,
        JSON.stringify(res.opening_hours),
        res.emergency_available,
        res.source,
        res.verified_at
      ]
    );
  }
  console.log(`[Seed] Successfully seeded ${SEED_RESOURCES.length} emergency resources.`);
}

// If run directly via tsx server/db/seed.ts
if (process.argv[1]?.includes('seed.ts')) {
  import('./index.js').then(async ({ initDb }) => {
    await initDb();
    await seedResources();
    console.log('[Seed] Database seed completed successfully.');
    process.exit(0);
  }).catch((err) => {
    console.error('[Seed] Error during seeding:', err);
    process.exit(1);
  });
}
