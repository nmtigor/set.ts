/** 80**************************************************************************
 * @module lib/compiling/set/SetLexr
 * @license MIT
 ******************************************************************************/

import { INOUT } from "@fe-src/global.ts";
import { isWhitespaceUCod } from "../../util/string.ts";
import { assert, out } from "../../util/trace.ts";
import { Lexr } from "../Lexr.ts";
import { LocCompared } from "../Loc.ts";
import { TokRan } from "../TokRan.ts";
import { type SetTk, Token } from "../Token.ts";
import { Err } from "../alias.ts";
import type { SetBufr } from "./SetBufr.ts";
import { SetTok } from "./SetTok.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class SetLexr extends Lexr<SetTok> {
  /** Fuzykey `uint16` which needs to escape using `\` */
  static #esc_a = [0x5C, 0x3E, 0x3F, 0x22, 0x28, 0x29]; // ["\\", ">", "?", '"', "(", ")"]

  reset_SetLexr(bufr_x?: SetBufr): this {
    return this.reset_Lexr$(bufr_x ?? this.bufr$);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** Adjust `strtLexTk$`, `stopLexTk$`, and assign `curLoc$` */
  protected override prelex$(): void {
    if (this.strtLexTk$.value === SetTok.subtract) {
      this.strtLexTk$ = this.strtLexTk$.prevToken_$!;
    }
    if (
      this.stopLexTk$.value !== SetTok.stopBdry &&
      this.stopLexTk$.sntStrtLoc.peek_ucod(-1) === /* "\\" */ 0x5C
    ) {
      this.stopLexTk$ = this.stopLexTk$.nextToken_$!;
    }

    this.curLoc$.become_Loc(this.strtLexTk$.sntStopLoc);
  }

  /**
   * @return `false` if all "[curLoc$" of the line `isWhitespaceUCod()`.
   *  Whatever `true` or `false`, `curLoc$` will be at the right place.
   */
  #skipLineWhitespace(): boolean {
    let ret = false;
    const ln_ = this.curLoc$.line_$;
    let i_ = this.curLoc$.loff_$;
    for (const iI = ln_.uchrLen; i_ < iI; ++i_) {
      if (!isWhitespaceUCod(ln_.ucodAt(i_)!)) {
        ret = true;
        break;
      }
    }
    this.curLoc$.loff_$ = i_;
    return ret;
  }
  /**
   * @return `true` if continue; `false` if `atRigtBdry$() === LocCompared.yes`.
   *  Whatever `true` or `false`, `curLoc$` will be at the right place.
   */
  #skipWhitespace(): boolean {
    let ret = true;
    const VALVE = 1_000;
    let valve = VALVE;
    L_0: do {
      const ucod = this.curLoc$.forw_ucod();
      switch (this.atRigtBdry$()) {
        case LocCompared.yes:
          ret = false;
          break L_0;
        case LocCompared.no_othrline:
          if (this.#skipLineWhitespace()) break L_0;
          break;
        default:
          if (!isWhitespaceUCod(ucod)) break L_0;
          break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return ret;
  }

  /** @out @param retTk_x */
  @out((_, ret) => {
    assert(ret.value === SetTok.quotkey);
  })
  private _scanQuotkey(retTk_x: SetTk): SetTk {
    /*#static*/ if (INOUT) {
      assert(!this.reachLexBdry$() && this.curLoc$.ucod === /* '"' */ 0x22);
    }
    const VALVE = 10_000;
    let valve = VALVE;
    do {
      const ucod = this.curLoc$.forw_ucod();
      if (this.atRigtBdry$() === LocCompared.yes) {
        retTk_x.setErr(Err.double_quoted_string)
          .setStop(this.curLoc$, SetTok.quotkey);
        break;
      }
      if (
        ucod === /* "\\" */ 0x5C &&
        this.curLoc$.peek_ucod(1) === /* '"' */ 0x22
      ) {
        this.curLoc$.forw();
        if (this.atRigtBdry$() === LocCompared.yes) {
          retTk_x.setErr(Err.double_quoted_string)
            .setStop(this.curLoc$, SetTok.quotkey);
          break;
        }
        continue;
      }
      if (ucod === /* '"' */ 0x22) {
        retTk_x.setStop(this.curLoc$.forw(), SetTok.quotkey);
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return retTk_x;
  }

  /** @out @param retTk_x */
  @out((_, ret) => {
    assert(ret.value === SetTok.fuzykey && !ret.empty);
  })
  private _scanFuzykey(retTk_x: SetTk): SetTk {
    /*#static*/ if (INOUT) {
      assert(!this.reachLexBdry$());
    }
    const VALVE = 1_000;
    let valve = VALVE;
    L_0: do {
      let ucod = this.curLoc$.ucod;
      if (this.atRigtBdry$() === LocCompared.yes || isWhitespaceUCod(ucod)) {
        retTk_x.setStop(this.curLoc$, SetTok.fuzykey);
        break;
      }
      switch (ucod) {
        case /* '"' */ 0x22:
        case /* "?" */ 0x3F:
        case /* ">" */ 0x3E:
        case /* "∩" */ 0x0_2229:
        case /* "∪" */ 0x0_222A:
        case /* "(" */ 0x28:
        case /* ")" */ 0x29:
          retTk_x.setStop(this.curLoc$, SetTok.fuzykey);
          break L_0;
        case /* "\\" */ 0x5C:
          ucod = this.curLoc$.forw_ucod();
          if (
            this.atRigtBdry$() === LocCompared.yes ||
            !SetLexr.#esc_a.includes(ucod)
          ) {
            /* "\\" is subtract */
            retTk_x.setStop(this.curLoc$.back(), SetTok.fuzykey);
            break L_0;
          }
          this.curLoc$.forw();
          break;
        default:
          this.curLoc$.forw();
          break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return retTk_x;
  }

  /** @implement */
  protected scan_impl$(): SetTk {
    const retTk = new Token(this, new TokRan(this.curLoc$.dup_Loc()));
    let ucod = this.curLoc$.ucod;
    if (isWhitespaceUCod(ucod)) {
      if (!this.#skipWhitespace()) {
        return retTk.setStop(this.curLoc$);
      }
      retTk.setStrt(this.curLoc$);
      ucod = this.curLoc$.ucod;
    }
    switch (ucod) {
      case /* '"' */ 0x22:
        this._scanQuotkey(retTk);
        break;
      case /* "?" */ 0x3F:
        retTk.setStop(this.curLoc$.forw(), SetTok.question);
        break;
      case /* ">" */ 0x3E:
        retTk.setStop(this.curLoc$.forw(), SetTok.joiner);
        break;
      case /* "\\" */ 0x5C:
        ucod = this.curLoc$.forw_ucod();
        if (
          this.atRigtBdry$() === LocCompared.yes ||
          !SetLexr.#esc_a.includes(ucod)
        ) {
          /* "\\" is subtract */
          retTk.setStop(this.curLoc$, SetTok.subtract);
          break;
        }
        this.curLoc$.back();
        this._scanFuzykey(retTk);
        break;
      case /* "∩" */ 0x0_2229:
        retTk.setStop(this.curLoc$.forw(), SetTok.intersect);
        break;
      case /* "∪" */ 0x0_222A:
        retTk.setStop(this.curLoc$.forw(), SetTok.union);
        break;
      case /* "(" */ 0x28:
        retTk.setStop(this.curLoc$.forw(), SetTok.paren_open);
        break;
      case /* ")" */ 0x29:
        retTk.setStop(this.curLoc$.forw(), SetTok.paren_cloz);
        break;
      default:
        this._scanFuzykey(retTk);
    }
    return retTk;
  }

  protected override canConcat$(tk_0: SetTk, tk_1: SetTk) {
    return (
      tk_0.value === SetTok.fuzykey && tk_1.value === SetTok.fuzykey &&
      tk_0.sntStopLoc.posE(tk_1.sntStrtLoc)
    );
  }
}
/*80--------------------------------------------------------------------------*/
