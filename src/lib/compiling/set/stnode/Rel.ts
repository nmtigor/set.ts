/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Rel
 * @license MIT
 ******************************************************************************/

import { assert } from "@fe-lib/util.ts";
import { INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { Token } from "../../Token.ts";
import { ErrMsg } from "../../util.ts";
import { Ids } from "./Ids.ts";
import { Key } from "./Key.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Rel extends SetSn {
  /** If `undefined`, must `hasErr`. */
  #src;
  get src() {
    return this.#src;
  }

  readonly jnr_1;

  /** If `undefined`, must `hasErr`. */
  #rel;
  get rel() {
    return this.#rel;
  }

  readonly jnr_2: SetTk | undefined;

  /** If `undefined`, must `hasErr`. */
  #tgt;
  get tgt() {
    return this.#tgt;
  }

  #children: (Key | Ids)[] | undefined;
  override get children(): (Key | Ids)[] {
    if (this.#children) return this.#children;

    const ret: (Key | Ids)[] = [];
    if (this.#src instanceof Key || this.#src instanceof Ids) {
      ret.push(this.#src);
    }
    if (this.#rel instanceof Key || this.#rel instanceof Ids) {
      ret.push(this.#rel);
    }
    if (this.#tgt instanceof Key || this.#tgt instanceof Ids) {
      ret.push(this.#tgt);
    }
    return this.#children = ret;
  }

  override get frstToken(): SetTk {
    return this.frstToken$ ??= this.#src
      ? this.#src instanceof Token ? this.#src : this.#src.frstToken
      : this.jnr_1;
  }
  override get lastToken(): SetTk {
    return this.lastToken$ ??= this.#tgt
      ? this.#tgt instanceof Token ? this.#tgt : this.#tgt.lastToken
      : this.jnr_2
      ? this.jnr_2
      : this.#rel
      ? this.#rel instanceof Token ? this.#rel : this.#rel.lastToken
      : this.jnr_1;
  }

  constructor(
    src_x: Key | Ids | SetTk | undefined,
    jnr_1_x: SetTk,
    rel_x?: Key | Ids | SetTk,
    jnr_2_x?: SetTk,
    tgt_x?: Key | Ids | SetTk,
  ) {
    super();
    this.#src = src_x;
    this.jnr_1 = jnr_1_x;
    this.#rel = rel_x;
    this.jnr_2 = jnr_2_x;
    this.#tgt = tgt_x;

    if (src_x instanceof Key || src_x instanceof Ids) src_x.parent_$ = this;
    if (rel_x instanceof Key || rel_x instanceof Ids) rel_x.parent_$ = this;
    if (!jnr_2_x) this.setErr(ErrMsg.set_rel_no_2nd);
    if (tgt_x instanceof Key || tgt_x instanceof Ids) tgt_x.parent_$ = this;
    if (!src_x && !rel_x && !tgt_x) this.setErr(ErrMsg.set_rel_no_srt);

    this.ensureBdries();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: Key | Ids, newSn_x: Key | Ids) {
    newSn_x.parent_$ = this;

    if (this.#src === oldSn_x) {
      this.#src = newSn_x;
    } else if (this.#rel === oldSn_x) {
      this.#rel = newSn_x;
    } else {
      /*#static*/ if (INOUT) {
        assert(this.#tgt === oldSn_x);
      }
      this.#tgt = newSn_x;
    }
    this.#children = undefined;

    this.invalBdry();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.#src} > ${this.#rel} > ${this.#tgt})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, {
      src: this.#src
        ? this.#src instanceof Token ? this.#src.toString() : this.#src._repr_()
        : this.#src,
      jnr_1: this.jnr_1.toString(),
      rel: this.#rel
        ? this.#rel instanceof Token ? this.#rel.toString() : this.#rel._repr_()
        : this.#rel,
      jnr_2: this.jnr_2 ? this.jnr_2.toString() : this.jnr_2,
      tgt: this.#tgt
        ? this.#tgt instanceof Token ? this.#tgt.toString() : this.#tgt._repr_()
        : this.#tgt,
    }];
  }
}
/*80--------------------------------------------------------------------------*/
