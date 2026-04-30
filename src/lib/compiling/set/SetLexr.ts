/** 80**************************************************************************
 * @module lib/compiling/set/SetLexr
 * @license MIT
 ******************************************************************************/

import { INOUT } from "@fe-src/preNs.ts";
import { assert, out } from "../../util.ts";
import { isWs } from "../../util/string.ts";
import { Lexr } from "../Lexr.ts";
import { LocCfd } from "../Loc.ts";
import type { SetTk } from "../Token.ts";
import { Err } from "../alias.ts";
import { SetTok } from "./SetTok.ts";
/*80--------------------------------------------------------------------------*/

/** Fuzykey `UInt16` which needs to escape using `\` */
const setEsc_a = [0x5C, 0x3E, 0x3F, 0x22, 0x28, 0x29]; // ["\\", ">", "?", '"', "(", ")"]

/** @final */
export class SetLexr extends Lexr<SetTok> {
  /** Adjust `strtLexTk$`, `stopLexTk$`, and assign `curLoc$` */
  protected override preLex$(): void {
    if (this.strtLexTk$.value === SetTok.subtract) {
      this.enlrgStrtTk$();
    }
    if (
      this.stopLexTk$.value !== SetTok.stopBdry &&
      this.stopLexTk$.sntStrtLoc.peek_ucod(-1) === /* "\\" */ 0x5C
    ) {
      this.drtenTk$(this.stopLexTk$);
      this.stopLexTk$ = this.stopLexTk$.nextToken_$!;
    }
    super.preLex$();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  @out((self: SetLexr) => {
    assert(self.outTk$?.value === SetTok.quotkey);
  })
  #scanQuotkey(): void {
    /*#static*/ if (INOUT) {
      assert(
        this.outTk$?.sntStrtLoc.posE(this.curLoc$) &&
          this.curLoc$.ucod === /* '"' */ 0x22,
      );
    }
    const VALVE = 10_000;
    let valve = VALVE;
    do {
      const ucod = this.curLoc$.forw_ucod();
      if (this.reachLexBdry$()) {
        this.outTk$!.setErr(Err.quoted_string_open)
          .setStop(this.curLoc$, SetTok.quotkey);
        break;
      }
      if (
        ucod === /* "\\" */ 0x5C &&
        this.curLoc$.peek_ucod(1) === /* '"' */ 0x22
      ) {
        this.curLoc$.forw();
        if (this.reachLexBdry$()) {
          this.outTk$!.setErr(Err.quoted_string_open)
            .setStop(this.curLoc$, SetTok.quotkey);
          break;
        }
        continue;
      }
      if (ucod === /* '"' */ 0x22) {
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.quotkey);
        break;
      }
    } while (valve--);
    assert(valve, `Loop ${VALVE}±1 times`);
  }

  @out((self: SetLexr) => {
    assert(self.outTk$?.value === SetTok.fuzykey && !self.outTk$.empty);
  })
  #scanFuzykey(): void {
    /*#static*/ if (INOUT) {
      assert(this.outTk$?.sntStrtLoc.posE(this.curLoc$));
    }
    const VALVE = 1_000;
    let valve = VALVE;
    L_0: do {
      let ucod = this.curLoc$.ucod;
      if (this.reachLexBdry$() || isWs(ucod)) {
        this.outTk$!.setStop(this.curLoc$, SetTok.fuzykey);
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
          this.outTk$!.setStop(this.curLoc$, SetTok.fuzykey);
          break L_0;
        case /* "\\" */ 0x5C:
          ucod = this.curLoc$.forw_ucod();
          if (this.reachLexBdry$() || !setEsc_a.includes(ucod)) {
            /* "\\" is subtract */
            this.outTk$!.setStop(this.curLoc$.back(), SetTok.fuzykey);
            break L_0;
          }
          this.curLoc$.forw();
          break;
        default:
          this.curLoc$.forw();
          break;
      }
    } while (valve--);
    assert(valve, `Loop ${VALVE}±1 times`);
  }

  /** @implement */
  protected scan_impl$(): SetTk | undefined {
    let ucod = this.curLoc$.ucod;
    if (isWs(this.curLoc$.ucod) && !this.skipWs$()) return;

    this.outTk_1$;
    ucod = this.curLoc$.ucod;
    switch (ucod) {
      case /* '"' */ 0x22:
        this.#scanQuotkey();
        break;
      case /* "?" */ 0x3F:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.question);
        break;
      case /* ">" */ 0x3E:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.joiner);
        break;
      case /* "\\" */ 0x5C:
        ucod = this.curLoc$.forw_ucod();
        if (this.reachLexBdry$() || !setEsc_a.includes(ucod)) {
          /* "\\" is subtract */
          this.outTk$!.setStop(this.curLoc$, SetTok.subtract);
          break;
        }
        this.curLoc$.back();
        this.#scanFuzykey();
        break;
      case /* "∩" */ 0x0_2229:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.intersect);
        break;
      case /* "∪" */ 0x0_222A:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.union);
        break;
      case /* "(" */ 0x28:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.paren_open);
        break;
      case /* ")" */ 0x29:
        this.outTk$!.setStop(this.curLoc$.forw(), SetTok.paren_cloz);
        break;
      default:
        this.#scanFuzykey();
    }
    return this.outTk$;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  protected override canConcat$(tk_0_x: SetTk, tk_1_x: SetTk) {
    return (
      tk_0_x.value === SetTok.fuzykey && tk_1_x.value === SetTok.fuzykey &&
      tk_0_x.sntStopLoc.posE(tk_1_x.sntStrtLoc)
    );
  }
}
/*80--------------------------------------------------------------------------*/
