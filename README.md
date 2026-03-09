# Deye Multi-Inverter Reader

Приложение для чтения данных с одного или нескольких инверторов Deye по протоколу **Modbus TCP**. Два режима работы: консольный (CLI) и как аддон Home Assistant (MQTT).

## Поддерживаемые модели

### Трёхфазные

| Модель в конфиге | Инверторы | Тип | Сенсоров |
|---|---|---|---|
| `deye-sun-3phase-lv` | SUN-6K, SUN-8K, SUN-10K, SUN-12K | 3-фазный сетевой | 39 |
| `deye-sun-3phase-hv` | SUN-15K, SUN-20K | 3-фазный сетевой HV | 45 |
| `deye-sg05lp3` | SUN-5K÷20K-SG05LP3-EU (вкл. SUN-20K-SG05LP3-EU-SM2) | 3-фазный гибридный | 98 |

### Однофазные

| Модель в конфиге | Инверторы | Тип | Сенсоров |
|---|---|---|---|
| `deye-hybrid-1p` | SUN-5K/6K-SG03LP1-EU, SUN-3.6K÷6K-SG04LP1-EU | 1-фазный гибрид, 2 MPPT | 64 |
| `deye-sg02lp1` | SUN-8K÷16K-SG02LP1-EU, SUN-8K÷16K-SG01LP1-EU | 1-фазный гибрид, 3 MPPT | 67 |
| `deye-micro` | SUN-300G3÷2000G3, SUN-*K-G (строковые) | Микроинвертор / строковый | 23 |

> **Важно:** однофазные и трёхфазные инверторы Deye используют **полностью разные карты Modbus-регистров**. Это не "те же регистры минус L2/L3" — у них разные адреса для всех параметров. Поэтому при добавлении инвертора в конфиг обязательно укажите правильную модель.

Модель `deye-sg05lp3` совместима также с серией SG04LP3 (тот же протокол Modbus). Модель `deye-hybrid-1p` совместима с SG03LP1 и SG04LP1. Модель `deye-sg02lp1` — расширенная версия с 3-м MPPT и увеличенным масштабом grid power (x10).

### Таблица соответствия: модель на шильдике → модель в конфиге

Найдите название вашего инвертора на корпусе или в приложении и используйте значение из правого столбца в поле `model` конфига.

| Модель инвертора (шильдик) | Мощность | Фаз | Тип | `model` в конфиге |
|---|---|---|---|---|
| SUN-6K-G03 | 6 kW | 3 | Сетевой | `deye-sun-3phase-lv` |
| SUN-8K-G03 | 8 kW | 3 | Сетевой | `deye-sun-3phase-lv` |
| SUN-10K-G03 | 10 kW | 3 | Сетевой | `deye-sun-3phase-lv` |
| SUN-12K-G03 | 12 kW | 3 | Сетевой | `deye-sun-3phase-lv` |
| SUN-15K-G03 | 15 kW | 3 | Сетевой HV | `deye-sun-3phase-hv` |
| SUN-20K-G03 | 20 kW | 3 | Сетевой HV | `deye-sun-3phase-hv` |
| | | | | |
| SUN-5K-SG04LP3-EU | 5 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-6K-SG04LP3-EU | 6 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-8K-SG04LP3-EU | 8 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-10K-SG04LP3-EU | 10 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-12K-SG04LP3-EU | 12 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-5K-SG05LP3-EU | 5 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-6K-SG05LP3-EU | 6 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-8K-SG05LP3-EU | 8 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-10K-SG05LP3-EU | 10 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-12K-SG05LP3-EU | 12 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-14K-SG05LP3-EU | 14 kW | 3 | Гибрид | `deye-sg05lp3` |
| SUN-16K-SG05LP3-EU | 16 kW | 3 | Гибрид | `deye-sg05lp3` |
| **SUN-20K-SG05LP3-EU-SM2** | **20 kW** | **3** | **Гибрид** | **`deye-sg05lp3`** |
| | | | | |
| SUN-3.6K-SG04LP1-EU | 3.6 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-5K-SG04LP1-EU | 5 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-6K-SG04LP1-EU | 6 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-5K-SG03LP1-EU | 5 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-6K-SG03LP1-EU | 6 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-3.6K-SG05LP1-EU | 3.6 kW | 1 | Гибрид | `deye-hybrid-1p` |
| SUN-5K-SG05LP1-EU | 5 kW | 1 | Гибрид | `deye-hybrid-1p` |
| **SUN-6K-SG05LP1-EU** | **6 kW** | **1** | **Гибрид** | **`deye-hybrid-1p`** |
| | | | | |
| SUN-8K-SG01LP1-EU | 8 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-10K-SG01LP1-EU | 10 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-12K-SG01LP1-EU | 12 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-16K-SG01LP1-EU | 16 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-8K-SG02LP1-EU | 8 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-10K-SG02LP1-EU | 10 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| SUN-12K-SG02LP1-EU | 12 kW | 1 | Гибрид 3 MPPT | `deye-sg02lp1` |
| | | | | |
| SUN-300G3-EU-230 | 300 W | 1 | Микро | `deye-micro` |
| SUN-600G3-EU-230 | 600 W | 1 | Микро | `deye-micro` |
| SUN-800G3-EU-230 | 800 W | 1 | Микро | `deye-micro` |
| SUN-1000G3-EU-230 | 1000 W | 1 | Микро | `deye-micro` |
| SUN-1300G3-EU-230 | 1300 W | 1 | Микро | `deye-micro` |
| SUN-1600G3-EU-230 | 1600 W | 1 | Микро | `deye-micro` |
| SUN-2000G3-EU-230 | 2000 W | 1 | Микро | `deye-micro` |
| SUN-2K-G | 2 kW | 1 | Строковый | `deye-micro` |
| SUN-3K-G | 3 kW | 1 | Строковый | `deye-micro` |
| SUN-5K-G | 5 kW | 1 | Строковый | `deye-micro` |

