# Sensor Reference

Complete list of sensors for each supported inverter model.

**Sign conventions:**
- **Grid power**: positive = import from grid, negative = export to grid
- **Inverter power**: positive = inverter producing, negative = consuming from grid
- **Battery power**: positive = charging, negative = discharging
- **Battery current**: positive = charging, negative = discharging

---

## Virtual Totals (vt_)

Unified sensors available across all models. Same `id` regardless of inverter type — register addresses differ per model.

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| vt_solar_power | VT Solar Power | W | 0..65535 | Total PV production |
| vt_inverter_power | VT Inverter Power | W | -32768..32767 | Total inverter output (+produce / -consume) |
| vt_grid_power | VT Grid Power | W | -32768..32767 | Grid exchange (+import / -export) |
| vt_load_power | VT Load Power | W | 0..65535 ¹ | Total home consumption |
| vt_battery_power | VT Battery Power | W | -32768..32767 | Battery (+charge / -discharge) |
| vt_generator_power | VT Generator Power | W | -32768..32767 | Generator input |

¹ On hybrid-1p `vt_load_power` is signed.

**Availability:**

| Sensor | hybrid-1p | sg02lp1 | sg05lp3 | sun-3ph-lv | sun-3ph-hv | micro |
|---|---|---|---|---|---|---|
| vt_solar_power | + | + | + | + | + | + |
| vt_inverter_power | + | + | + | + | + | + |
| vt_grid_power | + | + ² | + | + | + | - |
| vt_load_power | + | + | + | + | + | - |
| vt_battery_power | + | + | + | + | + | - |
| vt_generator_power | + | + | + | - | - | - |

² sg02lp1 uses factor=10 for grid power (high-power single-phase models).

---

## deye-hybrid-1p

Single-phase hybrid inverters with 2 MPPT.
Models: SUN-5K/6K-SG03LP1-EU, SUN-3.6K-6K-SG04LP1-EU.

### PV / DC Input

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv1_power | PV1 Power | W | 0..65535 | PV string 1 power |
| pv2_power | PV2 Power | W | 0..65535 | PV string 2 power |
| pv1_voltage | PV1 Voltage | V | 0..6553.5 | PV string 1 voltage |
| pv1_current | PV1 Current | A | 0..6553.5 | PV string 1 current |
| pv2_voltage | PV2 Voltage | V | 0..6553.5 | PV string 2 voltage |
| pv2_current | PV2 Current | A | 0..6553.5 | PV string 2 current |
| pv_total_power | PV Total Power | W | 0..65535 | Total PV power (all strings) |

### Grid

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| grid_voltage | Grid Voltage | V | 0..6553.5 | Grid input voltage |
| grid_frequency | Grid Frequency | Hz | 0..655.35 | Grid frequency |
| grid_current | Grid Current | A | -327.68..327.67 | Grid current (signed) |
| grid_l1_power | Grid L1 Power | W | -32768..32767 | Grid phase power |
| grid_total_power | Grid Total Power | W | -32768..32767 | Total grid power (+import / -export) |
| external_ct_l1_power | External CT L1 Power | W | -32768..32767 | External CT phase power |
| external_ct_total_power | External CT Total Power | W | -32768..32767 | External CT total |

### Inverter Output

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| inverter_voltage | Inverter Voltage | V | 0..6553.5 | Inverter output voltage |
| inverter_current | Inverter Current | A | -327.68..327.67 | Inverter output current |
| inverter_l1_power | Inverter L1 Power | W | -32768..32767 | Inverter output power |
| inverter_total_power | Inverter Total Power | W | -32768..32767 | Inverter total output |
| inverter_frequency | Inverter Frequency | Hz | 0..655.35 | Inverter output frequency |

### Load

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| load_voltage | Load Voltage | V | 0..6553.5 | Load side voltage |
| load_l1_power | Load L1 Power | W | -32768..32767 | Load phase power |
| load_total_power | Load Total Power | W | -32768..32767 | Total load consumption |
| load_frequency | Load Frequency | Hz | 0..655.35 | Load frequency |

### AUX / Generator

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| aux_power | AUX Power | W | -32768..32767 | AUX / generator input power |
| aux_voltage | AUX Voltage | V | 0..6553.5 | AUX input voltage |

