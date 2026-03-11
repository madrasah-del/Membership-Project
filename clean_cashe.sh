#!/bin/zsh

# 1. Clearing User Caches
echo "Cleaning User Caches..."
rm -rf ~/Library/Caches/*

# 2. Clearing System Caches (Requires Password)
echo "Cleaning System Caches..."
sudo rm -rf /Library/Caches/*

# 3. Clearing System Logs
echo "Cleaning System Logs..."
sudo rm -rf /private/var/log/*
sudo rm -rf /Library/Logs/*

echo "Cleanup Complete. It is highly recommended to restart your Mac now."

chmod +x clean_cashe.sh

./clean_cash.sh


