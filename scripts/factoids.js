/**
 * Description:
 *   Saves and retrieves facts.
 *
 * Commands:
 *   lubot: ericduran is jacketless
 *   ericduran?
 *     > ericduran is jacketless
 *   ericduran!
 *     > ericduran is jacketless
 *   lubot: ericduran?
 *     > ericduran is jacketless
 *   lubot: ericduran!
 *     > ericduran is jacketless
 *  lubot: factoid delete <key>
 *
 **/
module.exports = function(bot) {
  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
      
      // Add factoids.
      var re = /(.+?)\sis\s(.+)/;
      var matches = re.exec(text);
      if (!bot.helpers.utils.empty(matches, 1) && !bot.helpers.utils.empty(matches, 2)) {
        bot.brain.upsertToCollection('factoids', {key: matches[1], channel: to}, {key: matches[1], channel: to, factoid: matches[2]});
        bot.irc.say(to, nick + ': Okay!');
      }
    }
    
    // Delete a factoid.
    var delText = bot.helpers.utils.startsWith('delete factoid ', text);
    if (delText !== false) {
      bot.brain.removeFromCollection('factoids', {key: delText, channel: to});
      bot.irc.say(to, nick + ': Okay!');
    }

    // Respond to factoids.
    var factoid = text;
    var qText = bot.helpers.utils.endsWith('?', factoid);
    if (qText !== false) {
      factoid = qText;
    }
    else {
      factoid = bot.helpers.utils.endsWith('!', factoid);
    }
    if (factoid !== false) {
      bot.brain.loadFromCollection('factoids', {key: factoid, channel: to}, {}, function(docs) {
        if (docs.hasOwnProperty(0)) {
          bot.irc.say(to, factoid + ' is ' + docs[0].factoid);
        }
      });
    }
  });
};
