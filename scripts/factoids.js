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
 *   lubot: tacos are awesome
 *   tacos?
 *     > tacos are awesome
 *  lubot: factoid delete <key>
 *
 **/
module.exports = function(bot) {
  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
      
      // Add factoids, note that we also match the is|are that's used when
      // setting a factoid so that we can respond correctly.
      var re = /(.+?)\s(is|are)\s(.+)/;
      var matches = re.exec(text);
      if (!bot.helpers.utils.empty(matches, 1) && !bot.helpers.utils.empty(matches, 2)) {
        bot.brain.upsertToCollection('factoids', {key: matches[1], channel: to}, {key: matches[1], channel: to, factoid: matches[3], is_are: matches[2]});
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
          var response;
          var message = docs[0].factoid;
          // Was the factoid set using "is" or "are"?
          var is_are = docs[0].is_are;
          // Allow for the string !who in factoids to be replaced with the nick
          // from the user making the query.
          message = message.replace(/\!who/gi, nick);

          response = factoid + ' ' + is_are + ' ' + message;
          bot.irc.say(to, response);
        }
      });
    }
  });
};
