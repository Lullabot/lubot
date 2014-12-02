/**
 * Description:
 *   Allows messages to be left for other users.
 *
 * Commands:
 *   lubot: tell <nick> <text>
 *   messages?
 *
 **/
module.exports = function(bot) {

  // Provide help for the tell command.
  bot.help.add('tell', 'Queue messages with "BOTNAME: tell SuperMan that his cape is awesome." Users will be notified they have queued messages when the recipient joins the channel. A user can retrieve their messages with "messages?".');

  // Listen for new messages.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;

      var cutText = bot.helpers.utils.startsWith('tell ', text);
      if (cutText !== false) {
        var re = /(.+?)\s(.+)/;
        var matches = re.exec(cutText);
        if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0 && matches.hasOwnProperty(2) && matches[2].length > 0) {
          var message = '<' + nick + '> ' + matches[2]
          bot.brain.saveToCollection('tell', {nick: matches[1], channel: to, from: nick, message: matches[2]});
          bot.irc.say(to, nick + ": I'll pass that on when " + matches[1] + " is around.")
        }
      }
    }
  });

  // Tell a user they have a new message.
  bot.irc.addListener('join', function (channel, nick, message) {
    bot.irc.whois(nick, function(info) {
      var accounts = [{nick: nick}];
      if (info.account !== undefined && info.account !== null) {
        accounts.push({nick: info.account});
      }
      bot.brain.loadFromCollection('tell', {channel: channel, $or: accounts}, {}, function(docs) {
        if (docs.length === 1) {
          bot.irc.say(channel, nick + ': I have ' + docs.length + ' message for you. Type "messages?" to receive them.')
        }
        else if (docs.length > 1) {
          bot.irc.say(channel, nick + ': I have ' + docs.length + ' messages for you. Type "messages?" to receive them.')
        }
      });
    });
  });

  // Tell a user they have a new message.
  bot.irc.addListener('nick', function (oldnick, newnick, channels, message) {
    bot.brain.loadFromCollection('tell', {nick: newnick}, {}, function(docs) {
      var chanMessages = {};
      for (var i = 0; i < channels.length; i++) {
        chanMessages[channels[i]] = 0;
        for (var j = 0; j < docs.length; j++) {
          if (docs[i].channel === channels[i]) {
            chanMessages[channels[i]]++;
          }
        }
        if (chanMessages[channels[i]] === 1) {
          bot.irc.say(channels[i], newnick + ': I have ' + chanMessages[channels[i]] + ' message for you. Type "messages?" to receive them.')
        }
        else if (chanMessages[channels[i]] > 1) {
          bot.irc.say(channels[i], newnick + ': I have ' + chanMessages[channels[i]] + ' messages for you. Type "messages?" to receive them.')
        }
      }
    });
  });

  // Deliver messages.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    if (text === 'messages?') {
      bot.irc.whois(nick, function(info) {
        var accounts = [{nick: nick}];
        if (info.account !== undefined && info.account !== null) {
          accounts.push({nick: info.account});
        }
        bot.brain.loadFromCollection('tell', {channel: to, $or: accounts}, {}, function(docs) {
          if (docs.length > 0) {
            for (var i = 0; i < docs.length; i++) {
              bot.irc.say(to, nick + ': ' + docs[i].from + ' said "' + docs[i].message + '"');
            }
            bot.brain.removeFromCollection('tell', {channel: to, $or: accounts});
          }
          else {
            bot.irc.say(to, nick + ': I have no messages for you.');
          }
        });
      });
    }
  });
};
