/**
 * Description:
 *   Broadcasts Issues and Pull Requests.
 **/
module.exports = function(bot, app) {
  var githubConfig = JSON.parse(process.env.LUBOT_GITHUB);
  app.post('/github', function(request, response) {
    if (payload !== null) {
      var payload = request.body;
      if (payload.action !== null) {
        var repo = payload.repository.full_name;
        var ghuser = replaceAt(payload.sender.login, 1, "_")
        if (typeof githubConfig[repo] === 'string') {
          var channel = githubConfig[repo];
          // Issues
          if (typeof payload.issue !== 'undefined') {
            if ((payload.action == 'labeled' && payload.label.name == "needs review") || (payload.action == 'unlabeled'  && payload.label.name == "needs review")) {
              bot.irc.say(channel, '[ ' + ghuser + ' ' + payload.action + 'under review'  + ' issue #' + payload.issue.number + ': ' + payload.issue.title + ' ' + payload.issue.html_url + ' ]')
            }
            else if (payload.action == 'created' || payload.action == 'closed' || payload.action == 'reopened') {
              bot.irc.say(channel, '[ ' + ghuser + ' ' + payload.action + ' issue #' + payload.issue.number + ': ' + payload.issue.title + ' ' + payload.issue.html_url + ' ]')
            }
          }
          // Pull Requests
          else if (typeof payload.pull_request !== 'undefined') {
            bot.irc.say(channel, '[ ' + ghuser + ' ' + payload.action + ' pull request #' + payload.pull_request.number + ': ' + payload.pull_request.title + ' ' + payload.pull_request.html_url + ' ]')
          }
        }
      }
    }
  });
};

function replaceAt(s, n, t) {
    return s.substring(0, n) + t + s.substring(n + 1);
}

