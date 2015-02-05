/**
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   lubot all: <text>
 *
 **/
module.exports = function(bot) {

  // Provide help for the seen command.
  bot.help.add('seen', 'If someone asks "seen SuperMan?", the bot will report the last time they\'ve been seen in the channel.');

  // Respond to seen? requests.
  bot.registerIntentProcessor(function seenCallback(nick, to, text, message, complete) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
    }

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
        complete(true);
      }
    }

    complete();
  });
};
