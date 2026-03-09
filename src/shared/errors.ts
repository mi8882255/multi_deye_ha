export class ModbusConnectionError extends Error {
  constructor(
    public readonly host: string,
    public readonly port: number,
    cause?: Error,
  ) {
    super(`Failed to connect to Modbus at ${host}:${port}`);
    this.name = 'ModbusConnectionError';
    if (cause) this.cause = cause;
  }
}

export class ModbusReadError extends Error {
  constructor(
    public readonly address: number,
    public readonly count: number,
    cause?: Error,
  ) {
    super(`Failed to read registers ${address}–${address + count - 1}`);
    this.name = 'ModbusReadError';
    if (cause) this.cause = cause;
  }
}

/**
 * Thrown when the Solarman V5 logger can reach us but the inverter
 * did not respond (e.g. inverter sleeping at night).
 * Should NOT trigger a reconnect — the connection to the logger is fine.
 */
export class InverterNotRespondingError extends Error {
  constructor(message = 'Inverter did not respond (logger returned error frame)') {
    super(message);
    this.name = 'InverterNotRespondingError';
  }
}

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigValidationError';
  }
}
