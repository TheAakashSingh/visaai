require('dotenv').config();
const connectDB = require('../config/db');
const { User, Lead, Knowledge, Settings } = require('../models');
const bcrypt = require('bcryptjs');

const seed = async () => {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Clear existing
  await Promise.all([User.deleteMany(), Lead.deleteMany(), Knowledge.deleteMany(), Settings.deleteMany()]);

  // Admin user
  const admin = await User.create({
    name: 'SinghJi Admin',
    email: 'admin@singhjitech.com',
    password: 'admin123',
    role: 'admin',
    company: 'SinghJi Tech',
    phone: '+91 98765 43210',
  });
  await Settings.create({ userId: admin._id });

  // Sample leads
  const leads = [
    { name: 'Rahul Sharma', phone: '+919820133411', email: 'rahul@gmail.com', visaType: 'student', destination: 'Canada', status: 'new', channel: 'whatsapp', priority: 'high' },
    { name: 'Priya Mehta', phone: '+918765432109', email: 'priya@gmail.com', visaType: 'work', destination: 'Germany', status: 'processing', channel: 'voice', priority: 'hot' },
    { name: 'Ankit Gupta', phone: '+917654321098', email: 'ankit@gmail.com', visaType: 'tourist', destination: 'Schengen', status: 'approved', channel: 'whatsapp', priority: 'medium' },
    { name: 'Sunita Rao', phone: '+916543210987', email: 'sunita@gmail.com', visaType: 'business', destination: 'USA', status: 'new', channel: 'voice', priority: 'medium' },
    { name: 'Vikram Singh', phone: '+915432109876', visaType: 'student', destination: 'UK', status: 'approved', channel: 'whatsapp', priority: 'low' },
    { name: 'Kavya Nair', phone: '+914321098765', visaType: 'pr', destination: 'Australia', status: 'processing', channel: 'voice', priority: 'high' },
    { name: 'Arun Patel', phone: '+913210987654', visaType: 'work', destination: 'UAE', status: 'rejected', channel: 'whatsapp', priority: 'low' },
    { name: 'Neha Kapoor', phone: '+912109876543', visaType: 'tourist', destination: 'Japan', status: 'new', channel: 'whatsapp', priority: 'medium' },
    { name: 'Rajan Verma', phone: '+911234567890', visaType: 'student', destination: 'New Zealand', status: 'new', channel: 'whatsapp', priority: 'high' },
    { name: 'Deepa Krishnan', phone: '+910987654321', visaType: 'work', destination: 'Singapore', status: 'contacted', channel: 'whatsapp', priority: 'hot' },
  ];
  await Lead.insertMany(leads);

  // Knowledge base
  const knowledgeItems = [
    { country: 'Canada', visaType: 'student', title: 'Canada Student Visa Requirements', category: 'requirement', content: 'Letter of Acceptance from DLI, IELTS 6.0+, proof of funds CAD 10,000+, valid passport, biometrics. Processing: 8-16 weeks. Fee: CAD 150.', tags: ['canada', 'student', 'study permit'] },
    { country: 'Germany', visaType: 'work', title: 'Germany Work Permit', category: 'requirement', content: 'Job offer or LMIA, German language B1/B2, recognized qualification, blocked account EUR 11,208. Processing: 4-8 weeks.', tags: ['germany', 'work', 'job seeker'] },
    { country: 'Schengen', visaType: 'tourist', title: 'Schengen Tourist Visa', category: 'requirement', content: 'Travel insurance EUR 30K min, hotel bookings, flight itinerary, bank statements, funds EUR 85+/day. Fee: EUR 80. Processing: 15 working days.', tags: ['schengen', 'europe', 'tourist'] },
    { country: 'UK', visaType: 'work', title: 'UK Skilled Worker Visa', category: 'requirement', content: 'Job offer from licensed UK sponsor, Certificate of Sponsorship, salary min GBP 26,200, IELTS B1 English. Fee: GBP 719. Processing: 3-8 weeks.', tags: ['uk', 'work', 'skilled worker'] },
    { country: 'Australia', visaType: 'student', title: 'Australia Student Visa', category: 'requirement', content: 'CoE from institution, IELTS 5.5-6.0+, funds AUD 21,041/year. Fee: AUD 620. Processing: 4-12 weeks.', tags: ['australia', 'student'] },
    { country: 'USA', visaType: 'student', title: 'USA F-1 Student Visa', category: 'requirement', content: 'I-20 from SEVIS school, IELTS 6.5+/TOEFL 80+, funds USD 20,000+/year, interview required. Fee: USD 160.', tags: ['usa', 'f1', 'student'] },
    { country: 'UAE', visaType: 'work', title: 'UAE Work Visa', category: 'requirement', content: 'Job offer from UAE employer, company sponsored, medical fitness test, Emirates ID. Processing: 2-4 weeks.', tags: ['uae', 'dubai', 'work'] },
    { country: 'New Zealand', visaType: 'student', title: 'NZ Student Visa', category: 'requirement', content: 'Offer from NZ institution, funds NZD 15,000/year, IELTS 5.5-6.5. Fee: NZD 330. Processing: 4-6 weeks.', tags: ['new zealand', 'student'] },
  ];
  await Knowledge.insertMany(knowledgeItems);

  console.log('✅ Seeding complete!');
  console.log('👤 Admin login: admin@singhjitech.com / admin123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
