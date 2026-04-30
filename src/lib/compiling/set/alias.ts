/** 80**************************************************************************
 * @module lib/compiling/set/alias
 * @license MIT
 ******************************************************************************/

import type { uint } from "../../alias.ts";
import type { BinaryErr } from "./stnode/BinaryOp.ts";
import type { Intersect } from "./stnode/Intersect.ts";
import type { Key } from "./stnode/Key.ts";
import type { Rel } from "./stnode/Rel.ts";
import type { Subtract } from "./stnode/Subtract.ts";
import type { Union } from "./stnode/Union.ts";
/*80--------------------------------------------------------------------------*/

/** Operator precedence */
export const enum Oprec {
  lowest = 1,
  err,
  union, // ∪
  intersect, // ∩
  subtract, // \
}

export type Paren = uint;

export type UnparenSet = Intersect | Subtract | Union | BinaryErr | Rel | Key;
/*80--------------------------------------------------------------------------*/
