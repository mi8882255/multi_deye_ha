#!/usr/bin/with-contenv bashio

bashio::log.info "Starting Deye Multi-Inverter Reader..."

cd /app
exec node dist/ha-addon/addon.js
