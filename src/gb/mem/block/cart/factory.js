import { Types, Cartridge } from "./index";
import { MBC1 } from "./mbc1";

/**
 * Wanted this to be static on the Cartridge class but circular import structure
 * caused things to break.
 */
export class CartridgeFactory {
  static create(byteArr) {
    let base = new Cartridge(byteArr);
    //Will do more of these later
    switch(base.type) {
      case Types.MBC1:
        return new MBC1(byteArr);
      default:
        return base;
    }
  }
}