> Суффиксы `-EU`, `-AM2`, `-SM2` обозначают регион/ревизию платы и **не влияют** на карту Modbus-регистров. Если вашей точной модели нет в таблице, выберите ближайшую по серии (SG0xLP1/LP3, G3, G).

## Что нужно для подключения

1. **Инвертор Deye** с поддержкой Modbus TCP (встроенный Wi-Fi/LAN модуль или внешний RS485-to-TCP конвертер)
2. **IP-адрес** инвертора в локальной сети
3. **Modbus Unit ID** (по умолчанию `1`; при каскадном подключении — у каждого инвертора свой)
4. **Порт** — стандартный Modbus TCP порт `502`
5. **Node.js >= 20** для запуска

## Установка

```bash
git clone <repo-url> && cd deyeAddon
npm install
```

## Быстрый старт

Посмотреть список поддерживаемых моделей и доступных сенсоров:

```bash
npx tsx src/cli/cli.ts discover
npx tsx src/cli/cli.ts discover --model deye-sun-3phase-lv
```

Однократное чтение с инвертора:

```bash
npx tsx src/cli/cli.ts poll -c config.yaml --once
```

---

## Конфигурация

Конфигурация описывается в YAML-файле (см. `config.example.yaml`).

### Один инвертор — минимальный конфиг

Самый простой случай: один инвертор, подключённый напрямую по сети.

```yaml
inverters:
  - id: inv-1
    host: 192.168.1.100   # IP-адрес инвертора
    port: 502              # Modbus TCP порт
    unitId: 1              # Modbus Unit ID
    model: deye-sun-3phase-lv
    name: "Мой инвертор"

scheduler:
  readInterval: 10         # как часто читать данные (секунды)
  reportInterval: 30       # как часто выводить/отправлять отчёт (секунды)

logLevel: info
```

### Два инвертора на разных IP

Каждый инвертор имеет свой IP-адрес. Приложение создаёт отдельное TCP-соединение для каждого и опрашивает их параллельно.

```yaml
inverters:
  - id: inv-1
    host: 192.168.1.100
    port: 502
    unitId: 1
    model: deye-sun-3phase-lv
    name: "Инвертор на крыше"

  - id: inv-2
    host: 192.168.1.101
    port: 502
    unitId: 1
    model: deye-sun-3phase-hv
    name: "Инвертор в гараже"

scheduler:
  readInterval: 10
  reportInterval: 30
```

