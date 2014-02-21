/**
 * Description:
 *   Keeps track of karma
 *
 * Commands:
 *   <item>++
 *   <item>--
 *   karma <item>(?)
 *
 **/
module.exports = function(bot) {
  // Listens for ++
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var endsWithUp = bot.helpers.utils.endsWith('++', text);
    if (endsWithUp !== false && endsWithUp.length > 0) {
      bot.brain.incKV(endsWithUp, 1, 'karma');
    }
  });
  
  // Listens for --
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var endsWithDown = bot.helpers.utils.endsWith('--', text);
    if (endsWithDown !== false && endsWithDown.length > 0) {
      bot.brain.incKV(endsWithDown, -1, 'karma');
    }
  });
  
  // Retrieves karma
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith('karma ', text);
    if (cutText !== false) {
      var removeQM = bot.helpers.utils.endsWith('?', cutText);
      if (removeQM !== false) {
        cutText = removeQM;
      }
      
      bot.brain.loadKV(cutText, 'karma', function(value) {
        bot.irc.say(to, cutText + ' has a karma of ' + value);
      });
    }
  });
};
