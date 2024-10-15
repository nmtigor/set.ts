/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Union
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import { Err } from "../../alias.ts";
import { Oprec } from "../alias.ts";
import { BinaryOp } from "./BinaryOp.ts";
import type { Set } from "./Set.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Union extends BinaryOp {
  override readonly op = "∪";
  static override readonly oprec = Oprec.union;

  constructor(lhs_x: Set, opTk_x: SetTk, rhs_x: Set | undefined) {
    super(lhs_x, opTk_x);
    if (rhs_x) {
      rhs_x.parent_$ = this;
      this.rhs$ = rhs_x;
    } else {
      this.setErr(Err.lack_of_union_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
