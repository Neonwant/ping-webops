const { WebClient } = require('@slack/client');
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser')
const request = require('request');
const qs = require('querystring');

const port = 9000;
const SLACK_TOKEN = 'secret';
const CLIENT_ID = 'secret';
const CLIENT_SECRET = 'secret';

const app = express();
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

app.use(express.static('/views'));
app.use(bodyParser.json());
app.use(
  session({
    secret: 'adsasd-rwerwer-sfdsdf', // generate uuid 
    cookie: { maxAge: 30000 },
    resave: false,
    saveUninitialized: false,
  }
))

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "*");
  next();
});

app.post('/postMessage', (req, res) => {
  sendMessage(req.body)
  res.send()
})

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/login', (req, res) => {
  const url = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${CLIENT_ID}`;
  res.redirect(url);
});

app.get('/redirect', (req, res) => {
  console.log('Request sent by GitHub: ', req.query);

  const code = req.query.code;
  const returnedState = req.query.state;

  request.post(`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&code=${code}&state=${returnedState}`,
  (error, response, body) => {
    console.log('Access Token: ', qs.parse(body));

    req.session.access_token = qs.parse(body).access_token;
    res.redirect('/user_info');
  });
  // 
});

app.get('/user_info', (req, res) => {
  request.get(
    {
      url: 'https://api.github.com/user/public_emails',
      headers: {
        Authorization: 'token ' + req.session.access_token,
        'User-Agent': 'Login-App'
      }
    },
    (error, response, body) => {
      res.send(
        "<p>You're logged in! Here's all your emails on GitHub: </p>" +
        body +
        '<p>Go back to <a href="/">log in page</a>.</p>'
      );
    }
  );
});

app.listen(port, () => console.log(`Ping webops app is listening on port ${port}!`));