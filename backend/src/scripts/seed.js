import { pool, query } from '../config/db.js';

const CATEGORIES = [
  ['Electronics', 'electronics', 'cpu'],
  ['Vehicles', 'vehicles', 'car'],
  ['Furniture', 'furniture', 'sofa'],
  ['Cameras', 'cameras', 'camera'],
  ['Laptops', 'laptops', 'laptop'],
  ['Mobile Phones', 'mobile-phones', 'smartphone'],
  ['Books', 'books', 'book-open'],
  ['Appliances', 'appliances', 'washing-machine'],
  ['Gaming', 'gaming', 'gamepad-2'],
  ['Musical Instruments', 'musical-instruments', 'guitar'],
  ['Fashion', 'fashion', 'shirt'],
  ['Sports Equipment', 'sports-equipment', 'dumbbell'],
  ['Fitness Equipment', 'fitness-equipment', 'activity'],
  ['Photography Equipment', 'photography-equipment', 'aperture'],
  ['Tools', 'tools', 'wrench'],
  ['Party Supplies', 'party-supplies', 'party-popper'],
  ['Home Decor', 'home-decor', 'lamp'],
  ['Camping Gear', 'camping-gear', 'tent'],
  ['Office Equipment', 'office-equipment', 'printer'],
  ['Baby Products', 'baby-products', 'baby'],
];

async function seed() {
  console.log('Seeding categories...');
  for (let i = 0; i < CATEGORIES.length; i++) {
    const [name, slug, icon] = CATEGORIES[i];
    await query(
      `INSERT INTO categories (name, slug, icon, display_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (slug) DO NOTHING`,
      [name, slug, icon, i]
    );
  }
  console.log(`Seeded ${CATEGORIES.length} categories.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
