export const Registers = {
  A: "regA",
  F: "regF",
  AF: "regA_regF",
  B: "regB",
  C: "regC",
  BC: "regB_regC",
  D: "regD",
  E: "regE",
  DE: "regD_regE",
  H: "regH",
  L: "regL",
  HL: "regH_regL",
  SP: "regSP",
  PC: "regPC",
  IME: "regIME" //not actually a register, it's a flag, but i'll say it's a register to have a single entrypoint to modifying cpu
};

export const Flags = {
  Z: "Z",
  N: "N",
  H: "H",
  C: "C"
};

export class CPU {
  constructor(gameBoy) {
    this.gameBoy_ = gameBoy;
    this[Registers.A] = 0x01;
    this[Registers.F] = 0x02;
    this[Registers.B] = 0x03;
    this[Registers.C] = 0x04;
    this[Registers.D] = 0x05;
    this[Registers.E] = 0x06;
    this[Registers.H] = 0x07;
    this[Registers.L] = 0x08;
    this[Registers.SP] = 0x1234;
    this[Registers.PC] = 0x1234;
    this[Registers.IME] = 0;
  }

  get GB() {
    return this.gameBoy_;
  }

  runFrame() {
    this.runInst();
  }

  runInst() {
    let addr = this.PC++;
    switch(this.GB.M.get(addr)) {
      case 0x00:
        return 4;
      case 0x01:
        this.ldr_(Registers.BC, this.GB.M.get(this.PC, 2));
        this.PC += 2;
        return 12;
      case 0x03:
        this.inc_(Registers.BC);
        return 8;
      case 0x0A:
        this.ldr_(Registers.A, this.GB.M.get(this.BC));
        return 8;
      case 0x11:
        this.ldr_(Registers.DE, this.GB.M.get(this.PC, 2));
        this.PC += 2;
        return 12;
      case 0x13:
        this.inc_(Registers.DE);
        return 8;
      case 0x18:
        this.jr_(this.GB.M.get(this.PC++));
        return 12;
      case 0x1A:
        this.ldr_(Registers.A, this.GB.M.get(this.DE));
        return 8;
      case 0x21:
        this.ldr_(Registers.HL, this.GB.M.get(this.PC, 2));
        this.PC += 2;
        return 12;
      case 0x23:
        this.inc_(Registers.HL);
        return 8;
      case 0x2A:
        this.ldr_(Registers.A, this.GB.M.get(this.HL));
        this.inc_(Registers.HL);
        return 8;
      case 0x31:
        this.ldr_(Registers.SP, this.GB.M.get(this.PC, 2));
        this.PC += 2;
        return 12;
      case 0x33:
        this.inc_(Registers.SP);
        return 8;
      case 0x3A:
        this.ldr_(Registers.A, this.GB.M.get(this.HL));
        this.dec_(Registers.HL);
        return 8;
      case 0x3E:
        this.ldr_(Registers.A, this.GB.M.get(this.PC++));
        return 8;
      case 0x48:
        this.ldr_(Registers.C, this.B);
        return 4;
      case 0x58:
        this.ldr_(Registers.E, this.B);
        return 4;
      case 0x68:
        this.ldr_(Registers.L, this.B);
        return 4;
      case 0x78:
        this.ldr_(Registers.A, this.B);
        return 4;
      case 0x7C:
        this.ldr_(Registers.A, this.H);
        return 4;
      case 0x7D:
        this.ldr_(Registers.A, this.L);
        return 4;
      case 0xC1:
        this.pop_(Registers.BC);
        return 12;
      case 0xC3:
        this.jp_(this.GB.M.get(this.PC, 2));
        return 16;
      case 0xC5:
        this.push_(Registers.BC);
        return 16;
      case 0xC9:
        this.ret_();
        return 16;
      case 0xCD:
        let a16 = this.GB.M.get(this.PC, 2);
        this.PC += 2;
        this.SP -= 2;
        this.lda_(this.SP, this.PC, 2);
        this.PC = a16;
        return 24;
      case 0xD1:
        this.pop_(Registers.DE);
        return 12;
      case 0xD5:
        this.push_(Registers.DE);
        return 16;
      case 0xE0:
        this.lda_(0xFF00 + this.GB.M.get(this.PC++), this.A);
        return 12;
      case 0xE1:
        this.pop_(Registers.HL);
        return 12;
      case 0xE5:
        this.push_(Registers.HL);
        return 16;
      case 0xEA:
        this.lda_(this.GB.M.get(this.PC, 2), this.A);
        this.PC += 2;
        return 16;
      case 0xF1:
        this.pop_(Registers.AF);
        return 12;
      case 0xF3:
        this.FlagIME = false;
        return 4;
      case 0xF5:
        this.push_(Registers.AF);
        return 16;
      default:
        throw Error(`Unimplemented instruction 0x${this.GB.M.get(addr).toString(16).toUpperCase().padStart(2, "0")}`);
    }
  }

  inc_(register) {
    this.set(register, this.get(register) + 1);
  }

  dec_(register) {
    this.set(register, this.get(register) - 1);
  }

  ldr_(register, val) {
    this.set(register, val);
  }

