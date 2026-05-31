/** 80**************************************************************************
 * @module lib/compiling/html/HTMLTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum HTMLTok_ {
  doctype = 500,
  tag,
  comment,
  character,
  chrref, // &lt; | &#60; | &#x3C;

  /**
   * By spec, some bogus tags are not tokenized to any spec token (e.g. "<z\r"),
   * so add this to keep `HTMLTk`s concatenated.
   */
  bogusTag,

  _max,
}
console.assert(HTMLTok_._max <= 600);

export type HTMLTok = BaseTok | HTMLTok_;
export const HTMLTok = { ...BaseTok, ...HTMLTok_ };
/*80--------------------------------------------------------------------------*/
