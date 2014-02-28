/**
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   lubot all: <text>
 *
 **/
module.exports = function(bot) {
  // Respond to seen? requests.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith('seen ', text);
    if (cutText !== false) {
      var re = /([^?]+)\??/;
      var matches = re.exec(cutText);
      if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0) {
        bot.brain.loadMessageLog({nick: matches[1], channel: to}, {limit: 1, sort: [['time','desc']]}, function(docs) {
          if (docs.hasOwnProperty(0)) {
            var seen = docs[0];
            bot.irc.say(to, seen.nick + ' last spoke ' + bot.helpers.utils.timeSince(seen.time) + ' ago.');
          }
          else {
            bot.irc.say(to, 'Sorry, I haven\'t seen ' + matches[1]);
          }
        });
      }
    }
  });
};
