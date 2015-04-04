/**
 * @file
 * Control hackpad :)
 *
 * Commands:
 *   lubot: make me a hackpad
 *     > Makes a hackpad
 *   lubot: hackpad <search term>
 *     > Searches yoursite.hackpad.com
 *
 *
 **/

var uuid = require('node-uuid');
var Hackpad = require('hackpad');
var config = {
  hackpadKey:  process.env.LUBOT_HACKPAD_KEY,
  hackpadSecret: process.env.LUBOT_HACKPAD_SECRET,
  hackpadSite: process.env.LUBOT_HACKPAD_SITE
}

module.exports = function(bot) {

    if (config.hackpadKey && config.hackpadSecret && config.hackpadSite) {
      // Add a listener for messages in the channel.
      bot.irc.addListener('message#', function(nick, to, text, message) {
        // Remove bot name.

        botText = bot.helpers.utils.startsBot(text);
        // If the bot is addressed, continue.
        if (botText !== false) {
          text = botText;

          // Help summary.
          if (text === 'make me a hackpad') {
            var uuid1 = uuid.v4();
            var hackurl = 'https://' + config.hackpadSite + '.hackpad.com/' + uuid1;
            bot.irc.say(to, hackurl);
          }
        }
      });

      // Provide help for the seen command.
      bot.help.add('hackpad', 'Format: botname: hackpad <search terms>, start (Offset to start from), limit (How many results to return)');

      // Respond to search requests.
      bot.irc.addListener("message#", function(nick, to, text, message) {
        // Remove bot name.
        botText = bot.helpers.utils.startsBot(text);
        if (botText !== false) {
          text = botText;
        }

        var cutText = bot.helpers.utils.startsWith('hackpad ', text);
          var options = {site: config.hackpadSite}; 
          var client = new Hackpad(config.hackpadKey, config.hackpadSecret, options);
          var searchParams = cutText.replace(/^\s+|\s+$/g,"").split(/\s*,\s*/);
          
          client.search(searchParams[0], searchParams[1], searchParams[2], function(err, result) {
            if(err) {
              bot.irc.say(to, JSON.stringify(err));
            }
            else {
              for (var key in result) {
                if (result.hasOwnProperty(key)) {
                  var obj = result[key];
                  bot.irc.say(nick, obj.title + ' - https://' + config.hackpadSite + '.hackpad.com/' + obj.id);
                }
              }
            }
          });
      });
    }
    else {
      console.error("You need to set the bot's hackpad environment variables as per the readme to use this script");
    }
};
