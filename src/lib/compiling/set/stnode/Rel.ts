/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Rel
 * @license MIT
 ******************************************************************************/

import { LOG_cssc } from "@fe-src/alias.ts";
import { SetSN } from "../SetSN.ts";
import { SetTk } from "../../Token.ts";
import { Err } from "../../alias.ts";
import { Key } from "./Key.ts";
import { INOUT } from "@fe-src/global.ts";
import { assert } from "@fe-lib/util/trace.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Rel extends SetSN {
  /** If `undefined`, must `hasErr`. */
  #src: Key | SetTk | undefined;
  get src() {
    return this.#src;
  }

  readonly jnr_1;

  /** If `undefined`, must `hasErr`. */
  #rel: Key | SetTk | undefined;
  get rel() {
    return this.#rel;
  }

  readonly jnr_2: SetTk | undefined;

  /** If `undefined`, must `hasErr`. */
  #tgt: Key | SetTk | undefined;
  get tgt() {
    return this.#tgt;
  }

  override get children(): Key[] {
    if (this.children$) return this.children$ as Key[];

    const ret: Key[] = [];
    if (this.#src instanceof Key) ret.push(this.#src);
    if (this.#rel instanceof Key) ret.push(this.#rel);
    if (this.#tgt instanceof Key) ret.push(this.#tgt);
    return this.children$ = ret;
  }

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.#src
      ? this.#src instanceof SetTk ? this.#src : this.#src.frstToken
      : this.jnr_1;
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.#tgt
      ? this.#tgt instanceof SetTk ? this.#tgt : this.#tgt.lastToken
      : this.jnr_2
      ? this.jnr_2
      : this.#rel
      ? this.#rel instanceof SetTk ? this.#rel : this.#rel.lastToken
      : this.jnr_1;
  }

  constructor(
    src_x: Key | SetTk | undefined,
    jnr_1_x: SetTk,
    rel_x?: Key | SetTk,
    jnr_2_x?: SetTk,
    tgt_x?: Key | SetTk,
  ) {
    super();
    if (src_x) {
      if (src_x instanceof Key) src_x.parent_$ = this;
      this.#src = src_x;
    }
    this.jnr_1 = jnr_1_x;
    if (rel_x) {
      if (rel_x instanceof Key) rel_x.parent_$ = this;
      this.#rel = rel_x;
    }
    if (jnr_2_x) {
      this.jnr_2 = jnr_2_x;
    } else {
      this.setErr(Err.rel_lack_of_2nd);
    }
    if (tgt_x) {
      if (tgt_x instanceof Key) tgt_x.parent_$ = this;
      this.#tgt = tgt_x;
    }
    if (!src_x && !rel_x && !tgt_x) {
      this.setErr(Err.rel_lack_of_srt);
    }

    this.ensureBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: SetSN, newSn_x: SetSN) {
    /*#static*/ if (INOUT) {
      assert(newSn_x instanceof Key);
    }
    newSn_x.parent_$ = this;

    if (this.#src === oldSn_x) {
      this.#src = newSn_x as Key;
    } else if (this.#rel === oldSn_x) {
      this.#rel = newSn_x as Key;
    } else {
      /*#static*/ if (INOUT) {
        assert(this.#tgt === oldSn_x);
      }
      this.#tgt = newSn_x as Key;
    }
    this.children$ = undefined;

    this.invalidateBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.#src} > ${this.#rel} > ${this.#tgt})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, {
      src: this.#src
        ? this.#src instanceof SetTk ? this.#src.toString() : this.#src._repr_()
        : this.#src,
      jnr_1: this.jnr_1.toString(),
      rel: this.#rel
        ? this.#rel instanceof SetTk ? this.#rel.toString() : this.#rel._repr_()
        : this.#rel,
      jnr_2: this.jnr_2 ? this.jnr_2.toString() : this.jnr_2,
      tgt: this.#tgt
        ? this.#tgt instanceof SetTk ? this.#tgt.toString() : this.#tgt._repr_()
        : this.#tgt,
    }];
  }
}
/*80--------------------------------------------------------------------------*/
