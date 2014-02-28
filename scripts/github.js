/**
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *   all: <text>
 *
 **/
module.exports = function(bot, app) {
  var githubConfig = JSON.parse(process.env.SIMPLEBOT_GITHUB);
  app.post('/github', function(request, response) {
    if (payload !== null) {
      var payload = JSON.parse(request.body.payload);
      if (payload.action !== null) {
        var repo = payload.repository.full_name;
        if (typeof githubConfig[repo] === 'string') {
          var channel = githubConfig[repo];
          // Issues
          if (typeof payload.issue !== 'undefined') {
            bot.irc.say(channel, '[ ' + payload.issue.user.login + ' ' + payload.action + ' issue #' + payload.issue.number + ': ' + payload.issue.title + ' ' + payload.issue.html_url + ' ]')
          }
          // Pull Requests
          else if (typeof payload.pull_request !== 'undefined') {
            bot.irc.say(channel, '[ ' + payload.pull_request.user.login + ' ' + payload.action + ' pull request #' + payload.pull_request.number + ': ' + payload.pull_request.title + ' ' + payload.pull_request.html_url + ' ]')
          }
        }
      }
    }
  });
};