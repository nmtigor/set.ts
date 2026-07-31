/** 80**************************************************************************
 * @module lib/compiling/set/alias
 * @license MIT
 ******************************************************************************/

import type { uint } from "../../alias.ts";
import type { BinaryOp } from "./stnode/BinaryOp.ts";
import type { Ids } from "./stnode/Ids.ts";
import type { Key } from "./stnode/Key.ts";
import type { Rel } from "./stnode/Rel.ts";
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

export type UnparenSet =
  | BinaryOp
  | Rel
  | Key
  | Ids;
/*80--------------------------------------------------------------------------*/
