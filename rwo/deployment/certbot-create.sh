#!/bin/bash
DOMAIN_NAME=$COMMON_NAME
if [[ -z "$COMMON_NAME" ]]; then echo COMMON_NAME required; exit; fi
set +x
certbot certonly $* --test-cert --manual --preferred-challenges=http --manual-auth-hook ./certbot-helper-auth.sh --manual-cleanup-hook ./certbot-helper-cleanup.sh --deploy-hook ./certbot-helper-deploy.sh -d $DOMAIN_NAME -d www.$DOMAIN_NAME --email hostmaster@$DOMAIN_NAME --agree-tos -n --config-dir $CERTBOT_FOLDER/conf --work-dir $CERTBOT_FOLDER/work --logs-dir $CERTBOT_FOLDER/log
