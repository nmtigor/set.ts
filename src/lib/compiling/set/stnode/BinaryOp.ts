/** 80**************************************************************************
 * @module lib/compiling/set/stnode/BinaryOp
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import { Ranval } from "../../Ranval.ts";
import type { SetTk } from "../../Token.ts";
import { ErrMsg } from "../../util.ts";
import { SetTok } from "../SetTok.ts";
import { Oprec } from "../alias.ts";
import { Set } from "./Set.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

export abstract class BinaryOp extends SetSn {
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

  override replaceChild(oldSn_x: Set, newSn_x: Set) {
    newSn_x.parent_$ = this;

    if (this.lhs$ === oldSn_x) {
      this.lhs$ = newSn_x;
    } else {
      /*#static*/ if (INOUT) {
        assert(this.rhs$ === oldSn_x);
      }
      this.rhs$ = newSn_x;
    }
    this.#children = undefined;

    this.invalBdry();
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
    this.setErr([
      ErrMsg.set_inval_binary_op,
      Ranval.fromRan(opTk_x.ran_$),
      opTk_x.name,
    ]);
    if (rhs_x) {
      rhs_x.parent_$ = this;
      this.rhs$ = rhs_x;
    } else {
      this.setErr(ErrMsg.set_binaryerr_no_rhs);
    }

    this.ensureBdries();
  }
}
/*80--------------------------------------------------------------------------*/
