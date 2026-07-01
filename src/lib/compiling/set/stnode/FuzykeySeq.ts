/** 80**************************************************************************
 * @module lib/compiling/set/stnode/FuzykeySeq
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import type { SetPazr } from "../SetPazr.ts";
import { SubkeySeq } from "./SubkeySeq.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class FuzykeySeq extends SubkeySeq {
  /**
   * @headconst @param pazr_x
   * @const @param tk_a
   */
  constructor(pazr_x: SetPazr, tk_a: SetTk[]) {
    super(pazr_x, tk_a);
  }
}
/*80--------------------------------------------------------------------------*/
