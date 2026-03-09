export type InverterModel =
  | 'deye-sun-3phase-lv'   // SUN-6K/8K/10K/12K
  | 'deye-sun-3phase-hv'   // SUN-15K/20K
  | 'deye-sg05lp3'         // SUN-*K-SG05LP3-EU (3-phase hybrid, incl. SUN-20K-SG05LP3-EU-SM2)
  | 'deye-hybrid-1p'       // SUN-5K/6K-SG03LP1/SG04LP1-EU (1-phase hybrid, 2 MPPT)
  | 'deye-sg02lp1'         // SUN-8K÷16K-SG02LP1/SG01LP1-EU (1-phase hybrid, 3 MPPT)
  | 'deye-micro';          // SUN-300G3÷2000G3, SUN-*K-G (micro/string, no battery)

export interface InverterIdentity {
  id: string;
  name: string;
  model: InverterModel;
  host: string;
  port: number;
  unitId: number;
  /** Logger serial number (required for Solarman V5 protocol on port 8899) */
  serialNumber?: number;
}
