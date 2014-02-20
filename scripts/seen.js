/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *
 **/ 
module.exports = function(bot) {
  // Respond to seen? requests.
  bot.irc.addListener("message#", function(nick, to, text, message) {
    var cutText = bot.helpers.utils.startsWith('seen ', text);
    if (cutText !== false) {
      var re = /([^?]+)\??/;
      var matches = re.exec(cutText);
      console.log(matches);
      if (matches !== null && matches.hasOwnProperty(1) && matches[1].length > 0) {
        console.log(matches);
      }
    }
  });
  
  // Log when a user leaves a channel.
  bot.irc.addListener('part', function (channel, nick, reason, message) {
    
  });
};