Схема соединений:

```
Приложение ──TCP──▶ 192.168.1.100:502 (inv-1, unitId=1)
           ──TCP──▶ 192.168.1.101:502 (inv-2, unitId=1)
```

### Два инвертора на одном IP (разные Unit ID)

Частый случай: несколько инверторов подключены через один RS485-to-TCP шлюз или инверторы соединены каскадом. У них одинаковый IP, но разные Modbus Unit ID.

Приложение автоматически использует **одно** TCP-соединение и переключает Unit ID перед каждым запросом. Для предотвращения конфликтов используется **mutex** — запросы к одному хосту выполняются строго последовательно.

```yaml
inverters:
  - id: inv-1
    host: 192.168.1.100
    port: 502
    unitId: 1
    model: deye-sun-3phase-lv
    name: "Инвертор #1"

  - id: inv-2
    host: 192.168.1.100
    port: 502
    unitId: 2
    model: deye-sun-3phase-lv
    name: "Инвертор #2"

scheduler:
  readInterval: 10
  reportInterval: 30
```

Схема соединений:

```
                    ┌─ unitId=1 → Инвертор #1
Приложение ──TCP──▶ 192.168.1.100:502 ─┤  (shared TCP + mutex)
                    └─ unitId=2 → Инвертор #2
```

### Комбинированный сценарий

Можно комбинировать оба варианта — часть инверторов на общем хосте, часть на отдельных:

```yaml
inverters:
  - id: inv-1
    host: 192.168.1.100
    port: 502
    unitId: 1
    model: deye-sun-3phase-lv
    name: "Корпус A — инвертор 1"

  - id: inv-2
    host: 192.168.1.100
    port: 502
    unitId: 2
    model: deye-sun-3phase-lv
    name: "Корпус A — инвертор 2"

  - id: inv-3
    host: 192.168.1.101
    port: 502
    unitId: 1
    model: deye-sun-3phase-hv
    name: "Корпус B — инвертор 20K"

scheduler:
  readInterval: 10
  reportInterval: 30
```

```
                    ┌─ unitId=1 → inv-1
Приложение ──TCP──▶ 192.168.1.100:502 ─┤  (shared TCP)
                    └─ unitId=2 → inv-2
           ──TCP──▶ 192.168.1.101:502 ── inv-3  (отдельный TCP)
```

### Фильтрация сенсоров

По умолчанию читаются все сенсоры модели. Можно ограничить список:

```yaml
inverters:
  - id: inv-1
    host: 192.168.1.100
    port: 502
    unitId: 1
    model: deye-sun-3phase-lv
    name: "Только основные"
    sensors:
      - pv1_power
      - pv2_power
      - battery_soc
      - grid_voltage_l1
      - load_total_power
```

Список всех доступных ID сенсоров можно посмотреть командой:

```bash
npx tsx src/cli/cli.ts discover --model deye-sun-3phase-lv
```

---

## Сосуществование с облаком Solarman

Логгеры Solarman поддерживают только **одно TCP-соединение** одновременно. Облако подключается каждые 5–15 минут на несколько секунд. Приложение реализует несколько механизмов для бесконфликтной работы:

### Короткоживущие соединения

Вместо постоянного TCP-соединения: подключаемся → читаем все регистры → сразу закрываем. Окно конфликта с облаком минимально (200–800мс вместо постоянного).

### Быстрый retry с jitter

Если облако занимает соединение, retry через случайную задержку 200–1000мс (настраивается). До 4 попыток по умолчанию. Облако обычно держит соединение 2–5 секунд, поэтому один из retry-ов почти всегда проходит.

### Кеширование при сбоях

При полном отказе чтения — отдаются последние известные значения с пометкой `stale`. В таблице устаревшие значения отмечаются `*`, в JSON — поле `stale: true`.

### Двухуровневый опрос (fast/slow)

- **Fast** (каждый цикл): мощность, ток, напряжение, SOC — быстро меняющиеся параметры
- **Slow** (каждый N-й цикл): суммарная энергия, температуры — медленно меняющиеся параметры

Тир определяется автоматически по `deviceClass` сенсора. Настраивается через `slowPollMultiplier` (по умолчанию 6 → slow-сенсоры читаются раз в минуту при `readInterval: 10`).

