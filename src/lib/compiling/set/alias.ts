/** 80**************************************************************************
 * @module lib/compiling/set/alias
 * @license MIT
 ******************************************************************************/

import type { uint } from "../../alias.ts";
/*80--------------------------------------------------------------------------*/

/**
 * Operator precedence
 */
export const enum Oprec {
  lowest = 1,
  err,
  union, // ∪
  intersect, // ∩
  subtract, // \
}

export type Paren = uint;
/*80--------------------------------------------------------------------------*/