/** 80**************************************************************************
 * @module lib/compiling/TLine
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { Dulstr, loff_t } from "../alias.ts";
import type { Chr } from "../alias_v.ts";
import "../jslang.ts";
import { assert } from "../util.ts";
import { Line } from "./Line.ts";
import type { TBufr } from "./TBufr.ts";
import type { LineData } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** @final */
export class TLine extends Line {
  declare readonly bufr: TBufr;

  override get prevLine() {
    return super.prevLine as TLine | undefined;
  }
  override get nextLine() {
    return super.nextLine as TLine | undefined;
  }

  #base_a: Chr[] = [];
  readonly text_a_$: (Chr | [Chr, ...Dulstr[]])[] = [];
  get chrLen() {
    return this.text_a_$.length;
  }
  #text: string | undefined;
  override get text() {
    this.#text ??= this.#base_a.join("");
    return this.#text;
  }

  /** @const @param bufr_x */
  protected constructor(bufr_x: TBufr) {
    super(bufr_x);
  }
  /**
   * @headconst @param bufr_x
   * @const @param text_x
   */
  static override create_$(
    bufr_x: TBufr,
    text_x?: string,
  ): { line: TLine; data: LineData } {
    return {
      line: new TLine(bufr_x).resetText_$(text_x),
      data: Array.sparse(6) as LineData,
    };
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  override resetText_$(text_x?: string): this {
    this.splice_$(0, this.chrLen, text_x);
    return this;
  }

  /** `in( !this.removed )` */
  // @traceOut(_TRACE)
  override splice_$(strt_x: loff_t, stop_x: loff_t, newt_x?: string) {
    // /*#static*/ if (_TRACE) {
    //   console.log([
    //     trace.indent,
    //     `>>>>>>> ${this._class_id_}.splice_$( ${strt_x}, ${stop_x}, `,
    //     newt_x === undefined ? "" : `"${newt_x}"`,
    //     " ) >>>>>>>",
    //   ].join(""));
    // }
    /*#static*/ if (INOUT) {
      assert(0 <= strt_x && strt_x <= this.chrLen);
    }
    if (strt_x >= stop_x && !newt_x) {
      return;
    }

    if (newt_x) {
      let i_ = 0;
      const LEN = Math.min(stop_x - strt_x, newt_x.length);
      while (i_ < LEN && newt_x[i_] === this.#base_a[strt_x]) {
        ++i_;
        ++strt_x;
      }
      let j_ = newt_x.length;
      while (
        j_ > 0 && stop_x > strt_x && newt_x[j_ - 1] === this.#base_a[stop_x - 1]
      ) {
        --j_;
        --stop_x;
      }
      if (i_ !== 0 || j_ !== newt_x.length) {
        newt_x = newt_x.slice(i_, j_);
      }
    }
    const chr_a = (newt_x ? [...newt_x] : []) as Chr[];
    if (strt_x < stop_x || chr_a.length) {
      this._splice_impl(strt_x, stop_x, chr_a);
      this.#text = undefined; //!
    }
  }

  /**
   * `in( !this.removed )`
   * @const @param strt_x
   * @const @param stop_x
   * @const @param chr_a_x
   */
  // @traceOut(_TRACE)
  private _splice_impl(strt_x: loff_t, stop_x: loff_t, chr_a_x: Chr[]): void {
    // /*#static*/ if (_TRACE) {
    //   console.log(
    //     `${trace.indent}>>>>>>> ${this._class_id_}._splice_impl(${strt_x}, ${stop_x}, [${chr_a_x}]) >>>>>>>`,
    //   );
    // }
    this.#base_a.splice(strt_x, stop_x - strt_x, ...chr_a_x);
    this.text_a_$.splice(strt_x, stop_x - strt_x, ...chr_a_x);
    const tlayr = this.bufr.tlvert;
    for (let i = strt_x, LEN = strt_x + chr_a_x.length; i < LEN; ++i) {
      const chr = this.#base_a[i];
      if (tlayr.treat(chr)) {
        const acc = new Set<Dulstr>();
        tlayr.dull([chr], acc);
        this.text_a_$[i] = [chr, ...acc];
      }
    }
    // console.log(this.#base_a);
    // console.log(this.text_a_$);
  }
}
/*80--------------------------------------------------------------------------*/
