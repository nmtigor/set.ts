/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Set
 * @license MIT
 ******************************************************************************/

import type { ERanr } from "@fe-edt/ERan.ts";
import { lnum_t } from "@fe-lib/alias.ts";
import { Pale } from "@fe-lib/color/Pale.ts";
import type { Cssc } from "@fe-lib/color/alias.ts";
import { $cssstylesheet } from "@fe-lib/symbols.ts";
import { assert } from "@fe-lib/util.ts";
import { DENO, INOUT } from "@fe-src/preNs.ts";
import { Ranval } from "../../Ranval.ts";
import type { SetTk } from "../../Token.ts";
import { Token } from "../../Token.ts";
import { ErrMsg, paleMock } from "../../util.ts";
import type { SetPazr } from "../SetPazr.ts";
import { SetTok } from "../SetTok.ts";
import type { Paren, UnparenSet } from "../alias.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Set extends SetSn {
  /* Pale */
  #mainFg_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.Set.mainFg");
  #onMainFgCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#mainFg_pn, _x);
    }
  };

  #errTs_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.errTs");
  #onErrTsCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#errTs_pn, _x);
    }
  };

  observeTheme() {
    this.#mainFg_p.registCsscHandler(this.#onMainFgCssc);
    this.#errTs_p.registCsscHandler(this.#onErrTsCssc);
  }
  unobserveTheme() {
    this.#mainFg_p.removeCsscHandler(this.#onMainFgCssc);
    this.#errTs_p.removeCsscHandler(this.#onErrTsCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** If `this.#unpanenSet instanceof SetTk`, must `hasErr`. */
  #unpanenSet: UnparenSet | SetTk;
  get unpanenSet() {
    return this.#unpanenSet;
  }

  #paren: Paren;
  get paren(): Paren {
    return this.#paren;
  }
  set paren_$(_x: Paren) {
    if (_x === this.#paren) return;

    this.#paren = _x;

    this.invalBdry().ensureBdry();
  }

  #children: UnparenSet[] | undefined;
  override get children(): UnparenSet[] {
    if (this.#children) return this.#children;

    const ret: UnparenSet[] = [];
    if (!(this.#unpanenSet instanceof Token)) ret.push(this.#unpanenSet);
    return this.#children = ret;
  }

  override get frstToken_1() {
    if (this.frstTk$) return this.frstTk$;

    let ret = this.#unpanenSet instanceof Token
      ? this.#unpanenSet
      : this.#unpanenSet.frstToken_1;
    for (let i = this.#paren; i--;) {
      const tk_ = ret.prevToken_$;
      if (!tk_ || tk_.value === SetTok.strtBdry) break;
      ret = tk_;
    }
    return this.frstTk$ = ret;
  }
  override get lastToken_1() {
    if (this.lastTk$) return this.lastTk$;

    let ret = this.#unpanenSet instanceof Token
      ? this.#unpanenSet
      : this.#unpanenSet.lastToken_1;
    for (let i = this.#paren; i--;) {
      const tk_ = ret.nextToken_$;
      if (!tk_ || tk_.value === SetTok.stopBdry) break;
      ret = tk_;
    }
    return this.lastTk$ = ret;
  }

  readonly #main_hl_name = `${this._class_id_}_main`;
  get #main_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[0] ??= new Highlight();
  }

  readonly #err_hl_name = `${this._class_id_}_err`;
  get #err_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[1] ??= new Highlight();
  }

  readonly #mainFg_pn = `--${this._class_id_}-parenFg`;
  readonly #errTs_pn = `--${this._class_id_}-errTs`;

  private constructor(
    pazr_x: SetPazr,
    unparnSet_x: UnparenSet | SetTk,
    paren_x: Paren,
  ) {
    super(pazr_x);
    this.#unpanenSet = unparnSet_x;
    this.#paren = paren_x;

    if (unparnSet_x instanceof Token) {
      this.setErr([
        ErrMsg.set_unexp_tk,
        Ranval.fromRan(unparnSet_x.ran_$),
        unparnSet_x.name,
      ]);
    } else {
      unparnSet_x.attachTo_$(this);
    }

    /*#static*/ if (!DENO) {
      CSS.highlights.set(this.#main_hl_name, this.#main_hl);
      CSS.highlights.set(this.#err_hl_name, this.#err_hl);
      document[$cssstylesheet].insertRule(
        `::highlight(${this.#main_hl_name}) {
          color: var(${this.#mainFg_pn});
        }`,
      );
      document[$cssstylesheet].insertRule(
        `::highlight(${this.#err_hl_name}) {
          text-shadow: 0 -.2em var(${this.#errTs_pn});
        }`,
        /* Underline is not always visible, e.g., underline is visible for "\\",
        but not visible for "(". */
        // `::highlight(${this.#err_hl_name}) {
        //   text-decoration: var(${this.#errTd_pn}) wavy underline;
        // }`,

        // `::highlight(${this.#err_hl_name}) {
        //     color: var(${this.#errTs_pn});
        //   }`,
      );
      document.body.style.setProperty(this.#mainFg_pn, this.#mainFg_p.cssc);
      document.body.style.setProperty(this.#errTs_pn, this.#errTs_p.cssc);
    }

    this.ensureBdry();
  }
  /**
   * @headconst @param pazr_x
   * @headconst @param unparnSet_x
   * @const @param paren_x
   */
  static create(
    pazr_x: SetPazr,
    unparnSet_x: UnparenSet | SetTk,
    paren_x: Paren,
  ) {
    const ret = new Set(pazr_x, unparnSet_x, paren_x);
    ret.observeTheme();
    return ret;
  }

  override destructor(): void {
    this.unobserveTheme();

    /*#static*/ if (!DENO) {
      document[$cssstylesheet].deleteSelector(
        `::highlight(${this.#main_hl_name})`,
      );
      document[$cssstylesheet].deleteSelector(
        `::highlight(${this.#err_hl_name})`,
      );
      document.body.style.removeProperty(this.#mainFg_pn);
      document.body.style.removeProperty(this.#errTs_pn);
    }

    super.destructor();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(_oldSn_x: UnparenSet, newSn_x: UnparenSet) {
    newSn_x.attachTo_$(this);
    this.#unpanenSet = newSn_x;
    this.#children = undefined;

    this.invalBdry();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  protected override clrHighlight_impl$(): false {
    for (
      let tk_ = this.frstToken_1;
      tk_.value === SetTok.paren_open;
      tk_ = tk_.nextToken_$!
    ) tk_.revERan();
    for (
      let tk_ = this.lastToken_1;
      tk_.value === SetTok.paren_cloz;
      tk_ = tk_.prevToken_$!
    ) tk_.revERan();
    if (this.unpanenSet instanceof Token) this.unpanenSet.revERan();

    this.#main_hl.clear();
    this.#err_hl.clear();
    return false;
  }

  protected override setHighlight_impl$(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    if (this.#paren === 0 && !this.isErr) {
      return this.clrHighlight_impl$();
    }

    this.#main_hl.clear();
    this.#err_hl.clear();
    let highlighted = false;

    /**
     * @headconst @param tk_y
     * @headconst @param hl_y
     */
    const addToHl_ = (tk_y: SetTk, hl_y: Highlight) => {
      if (
        tk_y.sntLastLidx_1 < frstLidx_x || tk_y.sntFrstLidx_1 > lastLidx_x
      ) {
        tk_y.revERan();
      } else {
        hl_y.add(tk_y.syncERan(eranr_x).syncRange());
        highlighted = true;
      }
    };

    if (this.#paren) {
      for (
        let tk_ = this.frstToken_1;
        tk_.value === SetTok.paren_open;
        tk_ = tk_.nextToken_$!
      ) addToHl_(tk_, this.#main_hl);
      for (
        let tk_ = this.lastToken_1;
        tk_.value === SetTok.paren_cloz;
        tk_ = tk_.prevToken_$!
      ) addToHl_(tk_, this.#main_hl);
    }
    if (this.isErr) {
      if (this.hasErrMsg(ErrMsg.set_unexp_tk)) {
        /*#static*/ if (INOUT) {
          assert(this.unpanenSet instanceof Token);
        }
        addToHl_(this.unpanenSet as SetTk, this.#err_hl);
      }
      if (this.hasErrMsg(ErrMsg.set_no_cloz_paren)) {
        let nCloz: Paren = 0;
        for (
          let tk_ = this.lastToken_1;
          tk_.value === SetTok.paren_cloz && tk_ !== this.unpanenSet;
          tk_ = tk_.prevToken_$!
        ) nCloz += 1;
        /*#static*/ if (INOUT) {
          assert(nCloz < this.#paren);
        }
        for (
          let tk_ = this.frstToken_1, i = this.#paren - nCloz;
          i--;
          tk_ = tk_.nextToken_$!
        ) addToHl_(tk_, this.#err_hl);
      }
      if (this.hasErrMsg(ErrMsg.set_no_open_paren)) {
        let nOpen: Paren = 0;
        for (
          let tk_ = this.frstToken_1;
          tk_.value === SetTok.paren_open;
          tk_ = tk_.nextToken_$!
        ) nOpen += 1;
        /*#static*/ if (INOUT) {
          assert(nOpen < this.#paren);
        }
        for (
          let tk_ = this.lastToken_1, i = this.#paren - nOpen;
          i--;
          tk_ = tk_.prevToken_$!
        ) addToHl_(tk_, this.#err_hl);
      }
    }
    return highlighted;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${
      new Array(this.#paren).fill("(").join("")
    }${this.#unpanenSet}${new Array(this.#paren).fill(")").join("")})`;
  }

  override _repr_() {
    const unpanenSet = this.#unpanenSet instanceof Token
      ? this.#unpanenSet.toString()
      : this.#unpanenSet._repr_();
    return this.#paren
      ? [
        this._info_,
        new Array(this.#paren).fill("(").join(""),
        unpanenSet,
        new Array(this.#paren).fill(")").join(""),
      ]
      : [this._info_, unpanenSet];
  }
}
/*80--------------------------------------------------------------------------*/
