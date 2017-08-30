#!/bin/bash

sudo apt install python-requests python-dateutil
wget https://raw.githubusercontent.com/YunoHost/apps/master/list_builder.py

mkdir locales
python list_builder.py labriqueinternet.list -o labriqueinternet.json

rmdir locales
rm list_builder.py

exit 0
