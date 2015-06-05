# Lubot
Lubot is a JavaScript node.js IRC bot that's designed to run across multiple channels simultaneously, backed by MongoDB. You can also run it on a free Heroku instance.

## Commands (see /scripts)
- factoids (per channel)
- karma (per channel agnostic)
- seen (per channel)
- all
- tell (per channel)
- ooo (only #lullabot)
- pingtroll

## Integrations
### GitHub
Set your webhook URL to "http://&lt;your-domain&gt;/github" and export a JSON object into your settings with repo/channel mappings (see "Running"). Currently shows Issue and Pull Request actions.

```json
{
  "Lullabot/lubot": "#lubot"
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
heroku config:add LUBOT_IRC_NICK="lubot"
heroku config:add LUBOT_IRC_NICK_PW="password"
heroku config:add LUBOT_MONGODB="mongodb://<username>:<password>@<host>:<port>/<database>"
heroku config:add LUBOT_MONGOPREFIX="lubot_"
heroku config:add LUBOT_GITHUB="{\"Lullabot/lubot\": \"#bot\"}";
```

Add the Heroku Scheduler app and add the command "rake dyno_ping" every 10 minutes to prevent your dyno from sleeping.

### Locally

Install the required npm packages.

```
npm install
```

You'll also need to make sure MongoDB is running. If you've got it installed already you can run the following command which will start a mongodb server in the background.  Make sure you've created the ./data/db and ./data/logfile directories.

```
mongod --fork --dbpath=./data/db --logpath ./data/logfile --logappend
```

Copy the default.config.yml file to config.yml and edit as desired
```
cp default.config.yml config.yml
```

Finally, start up the bot.

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

## Using the Help API.
See src/help.js for detailed documentation.

This system allows each script to provide help text that document their available commands, and integrates with the "BOTNAME: help?" command to display help text.

Example:

```
bot.help.add('all', 'Use the all command to send a message to everyone in the channel.');
```

This will allow for retrieval of this help text with `BOTNAME: help all?`.
