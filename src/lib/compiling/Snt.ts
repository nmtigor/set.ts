/** 80**************************************************************************
 * @module lib/compiling/Snt
 * @license MIT
 ******************************************************************************/

import * as Is from "@fe-lib/util/is.ts";
import type { lnum_t, loff_t } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import type { Line } from "./Line.ts";
import type { Loc } from "./Loc.ts";
import type { _OldInfo_, Err } from "./util.ts";
import { SortedErr } from "./util.ts";
/*80--------------------------------------------------------------------------*/

type NErr_ = 2;
const NErr_ = 2;
console.assert(NErr_ >= 1);

/** syntax node or token */
export abstract class Snt {
  static #ID = 0 as Id_t;
  readonly id = ++Snt.#ID as Id_t;
  /** @final */
  get _class_id_() {
    return `${this.constructor.name}_${this.id}`;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  abstract get sntStrtLoc(): Loc;
  abstract get sntStopLoc(): Loc;

  abstract get sntFrstLine(): Line;
  abstract get sntLastLine(): Line;

  abstract get sntFrstLidx_1(): lnum_t;
  abstract get sntLastLidx_1(): lnum_t;

  abstract get sntStrtLoff(): loff_t;
  abstract get sntStopLoff(): loff_t;

  /* err_sa$ */
  protected err_sa$?: SortedErr;
  private get _err_a() {
    return this.err_sa$ ??= new SortedErr();
  }

  /** @const */
  get isErr(): boolean {
    return !!this.err_sa$?.length;
  }
  /**
   * @const
   * @const @param errMsg_x
   */
  onlyErr(err_x: Err): boolean {
    return this.err_sa$?.at(0) === err_x && !this.err_sa$.at(1);
  }

  protected NErr$ = NErr_;

  /** @const @param err_x */
  setErr(err_x: Err): this {
    if (this._err_a.length < this.NErr$) {
      this._err_a.add(err_x);
    }
    return this;
  }
  clrErr(): this {
    this.err_sa$?.reset_SortedArray();
    return this;
  }

  /**
   * @const
   * @headconst @param tgtTk_x
   */
  tfrErr(tgtTk_x: Snt): this {
    /* in (non-reverse) order */
    for (let i = 0, iI = this.err_sa$?.length ?? 0; i < iI; i++) {
      tgtTk_x.setErr(this.err_sa$![i]);
    }
    return this;
  }

  /** @const */
  get _err_(): unknown[] {
    const retA: unknown[] = [];
    if (this.err_sa$) {
      for (const err of this.err_sa$) {
        if (Is.array(err)) {
          retA.push(err.map((_y) => `${_y}`));
        } else {
          retA.push(err);
        }
      }
    }
    return retA;
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** For testing only */
  toString() {
    return this._class_id_;
  }

  get _oldInfo_(): _OldInfo_ {
    return { sort: [0, 0], info: "" };
  }
}
/*80--------------------------------------------------------------------------*/
