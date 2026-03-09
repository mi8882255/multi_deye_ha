import { Socket } from 'node:net';
import { createLogger } from '../utils/logger.js';
import { InverterNotRespondingError } from '../../shared/errors.js';

const log = createLogger('solarman-v5');

const FRAME_START = 0xa5;
const FRAME_END = 0x15;
const CONTROL_REQUEST = 0x45;
const CONTROL_RESPONSE = 0x15;
const CONTROL_TIME_SYNC = 0x21;
const CONTROL_TIME_SYNC_RESPONSE = 0x31;
const CONTROL_SUFFIX = 0x10;
const FRAME_TYPE = 0x02;

/**
 * Total frame length = payloadLength + 13.
 *
 * The 13 "overhead" bytes NOT counted in payloadLength:
 *   start(1) + lengthField(2) + suffix(1) + control(1) + seq(2) + serial(4) + checksum(1) + end(1)
 */
const FRAME_OVERHEAD = 13;

/** CRC-16/Modbus — required by Deye loggers in V5 frames. */
function modbusCRC(buf: Buffer): Buffer {
  let crc = 0xffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  const result = Buffer.alloc(2);
  result.writeUInt16LE(crc, 0);
  return result;
}

/**
 * Solarman V5 protocol client.
 *
 * Deye inverters with Wi-Fi loggers expose port 8899 using the Solarman V5
 * protocol, NOT raw Modbus TCP. This wraps Modbus RTU frames in a Solarman
 * V5 envelope (header with logger serial number + checksum).
 *
 * Request frame layout:
 *   [0]      0xA5 (start)
 *   [1-2]    payload length (LE) = 15 + len(modbus)
 *   [3]      0x10 (control suffix)
 *   [4]      0x45 (control = request)
 *   [5-6]    sequence number (LE)
 *   [7-10]   logger serial (LE)
 *   [11]     frame type (0x02)
 *   [12-13]  sensor type (0x0000)
 *   [14-25]  time fields (zeros)
 *   [26..]   Modbus RTU frame
 *   [-2]     checksum (sum of [1]..[-3] mod 256)
 *   [-1]     0x15 (end)
 *
 * Response frame layout (14-byte sub-header instead of 15):
 *   [0]      0xA5
 *   [1-2]    payload length (LE) = 14 + len(modbus)
 *   [3]      0x10 (control suffix)
 *   [4]      0x15 (control = response)
 *   [5-6]    sequence number (LE)
 *   [7-10]   logger serial (LE)
 *   [11]     frame type (0x02)
 *   [12]     status (1 byte, NOT 2 like request sensor type)
 *   [13-24]  time fields (working time, power on, offset)
 *   [25..]   Modbus RTU frame
 *   [-2]     checksum
 *   [-1]     0x15
 */
export class SolarmanV5Client {
  private socket: Socket | null = null;
  private readonly host: string;
  private readonly port: number;
  private readonly serialNumber: number;
  private readonly timeout: number;
  private sequenceNumber = 1;
  private responseBuffer = Buffer.alloc(0);

  constructor(host: string, port: number, serialNumber: number, timeout = 5000) {
    this.host = host;
    this.port = port;
    this.serialNumber = serialNumber;
    this.timeout = timeout;
  }

  get isConnected(): boolean {
    return this.socket !== null && !this.socket.destroyed;
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    return new Promise((resolve, reject) => {
      this.socket = new Socket();
      this.socket.setTimeout(this.timeout);

      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      const onConnect = () => {
        cleanup();
        log.info({ host: this.host, port: this.port }, 'Solarman V5 connected');
        resolve();
      };

      const cleanup = () => {
        this.socket?.removeListener('error', onError);
        this.socket?.removeListener('connect', onConnect);
      };

      this.socket.once('error', onError);
      this.socket.once('connect', onConnect);
      this.socket.connect(this.port, this.host);
    });
  }

  close(): void {
    if (this.socket) {
      this.socket.destroy();
      this.socket = null;
    }
  }

