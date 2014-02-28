# Simplebot

## Commands
### factoids (per channel)
```
/**
 * Description:
 *   Saves and retrieves facts.
 *
 * Commands:
 *   simplebot: ericduran is jacketless
 *   ericduran?
 *     > ericduran is jacketless
 *   ericduran!
 *     > ericduran is jacketless
 *   simplebot: ericduran?
 *     > ericduran is jacketless
 *   simplebot: ericduran!
 *     > ericduran is jacketless
 *  simplebot: factoid delete <key>
 *
 **/
```
### karma (channel agnostic)
```
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
```
### ooo (only #lullabot)
```
/** 
 * Description:
 *   Shows who's out of office.
 *
 * Commands:
 *   ooo?
 *
 **/ 
 ```
### seen (per channel)
```
/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *
 **/ 
```
### all
```
/** 
 * Description:
 *   Broadcasts a message to all users of a channel.
 *
 * Commands:
 *   simplebot all: <text>
 *
 **/ 
```
### tell (per channel)
```
/** 
 * Description:
 *   Allows messages to be left for other users.
 *
 * Commands:
 *   simplebot: tell <nick> <text>
 *   messages?
 *
 **/ 
```

## Integrations
### Github
Set your webhook URL to "http://<your-domain>/github" and export a JSON object into your settings with repo/channel mappings (see "Running"). Currently shows Issue and Pull Request actions.

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
heroku config:add SIMPLEBOT_IRC_ROOMS="#room1,room2"
heroku config:add SIMPLEBOT_IRC_SERVER="holmes.freenode.net"
heroku config:add SIMPLEBOT_IRC_PORT=6697
heroku config:add SIMPLEBOT_IRC_NICK="simplebot"
heroku config:add SIMPLEBOT_MONGODB="mongodb://<username>:<password>@<host>:<port>/<database>"
heroku config:add SIMPLEBOT_MONGOPREFIX="simplebot_"
herolu config:add SIMPLEBOT_GITHUB = "{\"justafish/test\": \"#bot\"}";
```

Edit simplebot.js to configure, then just push the repository to Heroku.

### Locally
Set environment variables

```
export SIMPLEBOT_IRC_ROOMS="#room1,#room2"
export SIMPLEBOT_IRC_SERVER="holmes.freenode.net"
export SIMPLEBOT_IRC_PORT=6697
export SIMPLEBOT_IRC_NICK="simplebot"
export SIMPLEBOT_MONGODB="mongodb://<username>:<password>@<host>:<port>/<database>"
export SIMPLEBOT_MONGOPREFIX="simplebot_"
export SIMPLEBOT_GITHUB="{\"justafish/test\": \"#bot\"}";
```

```
node simplebot.js
```

## Commands / Scripts
Add these in to the /scripts directory

## Using the Brain
See simplebot.js for detailed explanations.


Example:

```
bot.simplebot.brain.saveKV('sally', 'fish');
bot.simplebot.brain.loadKV('sally', function(value) {
  console.log(value);
});
```