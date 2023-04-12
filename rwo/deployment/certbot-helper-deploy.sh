#!/bin/bash
. .env
[[ ! -d "$SSL_CERTS_FOLDER" ]] && exit 1
if [[ -r "${RENEWED_LINEAGE}/fullchain.pem" && -r "${RENEWED_LINEAGE}/privkey.pem" ]]; then
	cp "${RENEWED_LINEAGE}/fullchain.pem" "${RENEWED_LINEAGE}/privkey.pem" "$SSL_CERTS_FOLDER"
	docker-compose --env-file .env -f docker-compose.yml exec nginx nginx -s reload
fi