### Укрупнение батчей

`gapTolerance: 10` (было 3) — соседние регистры с разрывом до 10 адресов объединяются в один запрос. Меньше TCP-запросов → короче время удержания соединения.

---

## Параметры конфигурации

| Параметр | Тип | Обязательный | По умолчанию | Описание |
|---|---|---|---|---|
| `inverters` | список | да | — | Список инверторов |
| `inverters[].id` | string | да | — | Уникальный идентификатор |
| `inverters[].host` | string | да | — | IP-адрес инвертора |
| `inverters[].port` | number | нет | `502` | Modbus TCP порт |
| `inverters[].unitId` | number | нет | `1` | Modbus Unit ID (1–247) |
| `inverters[].model` | string | да | — | Модель (см. таблицу выше) |
| `inverters[].name` | string | нет | = id | Отображаемое имя |
| `inverters[].sensors` | string[] | нет | все | Фильтр сенсоров по ID |
| `inverters[].serialNumber` | number | нет | — | Серийный номер логгера (для Solarman V5, порт 8899) |
| `inverters[].retries` | number | нет | `4` | Количество повторных попыток чтения |
| `inverters[].retryMinDelay` | number | нет | `200` | Мин. задержка между retry (мс) |
| `inverters[].retryMaxDelay` | number | нет | `1000` | Макс. задержка между retry (мс) |
| `scheduler.readInterval` | number | нет | `10` | Интервал чтения (сек) |
| `scheduler.reportInterval` | number | нет | `30` | Интервал отчёта (сек) |
| `scheduler.gapTolerance` | number | нет | `10` | Макс. разрыв регистров для объединения в батч |
| `scheduler.staleThresholdSeconds` | number | нет | `120` | Через сколько секунд кеш считается устаревшим |
| `scheduler.slowPollMultiplier` | number | нет | `6` | Медленные сенсоры читаются каждый N-й цикл |
| `mqtt.host` | string | нет | `localhost` | MQTT брокер |
| `mqtt.port` | number | нет | `1883` | MQTT порт |
| `mqtt.username` | string | нет | — | MQTT логин |
| `mqtt.password` | string | нет | — | MQTT пароль |
| `mqtt.topicPrefix` | string | нет | `deye` | Префикс MQTT топиков |
| `mqtt.discoveryPrefix` | string | нет | `homeassistant` | Префикс HA auto-discovery |
| `logLevel` | string | нет | `info` | Уровень логирования |

---

## CLI — режим командной строки

### Команды

```bash
# Показать справку
npx tsx src/cli/cli.ts --help

# Список моделей
npx tsx src/cli/cli.ts discover

# Сенсоры конкретной модели
npx tsx src/cli/cli.ts discover --model deye-sun-3phase-lv

# Однократное чтение
npx tsx src/cli/cli.ts poll -c config.yaml --once

# Непрерывный опрос
npx tsx src/cli/cli.ts poll -c config.yaml

# Вывод в JSON
npx tsx src/cli/cli.ts poll -c config.yaml --once -f json

# Вывод в CSV
npx tsx src/cli/cli.ts poll -c config.yaml --once -f csv
```

### Форматы вывода

- **table** (по умолчанию) — человекочитаемая таблица
- **json** — JSON с массивом сенсоров
- **csv** — CSV для импорта в Excel / Grafana

---

## Home Assistant Addon

Аддон подключается к MQTT-брокеру и автоматически создаёт устройства и сенсоры в Home Assistant через MQTT Discovery.

### Установка

**Вариант 1 — Локальный аддон (рекомендуется для разработки):**

1. Скопировать **весь проект** на HA-машину:
   ```bash
   scp -r . root@homeassistant:/addons/deye_multi_inverter/
   ```
2. В Home Assistant: **Настройки → Дополнения → Магазин дополнений → ... (меню) → Проверить обновления**
3. Появится **Deye Multi-Inverter Reader** в разделе «Локальные дополнения» → установить
4. Настроить на вкладке **Конфигурация**, запустить

**Вариант 2 — Git-репозиторий (рекомендуется для production):**

