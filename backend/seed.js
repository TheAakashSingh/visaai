// backend/seed.js - Run once to seed initial data
const mongoose = require('mongoose');
require('dotenv').config();

const { WeVisaCountry, WeVisaPackage } = require('./models/wevisaAdmin');

const COUNTRIES = [
  { name: 'United Arab Emirates', code: 'AE', flag: '🇦🇪', region: 'Middle East', capital: 'Abu Dhabi', isFeatured: true, isActive: true },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', region: 'Asia', capital: 'Singapore', isFeatured: true, isActive: true },
  { name: 'Vietnam', code: 'VN', flag: '🇻🇳', region: 'Asia', capital: 'Hanoi', isFeatured: true, isActive: true },
  { name: 'Thailand', code: 'TH', flag: '🇹🇭', region: 'Asia', capital: 'Bangkok', isActive: true },
  { name: 'Malaysia', code: 'MY', flag: '🇲🇾', region: 'Asia', capital: 'Kuala Lumpur', isActive: true },
  { name: 'Indonesia', code: 'ID', flag: '🇮🇩', region: 'Asia', capital: 'Jakarta', isActive: true },
  { name: 'Turkey', code: 'TR', flag: '🇹🇷', region: 'Europe', capital: 'Ankara', isActive: true },
  { name: 'UK', code: 'GB', flag: '🇬🇧', region: 'Europe', capital: 'London', isFeatured: true, isActive: true, isSchengen: false },
  { name: 'USA', code: 'US', flag: '🇺🇸', region: 'Americas', capital: 'Washington DC', isFeatured: true, isActive: true },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', region: 'Americas', capital: 'Ottawa', isActive: true },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', region: 'Oceania', capital: 'Canberra', isActive: true },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', region: 'Europe', capital: 'Berlin', isActive: true, isSchengen: true },
  { name: 'France', code: 'FR', flag: '🇫🇷', region: 'Europe', capital: 'Paris', isActive: true, isSchengen: true },
  { name: 'Italy', code: 'IT', flag: '🇮🇹', region: 'Europe', capital: 'Rome', isActive: true, isSchengen: true },
  { name: 'Spain', code: 'ES', flag: '🇪🇸', region: 'Europe', capital: 'Madrid', isActive: true, isSchengen: true },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', region: 'Europe', capital: 'Amsterdam', isActive: true, isSchengen: true },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', region: 'Asia', capital: 'Tokyo', isActive: true },
  { name: 'New Zealand', code: 'NZ', flag: '🇳🇿', region: 'Oceania', capital: 'Wellington', isActive: true },
  { name: 'Sri Lanka', code: 'LK', flag: '🇱🇰', region: 'Asia', capital: 'Sri Jayawardenepura Kotte', isActive: true },
  { name: 'Maldives', code: 'MV', flag: '🇲🇻', region: 'Asia', capital: 'Malé', isActive: true },
];