  /**
   * Send a Modbus RTU request wrapped in Solarman V5 protocol and return the response.
   */
  async readHoldingRegisters(
    unitId: number,
    startAddress: number,
    quantity: number,
  ): Promise<number[]> {
    if (!this.isConnected) {
      throw new Error('Solarman V5 not connected');
    }

    // Build Modbus RTU request with CRC (required by Deye loggers)
    const pdu = Buffer.alloc(6);
    pdu.writeUInt8(unitId, 0);
    pdu.writeUInt8(0x03, 1); // function code: read holding registers
    pdu.writeUInt16BE(startAddress, 2);
    pdu.writeUInt16BE(quantity, 4);
    const modbusFrame = Buffer.concat([pdu, modbusCRC(pdu)]);

    const request = this.buildV5Frame(modbusFrame);
    const response = await this.sendAndReceive(request);
    return this.parseReadResponse(response, quantity);
  }

  /**
   * Build a Solarman V5 request frame.
   */
  private buildV5Frame(modbusFrame: Buffer): Buffer {
    const seq = this.sequenceNumber++ & 0xffff;

    // payloadLength covers: frameType(1) + sensorType(2) + times(12) + modbus
    const payloadLength = 15 + modbusFrame.length;
    const totalLength = payloadLength + FRAME_OVERHEAD;

    const frame = Buffer.alloc(totalLength); // alloc zeros everything

    frame[0] = FRAME_START; // 0xA5
    frame.writeUInt16LE(payloadLength, 1);
    frame[3] = CONTROL_SUFFIX; // 0x10
    frame[4] = CONTROL_REQUEST; // 0x45
    frame.writeUInt16LE(seq, 5);
    frame.writeUInt32LE(this.serialNumber, 7);
    frame[11] = FRAME_TYPE; // 0x02
    // [12-25] = zeros (sensor type + time fields) — already zero from alloc
    modbusFrame.copy(frame, 26);

    // Checksum: sum bytes [1] through [-3] (everything except start, checksum, end)
    let checksum = 0;
    for (let i = 1; i < totalLength - 2; i++) {
      checksum = (checksum + frame[i]) & 0xff;
    }
    frame[totalLength - 2] = checksum;
    frame[totalLength - 1] = FRAME_END; // 0x15

    return frame;
  }

  /**
   * Build a time sync response frame for the logger.
   */
  private buildTimeSyncResponse(): Buffer {
    const timestamp = Math.floor(Date.now() / 1000);
    // payloadLength = 4 (timestamp only)
    const payloadLength = 4;
    const totalLength = payloadLength + FRAME_OVERHEAD;

    const frame = Buffer.alloc(totalLength);
    frame[0] = FRAME_START;
    frame.writeUInt16LE(payloadLength, 1);
    frame[3] = CONTROL_SUFFIX;
    frame[4] = CONTROL_TIME_SYNC_RESPONSE; // 0x31
    frame.writeUInt16LE(0, 5); // seq
    frame.writeUInt32LE(this.serialNumber, 7);
    frame.writeUInt32LE(timestamp, 11);

    let checksum = 0;
    for (let i = 1; i < totalLength - 2; i++) {
      checksum = (checksum + frame[i]) & 0xff;
    }
    frame[totalLength - 2] = checksum;
    frame[totalLength - 1] = FRAME_END;

    return frame;
  }

  private sendAndReceive(request: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        return reject(new Error('Not connected'));
      }

