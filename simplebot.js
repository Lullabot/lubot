// Bot configuration.
var config = {
  channels: [""],
  server: "",
  botName: "",
  mongoUrl: "",
  mongoPrefix: ""
};

// Intialise the bot.
var bot = {
  helpers: {}
};

// Connect to IRC.
var irc = require("irc");
bot.irc = new irc.Client(config.server, config.botName, {
  channels: config.channels
});
bot.irc.addListener("registered", function(channel, who) {
  console.log('Connected to ' + config.server);
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
  'startsWith': function(token, text) {
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
  'endsWith': function(token, text) {
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
  'unique': function(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
      for(var j=i+1; j<a.length; ++j) {
        if(a[i] === a[j]) {
          a.splice(j--, 1);
        }
      }
    }
    return a;
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
  saveKV: function(key, value, collection_name) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection_n = config.mongoPrefix + 'kv';
      if (collection_name !== null && typeof collection_name === 'string') {
        collection_n = config.mongoPrefix + collection_name;
      }
      var collection = db.collection(collection_n);
      collection.findAndModify(
        {key: key},
        [['_id','asc']],
        {$set: {value: value}},
        {upsert: true},
        function(err, object) {
          db.close();
        }
      );
    });
  },
  loadKV: function(key, collection_name, success, error) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection_n = config.mongoPrefix + 'kv';
      if (collection_name !== null && typeof collection_name === 'string') {
        collection_n = config.mongoPrefix + collection_name;
      }
      var collection = db.collection(collection_n);
      collection.findOne({key: key}, function(err, document) {
        if (document && document.value && typeof success === 'function') {
          success(document.value);
        }
        else if (typeof error === 'function') {
          error(document);
        }
        db.close();
      });
    });
  },
  incKV: function(key, amount, collection_name, success) {
    if (key !== null && typeof key === 'string' && amount !== null && typeof amount === 'number') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        var collection_n = config.mongoPrefix + 'kv';
        if (collection_name !== null && typeof collection_name === 'string') {
          collection_n = config.mongoPrefix + collection_name;
        }
        var collection = db.collection(collection_n);
        collection.update(
          {key: key},
          {$inc: {value: amount}},
          {upsert: true},
          function(err, object) {
            if (success !== null && typeof success === 'function') {
              success(object);
            }
            db.close();
          }
        );
      });
    }
  },
  /**
   * Save a user to the database.
   *
   * @param string account
   *   The account name. "bob"
   * @param function sucess
   *   Success callback function.
   *   function(account) {}
   *     @param Object account
   *       The updated user account.
   */
  createUser: function(account, success) {
    if (account !== null && typeof account === 'string') {
      this.mongoClient().connect(config.mongoUrl, function(err, db) {
        if (err) throw err;
        var collection = db.collection(config.mongoPrefix + 'users');
        collection.update(
          {account: account},
          {account: account},
          {upsert: true},
          function(err, object) {
            if (typeof success === 'function') {
              success(object);
            }
            db.close();
          }
        );
      });
    }
  },
  saveToCollection: function(collection_name, id, data) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection = db.collection(config.mongoPrefix + collection_name);
      data.id = id;
      collection.findAndModify(
        {id: id},
        [['_id','asc']],
        {$set: data},
        {upsert: true},
        function(err, object) {
          db.close();
        }
      );
    });
  },
  loadFromCollection: function(collection_name, id, success, error) {
    this.mongoClient().connect(config.mongoUrl, function(err, db) {
      if (err) throw err;
      var collection = db.collection(config.mongoPrefix + collection_name);
      collection.findOne({id: id}, function(err, document) {
        if (document && typeof success === 'function') {
          success(document);
        }
        else if (typeof error === 'function'){
          error(document);
        }
        db.close();
      });
    });
  }
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
  }
};

/**
 * Keep track of users.
 */
// When the bot gets a list of names when joiining a channel.
bot.irc.addListener('names', function(channel, nicks) {
  for(var nick in nicks) {
    var whois = bot.irc.whois(nick, function(info) {
      if (info.account) {
        // Registered nick.
        bot.brain.createUser(info.account);
      }
    });
  }
});
// When a user joins a channel.
bot.irc.addListener('join', function(channel, nick, message) {
  var whois = bot.irc.whois(nick, function(info) {
    if (info.account) {
      // Registered nick.
      bot.brain.createUser(info.account);
    }
  });
});
// When a user changes their nick.
bot.irc.addListener('join', function(oldnick, newnick, channels, message) {
  var whois = bot.irc.whois(newnick, function(info) {
    if (info.account) {
      // Registered nick.
      bot.brain.createUser(info.account);
    }
  });
});


// Load Scripts
require("fs").readdirSync("./scripts").forEach(function(file) {
  if (bot.helpers.utils.endsWith(".js", file) !== false) {
    require("./scripts/" + file)(bot);
  }
});