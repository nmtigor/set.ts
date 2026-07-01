/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Key
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { FuzykeySeq } from "./FuzykeySeq.ts";
import { QuotkeySeq } from "./QuotkeySeq.ts";
import { SetSn } from "./SetSn.ts";
import type { SetPazr } from "../SetPazr.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Key extends SetSn {
  #children;
  override get children(): (FuzykeySeq | QuotkeySeq)[] {
    return this.#children;
  }

  override get frstToken_1(): SetTk {
    return this.frstTk$ ??= this.children[0].frstToken_1;
  }
  override get lastToken_1(): SetTk {
    return this.lastTk$ ??= this.children.at(-1)!.lastToken_1;
  }

  /**
   * @headconst @param pazr_x
   * @headconst @param sns_x
   */
  constructor(pazr_x: SetPazr, sns_x: (FuzykeySeq | QuotkeySeq)[]) {
    /*#static*/ if (INOUT) {
      assert(sns_x.length);
    }
    super(pazr_x);
    this.#children = sns_x;

    for (const sn of sns_x) sn.attachTo_$(this);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(
    oldSn_x: FuzykeySeq | QuotkeySeq,
    newSn_x: FuzykeySeq | QuotkeySeq,
  ) {
    const c_a = this.children;
    const i_ = c_a.indexOf(oldSn_x);
    if (i_ >= 0) {
      newSn_x.attachTo_$(this);
      c_a.splice(i_, 1, newSn_x);
    }

    if (i_ === 0 || i_ === c_a.length - 1) this.invalBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.children.join(" ")})`;
  }

  override _repr_(): string[] {
    const ret = [this._info_];
    for (const sn of this.children) {
      ret.push(sn.toString());
    }
    return ret;
  }
}
/*80--------------------------------------------------------------------------*/
