import { MemoryBlock } from ".";
import { Registers } from "../../ppu";

export class IORegisters extends MemoryBlock {
  constructor(gameBoy) {
    super(0xFF00, 0x0080);
    this.GB = gameBoy;
  }

  reset() {
    super.set(0x0000, 0xCF);
  }

  set(addr, val) {
    switch(addr) {
      case 0x0000:
        //first 4 bits of joypad are read only, top 2 are unused
        super.set(addr, (this.get(0x0000) & 0xCF) | (val & ~0xCF));
        break;
      case 0x0004:
        this.GB.Timer.DIV = val;
        break;
      case 0x0005:
        this.GB.Timer.TIMA = val;
        break;
      case 0x0006:
        this.GB.Timer.TMA = val;
        break;
      case 0x0007:
        this.GB.Timer.TAC = val;
        break;
      case 0x0040:
        this.GB.PPU.LCDC = val;
        break;
      case 0x0041:
        this.GB.PPU.STAT = val;
        break;
      case 0x0042:
        this.GB.PPU.SCY = val;
        break;
      case 0x0043:
        this.GB.PPU.SCX = val;
        break;
      case 0x0044:
        this.GB.PPU.LY = val;
        break;
      case 0x0045:
        this.GB.PPU.LYC = val;
        break;
      case 0x0046:
        this.GB.PPU.DMA = val;
        break;
      case 0x0047:
        this.GB.PPU.BGP = val;
        break;
      case 0x0048:
        this.GB.PPU.OBP0 = val;
        break;
      case 0x0049:
        this.GB.PPU.OBP1 = val;
        break;
      case 0x004A:
        this.GB.PPU.WY = val;
        break;
      case 0x004B:
        this.GB.PPU.WX = val;
        break;
      default:
        super.set(addr, val);
        break;
    }
  }

  get(addr) {
    switch(addr) {
      case 0x0004:
        return this.GB.Timer.DIV;
      case 0x0005:
        return this.GB.Timer.TIMA;
      case 0x0006:
        return this.GB.Timer.TMA;
      case 0x0007:
        return this.GB.Timer.TAC;
      case 0x0040:
        return this.GB.PPU.Reg[Registers.LCDC];
      case 0x0041:
        return this.GB.PPU.Reg[Registers.STAT];
      case 0x0042:
        return this.GB.PPU.Reg[Registers.SCY];
      case 0x0043:
        return this.GB.PPU.Reg[Registers.SCX];
      case 0x0044:
        return this.GB.PPU.Reg[Registers.LY];
      case 0x0045:
        return this.GB.PPU.Reg[Registers.LYC];
      case 0x0046:
        return this.GB.PPU.Reg[Registers.DMA];
      case 0x0047:
        return this.GB.PPU.Reg[Registers.BGP];
      case 0x0048:
        return this.GB.PPU.Reg[Registers.OBP0];
      case 0x0049:
        return this.GB.PPU.Reg[Registers.OBP1];
      case 0x004A:
        return this.GB.PPU.Reg[Registers.WY];
      case 0x004B:
        return this.GB.PPU.Reg[Registers.WX];
      default:
        return super.get(addr);
    }
  }
}
