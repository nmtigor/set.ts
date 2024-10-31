/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Key
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util/trace.ts";
import { INOUT } from "@fe-src/global.ts";
import { SetSN } from "../SetSN.ts";
import type { SetTk } from "../../Token.ts";
import { FuzykeySeq } from "./FuzykeySeq.ts";
import { QuotkeySeq } from "./QuotkeySeq.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Key extends SetSN {
  override get children(): (FuzykeySeq | QuotkeySeq)[] {
    return this.children$ as (FuzykeySeq | QuotkeySeq)[];
  }

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.children[0].frstToken;
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.children.at(-1)!.lastToken;
  }

  constructor(sn_a: (FuzykeySeq | QuotkeySeq)[]) {
    /*#static*/ if (INOUT) {
      assert(sn_a.length);
    }
    super();
    this.children$ = sn_a;

    for (const sn of sn_a) sn.parent_$ = this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: SetSN, newSn_x: SetSN) {
    /*#static*/ if (INOUT) {
      assert(newSn_x instanceof FuzykeySeq || newSn_x instanceof QuotkeySeq);
    }
    const c_a = this.children;
    const i_ = c_a.indexOf(oldSn_x as FuzykeySeq | QuotkeySeq);
    if (i_ >= 0) {
      newSn_x.parent_$ = this;
      c_a.splice(i_, 1, newSn_x as FuzykeySeq | QuotkeySeq);
    }

    if (i_ === 0 || i_ === c_a.length - 1) this.invalidateBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info}( ${this.children.join(" ")})`;
  }

  override _repr(): string[] {
    const ret = [this._info];
    for (const sn of this.children) {
      ret.push(sn.toString());
    }
    return ret;
  }
}
/*80--------------------------------------------------------------------------*/