### Battery

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| battery_temperature | Battery Temperature | °C | -100..5553.5 | Battery temperature (offset 1000) |
| battery_voltage | Battery Voltage | V | 0..655.35 | Battery voltage |
| battery_soc | Battery SOC | % | 0..100 | State of charge |
| battery_status | Battery Status | — | enum | 0=Charging, 1=Standby, 2=Discharging |
| battery_power | Battery Power | W | -32768..32767 | Battery power (+charge / -discharge) |
| battery_current | Battery Current | A | -327.68..327.67 | Battery current (+charge / -discharge) |

### BMS

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| bms_charging_voltage | BMS Charging Voltage | V | 0..655.35 | Max charging voltage from BMS |
| bms_discharging_voltage | BMS Discharging Voltage | V | 0..655.35 | Min discharging voltage from BMS |
| bms_charging_current_limit | BMS Charging Current Limit | A | 0..65535 | Max charging current allowed by BMS |
| bms_discharging_current_limit | BMS Discharging Current Limit | A | 0..65535 | Max discharging current allowed by BMS |
| bms_soc | BMS SOC | % | 0..100 | SOC reported by BMS |
| bms_voltage | BMS Voltage | V | 0..655.35 | Battery voltage reported by BMS |
| bms_current | BMS Current | A | -32768..32767 | Battery current reported by BMS |
| bms_temperature | BMS Temperature | °C | -100..5553.5 | Temperature reported by BMS (offset 1000) |

### Temperatures

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| dc_temperature | DC Temperature | °C | -100..5553.5 | DC side heatsink temperature |
| ac_temperature | AC Temperature | °C | -100..5553.5 | AC side heatsink temperature |
| environment_temperature | Environment Temperature | °C | -100..5553.5 | Ambient temperature sensor |

### Energy — Daily

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| day_pv_energy | Day PV Energy | kWh | 0..6553.5 | PV production today |
| day_battery_charge | Day Battery Charge | kWh | 0..6553.5 | Battery charged today |
| day_battery_discharge | Day Battery Discharge | kWh | 0..6553.5 | Battery discharged today |
| day_grid_import | Day Grid Import | kWh | 0..6553.5 | Imported from grid today |
| day_grid_export | Day Grid Export | kWh | 0..6553.5 | Exported to grid today |
| day_load_energy | Day Load Energy | kWh | 0..6553.5 | Load consumption today |

### Energy — Lifetime (32-bit)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| total_pv_energy | Total PV Energy | kWh | 0..429496729.5 | Lifetime PV production |
| total_battery_charge | Total Battery Charge | kWh | 0..429496729.5 | Lifetime battery charge |
| total_battery_discharge | Total Battery Discharge | kWh | 0..429496729.5 | Lifetime battery discharge |
| total_grid_export | Total Grid Export | kWh | 0..429496729.5 | Lifetime grid export |
| total_grid_import | Total Grid Import | kWh | 0..429496729.5 | Lifetime grid import |
| total_load_energy | Total Load Energy | kWh | 0..429496729.5 | Lifetime load consumption |

### Settings (read-only)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| work_mode | Work Mode | — | enum | 0=Export First, 1=Zero Export to Load, 2=Zero Export to CT |
| battery_max_charge_current | Battery Max Charge Current | A | 0..65535 | Max charge current setting |
| battery_max_discharge_current | Battery Max Discharge Current | A | 0..65535 | Max discharge current setting |
| battery_shutdown_soc | Battery Shutdown SOC | % | 0..100 | SOC at which inverter shuts down |
| battery_low_soc | Battery Low SOC | % | 0..100 | Low SOC warning threshold |

### Status

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| running_status | Running Status | — | enum | 0=Standby, 1=Self Check, 2=Normal, 3=Alarm, 4=Fault |
| grid_connected | Grid Connected | — | enum | 0=Off-Grid, 1=On-Grid |

---

## deye-sg02lp1

Single-phase hybrid inverters with 3 MPPT (high-power models).
Models: SUN-8K/10K/12K/16K-SG02LP1-EU, SUN-8K-16K-SG01LP1-EU.

Inherits all sensors from `deye-hybrid-1p` with the following changes:

### Overrides

| ID | Name | Unit | Change | Description |
|---|---|---|---|---|
| grid_total_power | Grid Total Power | W | factor=10 | Higher resolution for >8kW models |
| vt_grid_power | VT Grid Power | W | factor=10 | Same override for virtual sensor |

### Additional: PV3 (3rd MPPT)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv3_power | PV3 Power | W | 0..65535 | PV string 3 power |
| pv3_voltage | PV3 Voltage | V | 0..6553.5 | PV string 3 voltage |
| pv3_current | PV3 Current | A | 0..6553.5 | PV string 3 current |

---

