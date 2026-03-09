# Changelog

## [1.0.0] - 2026-03-09

### Added
- Multi-inverter support: 6 Deye models (3-phase, 1-phase, micro/string)
- Dual protocol: Modbus TCP (port 502) and Solarman V5 (port 8899)
- CLI with table/JSON/CSV output formats
- Home Assistant addon with MQTT auto-discovery
- Shared connection pool with mutex for multi-unit setups

### Solarman Cloud Coexistence
- Short-lived TCP connections (connect -> read -> close) to minimize conflict window
- Jitter retry (200-1000ms, 4 attempts) for cloud collision recovery
- Stale cache: returns last known values marked with `*` on read failure
- Two-level polling (fast/slow tiers) to reduce connection hold time
- Configurable batch gap tolerance (default 10) for fewer TCP requests
