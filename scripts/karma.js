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

  bot.ws.on('message', function(data, flags) {
    var message = JSON.parse(data);
    if (message.subtype !== "bot_message" && message.text && (message.channel == 'C024XJ9DZ' || message.channel == 'C0553ARSR')) {
      // Retrieves karma
      var karmaText = bot.helpers.utils.startsWith('karma ', message.text);
      if (karmaText !== false) {
        var entity = bot.helpers.utils.slackUserStrip(karmaText);
        if (entity !== false) {
          karmaText = entity;
        }
        // Remove question mark.
        var removeQM = bot.helpers.utils.endsWith('?', karmaText);
        if (removeQM !== false) {
          karmaText = removeQM;
        }

        var User = bot.helpers.utils.searchArray(bot.users, "id", karmaText);
        if (User) {
          karmaText = User.name;
        }

        bot.brain.loadFromCollection('karma', {
          key: karmaText,
        }, {}, function (docs) {
          if (bot.helpers.utils.empty(docs, 0)) {
            bot.slackbot.text = karmaText + ' has a karma of 0';
            bot.slackbot.channel = message.channel;
            bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          }
          else {
            bot.slackbot.text = karmaText + ' has a karma of ' + docs[0].value;
            bot.slackbot.channel = message.channel;
            bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          }
        });
      }

      // ++
      var userUp = bot.helpers.utils.stripUpKarma(message.text);
      if (userUp) {
        var slackUser = bot.helpers.utils.searchArray(bot.users, "name", bot.helpers.utils.slackUserStrip(userUp));
        var User = bot.helpers.utils.searchArray(bot.users, "id", bot.helpers.utils.slackUserStrip(userUp));
        if (message.user == User.id || message.user == slackUser.id) {
          bot.slackbot.text = 'What fates impose, that men must needs abide';
          bot.slackbot.channel = message.channel;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
        }
        else {
          if (User) {
            userUp = User.name;
          }
          bot.brain.incValue({
            key: userUp,
          }, 1, 'karma', function (inc) {
            bot.slackbot.text = userUp + ' has a karma of ' + inc.value;
            bot.slackbot.channel = message.channel;
            bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          });
        }
      }
      // --
      var userDown = bot.helpers.utils.stripDownKarma(message.text);
      if (userDown) {
        var slackUser = bot.helpers.utils.slackUserStrip(userDown);
        var User = bot.helpers.utils.searchArray(bot.users, "id", slackUser);
        if (User && User !== userDown && message.user !== slackUser) {
          userDown = User.name;
          bot.brain.incValue({
            key: userDown,
          }, -1, 'karma', function (inc) {
            bot.slackbot.text = userDown + ' has a karma of ' + inc.value;
            bot.slackbot.channel = message.channel;
            bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          });
        }
        else {
          bot.slackbot.text = 'What fates impose, that men must needs abide';
          bot.slackbot.channel = message.channel;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
        }
      }
    }
  });

  bot.irc.addListener('message#', function(nick, to, text, message) {
    // Retrieves karma
    var cutText = bot.helpers.utils.startsWithBot('karma ', text);
    if (cutText !== false) {
      // Remove question mark.
      var removeQM = bot.helpers.utils.endsWith('?', cutText);
      if (removeQM !== false) {
        cutText = removeQM;
      }

      bot.brain.loadFromCollection('karma', {
        key: cutText,
        channel: to
      }, {}, function(docs) {
        if (bot.helpers.utils.empty(docs, 0)) {
          bot.irc.say(to, cutText + ' has a karma of 0');
        }
        else {
          bot.irc.say(to, cutText + ' has a karma of ' + docs[0].value);
        }
      });
    }

    // Remove bot name.
    botText = bot.helpers.utils.startsBot(text);
    if (botText !== false) {
      text = botText;
    }

    // ++
    var userUp = bot.helpers.utils.stripUpKarma(text);
    if (userUp) {
      bot.brain.incValue({
        key: userUp,
        channel: to
      }, 1, 'karma', function(inc) {
        bot.irc.say(to, userUp + ' has a karma of ' + inc.value);
      });
    }
    else {
      // --
      var userDown = bot.helpers.utils.stripDownKarma(text);
      if (userDown) {
        bot.brain.incValue({
          key: userDown,
          channel: to
        }, -1, 'karma', function(inc) {
          bot.irc.say(to, userDown + ' has a karma of ' + inc.value);
        });
      }
    }
  });
};
