/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot: tell <nick> <text>
 *
 **/ 
module.exports = function(bot) {
  // Listen for new messages.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith(bot.irc.opt.nick + ': tell ', text);
    if (cutText !== false) {
      var re = /(.+?)\s(.+)/;
      var matches = re.exec(cutText);
      if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0 && matches.hasOwnProperty(2) && matches[2].length > 0) {
        bot.brain.saveToCollection('tell', {nick: matches[1], channel: to, message: matches[2]});
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
      bot.brain.loadFromCollection('tell', {channel: channel, $or: accounts}, function(docs) {
        if (docs.length === 1) {
          bot.irc.say(channel, nick + ': I have ' + docs.length + ' message for you. Type "messages?" to receive them.')
        }
        else if (docs.length > 1) {
          bot.irc.say(channel, nick + ': I have ' + docs.length + ' messages for you. Type "messages?" to receive them.')
        }
      });
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
        bot.brain.loadFromCollection('tell', {channel: to, $or: accounts}, function(docs) {
          if (docs.length > 0) {
            for (var i = 0; i < docs.length; i++) {
              bot.irc.say(to, nick + ': ' + docs[i].nick + ' said "' + docs[i].message + '"');
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
