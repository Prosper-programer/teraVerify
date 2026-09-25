const { pool } = require('./src/config/db');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const lands = [
  {
    id: uuidv4(),
    title: '1000m² Residential Plot in Odza',
    land_title_number: 'TF-2023-ODZA-001',
    description: 'Beautiful flat plot located in the heart of Odza, Yaoundé. Perfect for a family residence or an apartment building. Electricity and water access nearby.',
    region: 'Centre',
    division: 'Mfoundi',
    subdivision: 'Yaoundé IV',
    neighborhood: 'Odza',
    area_sq_m: 1000,
    price_fcfa: 15000000,
    unlock_fee_fcfa: 10000,
    land_type: 'residential',
    topography: 'flat',
    access_road: 'paved',
    images: JSON.stringify(["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80", "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"]),
    exact_location: JSON.stringify({ coordinates: { latitude: 3.8058, longitude: 11.5215 }, streetAddress: 'Carrefour Koweit, Odza', landmarkDescription: 'Behind the new pharmacy' }),
    seller_contact: JSON.stringify({ id: 'user-seller-01', name: 'Paul Njoya', phone: '+237 699 12 34 56', email: 'paul.njoya@example.com' }),
    verification_status: 'verified',
    is_published: true,
    is_featured: true,
    surveyor_notes: 'Land boundaries verified against cadastral map 12-A. No disputes recorded.',
    seller_id: 'user-seller-01'
  },
  {
    id: uuidv4(),
    title: 'Prime Commercial Land in Bonamoussadi',
    land_title_number: 'TF-2022-BONA-088',
    description: 'High visibility commercial plot situated on the main road in Bonamoussadi, Douala. Ideal for a shopping mall or office building.',
    region: 'Littoral',
    division: 'Wouri',
    subdivision: 'Douala V',
    neighborhood: 'Bonamoussadi',
    area_sq_m: 500,
    price_fcfa: 35000000,
    unlock_fee_fcfa: 15000,
    land_type: 'commercial',
    topography: 'flat',
    access_road: 'paved',
    images: JSON.stringify(["https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800&q=80"]),
    exact_location: JSON.stringify({ coordinates: { latitude: 4.0833, longitude: 9.7500 }, streetAddress: 'Avenue des Palmiers, Bonamoussadi', landmarkDescription: 'Next to Santa Lucia supermarket' }),
    seller_contact: JSON.stringify({ id: 'user-seller-02', name: 'Marie Ewane', phone: '+237 677 88 99 00', email: 'marie.ewane@example.com' }),
    verification_status: 'verified',
    is_published: true,
    is_featured: true,
    surveyor_notes: 'Commercial zoning confirmed. Title is clear of any mortgages.',
    seller_id: 'user-seller-01'
  },
  {
    id: uuidv4(),
    title: 'Agricultural Land near Lobé Falls',
    land_title_number: 'TF-2021-KRIBI-012',
    description: 'Vast agricultural expanse with rich red soil. Features river access, perfect for palm or rubber plantations.',
    region: 'Sud',
    division: 'Ocean',
    subdivision: 'Kribi I',
    neighborhood: 'Lobé',
    area_sq_m: 50000,
    price_fcfa: 20000000,
    unlock_fee_fcfa: 5000,
    land_type: 'agricultural',
    topography: 'gentle_slope',
    access_road: 'dirt_road',
    images: JSON.stringify(["https://images.unsplash.com/photo-1622353155792-75d3db7b0a85?w=800&q=80", "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&q=80"]),
    exact_location: JSON.stringify({ coordinates: { latitude: 2.8800, longitude: 9.9000 }, streetAddress: 'Route des Chutes, Lobé', landmarkDescription: '3km from the main waterfalls' }),
    seller_contact: JSON.stringify({ id: 'user-seller-03', name: 'Jean-Baptiste Mvondo', phone: '+237 655 44 33 22', email: 'jbmvondo@example.com' }),
    verification_status: 'verified',
    is_published: true,
    is_featured: true,
    surveyor_notes: 'Agricultural concession boundaries verified. Includes 500m of riverfront.',
    seller_id: 'user-seller-01'
  },
  {
    id: uuidv4(),
    title: 'Sea View Plot in Limbe',
    land_title_number: 'TF-2024-LIMBE-045',
    description: 'Elevated plot offering breathtaking views of the Atlantic Ocean. Perfect for a luxury villa or boutique hotel.',
    region: 'Sud-Ouest',
    division: 'Fako',
    subdivision: 'Limbe I',
    neighborhood: 'Down Beach',
    area_sq_m: 800,
    price_fcfa: 12000000,
    unlock_fee_fcfa: 10000,
    land_type: 'residential',
    topography: 'elevated',
    access_road: 'secondary',
    images: JSON.stringify(["https://images.unsplash.com/photo-1559825481-12a05cc00344?w=800&q=80"]),
    exact_location: JSON.stringify({ coordinates: { latitude: 4.0122, longitude: 9.2081 }, streetAddress: 'Ocean Drive, Down Beach', landmarkDescription: 'Opposite the old lighthouse' }),
    seller_contact: JSON.stringify({ id: 'user-seller-04', name: 'Peter Ndive', phone: '+237 688 11 22 33', email: 'peter.ndive@example.com' }),
    verification_status: 'under_review',
    is_published: true,
    is_featured: false,
    surveyor_notes: null,
    seller_id: 'user-seller-01'
  }
];

async function seed() {
  try {
    console.log('Seeding lands...');
    
    // First, let's make sure a user exists for the seller_id foreign key
    await pool.query(`
      INSERT IGNORE INTO users (id, full_name, email, phone, role) 
      VALUES ('user-seller-01', 'Test Seller', 'seller@test.com', '+237600000000', 'seller')
    `);

    for (const land of lands) {
      const keys = Object.keys(land);
      const values = Object.values(land);
      const placeholders = keys.map(() => '?').join(', ');
      
      const query = `
        INSERT IGNORE INTO lands (${keys.join(', ')}) 
        VALUES (${placeholders})
      `;
      
      await pool.query(query, values);
      console.log(`Inserted: ${land.title}`);
    }
    console.log('Seeding complete!');
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    process.exit();
  }
}

seed();
