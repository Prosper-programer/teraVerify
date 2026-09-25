const mysql = require('mysql2/promise');

const advisors = [
  {
    id: 'adv_001',
    full_name: 'Maître Jean-Paul Essomba',
    role_title: 'Senior Notary Public',
    years_of_experience: 15,
    bio: 'Maître Essomba has over 15 years of experience in property law and land registration in Cameroon. He specializes in securing land transactions and drafting foolproof sales agreements.',
    specialties: JSON.stringify(['Land Sales', 'Inheritance', 'Property Verification']),
    rating: 4.9,
    review_count: 124,
    consultation_fee_fcfa: 35000,
    available_days: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Friday']),
    available_hours: '09:00 - 17:00',
    phone: '+237 6 77 12 34 56',
    email: 'jp.essomba@notaire-cm.com',
    avatar_url: 'https://images.unsplash.com/photo-1520223297779-95bbd1ea79b7?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Yaoundé, Centre'
  },
  {
    id: 'adv_002',
    full_name: 'Mr. Amadou Njoya',
    role_title: 'Cadastral Engineer',
    years_of_experience: 8,
    bio: 'Certified cadastral engineer specializing in land boundary disputes, exact GPS delimitations, and official bornage plans required for the land titling process.',
    specialties: JSON.stringify(['Boundary Demarcation', 'Topographical Surveys', 'Title Splitting']),
    rating: 4.8,
    review_count: 89,
    consultation_fee_fcfa: 25000,
    available_days: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    available_hours: '10:00 - 16:00',
    phone: '+237 6 99 88 77 66',
    email: 'amadou.njoya@toposolutions.cm',
    avatar_url: 'https://images.unsplash.com/photo-1506277886134-2c5b18a309e6?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Douala, Littoral'
  },
  {
    id: 'adv_003',
    full_name: 'Dr. Samuel Eto\'o',
    role_title: 'Real Estate Attorney',
    years_of_experience: 12,
    bio: 'Specialist in complex land litigation and foreign investment in Cameroonian real estate. Ensures all your property acquisitions are 100% legally binding and indisputable.',
    specialties: JSON.stringify(['Litigation', 'Foreign Investment', 'Commercial Real Estate']),
    rating: 5.0,
    review_count: 210,
    consultation_fee_fcfa: 40000,
    available_days: JSON.stringify(['Tuesday', 'Thursday', 'Saturday']),
    available_hours: '09:00 - 13:00',
    phone: '+237 6 55 44 33 22',
    email: 'samuel.legal@etoopartners.cm',
    avatar_url: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Kribi, Sud'
  },
  {
    id: 'adv_004',
    full_name: 'Mr. Paul Atangana',
    role_title: 'Property Investment Expert',
    years_of_experience: 6,
    bio: 'Provides expert advice on land valuation, ROI projections for commercial developments, and navigating the administrative complexities of the Ministry of State Property and Land Tenure (MINDCAF).',
    specialties: JSON.stringify(['Land Valuation', 'Investment Strategy', 'MINDCAF Procedures']),
    rating: 4.7,
    review_count: 65,
    consultation_fee_fcfa: 20000,
    available_days: JSON.stringify(['Monday', 'Wednesday', 'Friday']),
    available_hours: '08:00 - 15:00',
    phone: '+237 6 77 99 11 22',
    email: 'paul.invest@camrealty.cm',
    avatar_url: 'https://images.unsplash.com/photo-1507114845802-0310ce5250af?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Yaoundé, Centre'
  },
  {
    id: 'adv_005',
    full_name: 'Mr. Alain Mveng',
    role_title: 'Senior Surveyor',
    years_of_experience: 20,
    bio: 'Highly experienced surveyor dedicated to coastal and agricultural lands in the South-West region. Fast, precise, and registered with the National Order of Surveyors.',
    specialties: JSON.stringify(['Coastal Lands', 'Agricultural Zoning', 'GPS Mapping']),
    rating: 4.9,
    review_count: 142,
    consultation_fee_fcfa: 30000,
    available_days: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
    available_hours: '09:00 - 17:00',
    phone: '+237 6 99 11 22 33',
    email: 'alain.mveng@surveys.cm',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    location: 'Limbe, Sud-Ouest'
  }
];

async function seedAdvisors() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'fuckyoushit',
    database: 'teraverify'
  });

  try {
    // Clear existing
    await connection.execute('DELETE FROM advisors');
    console.log('Cleared existing advisors.');

    for (const adv of advisors) {
      const [result] = await connection.execute(
        `INSERT INTO advisors (id, full_name, role_title, years_of_experience, bio, specialties, rating, review_count, consultation_fee_fcfa, available_days, available_hours, phone, email, avatar_url, location)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          adv.id, adv.full_name, adv.role_title, adv.years_of_experience, adv.bio, adv.specialties,
          adv.rating, adv.review_count, adv.consultation_fee_fcfa, adv.available_days, adv.available_hours,
          adv.phone, adv.email, adv.avatar_url, adv.location
        ]
      );
      console.log(`Inserted advisor: ${adv.full_name}`);
    }
    
    console.log('Successfully seeded 5 African advisors.');
  } catch (error) {
    console.error('Error seeding advisors:', error);
  } finally {
    await connection.end();
  }
}

seedAdvisors();
