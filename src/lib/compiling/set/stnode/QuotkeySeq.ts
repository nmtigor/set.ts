/** 80**************************************************************************
 * @module lib/compiling/set/stnode/QuotkeySeq
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import { SubkeySeq } from "./SubkeySeq.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class QuotkeySeq extends SubkeySeq {
  constructor(tk_a: SetTk[]) {
    super(tk_a);
  }
}
/*80--------------------------------------------------------------------------*/
