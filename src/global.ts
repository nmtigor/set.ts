/** 80**************************************************************************
 * @module global
 * @license MIT
 ******************************************************************************/

import { Hover, Pointer, type uint } from "./lib/alias.ts";
/*80--------------------------------------------------------------------------*/

// deno-fmt-ignore
/* preprocessor names */
export const 
  CF = false // cloudflare
, DENO = true
, LOCAL = false
, MOZCENTRAL = false

, INOUT = true // contracts
, DEV = true // debug build
  , COLR = true
  , INFO = true
  , STEP = true
  , TRACE = true
  
  , RESIZ = true // "resize", `ResizeObserver`
  , INTRS = true // `IntersectionObserver`

  , THEMESETTING = false
  , EDITOR = true
    , /** @deprecated */EDITOR_v = true // verbose
  , PDFTS = true
    , PDFTS_v = true // verbose
      , PDFTS_vv = false // very verbose
, /** @deprecated */APP = false // release build 
, /** PeRFormance */PRF = true

, TESTING = true
, CYPRESS = false 

, _COLR = DEV && COLR
, _INFO = DEV && INFO
, _STEP = DEV && STEP && !TESTING
, _TRACE = DEV && TRACE && !TESTING

/* Only in ./pdf/ */
, PDFJSDev = true
, GENERIC = true
, CHROME = false
, GECKOVIEW = false
, LIB = false
, SKIP_BABEL = true
, IMAGE_DECODERS = false
, COMPONENTS = false
;
/*80-------------------------------------------------------------------------*/

const space_a_: (string | undefined)[] = [];
export const space = (n_: uint) => {
  if (space_a_[n_] === undefined) {
    space_a_[n_] = new Array(n_).fill(" ").join("");
  }
  return space_a_[n_]!;
};
/*80-------------------------------------------------------------------------*/

export const global = new class {
  /** @deprecated Use preprocessor */
  testing = false;

  readonly LASTUPDATE_NOT = "2020-07-10 22:17:59 +0200";
  readonly LASTUPDATE_DATNI = "2020-07-24 01:59:51 +0200";
  readonly LASTUPDATE_DEV = "2021-05-22 05:04:21 +0200";

  /** HTMLVCo */
  vco?: unknown;
  // holdindicatr?: [HoldIndicatr, HoldIndicatr, HoldIndicatr];

  /** @deprecated */
  has_ResizeObserver = false;
  /** @deprecated */
  can_touchstart = false;
  pointer = Pointer.none;
  anyPointer = Pointer.none;
  get can_touch() {
    return (this.anyPointer === Pointer.coarse || "ontouchstart" in window) &&
      navigator.maxTouchPoints > 0;
  }
  hover = Hover.none;
  anyHover = Hover.none;
  get can_hover() {
    return this.anyHover === Hover.hover;
  }

  // /* For testing only */
  // #_touch: Pointer | undefined;
  // set _touch(b_x: boolean | undefined) {
  //   this.#_touch ??= this.anyPointer;
  //   if (b_x === undefined) {
  //     global.anyPointer = this.#_touch;
  //   } else {
  //     if (b_x) {
  //       global.anyPointer = Pointer.coarse;
  //     } else {
  //       global.anyPointer = Pointer.fine;
  //     }
  //   }
  // }

  // #_hover: Hover | undefined;
  // set _hover(b_x: boolean | undefined) {
  //   this.#_hover ??= this.anyHover;
  //   if (b_x === undefined) {
  //     global.anyHover = this.#_hover;
  //   } else {
  //     if (b_x) {
  //       global.anyHover = Hover.hover;
  //     } else {
  //       global.anyHover = Hover.none;
  //     }
  //   }
  // }
  // /* ~ */

  readonly #tabsize = 4;
  #dent = 0;
  get dent() {
    let ret;
    if (this.#dent === 0) ret = "";
    else ret = space(this.#dent);
    return ret;
  }
  get indent() {
    const ret = this.dent;
    this.#dent += this.#tabsize;
    return ret;
  }
  get outdent() {
    this.#dent -= this.#tabsize;
    console.assert(this.#dent >= 0, "There are more outdent than indent!");
    return this.#dent;
  }
  // inlog( s_x:string, c_x?:string )
  // {
  //   if( c_x === undefined )
  //        console.log( `${this.indent}${s_x}` );
  //   else console.log( `%c${this.indent}${s_x}`, `color:${c_x}` );
  // }
  // log( s_x:string, c_x?:string )
  // {
  //   if( c_x === undefined )
  //        console.log( `${this.dent}${s_x}` );
  //   else console.log( `%c${this.dent}${s_x}`, `color:${c_x}` );
  // }
}();
/*80--------------------------------------------------------------------------*/

/*
Before runtimes support it natively...

Ref. https://devblogs.microsoft.com/typescript/announcing-typescript-5-2/#using-declarations-and-explicit-resource-management
*/
(Symbol as any).dispose ??= Symbol("Symbol.dispose");
(Symbol as any).asyncDispose ??= Symbol("Symbol.asyncDispose");
/*80--------------------------------------------------------------------------*/
