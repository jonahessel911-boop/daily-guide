require('dotenv').config({ override: true });
const { sendTestEmail } = require('../lib/postmark');

sendTestEmail()
  .then((result) => {
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.ok ? 0 : 1);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
