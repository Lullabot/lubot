#!/usr/bin/env bash

# This script will help to migrate data from a Drupal bot.
# https://www.drupal.org/project/bot
#
# In order to do this we need to have access to the MySQL database for the
# Drupal bot, and the lubot mongodb database. You also need to have either the
# lubot started, or at least the mongodb instance needs to be running.

# Help text.
usage() { echo "Usage: $0 [-m arguments to pass to MySQL] [-d name of the mongodb database that contains the bots brain] -c [IRC channel name to assign imported data to]" 1>&2; exit 1; }

# Parse arguments from command line.
while getopts ":m:d:c:" o; do
    case "${o}" in
        m)
            MYSQL_STRING=${OPTARG}
            ;;
        d)
            MONGO_STRING=${OPTARG}
            ;;
        c)
            CHANNEL=${OPTARG}
            ;;
        *)
            usage
            ;;
    esac
done
shift $((OPTIND-1))

# Verify required arguments are present.
if [ -z "${MYSQL_STRING}" ] || [ -z "${MONGO_STRING}" ]; then
    usage
fi

# Where are we executing this script?
DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )

# Cleanup from any past runs that failed.
rm $DIR/karma.csv;
rm $DIR/factoids.csv;
rm $DIR/logs.csv;

# Dump the data from MySQL.
echo "Exporting karma data from MySQL";
echo "SELECT '$CHANNEL' AS channel, term AS 'key', karma AS 'value' INTO OUTFILE '$DIR/karma.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' FROM bot_karma;" | mysql $MYSQL_STRING;

# Import the karma data.
echo "Importing karma data";
mongoimport -d $MONGO_STRING -c lubot_karma --type csv --file $DIR/karma.csv --fields channel,key,value --upsert --upsertFields channel,key

# Cleanup karma.
rm $DIR/karma.csv;

# Export factoids.
echo "Exporting factoid data from MySQL";
echo "SELECT '$CHANNEL' AS channel, subject AS 'key', is_are AS 'is_are', statement AS 'factoid' INTO OUTFILE '$DIR/factoids.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' FROM bot_factoid;" | mysql $MYSQL_STRING;

# Import the factoid data.
echo "Importing factoid data";
mongoimport -d $MONGO_STRING -c lubot_factoids --type csv --file $DIR/factoids.csv --fields channel,key,is_are,factoid --upsert --upsertFields channel,key

# Cleanup factoids.
rm $DIR/factoids.csv;

# Export logs.
echo "Exporting logs data from MySQL";
echo "SELECT channel, nick, message AS 'text', timestamp AS 'time' INTO OUTFILE '$DIR/logs.csv' FIELDS TERMINATED BY ',' OPTIONALLY ENCLOSED BY '\"' LINES TERMINATED BY '\n' FROM bot_log;" | mysql $MYSQL_STRING;

# Import the log data.
echo "Importing log data";
mongoimport -d $MONGO_STRING -c lubot_logs --type csv --file $DIR/logs.csv --fields nick,channel,text,time --upsert --upsertFields nick,channel,time

# Cleanup logs.
rm $DIR/logs.csv;

echo "SUCCESS!";
exit 1;
