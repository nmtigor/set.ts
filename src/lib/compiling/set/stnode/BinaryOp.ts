/** 80**************************************************************************
 * @module lib/compiling/set/stnode/BinaryOp
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import { Ranval } from "../../Ranval.ts";
import type { SetTk } from "../../Token.ts";
import { ErrMsg } from "../../util.ts";
import type { SetPazr } from "../SetPazr.ts";
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

  override get frstToken_1(): SetTk {
    return this.frstTk$ ??= this.lhs$.frstToken_1;
  }
  override get lastToken_1(): SetTk {
    return this.lastTk$ ??= this.rhs$ ? this.rhs$.lastToken_1 : this.opTk;
  }

  /**
   * @headconst @param pazr_x
   * @headconst @param lhs_x
   * @const @param opTk_x
   */
  constructor(pazr_x: SetPazr, lhs_x: Set, opTk_x: SetTk) {
    super(pazr_x);
    this.lhs$ = lhs_x;
    this.opTk = opTk_x;

    lhs_x.attachTo_$(this);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: Set, newSn_x: Set) {
    newSn_x.attachTo_$(this);

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

  /**
   * @headconst @param pazr_x
   * @headconst @param lhs_x
   * @headconst @param opTk_x
   * @headconst @param rhs_x
   */
  constructor(
    pazr_x: SetPazr,
    lhs_x: Set,
    opTk_x: SetTk,
    rhs_x: Set | undefined,
  ) {
    /*#static*/ if (INOUT) {
      assert(
        opTk_x.value !== SetTok.subtract &&
          opTk_x.value !== SetTok.intersect &&
          opTk_x.value !== SetTok.union,
      );
    }
    super(pazr_x, lhs_x, opTk_x);
    this.setErr([
      ErrMsg.set_inval_binary_op,
      Ranval.fromRan(opTk_x.ran_$),
      opTk_x.name,
    ]);
    if (rhs_x) {
      rhs_x.attachTo_$(this);
      this.rhs$ = rhs_x;
    } else {
      this.setErr(ErrMsg.set_binaryerr_no_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
