/** 80**************************************************************************
 * @module lib/compiling/set/stnode/BinaryOp
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { Err } from "../../alias.ts";
import { SetTok } from "../SetTok.ts";
import { Oprec } from "../alias.ts";
import { Set } from "./Set.ts";
import { SetSN } from "./SetSN.ts";
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

  #children: Set[] | undefined;
  override get children(): Set[] {
    if (this.#children) return this.#children;

    const ret = [this.lhs$];
    if (this.rhs$) ret.push(this.rhs$);
    return this.#children = ret;
  }

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.lhs$.frstToken;
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.rhs$ ? this.rhs$.lastToken : this.opTk;
  }

  constructor(lhs_x: Set, opTk_x: SetTk) {
    super();
    this.lhs$ = lhs_x;
    this.opTk = opTk_x;

    lhs_x.parent_$ = this;
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
    this.#children = undefined;

    this.invalidateBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.lhs$} ${this.op} ${this.rhs$})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, {
      lhs: this.lhs$._repr_(),
      op: this.opTk.toString(),
      rhs: this.rhs$ ? this.rhs$._repr_() : this.rhs$,
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
    this.setErr(`${Err.set_invalid_binary_op}: ${opTk_x}`);
    if (rhs_x) {
      rhs_x.parent_$ = this;
      this.rhs$ = rhs_x;
    } else {
      this.setErr(Err.set_binaryerr_no_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
