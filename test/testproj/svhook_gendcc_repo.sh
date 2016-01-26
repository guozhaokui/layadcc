#!/bin/sh
cur=$(pwd)
cd ../gamesroot/
git --git-dir=.git status
git --git-dir=.git pull origin master
cd $cur
