/**
 * @file
 * Description: Troll Brian.
 **/

module.exports = function(bot) {
  bot.irc.addListener("join", function(channel, who) {
    // When the bot joins a channel we register a sales troll for that channel.
    if (who === bot.irc.opt.nick) {
      var salesTroll = function(channel) {
        bot.irc.say(channel, 'Sales!');

        // Set an interval somewhere between 2 and 8 hours from now and do it
        // all again.
        var min = 7200000; // 2 hours.
        var max = min * 4; // 8 hours.
        var interval = Math.floor(Math.random()*(max-min+1)+min);
        setTimeout(salesTroll, interval, channel);
      }

      // Lets get this party started.
      salesTroll(channel);
    }
  });
};