## deye-sg05lp3

3-phase hybrid inverters (low voltage battery).
Models: SUN-5K/6K/8K/10K/12K/15K/20K-SG05LP3-EU.

### PV / DC Input

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv1_power | PV1 Power | W | 0..65535 | PV string 1 power |
| pv2_power | PV2 Power | W | 0..65535 | PV string 2 power |
| pv1_voltage | PV1 Voltage | V | 0..6553.5 | PV string 1 voltage |
| pv1_current | PV1 Current | A | 0..6553.5 | PV string 1 current |
| pv2_voltage | PV2 Voltage | V | 0..6553.5 | PV string 2 voltage |
| pv2_current | PV2 Current | A | 0..6553.5 | PV string 2 current |
| pv_total_power | PV Total Power | W | 0..65535 | Total PV power |

### Grid Voltage & Frequency

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| grid_voltage_l1 | Grid Voltage L1 | V | 0..6553.5 | Grid voltage phase A |
| grid_voltage_l2 | Grid Voltage L2 | V | 0..6553.5 | Grid voltage phase B |
| grid_voltage_l3 | Grid Voltage L3 | V | 0..6553.5 | Grid voltage phase C |
| grid_frequency | Grid Frequency | Hz | 0..655.35 | Grid frequency |

### Internal CT

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| internal_ct_l1_power | Internal CT L1 Power | W | -32768..32767 | Internal CT phase A power |
| internal_ct_l2_power | Internal CT L2 Power | W | -32768..32767 | Internal CT phase B power |
| internal_ct_l3_power | Internal CT L3 Power | W | -32768..32767 | Internal CT phase C power |
| internal_ct_total_power | Internal CT Total Power | W | -32768..32767 | Internal CT total |
| internal_ct_l1_current | Internal CT L1 Current | A | -327.68..327.67 | Internal CT phase A current |
| internal_ct_l2_current | Internal CT L2 Current | A | -327.68..327.67 | Internal CT phase B current |
| internal_ct_l3_current | Internal CT L3 Current | A | -327.68..327.67 | Internal CT phase C current |

### External CT (Grid Meter)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| external_ct_l1_power | External CT L1 Power | W | -32768..32767 | External CT phase A power |
| external_ct_l2_power | External CT L2 Power | W | -32768..32767 | External CT phase B power |
| external_ct_l3_power | External CT L3 Power | W | -32768..32767 | External CT phase C power |
| external_ct_total_power | External CT Total Power | W | -32768..32767 | External CT total |
| external_ct_l1_current | External CT L1 Current | A | -327.68..327.67 | External CT phase A current |
| external_ct_l2_current | External CT L2 Current | A | -327.68..327.67 | External CT phase B current |
| external_ct_l3_current | External CT L3 Current | A | -327.68..327.67 | External CT phase C current |

### Grid Power

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| grid_l1_power | Grid L1 Power | W | -32768..32767 | Grid phase A power |
| grid_l2_power | Grid L2 Power | W | -32768..32767 | Grid phase B power |
| grid_l3_power | Grid L3 Power | W | -32768..32767 | Grid phase C power |
| grid_total_power | Grid Total Power | W | -32768..32767 | Total grid power |
| grid_power_factor | Grid Power Factor | % | -3276.8..3276.7 | Power factor (cos phi) |

### Inverter Output

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| output_voltage_l1 | Output Voltage L1 | V | 0..6553.5 | Inverter output voltage phase A |
| output_voltage_l2 | Output Voltage L2 | V | 0..6553.5 | Inverter output voltage phase B |
| output_voltage_l3 | Output Voltage L3 | V | 0..6553.5 | Inverter output voltage phase C |
| output_current_l1 | Output Current L1 | A | -327.68..327.67 | Inverter output current phase A |
| output_current_l2 | Output Current L2 | A | -327.68..327.67 | Inverter output current phase B |
| output_current_l3 | Output Current L3 | A | -327.68..327.67 | Inverter output current phase C |
| inverter_l1_power | Inverter L1 Power | W | -32768..32767 | Inverter phase A power |
| inverter_l2_power | Inverter L2 Power | W | -32768..32767 | Inverter phase B power |
| inverter_l3_power | Inverter L3 Power | W | -32768..32767 | Inverter phase C power |
| inverter_total_power | Inverter Total Power | W | -32768..32767 | Inverter total output |
| output_frequency | Output Frequency | Hz | 0..655.35 | Inverter output frequency |

