# Simplebot

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
Add these in to the scripts/ directory

## Using the Brain
See simplebot.js for detailed explanations.
```
saveKV: function(key, value, collection_name)

loadKV: function(key, collection_name, success, error)

incKV: function(key, amount, collection_name)

messageLog: function(data)

searchMessageLog: function(text)

saveToCollection: function(collection_name, data)

loadFromCollection: function(collection_name, search, success)

removeFromCollection: function(collection_name, search)
```
Example:


```
bot.simplebot.brain.saveKV('sally', 'fish');
bot.simplebot.brain.loadKV('sally', function(value) {
  console.log(value);
});
```