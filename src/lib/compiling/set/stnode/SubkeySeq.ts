/** 80**************************************************************************
 * @module lib/compiling/set/stnode/SubkeySeq
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { SetSN } from "./SetSN.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SubkeySeq extends SetSN {
  readonly tk_a;

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.tk_a[0];
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.tk_a.at(-1)!;
  }

  constructor(tk_a: SetTk[]) {
    /*#static*/ if (INOUT) {
      assert(tk_a.length);
    }
    super();
    this.tk_a = tk_a;

    this.ensureBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.tk_a.join(" ")})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, this.tk_a.map((tk_y) => tk_y.toString())];
  }
}
/*80--------------------------------------------------------------------------*/
