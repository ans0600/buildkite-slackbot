const SlackBot = require("slackbots");
const express = require("express");
const bodyParser = require("body-parser");

const bot = new SlackBot({
  token: process.env.SLACKBOT_TOKEN,
  name: process.env.SLACKBOT_NAME
});

const userMapping = JSON.parse(process.env.USER_MAPPING);

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
  return userMapping[buildkiteUser];
};

var sendBuildStatusMessage = function (buildkiteEventType, webhookData) {
  if (buildkiteEventType.indexOf("build") >= 0) {
    const buildCreatorEmail = webhookData.build.creator.email;
    const branch = webhookData.build.branch;
    const buildState = webhookData.build.state;
    const buildUrl = webhookData.build.web_url;
    // todo also notify commit author
    const slackUser = getSlackUserByBuildkiteUser(buildCreatorEmail);
    if (slackUser) {
      bot.postMessageToUser(slackUser, "Your build for `" + branch + "` is now `" + buildState+ "`");
      if (buildkiteEventType === "build.scheduled") {
        bot.postMessageToUser(slackUser, buildUrl);
      }
    } else {
      console.log("Unknown user", buildCreatorEmail, branch);
    }
  }
};

app.post("/", function (req, res) {
  console.log("Received POST", req.headers);

  // todo checking token for better security
  console.log("TOKEN", req.headers["x-buildkite-token"]);

  // Find the event name
  var buildkiteEvent = req.headers["x-buildkite-event"];

  console.log("buildkiteevent", buildkiteEvent);
  console.log("body", req.body);
  sendBuildStatusMessage(buildkiteEvent, req.body);
  res.status(204).end();
});
