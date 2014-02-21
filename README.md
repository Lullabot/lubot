# Simplebot

## Commands
### factoids
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
 *  simplebot: factoid delete <key>
 *
 **/ 
```
### karma
```
/** 
 * Description:
 *   Keeps track of karma
 *
 * Commands:
 *   <item>++
 *   <item>--
 *
 **/ 
```
### ooo
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
### seen
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
### tell
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

## Running
### Heroku
Create a MongoLab database, making sure you tick the "experimental features". You may have to create another one through the MongoLab interface after Heroku has created a default one. You can use this URL for your local development as well.

Edit simplebot.js to configure, then just push the repository to Heroku.

### Locally
Edit simplebot.js to point to your mongodb instance.

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