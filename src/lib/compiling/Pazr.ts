/** 80**************************************************************************
 * @module lib/compiling/Pazr
 * @license MIT
 ******************************************************************************/

import type { id_t } from "../alias.ts";
import { assert, out } from "../util/trace.ts";
import type { BaseTok } from "./BaseTok.ts";
import type { Lexr } from "./Lexr.ts";
import type { Stnode } from "./Stnode.ts";
import { calcCommon, SortedStnod_depth, SortedStnod_id } from "./Stnode.ts";
import type { TokBufr } from "./TokBufr.ts";
import { type Token } from "./Token.ts";
import type { Tok } from "./alias.ts";
import type { PlainTok } from "./plain/PlainTok.ts";
/*80--------------------------------------------------------------------------*/

export abstract class Pazr<T extends Tok = BaseTok> {
  static #ID = 0 as id_t;
  readonly id = ++Pazr.#ID as id_t;
  /** @final */
  get _type_id() {
    return `${this.constructor.name}_${this.id}`;
  }

  protected bufr$!: TokBufr<T>;
  get bufr() {
    return this.bufr$;
  }

  /* lexr$ */
  protected lexr$!: Lexr<T>;
  get lexr() {
    return this.lexr$;
  }

  #headBdryClrTk: Token<T> | undefined;
  #tailBdryClrTk: Token<T> | undefined;
  /* ~ */

  protected root$: Stnode<T> | undefined;
  get root() {
    return this.root$;
  }

  drtSn_$: Stnode<T> | undefined;
  get drtSn() {
    return this.drtSn_$;
  }
  /**
   * Last (finally) parsed `Stnode`
   */
  newSn_$: Stnode<T> | undefined;
  get newSn() {
    return this.newSn_$;
  }

  /* errSn_sa$ */
  protected readonly errSn_sa$ = new SortedStnod_id<T>();
  get hasErr() {
    return this.errSn_sa$.length;
  }
  get _err() {
    const ret: [string, string[]][] = [];
    for (const sn of this.errSn_sa$) {
      ret.push([sn._info, sn._err]);
    }
    return ret;
  }
  /* ~ */

  protected readonly unrelSn_sa$ = new SortedStnod_id<T>();
  get _unrelSn_sa() {
    return this.unrelSn_sa$;
  }

  strtToken$!: Token<T>;
  // get _curtk() { return this.strtToken$; }
  stopToken$!: Token<T>;

  /**
   * @headconst @param bufr_x
   * @headconst @param lexr_x
   */
  constructor(bufr_x: TokBufr<T>, lexr_x: Lexr<T>) {
    this.reset$(bufr_x, lexr_x);
  }

  /**
   * @final
   * @headconst @param bufr_x
   * @headconst @param lexr_x
   */
  protected reset$(bufr_x: TokBufr<T>, lexr_x: Lexr<T>): this {
    this.bufr$ = bufr_x;
    this.lexr$ = lexr_x;
    this.#headBdryClrTk = undefined;
    this.#tailBdryClrTk = undefined;

    this.root$ = undefined;
    this.drtSn_$ = undefined;
    this.newSn_$ = undefined;

    this.errSn_sa$.reset();
    this.unrelSn_sa$.reset();

    this.strtToken$ = this.lexr$.frstToken;
    this.stopToken$ = this.lexr$.lastToken;
    return this;
  }

