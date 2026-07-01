/** 80**************************************************************************
 * @module lib/compiling/set/stnode/QuotkeySeq
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import type { SetPazr } from "../SetPazr.ts";
import { SubkeySeq } from "./SubkeySeq.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class QuotkeySeq extends SubkeySeq {
  /**
   * @headconst @param pazr_x
   * @const @param tks_x
   */
  constructor(pazr_x: SetPazr, tks_x: SetTk[]) {
    super(pazr_x, tks_x);
  }
}
/*80--------------------------------------------------------------------------*/
