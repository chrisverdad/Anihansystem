import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import WasteType from '../models/WasteType.js';
import WasteCategory from '../models/WasteCategory.js';
import WasteSubmission from '../models/WasteSubmission.js';
import SourceWasteSubmission from '../models/SourceWasteSubmission.js';
import InventoryItem from '../models/InventoryItem.js';
import { DEMO_WASTE_TYPE_IMAGES } from '../constants/demoMedia.js';

dotenv.config();

const waitForDatabase = async (maxAttempts = 20): Promise<void> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await pool.execute('SELECT 1');
      await pool.execute('SELECT 1 FROM users LIMIT 1');
      return;
    } catch (e) {
      if (i === maxAttempts - 1) throw e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }
};

const seedData = async (): Promise<void> => {
  try {
    console.log('Waiting for database...');
    await waitForDatabase();
    console.log('Starting database seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await WasteType.deleteMany({});
    await WasteCategory.deleteMany({});
    await WasteSubmission.deleteMany({});
    await SourceWasteSubmission.deleteMany({});
    await InventoryItem.deleteMany({});

    console.log('Cleared existing data...');

    const hashedAdminPassword = bcrypt.hashSync('admin123', 10);
    const hashedVendorPassword = bcrypt.hashSync('vendor123', 10);
    const hashedUserPassword = bcrypt.hashSync('user123', 10);

    const user1 = await User.create({
      email: 'admin@anihan.com',
      password: hashedAdminPassword,
      full_name: 'Admin User',
      role: 'admin',
      phone: '+63 912 345 6789',
      address: 'Butuan City, Agusan del Norte',
      is_active: true
    });

    const user2 = await User.create({
      email: 'vendor@anihan.com',
      password: hashedVendorPassword,
      full_name: 'Maria Santos',
      role: 'vendor',
      phone: '+63 912 345 6787',
      address: 'Public Market, Butuan City',
      is_active: true,
      vendor_status: 'approved',
      business_name: 'Santos Farm Produce',
      business_type: 'Farm',
      years_in_business: '5'
    });

    const user3 = await User.create({
      email: 'user@anihan.com',
      password: hashedUserPassword,
      full_name: 'Pedro Garcia',
      role: 'user',
      phone: '+63 912 345 6786',
      address: 'Residential Area, Butuan City',
      is_active: true
    });

    const user4 = await User.create({
      email: 'vendor2@anihan.com',
      password: hashedVendorPassword,
      full_name: 'Juan Dela Cruz',
      role: 'vendor',
      phone: '+63 912 345 6785',
      address: 'Farmers Market, Butuan City',
      is_active: true,
      vendor_status: 'approved',
      business_name: 'Dela Cruz Market',
      business_type: 'Market',
      years_in_business: '3'
    });

    const user5 = await User.create({
      email: 'vendor3@anihan.com',
      password: hashedVendorPassword,
      full_name: 'Ana Rodriguez',
      role: 'vendor',
      phone: '+63 912 345 6784',
      address: 'Central Market, Butuan City',
      is_active: true,
      vendor_status: 'approved',
      business_name: 'Rodriguez Organic Farm',
      business_type: 'Farm',
      years_in_business: '7'
    });

    const users = [user1, user2, user3, user4, user5];
    console.log(`Seeded ${users.length} users...`);

    const category1 = await WasteCategory.create({
      name: 'Fruits',
      description: 'Fresh and processed fruits',
      color: '#f59e0b',
      icon: 'SunIcon',
      is_active: true
    });

    const category2 = await WasteCategory.create({
      name: 'Vegetables',
      description: 'Fresh and processed vegetables',
      color: '#10b981',
      icon: 'SunIcon',
      is_active: true
    });

    const category3 = await WasteCategory.create({
      name: 'Grains',
      description: 'Rice, wheat, and other grains',
      color: '#8b5cf6',
      icon: 'CubeIcon',
      is_active: true
    });

    const wasteCategories = [category1, category2, category3];
    console.log(`Seeded ${wasteCategories.length} waste categories...`);

    const wasteType1 = await WasteType.create({
      name: 'Overripe Bananas',
      description: 'Bananas that are too ripe for sale',
      image_url: DEMO_WASTE_TYPE_IMAGES.bananas,
      category: 'fruit',
      damage_level: 'moderate'
    });

    const wasteType2 = await WasteType.create({
      name: 'Bruised Tomatoes',
      description: 'Tomatoes with minor bruises',
      image_url: DEMO_WASTE_TYPE_IMAGES.tomatoes,
      category: 'vegetable',
      damage_level: 'slight'
    });

    const wasteType3 = await WasteType.create({
      name: 'Damaged Mangoes',
      description: 'Mangoes with severe damage',
      image_url: DEMO_WASTE_TYPE_IMAGES.mangoes,
      category: 'fruit',
      damage_level: 'severe'
    });

    const wasteType4 = await WasteType.create({
      name: 'Wilted Lettuce',
      description: 'Lettuce that has started to wilt',
      image_url: DEMO_WASTE_TYPE_IMAGES.lettuce,
      category: 'vegetable',
      damage_level: 'moderate'
    });

    const wasteType5 = await WasteType.create({
      name: 'Damaged Apples',
      description: 'Apples with bruises and cuts',
      image_url: DEMO_WASTE_TYPE_IMAGES.apples,
      category: 'fruit',
      damage_level: 'moderate'
    });

    const wasteType6 = await WasteType.create({
      name: 'Overripe Papayas',
      description: 'Papayas that are too soft for sale',
      image_url: DEMO_WASTE_TYPE_IMAGES.papayas,
      category: 'fruit',
      damage_level: 'moderate'
    });

    const wasteTypes = [wasteType1, wasteType2, wasteType3, wasteType4, wasteType5, wasteType6];
    console.log(`Seeded ${wasteTypes.length} waste types...`);

    const product1 = await Product.create({
      name: 'Organic Banana Compost',
      description: 'Rich compost made from overripe bananas, perfect for organic gardening',
      price: 150,
      category: 'compost',
      image_url: DEMO_WASTE_TYPE_IMAGES.compost,
      stock_quantity: 25,
      unit: 'kg',
      is_available: true
    });

    const products = [product1];
    console.log(`Seeded ${products.length} product(s)...`);

    if (!user2?.id || !wasteType1?.id) throw new Error('Missing user or waste type for submissions');

    const submission1 = await WasteSubmission.create({
      user_id: user2.id,
      waste_type_id: wasteType1.id,
      quantity: 25,
      unit: 'kg',
      description: "Bananas from yesterday's harvest",
      status: 'pending',
      title: 'Overripe Bananas',
      category: 'fruit',
      condition: 'overripe'
    });

    const submission2 = await WasteSubmission.create({
      user_id: user2.id,
      waste_type_id: wasteType2!.id!,
      quantity: 15,
      unit: 'pieces',
      description: 'Tomatoes with minor bruises',
      status: 'approved',
      title: 'Bruised Tomatoes',
      category: 'vegetable',
      condition: 'slightly_damaged'
    });

    const submission3 = await WasteSubmission.create({
      user_id: user2.id,
      waste_type_id: wasteType3!.id!,
      quantity: 8,
      unit: 'pieces',
      description: 'Mangoes damaged during transport',
      status: 'processed',
      title: 'Damaged Mangoes',
      category: 'fruit',
      condition: 'bruised',
      processed_at: new Date('2024-12-13T19:30:00Z').toISOString()
    });

    const wasteSubmissions = [submission1, submission2, submission3];
    console.log(`Seeded ${wasteSubmissions.length} waste submissions...`);

    if (!user2.id || !user4?.id || !user5?.id || !category1?.id || !category2?.id)
      throw new Error('Missing ids for source submissions');

    const sourceSubmission1 = await SourceWasteSubmission.create({
      vendor_id: user2.id,
      category_id: category1.id,
      title: 'Overripe Bananas',
      description: "Bananas from yesterday's harvest that are too ripe for sale",
      quantity: 25,
      unit: 'kg',
      condition: 'overripe',
      location: 'Public Market, Butuan City',
      estimated_value: 500,
      image_url: DEMO_WASTE_TYPE_IMAGES.bananas,
      status: 'approved'
    });

    const sourceSubmission2 = await SourceWasteSubmission.create({
      vendor_id: user4.id,
      category_id: category2.id,
      title: 'Bruised Tomatoes',
      description: 'Tomatoes with minor bruises from transport',
      quantity: 15,
      unit: 'pieces',
      condition: 'slightly_damaged',
      location: 'Farmers Market, Butuan City',
      estimated_value: 300,
      image_url: DEMO_WASTE_TYPE_IMAGES.tomatoes,
      status: 'approved'
    });

    const sourceSubmission3 = await SourceWasteSubmission.create({
      vendor_id: user5.id,
      category_id: category1.id,
      title: 'Damaged Mangoes',
      description: 'Mangoes damaged during transport',
      quantity: 8,
      unit: 'pieces',
      condition: 'bruised',
      location: 'Central Market, Butuan City',
      estimated_value: 200,
      image_url: DEMO_WASTE_TYPE_IMAGES.mangoes,
      status: 'processed',
      processed_at: new Date('2024-12-13T19:30:00Z').toISOString()
    });

    const sourceWasteSubmissions = [sourceSubmission1, sourceSubmission2, sourceSubmission3];
    console.log(`Seeded ${sourceWasteSubmissions.length} source waste submissions...`);

    if (!sourceSubmission1?.id || !sourceSubmission2?.id || !sourceSubmission3?.id)
      throw new Error('Missing source submission ids');

    const inventory1 = await InventoryItem.create({
      vendor_id: user2.id,
      product_name: 'Banana Compost',
      description: 'High-quality compost made from overripe bananas',
      category: 'compost',
      quantity: 50,
      unit: 'kg',
      price_per_unit: 25,
      total_value: 1250,
      source_waste_submission_id: sourceSubmission1.id,
      image_url: DEMO_WASTE_TYPE_IMAGES.compost,
      is_available: true,
      quantity_history: [
        {
          adjustment_type: 'set',
          quantity_change: 50,
          previous_quantity: 0,
          new_quantity: 50,
          reason: 'Initial inventory creation',
          adjusted_by: 'Maria Santos',
          notes: 'Created from processed banana waste'
        }
      ]
    });

    const inventoryItems = [inventory1];
    console.log(`Seeded ${inventoryItems.length} inventory items...`);

    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

void seedData();