### Load

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| load_voltage_l1 | Load Voltage L1 | V | 0..6553.5 | Load voltage phase A |
| load_voltage_l2 | Load Voltage L2 | V | 0..6553.5 | Load voltage phase B |
| load_voltage_l3 | Load Voltage L3 | V | 0..6553.5 | Load voltage phase C |
| load_l1_power | Load L1 Power | W | 0..65535 | Load phase A power |
| load_l2_power | Load L2 Power | W | 0..65535 | Load phase B power |
| load_l3_power | Load L3 Power | W | 0..65535 | Load phase C power |
| load_total_power | Load Total Power | W | 0..65535 | Total home consumption |
| load_frequency | Load Frequency | Hz | 0..655.35 | Load frequency |

### Battery

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| battery_temperature | Battery Temperature | °C | -100..5553.5 | Battery temperature (offset 1000) |
| battery_voltage | Battery Voltage | V | 0..655.35 | Battery voltage |
| battery_soc | Battery SOC | % | 0..100 | State of charge |
| battery_power | Battery Power | W | -32768..32767 | Battery power (+charge / -discharge) |
| battery_current | Battery Current | A | -327.68..327.67 | Battery current (+charge / -discharge) |
| battery_capacity | Battery Corrected Capacity | Ah | 0..65535 | Corrected battery capacity |

### BMS

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| bms_charging_voltage | BMS Charging Voltage | V | 0..655.35 | Max charging voltage from BMS |
| bms_discharging_voltage | BMS Discharging Voltage | V | 0..655.35 | Min discharging voltage from BMS |
| bms_charging_current_limit | BMS Charging Current Limit | A | 0..65535 | Max charging current allowed by BMS |
| bms_discharging_current_limit | BMS Discharging Current Limit | A | 0..65535 | Max discharging current allowed by BMS |
| bms_soc | BMS SOC | % | 0..100 | SOC reported by BMS |
| bms_voltage | BMS Voltage | V | 0..655.35 | Battery voltage reported by BMS |
| bms_current | BMS Current | A | -32768..32767 | Battery current reported by BMS |
| bms_temperature | BMS Temperature | °C | -100..5553.5 | Temperature reported by BMS (offset 1000) |
| bms_battery_alarm | BMS Battery Alarm | — | 0..65535 | BMS alarm flags (bitmask) |
| bms_battery_fault | BMS Battery Fault | — | 0..65535 | BMS fault flags (bitmask) |

### Temperatures

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| dc_temperature | DC Temperature | °C | -100..5553.5 | DC side heatsink temperature |
| ac_temperature | AC Temperature | °C | -100..5553.5 | AC side heatsink temperature |

### Generator

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| generator_voltage_l1 | Generator Voltage L1 | V | 0..6553.5 | Generator voltage phase A |
| generator_voltage_l2 | Generator Voltage L2 | V | 0..6553.5 | Generator voltage phase B |
| generator_voltage_l3 | Generator Voltage L3 | V | 0..6553.5 | Generator voltage phase C |
| generator_l1_power | Generator L1 Power | W | -32768..32767 | Generator phase A power |
| generator_l2_power | Generator L2 Power | W | -32768..32767 | Generator phase B power |
| generator_l3_power | Generator L3 Power | W | -32768..32767 | Generator phase C power |
| generator_total_power | Generator Total Power | W | -32768..32767 | Generator total power |

### Energy — Daily

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| day_battery_charge | Day Battery Charge | kWh | 0..6553.5 | Battery charged today |
| day_battery_discharge | Day Battery Discharge | kWh | 0..6553.5 | Battery discharged today |
| day_grid_import | Day Grid Import | kWh | 0..6553.5 | Imported from grid today |
| day_grid_export | Day Grid Export | kWh | 0..6553.5 | Exported to grid today |
| day_load_energy | Day Load Energy | kWh | 0..6553.5 | Load consumption today |
| day_pv_energy | Day PV Energy | kWh | 0..6553.5 | PV production today |
| day_generator_energy | Day Generator Energy | kWh | 0..6553.5 | Generator production today |

### Energy — Lifetime (32-bit)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| total_battery_charge | Total Battery Charge | kWh | 0..429496729.5 | Lifetime battery charge |
| total_battery_discharge | Total Battery Discharge | kWh | 0..429496729.5 | Lifetime battery discharge |
| total_grid_import | Total Grid Import | kWh | 0..429496729.5 | Lifetime grid import |
| total_grid_export | Total Grid Export | kWh | 0..429496729.5 | Lifetime grid export |
| total_load_energy | Total Load Energy | kWh | 0..429496729.5 | Lifetime load consumption |
| total_pv_energy | Total PV Energy | kWh | 0..429496729.5 | Lifetime PV production |
| total_generator_energy | Total Generator Energy | kWh | 0..429496729.5 | Lifetime generator production |

