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
 *   lubot: hello is <reply>Hi handsome
 *   hello!
 *     > Hi handsome
 *  lubot: factoid delete <key>
 *
 **/
var util = require('util');

module.exports = function(bot) {

  // Provide help for factoids command.
  bot.help.add('factoids', 'Set factoids with "BOTNAME: Metal is great." or  "BOTNAME: cats are furry." or "BOTNAME: ping is <reply>WHAT?!". You can use the !who placeholder, it will be replaced with the nick of the user performing the query. Retrieve with "Robots?" or "BOTNAME: cheer!" Forget with "BOTNAME: delete factoid ping".');

  // Register an intent processor.
  bot.registerIntentProcessor(function factoidSetCallback(nick, to, text, message, setIntent) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
      
      // Intent is to add a factoid, note that we also match the is|are that's
      // used when setting a factoid so that we can respond correctly.
      var re = /(.+?)\s(is|are)\s(.+)/;
      var matches = re.exec(text);

      if (matches) {
        // Create, and set, an intent object.
        var intent = {
          '_text': text,
          'intent': 'factoid',
          'action': 'set',
          'entities': {
            'search_query': [{'value': matches[1]}],
            'is_are': [{'value': matches[2]}],
            'factoid': [{'value': matches[3]}]
          }
        };
        setIntent(intent);
      }
    }
    
    // Intent is to delete a factoid?
    var delText = bot.helpers.utils.startsWith('delete factoid ', text);
    if (delText !== false) {
      // Create, and set, an intent object.
      var intent = {
        '_text': text,
        'intent': 'factoid',
        'action': 'delete',
        'entities': {
          'search_query': [{'value': delText}]
        }
      };
      setIntent(intent);
    }

    // Do we intend to respond to a factoid?
    var factoid = text;
    var qText = bot.helpers.utils.endsWith('?', factoid);
    if (qText !== false) {
      factoid = qText;
    }
    else {
      factoid = bot.helpers.utils.endsWith('!', factoid);
    }
    if (factoid !== false) {
      // Create, and set, an intent object.
      var intent = {
        '_text': text,
        'intent': 'factoid',
        'action': 'respond',
        'entities': {
          'search_query': [{'value': factoid}]
        }
      };
      setIntent(intent);
    }

    setIntent(false);
  });

  // Register an intent handler.
  bot.registerIntentHandler('factoid', function(intent, nick, to) {
    switch (intent.action) {
      // Create a new factoid.
      case 'set':
        bot.brain.upsertToCollection('factoids',
          {key: intent.entities.search_query[0].value, channel: to},
          {key: intent.entities.search_query[0].value, channel: to, factoid: intent.entities.factoid[0].value, is_are: intent.entities.is_are[0].value}
        );
        bot.irc.say(to, nick + ': Okay!');
        break;

      // Delete a factoid.
      case 'delete':
        var factoid = intent.entities.search_query[0].value;
        bot.brain.removeFromCollection('factoids', {key: factoid, channel: to});
        bot.irc.say(to, nick + ': Okay!');
        break;

      // Respond to a request to retrieve a factoid.
      default:
        bot.brain.loadFromCollection('factoids', {key: intent.entities.search_query[0].value, channel: to}, {}, function(docs) {
          if (docs.hasOwnProperty(0)) {
            var response;
            var message = docs[0].factoid;
            // Was the factoid set using "is" or "are"?
            var is_are = docs[0].is_are;
            // Allow for the string !who in factoids to be replaced with the nick
            // from the user making the query.
            message = message.replace(/\!who/gi, nick);

            // Allow for <reply> style factoids.
            var is_reply = message.indexOf('<reply>') === 0;
            message = message.replace('<reply>', '');

            // Format our response.
            if (is_reply === true) {
              response = message;
            }
            else {
              response = util.format('%s %s %s', intent.entities.search_query[0].value, is_are, message);
            }

            bot.irc.say(to, response);
          }
        });
        break;
    }
  });
};
