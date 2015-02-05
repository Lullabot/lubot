/**
 * Description:
 *   Pingtrolls someone.
 *
 * Commands:
 *   lubot pingtroll ericduran
 *
 **/
module.exports = function(bot) {
  bot.registerIntentProcessor(function pingtrollCallback(nick, to, text, message, complete) {
    var user = bot.helpers.utils.startsWithBot('pingtroll ', text);
    if (user !== false) {
      for (var i = 0; i < 3; i++) {
        bot.irc.say(to, user + ': ping');
        complete(true);
      }
    }

    complete();
  });
};
