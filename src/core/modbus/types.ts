export interface ModbusClientOptions {
  host: string;
  port: number;
  timeout?: number;
  retries?: number;
  /** Minimum delay between retries in ms (jitter lower bound) */
  retryMinDelay?: number;
  /** Maximum delay between retries in ms (jitter upper bound) */
  retryMaxDelay?: number;
  /** Logger serial number (required for Solarman V5 protocol on port 8899) */
  serialNumber?: number;
  /** Transport protocol. Auto-detected if not set: 'solarman' when serialNumber is provided, 'tcp' otherwise */
  protocol?: 'tcp' | 'solarman';
}

export interface RegisterResult {
  /** Map of register address → raw 16-bit value */
  registers: Map<number, number>;
  /** Addresses that failed to read */
  errors: number[];
}
