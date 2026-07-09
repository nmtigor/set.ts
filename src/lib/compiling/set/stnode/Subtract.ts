/** 80**************************************************************************
 * @module lib/compiling/set/stnode/Subtract
 * @license MIT
 ******************************************************************************/

import type { ERanr } from "@fe-edt/ERan.ts";
import type { lnum_t } from "@fe-lib/alias.ts";
import type { Cssc } from "@fe-lib/color/alias.ts";
import { Pale } from "@fe-lib/color/Pale.ts";
import { $CSS } from "@fe-lib/symbols.ts";
import { DENO } from "@fe-src/preNs.ts";
import type { SetTk } from "../../Token.ts";
import { ErrMsg, paleMock } from "../../util.ts";
import { Oprec } from "../alias.ts";
import type { SetPazr } from "../SetPazr.ts";
import { BinaryOp } from "./BinaryOp.ts";
import type { Set } from "./Set.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class Subtract extends BinaryOp {
  /* Pale */
  #errTd_p = /*#static*/ DENO ? paleMock : Pale.get("cpl.set.errTd");
  #onErrTdCssc = (_x: Cssc) => {
    /*#static*/ if (!DENO) {
      document.body.style.setProperty(this.#errTd_pn, _x);
    }
  };

  override observeTheme() {
    super.observeTheme();
    this.#errTd_p.registCsscHandler(this.#onErrTdCssc);
  }
  override unobserveTheme() {
    super.unobserveTheme();
    this.#errTd_p.removeCsscHandler(this.#onErrTdCssc);
  }
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override readonly op = "\\";
  static override readonly oprec = Oprec.subtract;

  readonly #err_hl_name = `${this.class_id}_err`;
  get #err_hl(): Highlight {
    this.hl_a$ ??= [];
    return this.hl_a$[2] ??= new Highlight();
  }
  #clr_err_hl(): void {
    this.hl_a$?.at(2)?.clear();
  }

  readonly #errTd_pn = `--${this.class_id}-errTd`;

  private constructor(
    pazr_x: SetPazr,
    lhs_x: Set,
    opTk_x: SetTk,
    rhs_x: Set | undefined,
  ) {
    super(pazr_x, lhs_x, opTk_x);
    if (rhs_x) {
      rhs_x.attachTo_$(this);
      this.rhs$ = rhs_x;
    } else {
      this.setErr(ErrMsg.set_subtract_no_rhs);
    }

    /*#static*/ if (!DENO) {
      CSS.highlights.set(this.#err_hl_name, this.#err_hl);

      document.body.style.setProperty(this.#errTd_pn, this.#errTd_p.cssc);

      document[$CSS].insertRule(
        `::highlight(${this.#err_hl_name}) {
          text-decoration: var(${this.#errTd_pn}) wavy underline;
          text-underline-offset: .2em;
        }`,
      );
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
    const ret = new Subtract(pazr_x, lhs_x, opTk_x, rhs_x);
    ret.observeTheme();
    return ret;
  }

  override destructor(): void {
    this.unobserveTheme();

    /*#static*/ if (!DENO) {
      document[$CSS].deleteSelector(
        `::highlight(${this.#err_hl_name})`,
      );

      document.body.style.removeProperty(this.#errTd_pn);

      CSS.highlights.delete(this.#err_hl_name);
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

    this.#clr_err_hl();

    if (snHled && this.hasErrMsg(ErrMsg.set_subtract_no_rhs)) {
      this.#err_hl.add(this.range_$);
    }

    return snHled;
  }
}
/*80--------------------------------------------------------------------------*/
