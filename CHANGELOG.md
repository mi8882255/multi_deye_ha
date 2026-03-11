# Changelog

## [1.2.5] - 2026-03-11

### Fixed
- `pv_total_power` and `vt_solar_power` now computed as sum of individual PV power registers via `MathSensor` — Deye has no dedicated "PV Total" register
  - `deye-hybrid-1p`: was reading register 184 (= `battery_soc`), showed 99% as 99W — now `sumOf: [186, 187]` (PV1+PV2)
  - `deye-sg05lp3`: was reading register 675 (= PV4 Power), always 0 on 2-MPPT — now `sumOf: [672, 673]` (PV1+PV2)
  - `deye-sun-3phase-lv`: was reading register 675 (= PV4 Power) — now `sumOf: [674, 678]` (PV1+PV2)
  - `deye-sun-3phase-hv`: overrides LV with `sumOf: [674, 678, 682, 686]` (PV1-PV4)
  - `deye-sg02lp1`: overrides hybrid-1p with `sumOf: [186, 187, 188]` (PV1-PV3)
  - `deye-micro`: unchanged (register 82 = real `dc_total_power`)

### Added
- `sumOf` field in `SensorDefinition` — declarative computed sensors (sum of registers)
- `buildSensors()` automatically creates `MathSensor` instances for definitions with `sumOf`
- `VirtualTotalMapping.solar` now accepts `{ sumOf: number[] }` for computed totals

## [1.2.4] - 2026-03-11

### Fixed
- `deye-sg05lp3`: `grid_power_factor` now correctly uses signed interpretation (was showing 6553% instead of -0.5%)
- `deye-hybrid-1p`: removed L2 sensors (`grid_l2_power`, `external_ct_l2_power`, `inverter_l2_power`, `load_l2_power`) — meaningless on single-phase inverters (always read 0)

### Added
- `deye-sg05lp3`: `bms_temperature` sensor (register 217, validated against real hardware)
- Sensor reference documentation (`docs/sensors.md`) with full description of all sensors per model

## [1.2.3] - 2026-03-10

### Changed
- Renamed virtual sensor display names to "VT" prefix for easier HA discovery (e.g. "VT Solar Power" instead of "Total Solar Power")

## [1.2.2] - 2026-03-09

### Fixed
- `deye-hybrid-1p`: `pv_total_power` register size 2→1 (32-bit read produced garbage ~1.2MW, correct value is 16-bit)

## [1.2.1] - 2026-03-09

### Added
- `vt_generator_power` virtual sensor for hybrid models (`deye-sg05lp3`, `deye-hybrid-1p`)

## [1.2.0] - 2026-03-09

### Added
- Unified virtual total sensors (`vt_` prefix) across all 6 inverter models — same sensor IDs regardless of inverter type
  - `vt_solar_power`, `vt_grid_power`, `vt_load_power`, `vt_inverter_power`, `vt_battery_power`
  - `createVirtualTotals()` helper in `common.ts` with `VirtualTotalMapping` interface
- Missing total sensors: `pv_total_power` (sg05lp3, hybrid-1p), `external_ct_total_power` (sun-3phase-lv), `inverter_total_power` (sun-3phase-lv)
- Virtual sensors documentation in README

### Changed
- MQTT addon: auto-detect Supervisor credentials (no manual mqtt_username/password needed)

## [1.1.3] - 2026-03-09

### Changed
- HA addon config: extended schema with `serialNumber`, `retries`, `retryMinDelay`, `retryMaxDelay` per inverter
- HA config loader: robust option parsing with Supervisor API fallback for MQTT credentials

## [1.1.2] - 2026-03-09

### Fixed
- Dockerfile optimizations, reduced image size
- HA addon config schema updates

## [1.1.1] - 2026-03-09

### Fixed
- Dockerfile build fixes for HA addon
- Config schema adjustments

## [1.1.0] - 2026-03-09

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
