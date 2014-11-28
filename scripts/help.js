/**
 * @file
 * Retrieves and displays help text from the help API.
 *
 * Commands:
 *   lubot: help?
 *     > You can get help on a specific topic with "help <key>".
 *   lubot: help <key>?
 *     > Displays help text associated with <key>.
 *
 **/
var util = require('util');

module.exports = function(bot) {

  // Add some help text.
  bot.help.add('help', "That's awfully meta.");

  // Add a listener for messages in the channel.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Remove bot name.

    botText = bot.helpers.utils.startsBot(text);
    // If the bot is addressed, continue.
    if (botText !== false) {
      text = botText;

      // Help summary.
      if (text === 'help?') {
        var summary = 'Detailed information is available with "BOTNAME: help <feature>?" where <feature> is one of: ';
        summary = summary + bot.help.getSummary();
        bot.irc.say(to, summary);
      }

      // If asking for a specific help message.
      var re = /^help\s(.+?)\?$/;
      var matches = re.exec(text);
      if (!bot.helpers.utils.empty(matches, 1)) {
        var key = matches[1];
        // Lets see if we have some help text for this key.
        var message = bot.help.get(key);
        bot.irc.say(to, message);
      }
    }

  });
};
