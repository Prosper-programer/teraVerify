const { pool } = require('./src/config/db');

async function updateImages() {
  try {
    console.log('Updating images in database...');
    
    await pool.query(
      `UPDATE lands SET images = ? WHERE land_title_number = 'TF-2023-ODZA-001'`,
      [JSON.stringify(["https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800&q=80"])]
    );
    console.log('Updated Odza');

    await pool.query(
      `UPDATE lands SET images = ? WHERE land_title_number = 'TF-2022-BONA-088'`,
      [JSON.stringify(["https://images.unsplash.com/photo-1590682680695-43b964a3ae17?w=800&q=80"])]
    );
    console.log('Updated Bonamoussadi');

    await pool.query(
      `UPDATE lands SET images = ? WHERE land_title_number = 'TF-2021-KRIBI-012'`,
      [JSON.stringify(["https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80"])]
    );
    console.log('Updated Kribi');

    await pool.query(
      `UPDATE lands SET images = ? WHERE land_title_number = 'TF-2024-LIMBE-045'`,
      [JSON.stringify(["https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80"])]
    );
    console.log('Updated Limbe');

    console.log('Images updated successfully!');
  } catch (error) {
    console.error('Error updating:', error);
  } finally {
    process.exit();
  }
}

updateImages();
