/** 80**************************************************************************
 * @module lib/compiling/set/stnode/SubkeySeq
 * @license MIT
 ******************************************************************************/

import { assert, fail } from "@fe-lib/util/trace.ts";
import { INOUT } from "@fe-src/global.ts";
import { SetSN } from "../SetSN.ts";
import { SetTk } from "../../Token.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SubkeySeq extends SetSN {
  readonly tk_a;

  override get children() {
    return undefined;
  }

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
    return `${this._info}( ${this.tk_a.join(" ")})`;
  }

  override _repr(): [string, any] {
    return [this._info, this.tk_a.map((tk_y) => tk_y.toString())];
  }
}
/*80--------------------------------------------------------------------------*/
