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

app.message('store conversation id', async ({ message, say }) => {
  try {
    const result = await app.client.conversations.list({
      token: process.env.SLACK_BOT_TOKEN,
    });
    for (const channel of result.channels) {
      store.push(channel.id);
    }
    console.log(store);
  } catch (error) {
    console.error(error);
  }
});

app.message('store conversation', async ({ message, say }) => {
  try {
    for (let i = 0; i < store.length; i += 1) {
      const result = await app.client.conversations.history({
        channel: store[i],
      });
      conversation.push(result.messages);
    }
  } catch (error) {
    console.error(error);
  }
});

app.message('knock knock', async ({ message, say }) => {
  await say(`_Who's there?_`);
});

(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
