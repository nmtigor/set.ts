/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Intersect
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import { Err } from "../../alias.ts";
import { Oprec } from "../alias.ts";
import { BinaryOp } from "./BinaryOp.ts";
import type { Set } from "./Set.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Intersect extends BinaryOp {
  override readonly op = "∩";
  static override readonly oprec = Oprec.intersect;

  constructor(lhs_x: Set, opTk_x: SetTk, rhs_x: Set | undefined) {
    super(lhs_x, opTk_x);
    if (rhs_x) {
      rhs_x.parent_$ = this;
      this.rhs$ = rhs_x;
    } else {
      this.setErr(Err.intersect_lack_of_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
