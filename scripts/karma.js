/**
 * Description:
 *   Keeps track of karma
 *
 * Commands:
 *   <item>++
 *   <item>--
 *   karma <item>(?)
 *
 **/
module.exports = function(bot) {

  // Provide help for karma command.
  bot.help.add('karma', 'Keeps track of "karma" altered by "foo++" or "bar--". "BOTNAME: karma foo?" gives the current karma score.');

  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
    }

    // ++
    var userUp = bot.helpers.utils.stripUpKarma(text);
    if (userUp) {
      bot.brain.incValue({key: userUp, channel: to}, 1, 'karma', function(inc) {
        bot.irc.say(to, userUp + ' has a karma of ' + inc.value);
      });
    }
    else {
    // --
      var userDown = bot.helpers.utils.stripDownKarma(text);
      if (userDown) {
        bot.brain.incValue({key: userDown, channel: to}, -1, 'karma', function(inc) {
          bot.irc.say(to, userDown + ' has a karma of ' + inc.value);
        });
      }
    }
  });

  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Retrieves karma

    // Remove bot name.
    var cutText = bot.helpers.utils.startsWithBot('karma ', text);
    if (cutText !== false) {
      // Remove question mark.
      var removeQM = bot.helpers.utils.endsWith('?', cutText);
      if (removeQM !== false) {
        cutText = removeQM;
      }

      bot.brain.loadFromCollection('karma', {key: cutText, channel: to}, {}, function(docs) {
        if (bot.helpers.utils.empty(docs, 0)) {
          bot.irc.say(to, cutText + ' has a karma of 0');
        }
        else {
          bot.irc.say(to, cutText + ' has a karma of ' + docs[0].value);
        }
      });
    }
  });
};
