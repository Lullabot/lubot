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

  bot.ws.on('message', function(data, flags) {
    var message = JSON.parse(data);
    var factText = false;
    if (message.subtype !== "bot_message" && message.text) {
      botText = bot.helpers.utils.startsSlackBot(message.text);
      if (botText !== false) {
        factText = botText;
        // Add factoids, note that we also match the is|are that's used when
        // setting a factoid so that we can respond correctly.
        var re = /(.+?)\s(is|are)\s(.+)/;
        var matches = re.exec(factText);
        if (!bot.helpers.utils.empty(matches, 1) && !bot.helpers.utils.empty(matches, 2)) {
          bot.brain.upsertToCollection('factoids', {key: matches[1], channel: message.channel}, {key: matches[1], channel: message.channel, factoid: matches[3], is_are: matches[2]});
          bot.slackbot.text = '<@' + message.user + '> Okay!';
          bot.slackbot.channel = message.channel;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
        }
      }

      if (factText !== false) {
      // Delete a factoid.
      var delText = bot.helpers.utils.startsWith('delete factoid ', factText);
      if (delText !== false) {
        bot.brain.removeFromCollection('factoids', {key: delText, channel: message.channel});
        bot.slackbot.text = '<@' + message.user + '> Okay! I have forgotten about ' + delText;
        bot.slackbot.channel = message.channel;
        bot.slack.api('chat.postMessage', bot.slackbot, function (){});
      }

      // Respond to factoids.
      var factoid = factText;
      var qText = bot.helpers.utils.endsWith('?', factoid);
      if (qText !== false) {
        factoid = qText;
      }
      else {
        factoid = bot.helpers.utils.endsWith('!', factoid);
      }
      if (factoid !== false) {
        bot.brain.loadFromCollection('factoids', {key: factoid, channel: message.channel}, {}, function(docs) {
          if (docs.hasOwnProperty(0)) {
            var response;
            var factoidMessage = docs[0].factoid;
            // Was the factoid set using "is" or "are"?
            var is_are = docs[0].is_are;
            // Allow for <reply> style factoids.
            var is_reply = factoidMessage.indexOf('<reply>') === 0;
            factoidMessage = factoidMessage.replace('<reply>', '');
            // Format our response.
            if (is_reply === true) {
              response = factoidMessage;
            }
            else {
              response = util.format('%s %s %s', factoid, is_are, factoidMessage);
            }

            bot.slackbot.text = response;
            bot.slackbot.channel = message.channel;
            bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          }
        });
      }
    }
    }
  });

  // Provide help for factoids command.
  bot.help.add('factoids', 'Set factoids with "BOTNAME: Metal is great." or  "BOTNAME: cats are furry." or "BOTNAME: ping is <reply>WHAT?!". You can use the !who placeholder, it will be replaced with the nick of the user performing the query. Retrieve with "Robots?" or "BOTNAME: cheer!" Forget with "BOTNAME: delete factoid ping".');

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

          // Allow for <reply> style factoids.
          var is_reply = message.indexOf('<reply>') === 0;
          message = message.replace('<reply>', '');

          // Format our response.
          if (is_reply === true) {
            response = message;
          }
          else {
            response = util.format('%s %s %s', factoid, is_are, message);
          }

          bot.irc.say(to, response);
        }
      });
    }
  });
};
