/** 80**************************************************************************
 * @module lib/compiling/set/stnode/SetSn
 * @license MIT
 ******************************************************************************/

import { Stnode } from "../../Stnode.ts";
import type { SetPazr } from "../SetPazr.ts";
import type { SetTok } from "../SetTok.ts";
/*80--------------------------------------------------------------------------*/

export abstract class SetSn extends Stnode<SetTok> {
  /** @headconst @param pazr_x */
  constructor(pazr_x: SetPazr) {
    super(pazr_x);
  }
}
/*80--------------------------------------------------------------------------*/
