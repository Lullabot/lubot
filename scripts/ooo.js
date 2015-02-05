/**
 * Description:
 *   Shows who's out of office.
 *
 * Commands:
 *   ooo?
 *
 **/
module.exports = function(bot) {

  // Provide help for the ooo command.
  bot.help.add('ooo', 'List everyone that is marked as being out-of-office today.');

  bot.registerIntentProcessor(function oooCallback(nick, to, text, message, complete) {
    if (text === 'ooo?' && to === '#lullabot') {
      var https = require('follow-redirects').https;
      var options = {
        host: 'script.googleusercontent.com',
        port: 443,
        path: '/a/macros/lullabot.com/s/AKfycbzkjIbZ50KmSP86WykNTpHpc6sHSfGCfN01CbQL_04cvGIO2may/exec?type=json',
        method: 'GET',
        maxRedirects: 1,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      https.get(options, function(res) {
        res.setEncoding('utf8');
        var output = '';
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function() {
          var obj = JSON.parse(output);
          var say = [];
          for (var i = 0; i < obj.length; i++) {
            say.push(obj[i].name);
          }
          bot.irc.say(to, say.join(', '));
          complete(true);
        });
      });
    }

    complete();
  });
};
