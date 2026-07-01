/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Intersect
 * @license MIT
 ******************************************************************************/

import type { SetTk } from "../../Token.ts";
import { ErrMsg } from "../../util.ts";
import { Oprec } from "../alias.ts";
import type { SetPazr } from "../SetPazr.ts";
import { BinaryOp } from "./BinaryOp.ts";
import type { Set } from "./Set.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Intersect extends BinaryOp {
  override readonly op = "∩";
  static override readonly oprec = Oprec.intersect;

  /**
   * @headconst @param pazr_x
   * @headconst @param lhs_x
   * @headconst @param opTk_x
   * @headconst @param rhs_x
   */
  constructor(
    pazr_x: SetPazr,
    lhs_x: Set,
    opTk_x: SetTk,
    rhs_x: Set | undefined,
  ) {
    super(pazr_x, lhs_x, opTk_x);
    if (rhs_x) {
      rhs_x.attachTo_$(this);
      this.rhs$ = rhs_x;
    } else {
      this.setErr(ErrMsg.set_intersect_no_rhs);
    }

    this.ensureBdry();
  }
}
/*80--------------------------------------------------------------------------*/
