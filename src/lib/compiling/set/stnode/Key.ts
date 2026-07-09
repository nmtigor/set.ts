/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Key
 * @license MIT
 ******************************************************************************/

import type { ERanr } from "@fe-edt/ERan.ts";
import type { lnum_t } from "@fe-lib/alias.ts";
import { Pale } from "@fe-lib/color/Pale.ts";
import type { Cssc } from "@fe-lib/color/alias.ts";
import { $CSS } from "@fe-lib/symbols.ts";
import { assert } from "@fe-lib/util.ts";
import { DENO, INOUT } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { Tdt, Tuof } from "../../alias.ts";
import { paleMock } from "../../util.ts";
import type { SetPazr } from "../SetPazr.ts";
import { FuzykeySeq } from "./FuzykeySeq.ts";
import { QuotkeySeq } from "./QuotkeySeq.ts";
import { SetSn } from "./SetSn.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Key extends SetSn {
  /* Pale */
  #cplTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.cplTd");
  #onCplTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#cplTd_pn, _x);
    }
  };

  observeTheme() {
    this.#cplTd_p.registCsscHandler(this.#onCplTdCssc);
  }
  unobserveTheme() {
    this.#cplTd_p.removeCsscHandler(this.#onCplTdCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  #children;
  override get children(): (FuzykeySeq | QuotkeySeq)[] {
    return this.#children;
  }

  //jjjj TOCLEANUP
  // override get known(): boolean {
  //   return this.#children[0].known && this.#children.at(-1)!.known;
  // }

  override get frstToken_1(): SetTk {
    return this.frstTk$ ??= this.children[0].frstToken_1;
  }
  override get lastToken_1(): SetTk {
    return this.lastTk$ ??= this.children.at(-1)!.lastToken_1;
  }

  readonly #cpl_hl_name = `${this.class_id}_cpl`;
  get #cpl_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[0] ??= new Highlight();
  }
  #clr_cpl_hl(): void {
    this.hl_a$?.at(0)?.clear();
  }

  readonly #cplTd_pn = `--${this.class_id}-cplTd`;
  readonly #cplTuo_pn = `--${this.class_id}-cplTuo`;

  private constructor(pazr_x: SetPazr, sns_x: (FuzykeySeq | QuotkeySeq)[]) {
    /*#static*/ if (INOUT) {
      assert(sns_x.length);
    }
    super(pazr_x);
    this.#children = sns_x;

    for (const sn of sns_x) sn.attachTo_$(this);

    /*#static*/ if (!DENO) {
      CSS.highlights.set(this.#cpl_hl_name, this.#cpl_hl);

      document.body.style.setProperty(this.#cplTd_pn, this.#cplTd_p.cssc);

      document[$CSS].insertRule(
        `::highlight(${this.#cpl_hl_name}) {
          text-decoration: var(${this.#cplTd_pn}) underline ${Tdt}em;
          text-underline-offset: var(${this.#cplTuo_pn});
        }`,
      );
    }
  }
  /**
   * @headconst @param pazr_x
   * @headconst @param sns_x
   */
  static create(pazr_x: SetPazr, sns_x: (FuzykeySeq | QuotkeySeq)[]) {
    const ret = new Key(pazr_x, sns_x);
    ret.observeTheme();
    return ret;
  }

  override destructor(): void {
    this.unobserveTheme();

    /*#static*/ if (!DENO) {
      document[$CSS].deleteSelector(
        `::highlight(${this.#cpl_hl_name})`,
      );

      document.body.style.removeProperty(this.#cplTd_pn);
      document.body.style.removeProperty(this.#cplTuo_pn);

      CSS.highlights.delete(this.#cpl_hl_name);
    }

    super.destructor();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override replaceChild(
    oldSn_x: FuzykeySeq | QuotkeySeq,
    newSn_x: FuzykeySeq | QuotkeySeq,
  ) {
    const c_a = this.children;
    const i_ = c_a.indexOf(oldSn_x);
    if (i_ >= 0) {
      newSn_x.attachTo_$(this);
      c_a.splice(i_, 1, newSn_x);
    }

    if (i_ === 0 || i_ === c_a.length - 1) this.invalBdry();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  protected override clrHighlight_impl$(): false {
    this.revERan();
    this.#clr_cpl_hl();
    return false;
  }

  protected override setHighlight_impl$(
    frstLidx_x: lnum_t,
    lastLidx_x: lnum_t,
    eranr_x: ERanr,
  ): boolean {
    this.#clr_cpl_hl();
    let highlighted = false;

    if (this.sntLastLidx_1 < frstLidx_x || lastLidx_x < this.sntFrstLidx_1) {
      this.revERan();
    } else {
      document.body.style.setProperty(
        this.#cplTuo_pn,
        `-${Math.max(1 + Tuof - this.depth_1 * Tuof, 0)}em`,
      );
      this.#cpl_hl.add(this.syncERan(eranr_x).syncRange());
      highlighted = true;
    }
    return highlighted;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override toString() {
    return `${this._info_} ( ${this.children.join(" ")})`;
  }

  override _repr_(): string[] {
    const ret = [this._info_];
    for (const sn of this.children) {
      ret.push(sn.toString());
    }
    return ret;
  }
}
/*80--------------------------------------------------------------------------*/
