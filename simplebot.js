var config = {
  channels: ["#lullaclient"],
  server: "holmes.freenode.net",
  botName: "simplebotlb"
};

var irc = require("irc");

var bot = new irc.Client(config.server, config.botName, {
  channels: config.channels
});

bot.simplebotHelpers = {
  'startsWith': function(token, text) {
    var start = text.slice(0, token.length);
    if (start === token) {
      nextText = text.slice(token.length);
      if (nextText.length > 0) {
        return nextText;
      }
    }
    return false;
  },
  'channelUsers': function(channel) {
    if (typeof channel !== "undefined" && typeof bot.chans !== "undefined" && typeof bot.chans[channel] !== "undefined" && typeof bot.chans[channel].users !== "undefined") {
      return bot.chans[channel].users;
    }
    return {};
  }
};

bot.addListener("registered", function(channel, who) {
  console.log('Connected to ' + config.server);
});

// Load Scripts
require("fs").readdirSync("./scripts").forEach(function(file) {
  require("./scripts/" + file)(bot);
});