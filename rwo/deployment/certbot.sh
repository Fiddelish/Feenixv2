#!/bin/bash
. .env
which certbot >/dev/null || { echo certbot not found, did you activate venv?; exit 1; }
[[ -z "$COMMON_NAME" ]] && { echo COMMON_NAME required;  exit 1; }
[[ -z "$CERTBOT_FOLDER" || ! -d "$CERTBOT_FOLDER" ]] && { echo CERTBOT_FOLDER required; exit 1; }
DOMAIN_NAME=$COMMON_NAME
set -x
certbot $@ $CERTBOT_ARGS -d $DOMAIN_NAME --email $HOSTMASTER_EMAIL --manual --preferred-challenges=http --manual-auth-hook ./certbot-helper-auth.sh --manual-cleanup-hook ./certbot-helper-cleanup.sh --deploy-hook ./certbot-helper-deploy.sh --agree-tos -n --config-dir $CERTBOT_FOLDER/conf --work-dir $CERTBOT_FOLDER/work --logs-dir $CERTBOT_FOLDER/log
