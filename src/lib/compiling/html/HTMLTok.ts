/** 80**************************************************************************
 * @module lib/compiling/uri/HTMLTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum HTMLTok_ {
  _ = 1000,

  _max,
}
console.assert(HTMLTok_._max <= 1100);

export type HTMLTok = BaseTok | HTMLTok_;
export const HTMLTok = { ...BaseTok, ...HTMLTok_ };
/*80--------------------------------------------------------------------------*/
