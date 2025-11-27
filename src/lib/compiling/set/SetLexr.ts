/** 80**************************************************************************
 * @module lib/compiling/set/SetLexr
 * @license MIT
 ******************************************************************************/

import { INOUT } from "@fe-src/preNs.ts";
import { assert, out } from "../../util.ts";
import { isWhitespaceUCod } from "../../util/string.ts";
import { Lexr } from "../Lexr.ts";
import { LocCompared } from "../Loc.ts";
import type { SetTk } from "../Token.ts";
import { Err } from "../alias.ts";
import { SetTok } from "./SetTok.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class SetLexr extends Lexr<SetTok> {
  /** Fuzykey `UInt16` which needs to escape using `\` */
  static #esc_a = [0x5C, 0x3E, 0x3F, 0x22, 0x28, 0x29]; // ["\\", ">", "?", '"', "(", ")"]
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** Adjust `strtLexTk$`, `stopLexTk$`, and assign `curLoc$` */
  protected override prelex$(): void {
    if (this.strtLexTk$.value === SetTok.subtract) {
      this.drtenTk_$(this.strtLexTk$);
      this.strtLexTk$ = this.strtLexTk$.prevToken_$!;
    }
    if (
      this.stopLexTk$.value !== SetTok.stopBdry &&
      this.stopLexTk$.sntStrtLoc.peek_ucod(-1) === /* "\\" */ 0x5C
    ) {
      this.drtenTk_$(this.stopLexTk$);
      this.stopLexTk$ = this.stopLexTk$.nextToken_$!;
    }
    super.prelex$();
  }

  @out((self: SetLexr) => {
    assert(self.outTk$?.value === SetTok.quotkey);
  })
  private _scanQuotkey(): void {
    /*#static*/ if (INOUT) {
      assert(!this.reachLexBdry$() && this.curLoc$.ucod === /* '"' */ 0x22);
    }
    const VALVE = 10_000;
    let valve = VALVE;
    do {
      const ucod = this.curLoc$.forw_ucod();
      if (this.atRigtBdry$() === LocCompared.yes) {
        this.outTk_1$.setErr(Err.double_quoted_string_open)
          .setStop(this.curLoc$, SetTok.quotkey);
        break;
      }
      if (
        ucod === /* "\\" */ 0x5C &&
        this.curLoc$.peek_ucod(1) === /* '"' */ 0x22
      ) {
        this.curLoc$.forw();
        if (this.atRigtBdry$() === LocCompared.yes) {
          this.outTk_1$.setErr(Err.double_quoted_string_open)
            .setStop(this.curLoc$, SetTok.quotkey);
          break;
        }
        continue;
      }
      if (ucod === /* '"' */ 0x22) {
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.quotkey);
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
  }

  @out((self: SetLexr) => {
    assert(self.outTk$?.value === SetTok.fuzykey && !self.outTk$.empty);
  })
  private _scanFuzykey(): void {
    /*#static*/ if (INOUT) {
      assert(!this.reachLexBdry$());
    }
    const VALVE = 1_000;
    let valve = VALVE;
    L_0: do {
      let ucod = this.curLoc$.ucod;
      if (this.atRigtBdry$() === LocCompared.yes || isWhitespaceUCod(ucod)) {
        this.outTk_1$.setStop(this.curLoc$, SetTok.fuzykey);
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
          this.outTk_1$.setStop(this.curLoc$, SetTok.fuzykey);
          break L_0;
        case /* "\\" */ 0x5C:
          ucod = this.curLoc$.forw_ucod();
          if (
            this.atRigtBdry$() === LocCompared.yes ||
            !SetLexr.#esc_a.includes(ucod)
          ) {
            /* "\\" is subtract */
            this.outTk_1$.setStop(this.curLoc$.back(), SetTok.fuzykey);
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
  }

  /** @implement */
  protected scan_impl$(): SetTk | undefined {
    this.outTk$ = undefined;
    let ucod = this.curLoc$.ucod;
    if (
      isWhitespaceUCod(this.curLoc$.ucod) &&
      !this.skipWhitespace$()
    ) return;

    this.outTk_1$;
    ucod = this.curLoc$.ucod;
    switch (ucod) {
      case /* '"' */ 0x22:
        this._scanQuotkey();
        break;
      case /* "?" */ 0x3F:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.question);
        break;
      case /* ">" */ 0x3E:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.joiner);
        break;
      case /* "\\" */ 0x5C:
        ucod = this.curLoc$.forw_ucod();
        if (
          this.atRigtBdry$() === LocCompared.yes ||
          !SetLexr.#esc_a.includes(ucod)
        ) {
          /* "\\" is subtract */
          this.outTk_1$.setStop(this.curLoc$, SetTok.subtract);
          break;
        }
        this.curLoc$.back();
        this._scanFuzykey();
        break;
      case /* "∩" */ 0x0_2229:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.intersect);
        break;
      case /* "∪" */ 0x0_222A:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.union);
        break;
      case /* "(" */ 0x28:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.paren_open);
        break;
      case /* ")" */ 0x29:
        this.outTk_1$.setStop(this.curLoc$.forw(), SetTok.paren_cloz);
        break;
      default:
        this._scanFuzykey();
    }
    return this.outTk$;
  }

  protected override canConcat$(tk_0: SetTk, tk_1: SetTk) {
    return (
      tk_0.value === SetTok.fuzykey && tk_1.value === SetTok.fuzykey &&
      tk_0.sntStopLoc.posE(tk_1.sntStrtLoc)
    );
  }
}
/*80--------------------------------------------------------------------------*/
