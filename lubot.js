// Bot configuration.
var config = {
  webPort: Number(process.env.PORT || 5000),
  channels: process.env.LUBOT_IRC_ROOMS.split(","),
  server: process.env.LUBOT_IRC_SERVER,
  port: process.env.LUBOT_IRC_PORT,
  botName: process.env.LUBOT_IRC_NICK,
  mongoUrl: process.env.LUBOT_MONGODB,
  mongoPrefix: process.env.LUBOT_MONGOPREFIX
};

if (typeof process.env.LUBOT_IRC_NICK_PW !== 'undefined') {
  config.botPassword = process.env.LUBOT_IRC_NICK_PW;
}
else {
  config.botPassword = null;
}

var express = require('express');
var app = express();
app.use(express.json());
app.use(express.urlencoded());
app.get('/', function(req, res){
  res.send('Hello, world!');
});
app.listen(config.webPort);

// Intialise the bot.
var bot = {
  helpers: {}
};

// Connect to IRC.
var irc = require("irc");
bot.irc = new irc.Client(config.server, config.botName, {
  channels: config.channels,
  port: config.port,
  secure: true,
  stripColors: true
});
bot.irc.once("registered", function(channel, who) {
  console.log('Connected to ' + config.server);
  bot.irc.say('NickServ', 'IDENTIFY ' + config.botName + ' ' + config.botPassword);
});

// Increase max listeners.
bot.irc.setMaxListeners(50);

// Catch IRC errors.
bot.irc.addListener('error', function(message) {
    console.log('error: ', message);
});

/**
 * Helpers for text processing.
 */
bot.helpers.utils = {
  /**
   * Finds if a string begins with another string.
   *
   * @param string token
   *   The string to look for
   * @param string text
   *   The string to search in
   *
   * @return string|bool
   *   The string with the token cut out, or false if it wasn't found.
   */
  startsWith: function(token, text) {
    var start = text.slice(0, token.length);
    if (start === token) {
      newText = text.slice(token.length);
      if (newText.length > 0) {
        return newText;
      }
    }
    return false;
  },
  /**
   * Sees if the text is addressing the bot.
   *
   * @param string text
   *   The string to search in
   *
   * @return string|bool
   *   The string with the token cut out, or false if it wasn't found.
   */
  startsBot: function(text) {
    var re = new RegExp(bot.irc.opt.nick + "(.*?) (.*)", "gi");
    var matches = re.exec(text);
    if (!bot.helpers.utils.empty(matches, 1) && !bot.helpers.utils.empty(matches, 2)) {
      return matches[2]
    }
    return false;
  },
  /**
   * Finds if a string begins with another string, possibly prefixed by the
   * bot name.
   *
   * @param string token
   *   The string to look for
   * @param string text
   *   The string to search in
   *
   * @return string|bool
   *   The string with the token cut out, or false if it wasn't found.
   */
  startsWithBot: function(token, text) {
    botText = this.startsBot(text);
    if (botText !== false) {
      text = this.startsWith(token, botText);
    }
    else {
      text = this.startsWith(token, text);
    }
    return text;
  },
  /**
   * Finds if a string ends with another string.
   *
   * @param string token
   *   The string to look for
   * @param string text
   *   The string to search in
   *
   * @return string|bool
   *   The string with the token cut out, or fale if it wasn't found
   */
  endsWith: function(token, text) {
    var end = text.slice(0 - token.length);
    if (end === token) {
      newText = text.slice(0, text.length - token.length);
      if (newText.length > 0) {
        return newText;
      }
    }
    return false;
  },
  /**
   * Processes an array to only have unique items.
   *
   * @param Array array
   *   The array to process
   *
   * @return Array
   *   The processed array.
   */
  unique: function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
  },
  /**
   * Returns the timestamp formatted as "time since.."
   * e.g. "4 seconds ago"
   *
   * @param number timestamp
   *
   * @return string
   */
  timeSince: function(timestamp) {
    var seconds = Math.floor((new Date() - timestamp) / 1000);
    var interval = Math.floor(seconds / 31536000);

    if (interval > 1) {
      return interval + " years";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) {
      return interval + " months";
    }
    interval = Math.floor(seconds / 86400);
    if (interval > 1) {
      return interval + " days";
    }
    interval = Math.floor(seconds / 3600);
    if (interval > 1) {
      return interval + " hours";
    }
    interval = Math.floor(seconds / 60);
    if (interval > 1) {
      return interval + " minutes";
    }
    return Math.floor(seconds) + " seconds";
  },
  /**
   * Finds if an object key is set and has length.
   *
   * @param object object
   * @param string|number key
   *
   * @return bool
   */
  empty: function(object, key) {
    if (object !== null && object.hasOwnProperty(key)) {
      return false;
    }
    return true;
  }
};

