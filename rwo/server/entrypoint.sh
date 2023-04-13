#!/usr/bin/env sh

python create_db.py
python check_api.py
exec $@