      const socket = this.socket;
      this.responseBuffer = Buffer.alloc(0);

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timed out'));
      }, this.timeout);

      const onData = (data: Buffer) => {
        this.responseBuffer = Buffer.concat([this.responseBuffer, data]);

        // Try to extract a complete frame (handles time sync internally)
        const frame = this.tryParseFrame(this.responseBuffer);
        if (frame) {
          cleanup();
          resolve(frame);
        }
      };

      const onError = (err: Error) => {
        cleanup();
        reject(err);
      };

      const onClose = () => {
        cleanup();
        reject(new Error('Connection closed'));
      };

      const cleanup = () => {
        clearTimeout(timer);
        socket.removeListener('data', onData);
        socket.removeListener('error', onError);
        socket.removeListener('close', onClose);
      };

      socket.on('data', onData);
      socket.once('error', onError);
      socket.once('close', onClose);

      socket.write(request);
    });
  }

  /**
   * Try to parse a complete Solarman V5 response frame.
   * Returns the Modbus RTU payload (without V5 wrapper) or null if incomplete.
   * Handles time sync requests from the logger automatically.
   */
  private tryParseFrame(buf: Buffer): Buffer | null {
    // Need at least: start(1) + length(2) + suffix(1) + control(1)
    if (buf.length < 5) return null;

    // Find start marker
    const startIdx = buf.indexOf(FRAME_START);
    if (startIdx === -1) return null;

    if (buf.length < startIdx + 5) return null;

    const payloadLength = buf.readUInt16LE(startIdx + 1);

    // Total frame = payloadLength + 13 (overhead bytes)
    const totalLength = payloadLength + FRAME_OVERHEAD;

    if (buf.length < startIdx + totalLength) return null;

    const endByte = buf[startIdx + totalLength - 1];
    if (endByte !== FRAME_END) {
      log.warn(
        {
          endByte,
          payloadLength,
          totalLength,
          bufLen: buf.length,
          hex: buf.subarray(startIdx, startIdx + Math.min(totalLength, 60)).toString('hex'),
        },
        'Invalid frame end marker',
      );
      // Skip this start byte and try to find another frame
      this.responseBuffer = buf.subarray(startIdx + 1);
      return null;
    }

    // Valid frame found — check what type it is
    const controlCode = buf[startIdx + 4];

    // Handle time sync request from the logger
    if (controlCode === CONTROL_TIME_SYNC) {
      log.info('Logger requested time sync, responding');
      if (this.socket && !this.socket.destroyed) {
        this.socket.write(this.buildTimeSyncResponse());
      }
      // Remove this frame from buffer and continue looking for data response
      this.responseBuffer = buf.subarray(startIdx + totalLength);
      // Recursively try to parse next frame (there might be one already)
      if (this.responseBuffer.length > 0) {
        return this.tryParseFrame(this.responseBuffer);
      }
      return null;
    }

    // Skip non-data-response frames (keepalives, etc.)
    if (controlCode !== CONTROL_RESPONSE) {
      log.debug({ controlCode: controlCode.toString(16) }, 'Skipping non-data frame');
      this.responseBuffer = buf.subarray(startIdx + totalLength);
      if (this.responseBuffer.length > 0) {
        return this.tryParseFrame(this.responseBuffer);
      }
      return null;
    }

    // Verify checksum: sum bytes [1] through [-3]
    let expectedChecksum = 0;
    for (let i = startIdx + 1; i < startIdx + totalLength - 2; i++) {
      expectedChecksum = (expectedChecksum + buf[i]) & 0xff;
    }
    const actualChecksum = buf[startIdx + totalLength - 2];
    if (expectedChecksum !== actualChecksum) {
      log.warn(
        { expected: expectedChecksum, actual: actualChecksum },
        'Checksum mismatch',
      );
    }

    // Response sub-header is 14 bytes (frameType(1) + status(1) + times(12))
    // So Modbus RTU data starts at absolute offset 25 from frame start
    const modbusStart = startIdx + 25;
    const modbusEnd = startIdx + totalLength - 2; // before checksum and end

    if (modbusEnd <= modbusStart) {
      log.warn('Frame too short for Modbus payload');
      return null;
    }

    return buf.subarray(modbusStart, modbusEnd);
  }

  /**
   * Parse a Modbus RTU read holding registers response.
   * Response format: unitId(1) + funcCode(1) + byteCount(1) + data(N)
   */
  private parseReadResponse(modbusResponse: Buffer, expectedQuantity: number): number[] {
    if (modbusResponse.length < 3) {
      // Logger returned a short payload (e.g. 05 00) — inverter not responding
      throw new InverterNotRespondingError(
        `Inverter not responding (logger returned ${modbusResponse.toString('hex')})`,
      );
    }

    const funcCode = modbusResponse[1];

    // Check for Modbus exception
    if (funcCode & 0x80) {
      const exceptionCode = modbusResponse[2];
      throw new Error(
        `Modbus exception: function=0x${(funcCode & 0x7f).toString(16)}, code=${exceptionCode}`,
      );
    }

    const byteCount = modbusResponse[2];
    const expectedBytes = expectedQuantity * 2;

    if (byteCount !== expectedBytes) {
      log.warn(
        {
          byteCount,
          expectedBytes,
          modbusHex: modbusResponse.toString('hex'),
          modbusLen: modbusResponse.length,
        },
        'Byte count mismatch',
      );
    }

    // Only read the requested number of registers (not more)
    const actualBytes = Math.min(byteCount, expectedBytes);
    const data: number[] = [];
    for (let i = 0; i < actualBytes && i + 4 <= modbusResponse.length; i += 2) {
      data.push(modbusResponse.readUInt16BE(3 + i));
    }

    return data;
  }
}
