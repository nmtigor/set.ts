/** 80**************************************************************************
 * @module lib/compiling/set/SetTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum SetTok_ {
  fuzykey = 200,
  quotkey,

  question, // ?
  joiner, // >

  subtract, // \
  intersect, // ∩
  union, // ∪

  paren_open, // (
  paren_cloz, // )

  _max,
}
console.assert(SetTok_._max <= 300);

export type SetTok = BaseTok | SetTok_;
export const SetTok = { ...BaseTok, ...SetTok_ };
/*80--------------------------------------------------------------------------*/
