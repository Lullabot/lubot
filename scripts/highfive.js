/**
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   lubot all: <text>
 *
 **/

module.exports = function(bot) {

  // Respond to build results.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
    }

    if(nick == 'lullajenky') {
      if (text.indexOf("SUCCESS") > -1) {
        bot.irc.action(to, 'highfives lullajenky');
      }
      else if (text.indexOf("FAIL") > -1) {
        bot.irc.action(to, "weeps uncontrollably");
      }
    }
  });
};
