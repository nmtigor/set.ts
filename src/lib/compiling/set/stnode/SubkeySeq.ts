/** 80**************************************************************************
 * @module lib/compiling/set/stnode/SubkeySeq
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import type { SetPazr } from "../SetPazr.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SubkeySeq extends SetSn {
  readonly tk_a;

  //jjjj TOCLEANUP
  // override get known(): boolean {
  //   return this.tk_a[0].value !== BaseTok.unknown &&
  //     this.tk_a.at(-1)!.value !== BaseTok.unknown;
  // }

  override get frstToken_1(): SetTk {
    return this.frstTk$ ??= this.tk_a[0];
  }
  override get lastToken_1(): SetTk {
    return this.lastTk$ ??= this.tk_a.at(-1)!;
  }

  /**
   * @headconst @param pazr_x
   * @const @param tks_x
   */
  constructor(pazr_x: SetPazr, tks_x: SetTk[]) {
    /*#static*/ if (INOUT) {
      assert(tks_x.length);
    }
    super(pazr_x);
    this.tk_a = tks_x;

    this.ensureBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.tk_a.join(" ")})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, this.tk_a.map((tk) => `${tk}`)];
  }
}
/*80--------------------------------------------------------------------------*/
