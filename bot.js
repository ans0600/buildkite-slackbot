const SlackBot = require("slackbots");
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const bot = new SlackBot({
  token: "xoxb-72869698775-NPC0xgEXlNuucElRdR5dzqem", // Add a bot https://my.slack.com/services/new/bot and put the token
  name: "buildkite-bot"
});

bot.on("start", function () {
  // more information about additional params https://api.slack.com/methods/chat.postMessage
  var params = {
    icon_emoji: ":cat:"
  };

  // // define channel, where bot exist. You can adjust it there https://my.slack.com/services
  // bot.postMessageToChannel("general", "meow!", params);

  // define existing username instead of "user_name"
  bot.postMessageToUser("frank", "meow!", params);

  // If you add a "slackbot" property, 
  // you will post to another user"s slackbot channel instead of a direct message
  // bot.postMessageToUser("frank", "meow!", { "slackbot": true, icon_emoji: ":cat:" });

  // define private group instead of "private_group", where bot exist
  // bot.postMessageToGroup("private_group", "meow!", params);
});


const app = express();
app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

app.post("/", function (req, res) {
  console.log("Received POST", req.headers, req.webtaskContext.data);
  const webhookToken = req.webtaskContext.data.WEBHOOK_TOKEN;

  if (webhookToken && req.headers["x-buildkite-token"] != webhookToken)
    return res.status(401).send("Invalid webhook token");

  // Find the event name
  var buildkiteEvent = req.headers["x-buildkite-event"];

  console.log("buildkiteevent", buildkiteEvent);
  console.log("body", req.body);
  res.write("ok");
});

