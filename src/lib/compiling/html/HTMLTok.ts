/** 80**************************************************************************
 * @module lib/compiling/html/HTMLTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum HTMLTok_ {
  DOCTYPE = 500,
  tag,
  comment,
  character,
  chrref, // &lt; | &#60; | &#x3C;

  _max,
}
console.assert(HTMLTok_._max <= 600);

export type HTMLTok = BaseTok | HTMLTok_;
export const HTMLTok = { ...BaseTok, ...HTMLTok_ };
/*80--------------------------------------------------------------------------*/
