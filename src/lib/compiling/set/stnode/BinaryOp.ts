/** 80**************************************************************************
 * @module lib/compiling/set/stnode/BinaryOp
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util/trace.ts";
import { LOG_cssc } from "@fe-src/alias.ts";
import { INOUT } from "@fe-src/global.ts";
import { SetSN } from "../SetSN.ts";
import type { SetTk } from "../../Token.ts";
import { Err } from "../../alias.ts";
import { SetTok } from "../SetTok.ts";
import { Oprec } from "../alias.ts";
import { Set } from "./Set.ts";
/*80--------------------------------------------------------------------------*/

export abstract class BinaryOp extends SetSN {
  readonly op: string = "?";
  static readonly oprec: Oprec;

  protected lhs$: Set;
  get lhs() {
    return this.lhs$;
  }

  readonly opTk;

  /**
   * If `undefined`, must `hasErr`.
   */
  protected rhs$: Set | undefined;
  get rhs() {
    return this.rhs$;
  }

  override get children(): Set[] {
    if (this.children$) return this.children$ as Set[];

    const ret = [this.lhs$];
    if (this.rhs$) ret.push(this.rhs$);
    return this.children$ = ret;
  }

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.lhs$.frstToken;
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.rhs$ ? this.rhs$.lastToken : this.opTk;
  }

  constructor(lhs_x: Set, opTk_x: SetTk) {
    super();
    lhs_x.parent_$ = this;
    this.lhs$ = lhs_x;
    this.opTk = opTk_x;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: SetSN, newSn_x: SetSN) {
    /*#static*/ if (INOUT) {
      assert(newSn_x instanceof Set);
    }
    newSn_x.parent_$ = this;

    if (this.lhs$ === oldSn_x) {
      this.lhs$ = newSn_x as Set;
    } else {
      /*#static*/ if (INOUT) {
        assert(this.rhs$ === oldSn_x);
      }
      this.rhs$ = newSn_x as Set;
    }
    this.children$ = undefined;

    this.invalidateBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info}( ${this.lhs$} ${this.op} ${this.rhs$})`;
  }

  override _repr(): [string, any] {
    return [this._info, {
      lhs: this.lhs$._repr(),
      op: this.opTk.toString(),
      rhs: this.rhs$ ? this.rhs$._repr() : this.rhs$,
    }];
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class BinaryErr extends BinaryOp {
  static override readonly oprec = Oprec.err;

  constructor(lhs_x: Set, opTk_x: SetTk, rhs_x: Set | undefined) {
    /*#static*/ if (INOUT) {
      assert(
        opTk_x.value !== SetTok.subtract &&
          opTk_x.value !== SetTok.intersect &&
          opTk_x.value !== SetTok.union,
      );
    }
    super(lhs_x, opTk_x);
    this.setErr(`${Err.invalid_binary_op}: ${opTk_x}`);
    if (rhs_x) {
      rhs_x.parent_$ = this;
      this.rhs$ = rhs_x;
    } else {
      this.setErr(Err.lack_of_err_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
