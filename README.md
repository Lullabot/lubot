# Simplebot

## Running
```
node simplebot.js
```

## Commands / Scripts
Add these in to the scripts/ directory

## Using the Brain
There is a KV store as well as access to MongoDB's collections. If you use "id" in your data object before saving, then it will be overwritten.

```
saveKV: function(key, value)
loadKV: function(key, success, error)
saveToCollection: function(collection_name, id, data)
loadFromCollection: function(collection_name, id, success, error)
```

Example:


```
bot.simplebot.brain.saveKV('sally', 'fish');
bot.simplebot.brain.loadKV('sally', function(value) {
  console.log(value);
}, function(err) {});

bot.simplebot.brain.saveToCollection('simplebot_users', 'sally@justafish.co.uk', {nick: 'justafish'});
bot.simplebot.brain.loadFromCollection('simplebot_users', 'sally@justafish.co.uk', function (data) {
  console.log(data);
});
```