### Settings (read-only)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| work_mode | Work Mode | — | enum | 0=Export First, 1=Zero Export to Load, 2=Zero Export to CT |
| energy_pattern | Energy Pattern | — | enum | 0=Battery First, 1=Load First |
| grid_charge_enabled | Grid Charge Enabled | — | enum | 0=Off, 1=On |
| solar_sell_enabled | Solar Sell Enabled | — | enum | 0=Off, 1=On |
| battery_shutdown_soc | Battery Shutdown SOC | % | 0..100 | SOC at which inverter shuts down |
| battery_low_soc | Battery Low SOC | % | 0..100 | Low SOC warning threshold |
| battery_max_charge_current | Battery Max Charge Current | A | 0..65535 | Max charge current setting |
| battery_max_discharge_current | Battery Max Discharge Current | A | 0..65535 | Max discharge current setting |
| zero_export_power | Zero Export Power | W | 0..65535 | Zero export target power |
| max_sell_power | Max Sell Power | W | 0..65535 | Maximum sell power to grid |

### Status

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| running_status | Running Status | — | enum | 0=Standby, 1=Self Check, 2=Normal, 3=Alarm, 4=Fault |
| ac_relay_status | AC Relay Status | — | 0..65535 | AC relay status code |

---

## deye-sun-3phase-lv

3-phase string inverters (low voltage).

### PV / DC Input

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv1_voltage | PV1 Voltage | V | 0..6553.5 | PV string 1 voltage |
| pv1_current | PV1 Current | A | 0..6553.5 | PV string 1 current |
| pv1_power | PV1 Power | W | 0..65535 | PV string 1 power |
| pv2_voltage | PV2 Voltage | V | 0..6553.5 | PV string 2 voltage |
| pv2_current | PV2 Current | A | 0..6553.5 | PV string 2 current |
| pv2_power | PV2 Power | W | 0..65535 | PV string 2 power |
| pv_total_power | PV Total Power | W | 0..65535 | Total PV power |

### Grid / AC

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| grid_voltage_l1 | Grid Voltage L1 | V | 0..6553.5 | Grid voltage phase A |
| grid_voltage_l2 | Grid Voltage L2 | V | 0..6553.5 | Grid voltage phase B |
| grid_voltage_l3 | Grid Voltage L3 | V | 0..6553.5 | Grid voltage phase C |
| grid_frequency | Grid Frequency | Hz | 0..655.35 | Grid frequency |
| internal_ct_l1_power | Internal CT L1 Power | W | -32768..32767 | Internal CT phase A |
| internal_ct_l2_power | Internal CT L2 Power | W | -32768..32767 | Internal CT phase B |
| internal_ct_l3_power | Internal CT L3 Power | W | -32768..32767 | Internal CT phase C |

### External CT

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| external_ct_l1_power | External CT L1 Power | W | -32768..32767 | External CT phase A |
| external_ct_l2_power | External CT L2 Power | W | -32768..32767 | External CT phase B |
| external_ct_l3_power | External CT L3 Power | W | -32768..32767 | External CT phase C |
| external_ct_total_power | External CT Total Power | W | -32768..32767 | External CT total |

### Inverter Output

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| inverter_l1_power | Inverter L1 Power | W | -32768..32767 | Inverter phase A power |
| inverter_l2_power | Inverter L2 Power | W | -32768..32767 | Inverter phase B power |
| inverter_l3_power | Inverter L3 Power | W | -32768..32767 | Inverter phase C power |
| inverter_total_power | Inverter Total Power | W | -32768..32767 | Inverter total output |

### Load

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| load_l1_power | Load L1 Power | W | 0..65535 | Load phase A power |
| load_l2_power | Load L2 Power | W | 0..65535 | Load phase B power |
| load_l3_power | Load L3 Power | W | 0..65535 | Load phase C power |
| load_total_power | Load Total Power | W | 0..65535 | Total load consumption |

### Battery

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| battery_temperature | Battery Temperature | °C | -100..5553.5 | Battery temperature (offset 1000) |
| battery_voltage | Battery Voltage | V | 0..655.35 | Battery voltage |
| battery_soc | Battery SOC | % | 0..100 | State of charge |
| battery_current | Battery Current | A | -327.68..327.67 | Battery current |
| battery_power | Battery Power | W | -32768..32767 | Battery power |

