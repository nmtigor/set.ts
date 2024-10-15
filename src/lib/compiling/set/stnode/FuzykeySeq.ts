/** 80**************************************************************************
 * @module lib/compiling/set/stnode/FuzykeySeq
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import { SubkeySeq } from "./SubkeySeq.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class FuzykeySeq extends SubkeySeq {
  constructor(tk_a: SetTk[]) {
    super(tk_a);
  }
}
/*80--------------------------------------------------------------------------*/
