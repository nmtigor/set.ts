/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Set
 * @license MIT
 ******************************************************************************/

import { SetSN } from "../SetSN.ts";
import { Err } from "../../alias.ts";
import { SetTok } from "../SetTok.ts";
import type { Paren } from "../alias.ts";
import type { BinaryErr } from "./BinaryOp.ts";
import type { Intersect } from "./Intersect.ts";
import type { Key } from "./Key.ts";
import type { Rel } from "./Rel.ts";
import type { Subtract } from "./Subtract.ts";
import { SetTk } from "../../Token.ts";
import type { Union } from "./Union.ts";
/*80--------------------------------------------------------------------------*/

export type UnparenSet = Intersect | Subtract | Union | BinaryErr | Rel | Key;

/** @final */
export class Set extends SetSN {
  /**
   * If `this.#unpanenSet instanceof SetTk`, must `hasErr`.
   */
  #unpanenSet: UnparenSet | SetTk;
  get unpanenSet() {
    return this.#unpanenSet;
  }

  #paren: Paren;
  get paren(): Paren {
    return this.#paren;
  }
  set paren_$(_x: Paren) {
    if (_x === this.#paren) return;

    this.#paren = _x;

    this.invalidateBdry();
    this.ensureBdry();
  }

  override get children(): UnparenSet[] {
    if (this.children$) return this.children$ as UnparenSet[];

    const ret: UnparenSet[] = [];
    if (!(this.#unpanenSet instanceof SetTk)) ret.push(this.#unpanenSet);
    return this.children$ = ret;
  }

  override get frstToken() {
    if (this.frstToken$) return this.frstToken$;

    let ret = this.#unpanenSet instanceof SetTk
      ? this.#unpanenSet
      : this.#unpanenSet.frstToken;
    for (let i = this.#paren; i--;) {
      const tk_ = ret.prevToken_$;
      if (!tk_ || tk_.value === SetTok.strtBdry) break;
      ret = tk_;
    }
    return this.frstToken$ = ret;
  }
  override get lastToken() {
    if (this.lastToken$) return this.lastToken$;

    let ret = this.#unpanenSet instanceof SetTk
      ? this.#unpanenSet
      : this.#unpanenSet.lastToken;
    for (let i = this.#paren; i--;) {
      const tk_ = ret.nextToken_$;
      if (!tk_ || tk_.value === SetTok.stopBdry) break;
      ret = tk_;
    }
    return this.lastToken$ = ret;
  }

  constructor(unparnSet_x: UnparenSet | SetTk, paren_x: Paren) {
    super();
    this.#unpanenSet = unparnSet_x;
    if (unparnSet_x instanceof SetTk) {
      this.setErr(`${Err.unexpected_token_for_set}: ${unparnSet_x}`);
    } else {
      unparnSet_x.parent_$ = this;
    }
    this.#paren = paren_x;

    this.frstBdryTk;
    this.lastBdryTk;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(_oldSn_x: UnparenSet, newSn_x: UnparenSet) {
    newSn_x.parent_$ = this;
    this.#unpanenSet = newSn_x;
    this.children$ = undefined;

    this.invalidateBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info} ( ${
      new Array(this.#paren).fill("(").join("")
    }${this.#unpanenSet}${new Array(this.#paren).fill(")").join("")})`;
  }

  override _repr() {
    const unpanenSet = this.#unpanenSet instanceof SetTk
      ? this.#unpanenSet.toString()
      : this.#unpanenSet._repr();
    return this.#paren
      ? [
        this._info,
        new Array(this.#paren).fill("(").join(""),
        unpanenSet,
        new Array(this.#paren).fill(")").join(""),
      ]
      : [this._info, unpanenSet];
  }
}
/*80--------------------------------------------------------------------------*/
