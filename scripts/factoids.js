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
 *   simplebot: ericduran?
 *     > ericduran is jacketless
 *   simplebot: ericduran!
 *     > ericduran is jacketless
 *  simplebot: factoid delete <key>
 *
 **/
module.exports = function(bot) {
  // Add factoids.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    text = bot.helpers.utils.startsBot(text);
    if (text !== false) {
      var re = /(.+?)\sis\s(.+)/;
      var matches = re.exec(text);
      if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0 && matches.hasOwnProperty(2) && matches[2].length > 0) {
        bot.brain.upsertToCollection('factoids', {key: matches[1], channel: to}, {key: matches[1], channel: to, factoid: matches[2]});
        bot.irc.say(to, nick + ': Okay!');
      }
    }
  });
  
  // Respond to factoids.
  bot.irc.addListener('message#', function(nick, to, text, message) {
    var qText = bot.helpers.utils.endsWith('?', text);
    if (qText !== false) {
      text = qText;
    }
    else {
      text = bot.helpers.utils.endsWith('!', text);
    }
    
    if (text !== false) {
      // Remove bot name
      var newText = bot.helpers.utils.startsBot(text);
      if (newText !== false) {
        text = newText;
      }
      
      bot.brain.loadFromCollection('factoids', {key: text, channel: to}, {}, function(docs) {
        if (docs.hasOwnProperty(0)) {
          bot.irc.say(to, text + ' is ' + docs[0].factoid);
        }
      });
    }
  });
  
  // Delete a factoid
  bot.irc.addListener('message#', function(nick, to, text, message) {
    text = bot.helpers.utils.startsWithBot('delete factoid ', text);
    if (text !== false) {
      bot.brain.removeFromCollection('factoids', {key: text, channel: to});
      bot.irc.say(to, nick + ': Okay!');
    }
  });
};
