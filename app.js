const { App } = require('@slack/bolt');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// console.log(path.join(__dirname, './test'))

const db = require('./models');
// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true, // enable the following to use socket mode
  appToken: 'xapp-1-A03BPGTNFE2-3428082172880-8ee0cd5fc0e2015e4df18c4c62b19520263438a8a1703606a354fe89421ed4f9'
});


// const createTable = 'CREATE TABLE emojis (id SERIAL PRIMARY KEY, emoji_name VARCHAR(50) NOT NULL UNIQUE, emoji_link VARCHAR(50) NOT NULL)'
const resetEmojisTable = 'DELETE FROM emojis'

const copy = "COPY achievements TO 'c:/Users/benmiProjects/ftri-bot/test'"
const user = "ALTER USER CURRENT_USER WITH SUPERUSER"


app.command('/downloademojis', async ({ command, ack, say }) => {
  try {
    await ack();
    const emojiObj = {};
    let emojiNames = '';
    let emojiLinks = '';
    let response = '';

    app.client.emoji.list({token: 'xoxb-3416795458433-3416860575505-APilObOnXKqVXuUiZV6YZ0HJ'})
    .then(data => {
      db.query(resetEmojisTable, (err, results) => {
        if(err) console.log(err);
        // console.log(results)
      })

      let emojiList = '';

      for(const emojiName in data.emoji) {
        emojiObj[emojiName] = data.emoji[emojiName];
        response += `${emojiName}, `
        // emojiNames += `'${emojiName}', `
        // emojiLinks += `'${data.emoji[emojiName]}', `
        emojiList += `('${emojiName}','${data.emoji[emojiName]}'), `
      }

      // emojiNames = emojiNames.slice(0, emojiNames.length - 2)
      // emojiLinks = emojiLinks.slice(0, emojiLinks.length - 2)
      emojiList = emojiList.slice(0, emojiList.length - 2)
      const addEmojis = `INSERT INTO emojis (emoji_name, emoji_link) VALUES ${emojiList}`
      db.query(addEmojis, (err, results) => {
        if(err) console.log(err);
        // console.log(results)
      })

      response = response.slice(0, response.length - 2)
      // console.log(emojiObj)
      say(`${response} successfully downloaded`)
      fs.writeFileSync(path.join(__dirname, './emojis'), JSON.stringify(emojiObj))
    })

  } catch (error) {
    console.log('err');
  }
});

app.command('/ben', async ({ command, ack, say }) => {
  try {
    await ack();
    console.log('works')
  } catch (error) {
    console.log('err');
  }
});

// app.event('message', async ({message, say}) => {
  // if(message.user === 'U03BW59GTQS') await say('STFU Michael');
  // if(message.user === 'U03BWR5DQCA') await say('Hi Jonathan');
  // if(message.user === 'U03BX07THS6') await say('Well spoken, Daljit');
  // if(message.user === 'U03BWRCT9NX') await say('Hey King');
// });

(async () => {
  const port = 3000;
  // Start your app
  await app.start(process.env.PORT || port);
  console.log(`⚡️ Slack Bolt app is running on port ${port}!`);
})();