### Temperatures

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| dc_temperature | DC Temperature | °C | -100..5553.5 | DC side heatsink temperature |
| ac_temperature | AC Temperature | °C | -100..5553.5 | AC side heatsink temperature |

### Energy — Daily

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| day_grid_import | Day Grid Import | kWh | 0..6553.5 | Imported from grid today |
| day_grid_export | Day Grid Export | kWh | 0..6553.5 | Exported to grid today |
| day_pv_energy | Day PV Energy | kWh | 0..6553.5 | PV production today |
| day_load_energy | Day Load Energy | kWh | 0..6553.5 | Load consumption today |
| day_battery_charge | Day Battery Charge | kWh | 0..6553.5 | Battery charged today |
| day_battery_discharge | Day Battery Discharge | kWh | 0..6553.5 | Battery discharged today |

### Energy — Lifetime (32-bit)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| total_pv_energy | Total PV Energy | kWh | 0..429496729.5 | Lifetime PV production |
| total_load_energy | Total Load Energy | kWh | 0..429496729.5 | Lifetime load consumption |

### Status

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| running_status | Running Status | — | enum | 0=Standby, 1=Self Check, 2=Normal, 3=Alarm, 4=Fault |

---

## deye-sun-3phase-hv

3-phase string inverters (high voltage, 4 MPPT).

Inherits all sensors from `deye-sun-3phase-lv`, plus:

### Additional PV Inputs

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv3_voltage | PV3 Voltage | V | 0..6553.5 | PV string 3 voltage |
| pv3_current | PV3 Current | A | 0..6553.5 | PV string 3 current |
| pv3_power | PV3 Power | W | 0..65535 | PV string 3 power |
| pv4_voltage | PV4 Voltage | V | 0..6553.5 | PV string 4 voltage |
| pv4_current | PV4 Current | A | 0..6553.5 | PV string 4 current |
| pv4_power | PV4 Power | W | 0..65535 | PV string 4 power |

---

## deye-micro

Micro-inverters and small string inverters.

### PV / DC Input

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| pv1_voltage | PV1 Voltage | V | 0..6553.5 | PV string 1 voltage |
| pv1_current | PV1 Current | A | 0..6553.5 | PV string 1 current |
| pv2_voltage | PV2 Voltage | V | 0..6553.5 | PV string 2 voltage |
| pv2_current | PV2 Current | A | 0..6553.5 | PV string 2 current |
| pv3_voltage | PV3 Voltage | V | 0..6553.5 | PV string 3 voltage |
| pv3_current | PV3 Current | A | 0..6553.5 | PV string 3 current |
| pv4_voltage | PV4 Voltage | V | 0..6553.5 | PV string 4 voltage |
| pv4_current | PV4 Current | A | 0..6553.5 | PV string 4 current |
| dc_total_power | DC Total Power | W | 0..65535 | Total DC input power |

### AC Output

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| ac_voltage | AC Voltage | V | 0..6553.5 | AC output voltage |
| ac_current | AC Current | A | 0..6553.5 | AC output current |
| ac_frequency | AC Frequency | Hz | 0..655.35 | AC output frequency |
| ac_active_power | AC Active Power | W | 0..4294967295 | AC active power (32-bit) |
| operating_power | Operating Power | W | 0..65535 | Inverter operating power |

### Temperatures

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| radiator_temperature | Radiator Temperature | °C | -100..5553.5 | Radiator heatsink temperature |
| igbt_temperature | IGBT Temperature | °C | -100..5553.5 | IGBT module temperature |

### Energy — Daily

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| day_production | Day Production | kWh | 0..6553.5 | Total production today |
| day_pv1_energy | Day PV1 Energy | kWh | 0..6553.5 | PV string 1 production today |
| day_pv2_energy | Day PV2 Energy | kWh | 0..6553.5 | PV string 2 production today |

### Energy — Lifetime (32-bit)

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| total_production | Total Production | kWh | 0..429496729.5 | Lifetime total production |
| total_pv1_energy | Total PV1 Energy | kWh | 0..429496729.5 | Lifetime PV string 1 |
| total_pv2_energy | Total PV2 Energy | kWh | 0..429496729.5 | Lifetime PV string 2 |

### Status

| ID | Name | Unit | Range | Description |
|---|---|---|---|---|
| running_status | Running Status | — | enum | 0=Standby, 1=Self Check, 2=Normal, 3=Alarm, 4=Fault |