1. Залить проект в git-репозиторий (GitHub/GitLab)
2. В Home Assistant: **Настройки → Дополнения → Магазин дополнений → ... (меню) → Репозитории** → добавить URL репозитория
3. Найти и установить аддон из магазина
4. Обновления будут приходить автоматически

**Вариант 3 — Только файлы аддона:**

Если HA-машина имеет ограниченный диск, можно скопировать только необходимое:
```bash
# На dev-машине: собрать проект
npm run build

# Скопировать на HA
scp -r ha-addon/ dist/ package.json package-lock.json root@homeassistant:/addons/deye_multi_inverter/
ssh root@homeassistant "cd /addons/deye_multi_inverter && npm install --production"
```

### Конфигурация аддона

Настраивается через UI Home Assistant. Пример:

```json
{
  "inverters": [
    {
      "id": "inv-1",
      "host": "192.168.1.100",
      "port": 8899,
      "unitId": 1,
      "model": "deye-hybrid-1p",
      "name": "Main Inverter",
      "serialNumber": 1234567890,
      "retries": 4,
      "retryMinDelay": 200,
      "retryMaxDelay": 1000
    }
  ],
  "mqtt_host": "core-mosquitto",
  "mqtt_port": 1883,
  "topic_prefix": "deye",
  "discovery_prefix": "homeassistant",
  "read_interval": 10,
  "report_interval": 30,
  "gap_tolerance": 10,
  "stale_threshold_seconds": 120,
  "slow_poll_multiplier": 6,
  "log_level": "info"
}
```

### MQTT-топики

Для каждого инвертора создаются:

- **Состояние**: `deye/<inverter_id>/state` — JSON со всеми текущими значениями
  - При наличии устаревших данных добавляется поле `_stale: true`
- **Discovery**: `homeassistant/sensor/<inverter_id>/<sensor_slug>/config` (или `binary_sensor/` для бинарных)
- **Доступность**: `deye/status` — `online` / `offline`

---

## Как узнать IP-адрес и Unit ID инвертора

1. **IP-адрес** — найдите в настройках роутера или в приложении Solarman/Deye. Инвертор подключается к Wi-Fi или LAN и получает IP по DHCP. Рекомендуется зафиксировать IP через резервирование DHCP.

2. **Unit ID** — по умолчанию `1`. Если подключено несколько инверторов через один шлюз:
   - Откройте настройки каждого инвертора
   - Задайте уникальные Modbus-адреса: 1, 2, 3...
   - Используйте соответствующие `unitId` в конфиге

3. **Порт** — стандартный `502`. Если используется конвертер RS485-to-TCP, порт может отличаться (часто `8899` или `23`).

---

## Архитектура

```
src/
├── core/           — библиотека (Modbus, сенсоры, состояние, опрос)
│   ├── modbus/     — TCP-клиент, пул соединений, batch-чтение
│   ├── sensors/    — классы сенсоров и реестр
│   ├── definitions/— карты регистров для каждой модели
│   ├── inverter/   — состояние и опрос инвертора
│   ├── scheduler/  — планировщик чтения/отчётов
│   └── utils/      — утилиты (логгер, slug, конвертация значений)
├── cli/            — консольное приложение (commander)
├── ha-addon/       — Home Assistant аддон (MQTT)
└── shared/         — общие типы и ошибки
```

Принцип работы:

1. **Scheduler** запускает циклы чтения с заданным интервалом
2. **InverterPoller** для каждого инвертора запрашивает регистры через **ModbusPool** (fast-сенсоры каждый цикл, slow — каждый N-й)
3. **ModbusPool** управляет короткоживущими TCP-соединениями: connect → read → close, доступ через mutex
4. При сбое — retry с jitter-задержкой (200–1000мс), при полном отказе — кеш с пометкой stale
5. Сырые значения регистров преобразуются в читаемые значения через **Sensor** (с учётом factor, offset, signed, enum)
6. Результат выводится в консоль (CLI) или отправляется в MQTT (Home Assistant)

---

## Разработка

```bash
# Установка зависимостей
npm install

# Запуск тестов
npm test

# Type-check
npx tsc --noEmit

# Dev-режим с перезапуском
npm run dev
```

## Лицензия

MIT
