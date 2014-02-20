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
 *  simplebot: factoid delete <key>
 *
 **/ 
module.exports = function(bot) {
  // Add factoids.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith(bot.irc.opt.nick + ': ', text);
    if (cutText !== false) {
      var re = /(.+?)\sis\s(.+)/;
      var matches = re.exec(cutText);
      if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0 && matches.hasOwnProperty(2) && matches[2].length > 0) {
        bot.brain.saveKV(matches[1], matches[2], 'factoids');
        bot.irc.say(to, nick + ': Okay!');
      }
    }
  });
  
  // Respond to factoids.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var endText = bot.helpers.utils.endsWith('?', text);
    if (endText === false) {
      endText = bot.helpers.utils.endsWith('!', text);
    }

    if (endText !== false) {
      bot.brain.loadKV(endText, 'factoids', function(value) {
        bot.irc.say(to, endText + ' is ' + value);
      });
    }
  });
  
  // Delete a factoid
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith(bot.irc.opt.nick + ': delete factoid ', text);
    if (cutText !== false) {
      bot.brain.removeKV(cutText, 'factoids');
      bot.irc.say(to, nick + ': Okay!');
    }
  });
};
