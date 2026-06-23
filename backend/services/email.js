/**
 * Mock email service for Phase 3.
 * In production, this would use nodemailer or a cloud email provider.
 */
async function sendVerificationEmail(email, token) {
  const verificationLink = `${process.env.HMS_FRONTEND_BASE_URL}/verify-email?token=${token}`;
  
  console.log('------------------------------------');
  console.log(`SENDING EMAIL TO: ${email}`);
  console.log(`SUBJECT: Verify your MediLink Account`);
  console.log(`LINK: ${verificationLink}`);
  console.log('------------------------------------');
  
  return true;
}

module.exports = {
  sendVerificationEmail
};
