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
    var message = JSON.parse(data),
      messageText = message.text,
      karmaInquiry,
      messageTextUp,
      messageTextDown,
      karmaText,
      direction,
      slackUser;

    if (message.subtype !== 'bot_message' && message.text && (message.channel == 'C024XJ9DZ' || message.channel == 'C0553ARSR')) {
      // Start off with a trim
      messageText = messageText.replace(/^\s+|\s+$/g, '');
      // Next, replace any slack user id's in the message text with the user
      // name.
      messageText = bot.helpers.utils.slackIdToName(messageText);

      // Are we dealing with a karma inquiry?
      karmaInquiry = bot.helpers.utils.startsWith('karma ', messageText);
      if (karmaInquiry !== false) {
        // Remove question mark if any
        karmaInquiry = karmaInquiry.replace(/\?$/, '');

        bot.brain.loadFromCollection('karma', {
          key: karmaInquiry
        }, {}, function (docs) {
          if (bot.helpers.utils.empty(docs, 0)) {
            bot.slackbot.text = karmaInquiry + ' has a karma of 0';
          }
          else {
            bot.slackbot.text = karmaInquiry + ' has a karma of ' + docs[0].value;
          }
          bot.slackbot.channel = message.channel;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
        });
      }

      // Look for Karma increase/decrease
      // ++
      // --
      messageTextUp = bot.helpers.utils.stripUpKarma(messageText);
      messageTextDown = bot.helpers.utils.stripDownKarma(messageText);
      direction = messageTextUp ? 1 : -1;
      karmaText = messageTextUp || messageTextDown;

      if (karmaText) {
        // @todo check for increment/decrement ourselves
        slackUser = bot.helpers.utils.searchArray(bot.users, 'name', karmaText);
        console.log(slackUser);
        console.log(message.user);

        bot.brain.incValue({
          key: karmaText
        }, direction, 'karma', function (inc) {
          bot.slackbot.text = karmaText + ' has a karma of ' + inc.value;
          bot.slackbot.channel = message.channel;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
        });
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
