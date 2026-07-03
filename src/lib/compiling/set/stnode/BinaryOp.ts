/** 80**************************************************************************
 * @module lib/compiling/set/stnode/BinaryOp
 * @license MIT
 ******************************************************************************/

import type { ERanr } from "@fe-edt/ERan.ts";
import type { lnum_t } from "@fe-lib/alias.ts";
import { Pale } from "@fe-lib/color/Pale.ts";
import type { Cssc } from "@fe-lib/color/alias.ts";
import { $cssstylesheet } from "@fe-lib/symbols.ts";
import { assert } from "@fe-lib/util.ts";
import { DENO, INOUT } from "@fe-src/preNs.ts";
import { Ranval } from "../../Ranval.ts";
import type { SetTk } from "../../Token.ts";
import { Tdt, Tuof } from "../../alias.ts";
import { ErrMsg, paleMock } from "../../util.ts";
import type { SetPazr } from "../SetPazr.ts";
import { SetTok } from "../SetTok.ts";
import { Oprec } from "../alias.ts";
import { Set } from "./Set.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

export abstract class BinaryOp extends SetSn {
  /* Pale */
  #stxFg_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.BinaryOp.stxFg");
  #onStxFgCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#stxFg_pn, _x);
    }
  };

  #cplTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.cplTd");
  #onCplTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#cplTd_pn, _x);
    }
  };

  observeTheme() {
    this.#stxFg_p.registCsscHandler(this.#onStxFgCssc);
    this.#cplTd_p.registCsscHandler(this.#onCplTdCssc);
  }
  unobserveTheme() {
    this.#stxFg_p.removeCsscHandler(this.#onStxFgCssc);
    this.#cplTd_p.removeCsscHandler(this.#onCplTdCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  readonly op: string = "?";
  static readonly oprec: Oprec;

  protected lhs$: Set;
  get lhs() {
    return this.lhs$;
  }

  readonly opTk;

  /**
   * If `undefined`, must `hasErr`.
   */
  protected rhs$: Set | undefined;
  get rhs() {
    return this.rhs$;
  }

  #children: Set[] | undefined;
  override get children(): Set[] {
    if (this.#children) return this.#children;

    const ret = [this.lhs$];
    if (this.rhs$) ret.push(this.rhs$);
    return this.#children = ret;
  }

  override get frstToken_1(): SetTk {
    return this.frstTk$ ??= this.lhs$.frstToken_1;
  }
  override get lastToken_1(): SetTk {
    return this.lastTk$ ??= this.rhs$ ? this.rhs$.lastToken_1 : this.opTk;
  }

  readonly #stx_hl_name = `${this.class_id}_stx`;
  get #stx_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[0] ??= new Highlight();
  }

  readonly #cpl_hl_name = `${this.class_id}_cpl`;
  get #cpl_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[1] ??= new Highlight();
  }

  readonly #stxFg_pn = `--${this.class_id}-stxFg`;
  readonly #cplTd_pn = `--${this.class_id}-cplTd`;
  readonly #cplTuo_pn = `--${this.class_id}-cplTuo`;

  /**
   * @headconst @param pazr_x
   * @headconst @param lhs_x
   * @const @param opTk_x
   */
  protected constructor(pazr_x: SetPazr, lhs_x: Set, opTk_x: SetTk) {
    super(pazr_x);
    this.lhs$ = lhs_x;
    this.opTk = opTk_x;

    lhs_x.attachTo_$(this);

    /*#static*/ if (!DENO) {
      CSS.highlights.set(this.#stx_hl_name, this.#stx_hl);
      CSS.highlights.set(this.#cpl_hl_name, this.#cpl_hl);

      document[$cssstylesheet].insertRule(
        `::highlight(${this.#stx_hl_name}) {
          color: var(${this.#stxFg_pn});
        }`,
      );
      document[$cssstylesheet].insertRule(
        `::highlight(${this.#cpl_hl_name}) {
              text-decoration: var(${this.#cplTd_pn}) underline ${Tdt}em;
              text-underline-offset: var(${this.#cplTuo_pn});
            }`,
      );

      document.body.style.setProperty(this.#stxFg_pn, this.#stxFg_p.cssc);
      document.body.style.setProperty(this.#cplTd_pn, this.#cplTd_p.cssc);
    }
  }

  override destructor(): void {
    /*#static*/ if (!DENO) {
      document[$cssstylesheet].deleteSelector(
        `::highlight(${this.#stx_hl_name})`,
      );
      document[$cssstylesheet].deleteSelector(
        `::highlight(${this.#cpl_hl_name})`,
      );

      document.body.style.removeProperty(this.#stxFg_pn);
      document.body.style.removeProperty(this.#cplTd_pn);
      document.body.style.removeProperty(this.#cplTuo_pn);
    }

    super.destructor();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(oldSn_x: Set, newSn_x: Set) {
    newSn_x.attachTo_$(this);

    if (this.lhs$ === oldSn_x) {
      this.lhs$ = newSn_x;
    } else {
      /*#static*/ if (INOUT) {
        assert(this.rhs$ === oldSn_x);
      }
      this.rhs$ = newSn_x;
    }
    this.#children = undefined;

    this.invalBdry();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  protected override clrHighlight_impl$(): false {
    this.opTk.revERan();
    this.revERan();

    this.#stx_hl.clear();
    this.#cpl_hl.clear();
    return false;
  }

  protected override setHighlight_impl$(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    if (this.sntLastLidx_1 < frstLidx_x || lastLidx_x < this.sntFrstLidx_1) {
      return this.clrHighlight_impl$();
    }

    this.#stx_hl.clear();
    this.#cpl_hl.clear();

    if (
      this.opTk.sntLastLidx_1 < frstLidx_x ||
      lastLidx_x < this.opTk.sntFrstLidx_1
    ) {
      this.opTk.revERan();
    } else {
      this.#stx_hl.add(this.opTk.syncERan(eranr_x).syncRange());
    }

    document.body.style.setProperty(
      this.#cplTuo_pn,
      `-${Math.max(1 + Tuof - this.depth_1 * Tuof, 0)}em`,
    );
    this.#cpl_hl.add(this.syncERan(eranr_x).syncRange());

    return true;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.lhs$} ${this.op} ${this.rhs$})`;
  }

  override _repr_(): [string, any] {
    return [this._info_, {
      lhs: this.lhs$._repr_(),
      op: this.opTk.toString(),
      rhs: this.rhs$ ? this.rhs$._repr_() : this.rhs$,
    }];
  }
}
/*64----------------------------------------------------------*/

/** @final */
export class BinaryErr extends BinaryOp {
  /* Pale */
  #stxTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.errTd");
  #onStxTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#stxTd_pn, _x);
    }
  };

  #errTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.errTd");
  #onErrTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#errTd_pn, _x);
    }
  };

  override observeTheme() {
    super.observeTheme();
    this.#stxTd_p.registCsscHandler(this.#onStxTdCssc);
    this.#errTd_p.registCsscHandler(this.#onErrTdCssc);
  }
  override unobserveTheme() {
    super.unobserveTheme();
    this.#stxTd_p.removeCsscHandler(this.#onStxTdCssc);
    this.#errTd_p.removeCsscHandler(this.#onErrTdCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  static override readonly oprec = Oprec.err;

  readonly #stx_hl_name = `${this.class_id}_stx`;
  get #stx_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[2] ??= new Highlight();
  }

  readonly #err_hl_name = `${this.class_id}_err`;
  get #err_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[3] ??= new Highlight();
  }

  readonly #stxTd_pn = `--${this.class_id}-stxTd`;
  readonly #errTd_pn = `--${this.class_id}-errTd`;

  private constructor(
    pazr_x: SetPazr,
    lhs_x: Set,
    opTk_x: SetTk,
    rhs_x: Set | undefined,
  ) {
    /*#static*/ if (INOUT) {
      assert(
        opTk_x.value !== SetTok.subtract &&
          opTk_x.value !== SetTok.intersect &&
          opTk_x.value !== SetTok.union,
      );
    }
    super(pazr_x, lhs_x, opTk_x);
    this.setErr([
      ErrMsg.set_inval_binary_op,
      Ranval.fromRan(opTk_x.ran_$),
      opTk_x.name,
    ]);
    if (rhs_x) {
      rhs_x.attachTo_$(this);
      this.rhs$ = rhs_x;
    } else {
      this.setErr(ErrMsg.set_binaryerr_no_rhs);
    }

    /*#static*/ if (!DENO) {
      CSS.highlights.set(this.#stx_hl_name, this.#stx_hl);
      CSS.highlights.set(this.#err_hl_name, this.#err_hl);

      document[$cssstylesheet].insertRule(
        `::highlight(${this.#stx_hl_name}) {
          text-decoration: var(${this.#stxTd_pn}) wavy underline;
          text-underline-offset: .2em;
        }`,
      );
      document[$cssstylesheet].insertRule(
        `::highlight(${this.#err_hl_name}) {
          text-decoration: var(${this.#errTd_pn}) wavy underline;
          text-underline-offset: .2em;
        }`,
      );

      document.body.style.setProperty(this.#stxTd_pn, this.#stxTd_p.cssc);
      document.body.style.setProperty(this.#errTd_pn, this.#errTd_p.cssc);
    }

    this.ensureBdry();
  }
  /**
   * @headconst @param pazr_x
   * @headconst @param lhs_x
   * @const @param opTk_x
   * @headconst @param rhs_x
   */
  static create(
    pazr_x: SetPazr,
    lhs_x: Set,
    opTk_x: SetTk,
    rhs_x: Set | undefined,
  ) {
    const ret = new BinaryErr(pazr_x, lhs_x, opTk_x, rhs_x);
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

      document.body.style.removeProperty(this.#stxTd_pn);
      document.body.style.removeProperty(this.#errTd_pn);
    }

    super.destructor();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  protected override setHighlight_impl$(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    const snHled = super.setHighlight_impl$(frstLidx_x, lastLidx_x, eranr_x);

    this.#stx_hl.clear();
    this.#err_hl.clear();

    if (
      !snHled ||
      this.opTk.sntLastLidx_1 < frstLidx_x ||
      lastLidx_x < this.opTk.sntFrstLidx_1
    ) {
      this.opTk.revERan();
    } else {
      this.#stx_hl.add(this.opTk.syncERan(eranr_x).syncRange());
    }

    if (snHled && this.hasErrMsg(ErrMsg.set_binaryerr_no_rhs)) {
      this.#err_hl.add(this.range_$);
    }

    return snHled;
  }
}
/*80--------------------------------------------------------------------------*/
