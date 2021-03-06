/**
 * Description:
 *   Broadcasts Issues and Pull Requests.
 **/
module.exports = function(bot, app) {
  var githubConfig = JSON.parse(process.env.LUBOT_GITHUB);
  app.post('/github', function(request, response) {
    if (payload !== null) {
      var payload = JSON.parse(request.body.payload);
      if (payload.action !== null) {
        var repo = payload.repository.full_name;
        if (typeof githubConfig[repo] === 'string') {
          var channel = githubConfig[repo];
          // Issues
          if (typeof payload.issue !== 'undefined') {
            bot.irc.say(channel, '[ ' + payload.sender.login + ' ' + payload.action + ' issue #' + payload.issue.number + ': ' + payload.issue.title + ' ' + payload.issue.html_url + ' ]')
          }
          // Pull Requests
          else if (typeof payload.pull_request !== 'undefined') {
            bot.irc.say(channel, '[ ' + payload.sender.login + ' ' + payload.action + ' pull request #' + payload.pull_request.number + ': ' + payload.pull_request.title + ' ' + payload.pull_request.html_url + ' ]')
          }
        }
      }
    }
  });
};