  lda_(addr, val, bytes = 1) {
    this.GB.M.set(addr, val, bytes);
  }

  push_(register) {
    this.SP -= 2;
    this.GB.M.set(this.SP, this.get(register), 2);
  }

  pop_(register) {
    this.set(register, this.GB.M.get(this.SP, 2));
    this.SP += 2;
  }

  jr_(offset) {
    this.PC += (offset & 0b10000000) ? -(offset & 0b01111111) : (offset & 0b01111111);
  }

  jp_(addr) {
    this.PC = addr;
  }

  ret_() {
    this.PC = this.GB.M.get(this.SP, 2);
    this.SP += 2;
  }

  get(register) {
    switch(register) {
      case Registers.A:
      case Registers.F:
      case Registers.B:
      case Registers.C:
      case Registers.D:
      case Registers.E:
      case Registers.H:
      case Registers.L:
      case Registers.SP:
      case Registers.PC:
      case Registers.IME:
        return this[register];
      case Registers.AF:
      case Registers.BC:
      case Registers.DE:
      case Registers.HL:
        let split = register.split("_");
        return (this[split[0]] << 8) + this[split[1]];
    }
  }

  set(register, val) {
    switch(register) {
      case Registers.A:
      case Registers.F:
      case Registers.B:
      case Registers.C:
      case Registers.D:
      case Registers.E:
      case Registers.H:
      case Registers.L:
      case Registers.IME:
        this[register] = val & 0xFF;
        break;
      case Registers.AF:
      case Registers.BC:
      case Registers.DE:
      case Registers.HL:
        let split = register.split("_");
        this[split[0]] = (val >> 8) & 0xFF;
        this[split[1]] = val & 0xFF;
        break;
      case Registers.SP:
      case Registers.PC:
        this[register] = val & 0xFFFF;
        break;
    }
  }

  get A() {
    return this.get(Registers.A);
  }

  set A(val) {
    this.set(Registers.A, val);
  }

  get F() {
    return this.get(Registers.F);
  }

  set F(val) {
    this.set(Registers.F, val);
  }

  get AF() {
    return this.get(Registers.AF);
  }

  set AF(val) {
    this.set(Registers.AF, val);
  }

  get B() {
    return this.get(Registers.B);
  }

  set B(val) {
    this.set(Registers.B, val);
  }

  get C() {
    return this.get(Registers.C);
  }

  set C(val) {
    this.set(Registers.C, val);
  }

  get BC() {
    return this.get(Registers.BC);
  }

  set BC(val) {
    this.set(Registers.BC, val);
  }

  get D() {
    return this.get(Registers.D);
  }

  set D(val) {
    this.set(Registers.D, val);
  }

  get E() {
    return this.get(Registers.E);
  }

  set E(val) {
    this.set(Registers.E, val);
  }

  get DE() {
    return this.get(Registers.DE);
  }

  set DE(val) {
    this.set(Registers.DE, val);
  }

  get H() {
    return this.get(Registers.H);
  }

  set H(val) {
    this.set(Registers.H, val);
  }

  get L() {
    return this.get(Registers.L);
  }

  set L(val) {
    this.set(Registers.L, val);
  }

  get HL() {
    return this.get(Registers.HL);
  }

  set HL(val) {
    this.set(Registers.HL, val);
  }

  get SP() {
    return this.get(Registers.SP);
  }

  set SP(val) {
    this.set(Registers.SP, val);
  }

  get PC() {
    return this.get(Registers.PC);
  }

  set PC(val) {
    this.set(Registers.PC, val);
  }

  get FlagIME() {
    return !!(this.get(Registers.IME));
  }

  set FlagIME(bool) {
    bool ? this.set(Registers.IME, 1) : this.set(Registers.IME, 0);
  }

  get FlagZ() {
    return !!(this.F & 0x80);
  }

  set FlagZ(bool) {
    bool ? this.F |= 0x80 : this.F &= ~0x80;
  }

  get FlagN() {
    return !!(this.F & 0x40);
  }

  set FlagN(bool) {
    bool ? this.F |= 0x40 : this.F &= ~0x40;
  }

  get FlagH() {
    return !!(this.F & 0x20);
  }

  set FlagH(bool) {
    bool ? this.F |= 0x20 : this.F &= ~0x20;
  }

  get FlagC() {
    return !!(this.F & 0x10);
  }

  set FlagC(bool) {
    bool ? this.F |= 0x10 : this.F &= ~0x10;
  }
}

export function get_flags_updated(register, oldVal, newVal) {
  if(register === Registers.F || register === Registers.AF) {
    return {
      [Flags.Z]: !!((oldVal & 0x80) ^ (newVal & 0x80)),
      [Flags.N]: !!((oldVal & 0x40) ^ (newVal & 0x40)),
      [Flags.H]: !!((oldVal & 0x20) ^ (newVal & 0x20)),
      [Flags.C]: !!((oldVal & 0x10) ^ (newVal & 0x10))
    };
  } else {
    return {
      [Flags.Z]: false,
      [Flags.N]: false,
      [Flags.H]: false,
      [Flags.C]: false
    };
  }
}