  /**
   * @headconst @param bufr_x
   * @headconst @param lexr_x
   */
  reset(bufr_x?: TokBufr<T>, lexr_x?: Lexr<T>): this {
    return this.reset$(bufr_x ?? this.bufr$, lexr_x ?? this.lexr$);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Assign `strtToken$`, `stopToken$`
   */
  protected setPazRegion$(ret_x?: Stnode<T>) {
    if (ret_x && !ret_x.isRoot) {
      this.strtToken$ = ret_x.frstToken.prevToken_$!;
      this.stopToken$ = ret_x.lastToken.nextToken_$!;
      return ret_x;
    } else {
      this.strtToken$ = this.lexr$.frstToken;
      this.stopToken$ = this.lexr$.lastToken;
      return undefined;
    }
  }

  /** Helper */
  #tmpSn_sa = new SortedStnod_id<T>();
  /**
   * Invalidate "(strtToken$, stopToken$).stnod_$" (if any) and their parents up to
   * `drtSn_$` (excluded)\
   * Use `#tmpSn_sa`
   */
  protected invalidateBdries$(): void {
    this.#tmpSn_sa.reset();

    const VALVE = 1_000;
    let valve = VALVE;
    const invalidateUp = (sn_y: Stnode<T> | undefined) => {
      while (sn_y && sn_y !== this.drtSn_$ && --valve) {
        if (this.#tmpSn_sa.includes(sn_y)) break;

        sn_y.invalidateBdry();
        this.#tmpSn_sa.add(sn_y);
        sn_y = sn_y.parent;
      }
      assert(valve, `Loop ${VALVE}±1 times`);
    };
    let tk_ = this.strtToken$.nextToken_$;
    do {
      if (!tk_ || tk_ === this.stopToken$) break;

      invalidateUp(tk_.stnod_$);
      tk_ = tk_.nextToken_$;
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);

    this.#tmpSn_sa.reset();
  }

  /**
   * Assign `drtSn_$`, `strtToken$`, `stopToken$`\
   * Reset `errSn_sa$`
   */
  @out((_, self: Pazr<T>) => {
    assert(self.strtToken$.posS(self.stopToken$));
    if (self.drtSn_$) {
      assert(!self.drtSn_$.isRoot && !self.drtSn_$.isErr);
      assert(self.strtToken$ === self.drtSn_$.frstToken.prevToken_$);
      assert(self.stopToken$ === self.drtSn_$.lastToken.nextToken_$);
    } else {
      assert(self.strtToken$ === self.lexr$.frstToken);
      assert(self.stopToken$ === self.lexr$.lastToken);
    }
  })
  markPazRegion_$() {
    this.#headBdryClrTk = this.lexr$.strtToken_$;
    this.#tailBdryClrTk = this.lexr$.stopToken_$;
    this.newSn_$ = undefined; //!
    this.unrelSn_sa$.reset();
    const unrelSn_a: Stnode<T>[] = [];

    const VALVE = 10_000;
    let valve = VALVE;

    /* find boundary token backward */
    let clrTk_0: Token<T> | undefined = this.#headBdryClrTk;
    while (!clrTk_0.stnod_$ && (clrTk_0 = clrTk_0.prevToken_$) && --valve);
    assert(valve, `Loop ${VALVE}±1 times`);

    if (clrTk_0?.stnod_$!.lastToken.posSE(this.#headBdryClrTk)) {
      let sn_: Stnode<T> | undefined = clrTk_0.stnod_$!;
      let sn_1: Stnode<T> | undefined;
      do {
        if (sn_.filterTo(unrelSn_a, sn_1)) break;
        sn_1 = sn_;
      } while (
        (sn_ = sn_.parent_$) && sn_.lastToken.posSE(this.#headBdryClrTk) &&
        --valve
      );
    }

    /* find boundary token forward */
    let clrTk_1: Token<T> | undefined = this.#tailBdryClrTk;
    while (!clrTk_1.stnod_$ && (clrTk_1 = clrTk_1.nextToken_$) && --valve);
    assert(valve, `Loop ${VALVE}±1 times`);

    if (clrTk_1?.stnod_$!.frstToken.posGE(this.#tailBdryClrTk)) {
      let sn_: Stnode<T> | undefined = clrTk_1.stnod_$!;
      let sn_1: Stnode<T> | undefined;
      do {
        if (sn_.filterTo(unrelSn_a, sn_1)) break;
        sn_1 = sn_;
      } while (
        (sn_ = sn_.parent_$) && sn_.frstToken.posGE(this.#tailBdryClrTk) &&
        --valve
      );
    }

    if (!clrTk_0 || !clrTk_1) { // 1915
      if (clrTk_0) {
        let sn_: Stnode<T> | undefined = clrTk_0.stnod_$!;
        while ((sn_ = sn_.prevStnod) && --valve) sn_.filterTo(unrelSn_a);
        assert(valve, `Loop ${VALVE}±1 times`);
      }
      if (clrTk_1) {
        let sn_: Stnode<T> | undefined = clrTk_1.stnod_$!;
        while ((sn_ = sn_.nextStnod) && --valve) sn_.filterTo(unrelSn_a);
        assert(valve, `Loop ${VALVE}±1 times`);
      }
      this.unrelSn_sa$.add_O(unrelSn_a);
      this.drtSn_$ = this.setPazRegion$();
    } else { // 1916
      const sn_sa = new SortedStnod_depth([clrTk_0.stnod_$!, clrTk_1.stnod_$!]);
      let tk_: Token<T> | undefined = clrTk_0;
      while ((tk_ = tk_.nextToken_$) && tk_ !== clrTk_1 && --valve) {
        if (tk_.stnod_$) sn_sa.push(tk_.stnod_$);
      }
      assert(valve, `Loop ${VALVE}±1 times`);
      for (const sn of this.errSn_sa$) sn_sa.push(sn);
      this.drtSn_$ = this.setPazRegion$(
        calcCommon(sn_sa, { unrelSn_sa: this.unrelSn_sa$, unrelSn_a }),
      );
    }

    this.errSn_sa$.reset();
    this.lexr$.saveRanvalBack_$(this.#headBdryClrTk, this.strtToken$);
    this.lexr$.saveRanvalForw_$(this.#tailBdryClrTk, this.stopToken$);
    this.invalidateBdries$();
    return this;
  }

  /**
   * `in( this.strtToken$ && this.stopToken$ )`
   * @final
   */
  reachRigtBdry(): boolean {
    return this.strtToken$.posGE(this.stopToken$!);
  }
  /**
   * `in( this.strtToken$ && this.stopToken$ )`
   * @final
   */
  overRigtBdry(): boolean {
    return this.strtToken$.posG(this.stopToken$!);
  }

  /** @final */
  @out((_, self: Pazr<T>) => {
    assert(self.strtToken$ === self.stopToken$);
  })
  paz() {
    this.strtToken$ = this.strtToken$.nextToken_$!;
    if (this.reachRigtBdry()) {
      this.newSn_$ = undefined;
    } else {
      //kkkk TOCLEANUP
      // if( this.drtSn_$ ) this.adjustPazRegionBy( this.drtSn_$ );
      this.paz_impl$();
    }
  }

  /**
   * `in( this.strtToken$ && this.stopToken$ && !this.reachRigtBdry() )`
   */
  protected abstract paz_impl$(): void;

  //kkkk TOCLEANUP
  // /**
  //  * Adjust `strtToken$`, `stopToken$` by `sn_x`\
  //  * `in( this.strtToken$ && this.stopToken$ )`
  //  * @final
  //  * @headconst @param sn_x
  //  */
  // adjustPazRegionBy(sn_x: Stnode<T>) {
  //   this.strtToken$ = sn_x.frstToken;

  //   const stopTk = sn_x.lastToken.nextToken_$;
  //   // if( !this.stopToken$ ) this.stopToken$ = stopTk;
  //   if (stopTk && stopTk.posG(this.stopToken$!)) this.stopToken$ = stopTk;
  //   // if( !this.stopToken$ ) this.stopToken$ = this.lexr$.lastToken_1;
  //   /*#static*/ if (INOUT) {
  //     assert(this.strtToken$.posS(this.stopToken$!));
  //   }
  // }
}
/*80--------------------------------------------------------------------------*/

export class DoNothingPazr<T extends Tok = BaseTok> extends Pazr<T> {
  /** @implement */
  protected paz_impl$() {
    this.strtToken$ = this.stopToken$;
  }
}

/** @final */
export class PlainPazr extends DoNothingPazr<PlainTok> {}
/*80--------------------------------------------------------------------------*/
