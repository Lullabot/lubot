/**
 * Description:
 *   Keeps track of karma
 *
 * Commands:
 *   <item>++
 *   <item>--
 *
 **/
module.exports = function(bot) {
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var endsWithUp = bot.helpers.utils.endsWith('++', text);
    if (endsWithUp !== false && endsWithUp.length > 0) {
      bot.brain.incKV(endsWithUp, 1, 'karma');
    }
    else {
      var endsWithDown = bot.helpers.utils.endsWith('--', text);
      if (endsWithDown !== false && endsWithDown.length > 0) {
        bot.brain.incKV(endsWithDown, -1, 'karma');
      }
    }
  });
};
