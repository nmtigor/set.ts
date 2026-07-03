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
  #stxFg_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.Set.stxFg");
  #onStxFgCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#stxFg_pn, _x);
    }
  };

  #errTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.errTd");
  #onErrTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#errTd_pn, _x);
    }
  };

  observeTheme() {
    this.#stxFg_p.registCsscHandler(this.#onStxFgCssc);
    this.#errTd_p.registCsscHandler(this.#onErrTdCssc);
  }
  unobserveTheme() {
    this.#stxFg_p.removeCsscHandler(this.#onStxFgCssc);
    this.#errTd_p.removeCsscHandler(this.#onErrTdCssc);
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

  readonly #stx_hl_name = `${this.class_id}_stx`;
  get #stx_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[0] ??= new Highlight();
  }

  readonly #err_hl_name = `${this.class_id}_err`;
  get #err_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[1] ??= new Highlight();
  }

  readonly #stxFg_pn = `--${this.class_id}-stxFg`;
  readonly #errTd_pn = `--${this.class_id}-errTd`;

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
      CSS.highlights.set(this.#stx_hl_name, this.#stx_hl);
      CSS.highlights.set(this.#err_hl_name, this.#err_hl);

      document[$cssstylesheet].insertRule(
        `::highlight(${this.#stx_hl_name}) {
          color: var(${this.#stxFg_pn});
        }`,
      );
      document[$cssstylesheet].insertRule(
        //jjjj TOCLEANUP
        // `::highlight(${this.#err_hl_name}) {
        //   text-shadow: 0 -.2em var(${this.#errTd_pn});
        // }`,
        `::highlight(${this.#err_hl_name}) {
          text-decoration: var(${this.#errTd_pn}) wavy underline;
          text-underline-offset: .2em;
        }`,
      );

      document.body.style.setProperty(this.#stxFg_pn, this.#stxFg_p.cssc);
      document.body.style.setProperty(this.#errTd_pn, this.#errTd_p.cssc);
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
        `::highlight(${this.#stx_hl_name})`,
      );
      document[$cssstylesheet].deleteSelector(
        `::highlight(${this.#err_hl_name})`,
      );

      document.body.style.removeProperty(this.#stxFg_pn);
      document.body.style.removeProperty(this.#errTd_pn);
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

    this.#stx_hl.clear();
    this.#err_hl.clear();
    return false;
  }

  protected override setHighlight_impl$(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    if (
      this.sntLastLidx_1 < frstLidx_x || lastLidx_x < this.sntFrstLidx_1 ||
      this.#paren === 0 && !this.isErr
    ) {
      return this.clrHighlight_impl$();
    }

    this.#stx_hl.clear();
    this.#err_hl.clear();
    let highlighted = false;

    /**
     * @headconst @param tk_y
     * @headconst @param hl_y `#stx_hl` or `#err_hl`
     */
    const setHl_ = (tk_y: SetTk, hl_y: Highlight) => {
      if (tk_y.sntLastLidx_1 < frstLidx_x || lastLidx_x < tk_y.sntFrstLidx_1) {
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
      ) setHl_(tk_, this.#stx_hl);
      for (
        let tk_ = this.lastToken_1;
        tk_.value === SetTok.paren_cloz;
        tk_ = tk_.prevToken_$!
      ) setHl_(tk_, this.#stx_hl);
    }

    if (this.hasErrMsg(ErrMsg.set_unexp_tk)) {
      /*#static*/ if (INOUT) {
        assert(this.unpanenSet instanceof Token);
      }
      setHl_(this.unpanenSet as SetTk, this.#err_hl);
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
      ) setHl_(tk_, this.#err_hl);
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
      ) setHl_(tk_, this.#err_hl);
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
