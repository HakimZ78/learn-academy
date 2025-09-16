// Test nodemailer import
const nodemailer = require('nodemailer');

console.log('Nodemailer type:', typeof nodemailer);
console.log('Nodemailer keys:', Object.keys(nodemailer));
console.log('createTransporter exists?:', typeof nodemailer.createTransporter);

// Try to create a test transporter
try {
  const transporter = nodemailer.createTransporter({
    host: 'localhost',
    port: 25
  });
  console.log('✅ Transporter created successfully');
} catch (error) {
  console.log('❌ Error creating transporter:', error.message);
}