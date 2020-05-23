const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(
  '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',
);

async function main() {
  try {
    const result = await sgMail.send({
      to: '27ugeen@gmail.com',
      from: '28ugeen@gmail.com',
      subject: 'Hello SendGrid',
      html: '<p>Hello SendGrid emailing<p>',
    });

    console.log(result);
  } catch (err) {
    console.log(err);
  }
}

main();

// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);
// const msg = {
//   to: 'test@example.com',
//   from: 'test@example.com',
//   subject: 'Sending with Twilio SendGrid is Fun',
//   text: 'and easy to do anywhere, even with Node.js',
//   html: '<strong>and easy to do anywhere, even with Node.js</strong>',
// };
// sgMail.send(msg);
