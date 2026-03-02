/** 80**************************************************************************
 * @module lib/compiling/util
 * @license MIT
 ******************************************************************************/

import * as Is from "../util/is.ts";
import { INOUT } from "../../preNs.ts";
import type { loff_t, unum } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import { assert } from "../util.ts";
import type { Line } from "./Line.ts";
import type { Token } from "./Token.ts";
import type { TSeg } from "./TSeg.ts";
import type { FSRec } from "@fe-edt/alias.ts";
/*80--------------------------------------------------------------------------*/

export type LineData = [
  /**
   * Record of `Token<any>`s whose `frstLine` is this Line and
   * `prevToken_$?.frstLine` is not.
   */
  frstTk: Record</** Lexr.id */ Id_t, Token<any>> | undefined,
  /**
   * Record of `Token<any>`s whose `lastLine` is this Line and
   * `nextToken_$?.lastLine` is not.
   */
  lastTk: Record</** Lexr.id */ Id_t, Token<any>> | undefined,

  frstTSeg: Record</** Tfmr.id */ Id_t, TSeg> | undefined,
  lastTSeg: Record</** Tfmr.id */ Id_t, TSeg> | undefined,

  blockSize: Record</** EdtrBaseScrolr.id */ Id_t, unum> | undefined,
  fsrec_a: Record</** EdtrBaseScrolr.id */ Id_t, FSRec[]> | undefined,
];

export const lineFrstTkO = (_x: LineData) => _x[0] ??= {};
export const lineLastTkO = (_x: LineData) => _x[1] ??= {};

export const lineFrstTSegO = (_x: LineData) => _x[2] ??= {};
export const lineLastTSegO = (_x: LineData) => _x[3] ??= {};
export const clearLineFrstTSeg = (_x?: LineData) => !_x || (_x[2] = undefined);
export const clearLineLastTSeg = (_x?: LineData) => !_x || (_x[3] = undefined);

export const lineBSizeO = (_x: LineData) => _x[4] ??= {};
export const lineFsrecaO = (_x: LineData) => _x[5] ??= {};
/*80--------------------------------------------------------------------------*/

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
    for (; i_ < stop_x; ++i_) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    for (; i_ < stop_x; ++i_) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
    }
  } else {
    for (; i_ < stop_x; ++i_) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};
/*64----------------------------------------------------------*/

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
    for (; i_ >= strt_x; --i_) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    for (; i_ >= strt_x; --i_) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
    }
  } else {
    for (; i_ >= strt_x; --i_) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};
/*80--------------------------------------------------------------------------*/
