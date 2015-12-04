#!/usr/bin/env bash

rm crashChecker.log
./gruntWithKeys.sh prod | tee crashChecker.log &


while true
do
    echo "checking"
    if [[ $(tail -n 1 crashChecker.log| sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g"| sed -e  's/^[[:space:]]*//') = '[nodemon] app crashed - waiting for file changes before starting...' ]]
    then echo "killing node"
         killall grunt
         cat crashChecker.log >> crashLogs.log
         rm crashChecker.log
         ./gruntWithKeys.sh prod | tee crashChecker.log &
    else echo "chill"
    fi
    sleep 5
done
