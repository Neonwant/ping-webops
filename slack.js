const { WebClient } = require('@slack/client');
const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser')

const SLACK_TOKEN = 'xoxp-460933277351-459782866355-459150543264-78af1a875540b712f573d7e6be44d12f';

const web = new WebClient(SLACK_TOKEN);

const VladYuriyChannel = 'DDH4D2X08'
const TestChannel = 'CDH8QUA73'

const conversationId = VladYuriyChannel;

const createMessage = (pr, webops) => {
  let message = `Hey <@${webops}>,\nCould you, please, review this PR: ${pr}`;
  return message;
};

const sendMessage = ({ pr, webops }) => {
  // Sending message, see: https://api.slack.com/methods/chat.postMessage
  return web.chat.postMessage({ channel: conversationId, text: createMessage(pr, webops), as_user: true, link_names: true })
    .then((res) => {
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
}

app.use(bodyParser.json())

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

app.post('/postMessage', (req, res) => {
  sendMessage(req.body)
  res.send()
})

app.get('/', function(req, res){
  res.send('hello world');
});
