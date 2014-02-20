/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *
 **/ 
module.exports = function(bot) {
  bot.irc.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith('all: ', text);
    if (cutText !== false) {
      var replyText = '';
      users = bot.helpers.irc.channelUsers(to);
      for(var name in users) {
        if (name !== bot.irc.opt.nick) {
          replyText += name + ' ';
        }
      }
      replyText += ': ' + cutText;
      bot.irc.say(to, replyText);
    }
  });
};
