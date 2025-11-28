// In production swap with an email provider (SendGrid, Mailgun, SES)
exports.sendResetEmail = async ({ to, subject, text }) => {
  console.log('--- mock email ---');
  console.log('to:', to);
  console.log('subject:', subject);
  console.log('text:', text);
  console.log('--- end mock email ---');
  return true;
};
