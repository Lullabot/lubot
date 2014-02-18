/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *
 * Notes:
 *
 **/ 
module.exports = function(bot) {
  bot.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.simplebotHelpers.startsWith('all: ', text);
    if (cutText !== false) {
      var replyText = '';
      users = bot.simplebotHelpers.channelUsers(to);
      for(var name in users) {
        if (name !== bot.opt.nick) {
          replyText += name + ' ';
        }
      }
      replyText += ': ' + cutText;
      bot.say(to, replyText);
    }
  });
};
