# Lubot
Lubot is a JavaScript node.js IRC bot that's designed to run across multiple channels simultaneously, backed by MongoDB. You can also run it on a free Heroku instance.

## Commands (see /scripts)
- factoids (per channel)
- karma (per channel agnostic)
- seen (per channel)
- all
- tell (per channel)
- ooo (only #lullabot)

## Integrations
### Github
Set your webhook URL to "http://&lt;your-domain&gt;/github" and export a JSON object into your settings with repo/channel mappings (see "Running"). Currently shows Issue and Pull Request actions.

```json
{
  "Lullabot/simplebot": "#simplebot"
}
```

## Running
### Heroku
Create a MongoLab database, making sure you tick the "experimental features". You may have to create another one through the MongoLab interface after Heroku has created a default one. You can use this URL for your local development as well.

Set the following environment variables.
```
heroku config:add LUBOT_IRC_ROOMS="#room1,room2"
heroku config:add LUBOT_IRC_SERVER="holmes.freenode.net"
heroku config:add LUBOT_IRC_PORT=6697
heroku config:add LUBOT_IRC_NICK="simplebot"
heroku config:add LUBOT_IRC_NICK_PW="password"
heroku config:add LUBOT_MONGODB="mongodb://<username>:<password>@<host>:<port>/<database>"
heroku config:add LUBOT_MONGOPREFIX="simplebot_"
heroku config:add LUBOT_GITHUB = "{\"Lullabot/lubot\": \"#bot\"}";
```

Add the Heroku Scheduler app and add the command "rake dyno_ping" every 10 minutes to prevent your dyno from sleeping.

### Locally
Set environment variables

```
export LUBOT_IRC_ROOMS="#room1,#room2"
export LUBOT_IRC_SERVER="holmes.freenode.net"
export LUBOT_IRC_PORT=6697
export LUBOT_IRC_NICK="lubot"
export LUBOT_IRC_NICK_PW="password"
export LUBOT_MONGODB="mongodb://<username>:<password>@<host>:<port>/<database>"
export LUBOT_MONGOPREFIX="lubot_"
export LUBOT_GITHUB="{\"Lullabot/lubot\": \"#bot\"}";
```

```
node lubot.js
```

## Commands / Scripts
Add these in to the /scripts directory

## Using the Brain
See lubot.js for detailed explanations.


Example:

```
bot.lubot.brain.saveKV('justafish', 'is my creator');
bot.lubot.brain.loadKV('justafish', function(value) {
  console.log(value);
});
```