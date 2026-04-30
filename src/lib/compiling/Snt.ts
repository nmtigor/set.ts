/** 80**************************************************************************
 * @module lib/compiling/Snt
 * @license MIT
 ******************************************************************************/

import type { lnum_t, loff_t } from "../alias.ts";
import type { Id_t } from "../alias_v.ts";
import type { Line } from "./Line.ts";
import type { Loc } from "./Loc.ts";
import type { _OldInfo_ } from "./util.ts";
/*80--------------------------------------------------------------------------*/

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
