const SlackBot = require("slackbots");
const express = require("express");
const bodyParser = require("body-parser");

const bot = new SlackBot({
  token: "xoxb-72869698775-NPC0xgEXlNuucElRdR5dzqem", // Add a bot https://my.slack.com/services/new/bot and put the token
  name: "buildkite-bot"
});

bot.on("start", function () {
  console.log("slack bot is started");
});

const app = express();
app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 8080, function () {
  var port = server.address().port;
  console.log("App now running on port", port);
});

var getSlackUserByBuildkiteUser = function (buildkiteUser) {
  return {
    "frank.an@rangeme.com": "frank"
  }[buildkiteUser];
};

var sendBuildStatusMessage =  function(buildkiteEventType, webhookData) {
  const buildCreatorEmail = webhookData.build.creator.email;
  const branch = webhookData.build.branch;
  // todo also notify build author
  const slackUser = getSlackUserByBuildkiteUser(buildCreatorEmail);
  if (slackUser) {
    bot.postMessageToUser(slackUser, "Your build for" + branch + "has update with state: " + buildkiteEventType);
  } else {
    console.log("Unknown user", buildCreatorEmail, branch);
  }
};

app.post("/", function (req, res) {
  console.log("Received POST", req.headers);

  console.log("TOKEN", req.headers["x-buildkite-token"]);

  // Find the event name
  var buildkiteEvent = req.headers["x-buildkite-event"];

  console.log("buildkiteevent", buildkiteEvent);
  console.log("body", req.body);
  sendBuildStatusMessage(buildkiteEvent, req.body);
  res.status(204).end();
});

