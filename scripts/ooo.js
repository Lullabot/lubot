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

  bot.ws.on('message', function(data, flags) {
    var message = JSON.parse(data);
    if (message.text == "ooo?") {
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
            console.log(obj[i].name);
            bot.helpers.utils.setOoo(obj[i].name);
          }
          bot.slackbot.text = "Out of the Office Today: " + say.join(', ');
          bot.slackbot.channel = message.user;
          bot.slack.api('chat.postMessage', bot.slackbot, function (){});
          console.log(JSON.stringify(bot.users));
        });
      });  
    }
  });
  bot.irc.addListener("message#", function(nick, to, text, message) {
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
        });
      });
    }
  });
};
