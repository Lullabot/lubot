/**
 * @file
 * Makes a hackpad :)
 *
 * Commands:
 *   lubot: make me a hackpad
 *     > Makes a hackpad
 *
 **/

var uuid = require('node-uuid');

module.exports = function(bot) {

  // Add a listener for messages in the channel.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Remove bot name.

    botText = bot.helpers.utils.startsBot(text);
    // If the bot is addressed, continue.
    if (botText !== false) {
      text = botText;

      // Help summary.
      if (text === 'make me a hackpad') {
        var uuid1 = uuid.v4();
        var hackurl = 'https://lullabot.hackpad.com/' + uuid1;
        bot.irc.say(to, hackurl);
      }
    }
  });
};

