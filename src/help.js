/**
 * @file
 * API for collecting and displaying help text.
 */

function Help() {
 this._facts = {};
}

/**
 * Set a help fact.
 *
 * @param string key
 *   Unique keyword used to identify this help text. Usually the name of the
 *   script that set the help text.
 * @param string message
 *   The help text to be displayed when someone asks the bot for "help <key>?".
 */
Help.prototype.add = function(key, message) {
  this._facts[key] = message;
}

/**
 * Retrieve a help fact by key.
 *
 * @param string key
 *   Unique keyword used to identify this help text to retrieve.
 *
 * @return string|boolean
 *   The help text associated with <key>.
 */
Help.prototype.get = function(key) {
  if (typeof this._facts[key] !== 'undefined') {
    return this._facts[key];
  }

  return false;
}

/**
 * Retrieve a comma separated list of all the unique help text keys.
 *
 * @return string message
 *   Comma separated list of all known unique help keys.
 */
Help.prototype.getSummary = function() {
  var keys = Object.keys(this._facts);
  return keys.join(', ');
}

module.exports = Help;
