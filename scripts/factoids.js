/** 
 * Description:
 *   Saves and retrieves facts.
 *
 * Commands:
 *   simplebot: ericduran is jacketless
 *   ericduran?
 *     > ericduran is jacketless
 *   ericduran!
 *     > ericduran is jacketless
 *
 **/ 
module.exports = function(bot) {
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith(bot.irc.opt.nick + ': ', text);
    if (cutText !== false) {
      var re = /(.+?)\sis\s(.+)/;
      var matches = re.exec(cutText);
      if (typeof matches === 'object' && matches[1] !== null && matches[1].length > 0 && matches[2] !== null && matches[2].length > 0) {
        bot.brain.saveKV(matches[1], matches[2], 'factoids');
        bot.irc.say(to, nick + ': Okay!');
      }
    }
    else {
      var endText = bot.helpers.utils.endsWith('?', text);
      if (endText === false) {
        endText = bot.helpers.utils.endsWith('!', text);
      }

      if (endText !== false) {
        bot.brain.loadKV(endText, 'factoids', function(value) {
          bot.irc.say(to, endText + ' is ' + value);
        });
      }
    }
  });
};