const PACKAGES = [
  // UAE
  { countryName: 'United Arab Emirates', countryFlag: '🇦🇪', countryCode: 'AE', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '60 Days', entries: 'single', processingTime: '4 Hours', price: 2499, agentCost: 1800, commission: 699, isExpress: true, isFeatured: true, isActive: true },
  { countryName: 'United Arab Emirates', countryFlag: '🇦🇪', countryCode: 'AE', name: '90 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '90 Days', entries: 'single', processingTime: '4 Hours', price: 4999, agentCost: 3800, commission: 1199, isActive: true },
  
  // Singapore
  { countryName: 'Singapore', countryFlag: '🇸🇬', countryCode: 'SG', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '60 Days', entries: 'single', processingTime: '24 Hours', price: 3999, agentCost: 2800, commission: 1199, isExpress: true, isFeatured: true, isActive: true },
  
  // Vietnam
  { countryName: 'Vietnam', countryFlag: '🇻🇳', countryCode: 'VN', name: '90 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '90 Days', entries: 'multiple', processingTime: '2 Hours', price: 1499, agentCost: 900, commission: 599, isExpress: true, isFeatured: true, isActive: true },
  { countryName: 'Vietnam', countryFlag: '🇻🇳', countryCode: 'VN', name: '30 Days E-Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: '2 Hours', price: 899, agentCost: 600, commission: 299, isExpress: true, isActive: true },
  
  // Thailand
  { countryName: 'Thailand', countryFlag: '🇹🇭', countryCode: 'TH', name: '60 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '60 Days', validity: '60 Days', entries: 'single', processingTime: '3-5 Days', price: 2999, agentCost: 2200, commission: 799, isActive: true },
  
  // Malaysia
  { countryName: 'Malaysia', countryFlag: '🇲🇾', countryCode: 'MY', name: '30 Days e-Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: '3-5 Days', price: 1999, agentCost: 1400, commission: 599, isActive: true },
  
  // Turkey
  { countryName: 'Turkey', countryFlag: '🇹🇷', countryCode: 'TR', name: '90 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '180 Days', entries: 'multiple', processingTime: '24 Hours', price: 3499, agentCost: 2600, commission: 899, isExpress: true, isActive: true },
  
  // Bali/Indonesia
  { countryName: 'Indonesia', countryFlag: '🇮🇩', countryCode: 'ID', name: '30 Days Visa on Arrival', visaType: 'Tourist', category: 'on_arrival', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: 'On Arrival', price: 2999, agentCost: 2200, commission: 799, isActive: true },
  
  // UK
  { countryName: 'UK', countryFlag: '🇬🇧', countryCode: 'GB', name: 'Standard Visitor Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '2 Years', entries: 'multiple', processingTime: '3 Weeks', price: 15000, agentCost: 12000, commission: 3000, isActive: true },
  
  // USA
  { countryName: 'USA', countryFlag: '🇺🇸', countryCode: 'US', name: 'B1/B2 Tourist Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '10 Years', entries: 'multiple', processingTime: '14 Days', price: 25000, agentCost: 20000, commission: 5000, isActive: true },
  
  // Canada
  { countryName: 'Canada', countryFlag: '🇨🇦', countryCode: 'CA', name: 'Tourist Visa', visaType: 'Tourist', category: 'sticker', stayDuration: '6 Months', validity: '10 Years', entries: 'multiple', processingTime: '4-6 Weeks', price: 12000, agentCost: 9000, commission: 3000, isActive: true },
  
  // Australia
  { countryName: 'Australia', countryFlag: '🇦🇺', countryCode: 'AU', name: 'Tourist Visa Subclass 600', visaType: 'Tourist', category: 'sticker', stayDuration: '3 Months', validity: '1 Year', entries: 'multiple', processingTime: '4-6 Weeks', price: 18000, agentCost: 14500, commission: 3500, isActive: true },
  
  // Germany (Schengen)
  { countryName: 'Germany', countryFlag: '🇩🇪', countryCode: 'DE', name: 'Short Stay Visa', visaType: 'Tourist', category: 'appointment', stayDuration: '90 Days', validity: '90 Days', entries: 'single', processingTime: '15 Days', price: 8000, agentCost: 6500, commission: 1500, isActive: true, isSchengen: true },
  
  // France (Schengen)
  { countryName: 'France', countryFlag: '🇫🇷', countryCode: 'FR', name: 'Short Stay Visa', visaType: 'Tourist', category: 'appointment', stayDuration: '90 Days', validity: '90 Days', entries: 'single', processingTime: '15 Days', price: 8500, agentCost: 7000, commission: 1500, isActive: true, isSchengen: true },
  
  // Japan
  { countryName: 'Japan', countryFlag: '🇯🇵', countryCode: 'JP', name: 'Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '90 Days', validity: '90 Days', entries: 'multiple', processingTime: '5-7 Days', price: 4999, agentCost: 3800, commission: 1199, isActive: true },
  
  // Maldives
  { countryName: 'Maldives', countryFlag: '🇲🇻', countryCode: 'MV', name: '30 Days Tourist Visa', visaType: 'Tourist', category: 'evisa', stayDuration: '30 Days', validity: '30 Days', entries: 'single', processingTime: '1-2 Days', price: 3999, agentCost: 3000, commission: 999, isActive: true },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/visaai');
    console.log('Connected to MongoDB');
    
    // Clear existing
    await WeVisaCountry.deleteMany({});
    await WeVisaPackage.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert countries
    const countryDocs = await WeVisaCountry.insertMany(COUNTRIES);
    console.log(`Inserted ${countryDocs.length} countries`);
    
    // Insert packages
    await WeVisaPackage.insertMany(PACKAGES);
    console.log(`Inserted ${PACKAGES.length} packages`);
    
    console.log('✅ Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();