/**
 * MongoDB backed brain. Contains a simple KV store as well as saving objects
 * to specific collections.
 */
bot.brain = {
  mongoClient: function() {
    var MongoClient = require('mongodb').MongoClient
        , format = require('util').format;
        return MongoClient;
  },
  /**
   * Save an item into the Key/Value store.
   *
   * @param string key
   * @param (anything) value
   * @param (optional) collection_name
   *   Store items into their own collection
   */
  saveKV: function(key, value, collection_name) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection_n = config.mongoPrefix + 'kv';
      if (collection_name !== null && typeof collection_name === 'string') {
        collection_n = config.mongoPrefix + collection_name;
      }
      var collection = db.collection(collection_n);
      collection.findAndModify(
        {key: key.toLowerCase()},
        [['_id','asc']],
        {$set: {value: value}},
        {upsert: true},
        function(err, object) {
          db.close();
        }
      );
    });
  },
  /**
   * Retrieve an item from the Key/value store.
   *
   * @param string key
   * @param (optional) collection_name
   *   If this item has been stored into it's own collection, provide the name here.
   * @param (optional) function success
   *   @return function(value){}
   */
  loadKV: function(key, collection_name, success) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection_n = config.mongoPrefix + 'kv';
      if (collection_name !== null && typeof collection_name === 'string') {
        collection_n = config.mongoPrefix + collection_name;
      }
      var collection = db.collection(collection_n);
      collection.findOne({key: key.toLowerCase()}, function(err, document) {
        if (document && document.value && typeof success === 'function') {
          success(document.value);
        }
        db.close();
      });
    });
  },
  /**
   * Delete an item from the Key/Value store.
   *
   * @param string key
   * @param (optional) collection_name
   *   If this item has been stored into it's own collection, provide the name here.
   */
  removeKV: function(key, collection_name) {
    if (typeof key === 'string') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        var collection_n = config.mongoPrefix + 'kv';
        if (collection_name !== null && typeof collection_name === 'string') {
          collection_n = config.mongoPrefix + collection_name;
        }
        var collection = db.collection(collection_n);
        collection.remove({key: key}, {w:1}, function(err, numberOfRemovedDocs) {
          db.close();
        });
      });
    }
  },
  /**
   * Log an item into the message log. This is automatically initiated for every message in a channel
   * the bot resides in.
   *
   * @param object data
   */
  messageLog: function(data) {
    if (data !== null && typeof data === 'object') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        data.time = new Date().getTime();
        var collection  = db.collection(config.mongoPrefix + 'logs');
        collection.insert(data, {safe: true}, function(err, records) {
          db.close();
        });
      });
    }
  },
  /**
   * Load an item from the message log.
   * @param object search parameters
   *   {nick: "lubot"}
   * @param object options
   *   {limit: 20, skip: 10, sort: "title"}
   * @param function success
   *   @return function(docs) {}
   */
  loadMessageLog: function(search, options, success) {
    if (typeof search === 'object' && typeof options === 'object' && typeof success === 'function') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        options_m = {};
        if (options !== null && typeof options === "object") {
          options_m = options;
        }
        var collection = db.collection(config.mongoPrefix + 'logs');
        collection.find(search, options, function(err, cursor) {
          if (cursor !== null) {
            cursor.toArray(function(err, docs) {
              success(docs);
              db.close();
            });
          }
        });
      });
    }
  },
  /**
   * Search the message log.
   *
   * @param stringtext
   *   @see http://docs.mongodb.org/manual/tutorial/search-for-text/
   *
   * @return ?
   */
  searchMessageLog: function(text) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      db.command({text: config.mongoPrefix + 'logs', search: text}, function(err, objects) {
        console.log(objects);
        db.close();
      });
    });
  },
  /**
   * Save data to a collection.
   *
   * @param string collection_name
   * @param object data
   */
  saveToCollection: function(collection_name, data) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection = db.collection(config.mongoPrefix + collection_name);
      collection.insert(data, {safe: true}, function(err, records) {
        db.close();
      });
    });
  },
  /**
   * Update or insert data in a collection.
   *
   * @param string collection_name
   * @param object search
   * @param object data
   */
  upsertToCollection: function(collection_name, search, data) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection = db.collection(config.mongoPrefix + collection_name);
      collection.update(
        search,
        {$set: data},
        {upsert: true}, function(err, count) {
          db.close();
        }
      );
    });
  },
  /**
   * Load data from a collection.
   *
   * @param string collection_name
   * @param object search parameters
   *   {nick: "lubot"}
   * @param object options
   *   {limit: 20, skip: 10, sort: "title"}
   * @param function success
   *   @return function(docs) {}
   */
  loadFromCollection: function(collection_name, search, options, success) {
    if (typeof collection_name === 'string' && typeof search === 'object' && typeof options === 'object' && typeof success === 'function') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        options_m = {};
        if (options !== null && typeof options === "object") {
          options_m = options;
        }
        var collection = db.collection(config.mongoPrefix + collection_name);
        collection.find(search, options, function(err, cursor) {
          if (cursor !== null) {
            cursor.toArray(function(err, docs) {
              success(docs);
              db.close();
            });
          }
        });
      });
    }
  },
  /**
   * Delete an item from a collection.
   *
   * @param string collection_name
   * @param object search parameters
   *   {nick: "lubot"}
   */
  removeFromCollection: function(collection_name, search) {
    if (typeof collection_name === 'string' && typeof search === 'object') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        var collection = db.collection(config.mongoPrefix + collection_name);
        collection.remove(search, {w:1}, function(err, numberOfRemovedDocs) {
          db.close();
        });
      });
    }
  },
  /**
   * Increment a number value stored in the Key/Value store.
   * Negative numbers can also be used to decrement values.
   *
   * @param string|object key or search object
   * @param number amount
   * @param (optional) string collection_name
   *   If this item has been stored into it's own collection, provide the name here.
   */
  incValue: function(key, amount, collection_name) {
    if (key !== null && amount !== null && typeof amount === 'number') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        var collection_n = config.mongoPrefix + 'kv';
        if (collection_name !== null && typeof collection_name === "string" && collection_name.length > 0) {
          collection_n = config.mongoPrefix + collection_name;
        }
        var collection = db.collection(collection_n);
        var search = {};
        if (typeof key === 'string') {
          search.key = key;
        }
        else if (typeof key === 'object') {
          search = key;
        }
        collection.update(
          search,
          {$inc: {value: amount}},
          {upsert: true},
          function(err, object) {
            db.close();
          }
        );
      });
    }
  },
};

/**
 * Helpers for IRC.
 */
bot.helpers.irc = {
  /**
   * Gets a list of users in a channel.
   *
   * @param string channel
   *   channel name
   *
   * @return object
   */
  'channelUsers': function(channel) {
    if (typeof channel !== "undefined" && typeof bot.irc.chans !== "undefined" && typeof bot.irc.chans[channel] !== "undefined" && typeof bot.irc.chans[channel].users !== "undefined") {
      return bot.irc.chans[channel].users;
    }
    return {};
  },
};

/**
 * Logger
 */
bot.brain.mongoClient().connect(config.mongoUrl, function(err, db) {
  db.ensureIndex(config.mongoPrefix + 'logs', {text: "text"}, function(err, obj) {});
  bot.irc.addListener("message#", function(nick, to, text, message) {
    bot.brain.messageLog({nick: nick, channel: to, text: text});
  });
});

// Load Scripts
require("fs").readdirSync("./scripts").forEach(function(file) {
  if (bot.helpers.utils.endsWith(".js", file) !== false) {
    require("./scripts/" + file)(bot, app);
  }
});
