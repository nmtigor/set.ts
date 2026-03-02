/** 80**************************************************************************
 * @module lib/editor/MainCaret
 * @license MIT
 ******************************************************************************/

import { Ranval } from "@fe-cpl/Ranval.ts";
import type { lnum_t } from "../alias.ts";
import "../jslang.ts";
import { Caret } from "./Caret.ts";
import type { EdtrBase } from "./EdtrBase.ts";
import { genInlineMidOf } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class MainCaret extends Caret {
  //jjjj TOCLEANUP
  // visible?: boolean;

  protected override get isMain$(): boolean {
    return this === this.realBody;
    // return true;
  }

  /** Viewport inline within `edtr` to keep */
  inline_$ = 0;
  keepInlineOnce_$ = false;

  /**
   * Set in EdtrScrolr, because it is shared between `mainCaret` and its shadow
   * carets.
   */
  suppressDrawRangeOnce_$ = false;

  /* For `EdtrScrolr.moveCaretLeft()`, etc */
  readonly move_rv_$ = new Ranval(0, 0);
  /* ~ */

  /* For dragging selection */
  ctnr_rv: Ranval | undefined;
  drag_rv_$: Ranval | undefined;
  get dragingSel(): boolean {
    return !!this.ctnr_rv && !!this.drag_rv_$;
  }
  /* ~ */

  private constructor(coo_x: EdtrBase) {
    super(coo_x);
  }
  /** @headconst @param coo_x */
  static override create(coo_x: EdtrBase) {
    const ret = new MainCaret(coo_x);
    ret.observeTheme();
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  protected override sufDraw$(): void {
    if (!this.keepInlineOnce_$ && this.lastSin$) {
      this.inline_$ = genInlineMidOf(this.coo$._writingMode)(this.lastSin$);
      // console.log("🚀 ~ Caret ~ #drawFocus ~ inline_$:", this.inline_$);
    }
    this.keepInlineOnce_$ = false;
  }
}
/*80--------------------------------------------------------------------------*/
