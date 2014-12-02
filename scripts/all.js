/**
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   lubot all: <text>
 *   all: <text>
 *
 **/
module.exports = function(bot) {

  // Provide help for the all command.
  bot.help.add('all', 'Send a message to everyone in the channel with "all: <message>".');

  bot.irc.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWithBot('all:', text);
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
