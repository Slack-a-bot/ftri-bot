const { App } = require('@slack/bolt');
require('dotenv').config();
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  // socketMode: true, // enable the following to use socket mode
  // appToken: process.env.APP_TOKEN,
});
const store = [];
const conversation = [];

app.command('/knowledge', async ({ command, ack, say }) => {
  try {
    await ack();
    say('Conversation stored');
  } catch (error) {
    console.log('err');
    console.error(error);
  }
});

(async () => {
  await app.start(process.env.PORT || 5000);
  console.log('⚡️ Bolt app is running!');
})();
