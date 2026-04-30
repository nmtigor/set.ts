/** 80**************************************************************************
 * @module lib/compiling/util
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { loff_t, unum } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import { assert } from "../util.ts";
import * as Is from "../util/is.ts";
import { SortedIdo } from "../util/SortedArray.ts";
import type { Locval, Tok } from "./alias.ts";
import type { Line } from "./Line.ts";
import type { Snt } from "./Snt.ts";
import { Stnode } from "./Stnode.ts";
import type { Token } from "./Token.ts";
/*80--------------------------------------------------------------------------*/

export type LineData = [
  /**
   * Record of `Token<any>`s whose `frstLine` is this Line and
   * `prevToken_$?.frstLine` is not.
   */
  frstTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,
  /**
   * Record of `Token<any>`s whose `lastLine` is this Line and
   * `nextToken_$?.lastLine` is not.
   */
  lastTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,

  //jjjj TOCLEANUP
  // frstTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,
  // lastTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,

  blockSize: Record</** EdtrBaseScrolr.id */ Id_t, unum> | undefined,
  //jjjj TOCLEANUP
  // fsrec_a: Record</** EdtrBaseScrolr.id */ Id_t, FSRec[]> | undefined,
];

export const lineFrstTkO = (_x: LineData) => _x[0] ??= {};
export const lineLastTkO = (_x: LineData) => _x[1] ??= {};

//jjjj TOCLEANUP
// export const lineFrstTSegO = (_x: LineData) => _x[2] ??= {};
// export const lineLastTSegO = (_x: LineData) => _x[3] ??= {};
// export const clearLineFrstTSeg = (_x?: LineData) => !_x || (_x[2] = undefined);
// export const clearLineLastTSeg = (_x?: LineData) => !_x || (_x[3] = undefined);

export const lineBSizeO = (_x: LineData) => _x[2] ??= {};
// export const lineFsrecaO = (_x: LineData) => _x[5] ??= {};
/*64----------------------------------------------------------*/

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const frstNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = strt_x;
  if (Is.func(ucod_x)) {
    for (; i_ < stop_x; i_++) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ < stop_x; i_++) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ < stop_x; i_++) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const lastNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t | -1 => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = stop_x - 1;
  if (Is.func(ucod_x)) {
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ >= strt_x; i_--) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};
/*80--------------------------------------------------------------------------*/

export abstract class LexdInfo {
  static #ID = 0 as Id_t;
  readonly id = ++LexdInfo.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  destructor(): void {}
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @const */
  // become(li_x: LexdInfo) {}

  toString(): string {
    return "";
  }
}
/*80--------------------------------------------------------------------------*/

export const sntFrstTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.frstToken : snt_x;

export const sntLastTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.lastToken : snt_x;
/*80--------------------------------------------------------------------------*/

export type _OldInfo_ = {
  sort: Locval;
  info: string;
};

export class SortedSnt_id<T extends Snt = Snt> extends SortedIdo<T> {
  _repr_(): string[] {
    const ret: _OldInfo_[] = [];
    for (const v of this) ret.push(v._oldInfo_);
    return ret.sort((a_y, b_y) => {
      const lv_a = a_y.sort;
      const lv_b = b_y.sort;
      return lv_a[0] < lv_b[0]
        ? -1
        : lv_a[0] === lv_b[0] && lv_a[1] < lv_b[1]
        ? -1
        : lv_a[1] === lv_b[1]
        ? 0
        : 1;
    }).map((_y) => _y.info);
  }
}

/** @final */
export class SortedSn_id extends SortedSnt_id<Stnode<any>> {}
/*80--------------------------------------------------------------------------*/
