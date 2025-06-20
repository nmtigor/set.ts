/** 80**************************************************************************
 * @module lib/compiling/Token
 * @license MIT
 ******************************************************************************/

import { DEV, INOUT, PRF } from "../../global.ts";
import type { lnum_t, loff_t, TupleOf, uint } from "../alias.ts";
import { zUint } from "../alias.ts";
import { g_count } from "../util/performance.ts";
import { assert, out } from "../util/trace.ts";
import { BaseTok } from "./BaseTok.ts";
import type { LexdInfo } from "./Lexr.ts";
import { Lexr } from "./Lexr.ts";
import type { Loc } from "./Loc.ts";
import { Ranval } from "./Ranval.ts";
import { type _OldInfo_, Snt } from "./Snt.ts";
import { Stnode } from "./Stnode.ts";
import type { TokLine } from "./TokLine.ts";
import type { TokRan } from "./TokRan.ts";
import type { Tok } from "./alias.ts";
import { JSLangTok } from "./jslang/JSLangTok.ts";
import { MdextTok } from "./mdext/MdextTok.ts";
import { PDFTok } from "./pdf/PDFTok.ts";
import { PlainTok } from "./plain/PlainTok.ts";
import { RMLTok } from "./rml/RMLTok.ts";
import { SetTok } from "./set/SetTok.ts";
import { URITok } from "./uri/URITok.ts";
import { HTMLTok } from "./html/HTMLTok.ts";
/*80--------------------------------------------------------------------------*/

type NErr_ = 2;
const NErr_ = 2;

/** @final */
export class Token<T extends Tok = BaseTok> extends Snt {
  readonly lexr_$: Lexr<T>;

  /* #oldRanval */
  #oldRanval: Ranval | undefined;
  get oldRanval(): Ranval | undefined {
    return this.#oldRanval;
  }

  //jjjj TOCLEANUP
  // bakeRanval_$() {
  //   this.syncRanval();
  // }

  saveRanval_$() {
    //jjjj TOCLEANUP
    // this.syncRanval();

    this.#oldRanval ??= new Ranval(0 as lnum_t, 0);
    this.#oldRanval.become_Array(this.ran_$.ranval);
  }
  /* ~ */

  /* ran_$ */
  readonly ran_$: TokRan<T>;

  syncRanvalAnchr(): this {
    this.ran_$.syncRanvalAnchr_$();
    return this;
  }
  syncRanvalFocus(): this {
    this.ran_$.syncRanvalFocus_$();
    return this;
  }
  syncRanval(): this {
    this.ran_$.syncRanval_$();
    return this;
  }

  /* 2 "strt" */
  /**
   * ! Do not use `sntStrtLoc.become()`. Use `setStrt()` instead.
   * @implement
   */
  get sntStrtLoc() {
    return this.ran_$.strtLoc;
  }
  /**
   * @const @param loc_x
   * @const @param tok_x
   */
  setStrt(loc_x: Loc, tok_x?: T): this {
    this.sntStrtLoc.become_Loc(loc_x);
    if (tok_x) this.value = tok_x;
    return this.syncRanvalAnchr();
  }
  /** @implement */
  get sntFrstLine() {
    return this.ran_$.frstLine;
  }
  /** @implement */
  get sntFrstLidx_1(): lnum_t {
    return this.sntFrstLine.lidx_1;
  }
  /** @implement */
  get sntStrtLoff(): loff_t {
    return this.ran_$.strtLoff;
  }
  /* 2 ~ */

  /* 2 "stop" */
  /**
   * ! Do not use `sntStopLoc.become()`. Use `setStop()` instead.
   * @implement
   */
  get sntStopLoc() {
    return this.ran_$.stopLoc;
  }
  /**
   * @const @param loc_x
   * @const @param tok_x
   */
  setStop(loc_x: Loc, tok_x?: T): this {
    this.sntStopLoc.become_Loc(loc_x);
    if (tok_x) this.value = tok_x;
    return this.syncRanvalFocus();
  }
  /** @implement */
  get sntLastLine() {
    return this.ran_$.lastLine;
  }
  /** @implement */
  get sntLastLidx_1(): lnum_t {
    return this.sntLastLine.lidx_1;
  }
  /** @implement */
  get sntStopLoff(): loff_t {
    return this.ran_$.stopLoff;
  }
  /* 2 ~ */

  /** @const */
  get empty(): boolean {
    return this.ran_$.collapsed;
  }

  get length_1(): loff_t {
    return this.ran_$.length_1;
  }

  get lineN_1(): lnum_t {
    return this.ran_$.lineN_1;
  }

  /**
   * @primaryconst
   * @primaryconst @param loc_x
   */
  contain(loc_x: Loc): boolean {
    return this.ran_$.contain(loc_x);
  }
  /** @see {@linkcode contain()} */
  touch(loc_x: Loc): boolean {
    return this.ran_$.touch(loc_x);
  }

  /** @const */
  getTexta(): string[] {
    return this.ran_$.getTexta();
  }
  /** @const */
  getText(): string {
    return this.ran_$.getText();
  }
  /* ~ */

  #value!: T;
  get value() {
    return this.#value;
  }
  set value(_x: T) {
    this.#value = _x;
    /*#static*/ if (DEV) {
      (this as any)._valvename_ = _x <= BaseTok._max
        ? BaseTok[_x]
        : _x <= PlainTok._max
        ? PlainTok[_x]
        : _x <= SetTok._max
        ? SetTok[_x]
        : _x <= URITok._max
        ? URITok[_x]
        : _x <= MdextTok._max
        ? MdextTok[_x]
        : _x <= PDFTok._max
        ? MdextTok[_x]
        : _x <= PDFTok._max
        ? PDFTok[_x]
        : _x <= RMLTok._max
        ? RMLTok[_x]
        : _x <= JSLangTok._max
        ? JSLangTok[_x]
        : _x <= HTMLTok._max
        ? HTMLTok[_x]
        : "unknown";
    }
  }
  lexdInfo: LexdInfo | null = null;

  /* #errMsg_a */
  readonly #errMsg_a = new Array(NErr_).fill("") as TupleOf<string, NErr_>;
  get _err_() {
    return this.#errMsg_a.filter(Boolean);
  }
  get isErr() {
    return !!this.#errMsg_a[0];
  }

  /**
   * @const @param errMsg_x
   */
  setErr(errMsg_x: string): this {
    for (let i = 0; i < NErr_; ++i) {
      if (!this.#errMsg_a[i]) {
        this.#errMsg_a[i] = errMsg_x;
        break;
      }
    }
    return this;
  }

  clrErr(): this {
    this.#errMsg_a.fill("");
    return this;
  }
  /* ~ */

  prevToken_$: Token<T> | undefined;
  get prevToken() {
    return this.prevToken_$;
  }
  nextToken_$: Token<T> | undefined;
  get nextToken() {
    return this.nextToken_$;
  }
  // linked_ = false;

  isConcatedTo(next_x: Token<T>): boolean {
    return this.nextToken_$ === next_x && next_x.prevToken_$ === this;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * `this` is a DIRECT boundary token of `stnod_$`.
   */
  stnod_$: Stnode<T> | undefined;

  /**
   * @headconst @param lexr_x
   * @headconst @param ran_x [COPIED]
   * @const @param value_x
   */
  constructor(lexr_x: Lexr<T>, ran_x: TokRan<T>, value_x?: T) {
    super();
    this.lexr_$ = lexr_x;
    /* `syncRanval_$()` after `this` is scanned or adjusted */
    // ran_x.syncRanval_$();
    this.ran_$ = ran_x;
    this.value = value_x ? value_x : BaseTok.unknown as T;

    /*#static*/ if (PRF) {
      g_count.newToken += 1;
    }
  }

  /**
   * `lexr_$` is shared, `ran_$` is `dup()`ed, `#value` is copied. Other fields
   * are not influenced by `this`.
   * @const
   */
  dup_Token() {
    return new Token(this.lexr_$, this.ran_$.dup(), this.#value);
  }

  // /**
  //  * Move fields from `tk_x` EXCEPT `prevToken_$`, `nextToken_$`, `lexr_$`
  //  * ! MUST NOT keep using `tk_x` after `become()`
  //  */
  // becomeToken(tk_x: Token<T>): this {
  //   /*#static*/ if (INOUT) {
  //     assert(this.lexr_$ === tk_x.lexr_$);
  //   }
  //   this.ran_$.becomeRan(tk_x.ran_$);

  //   this.value = tk_x.value;
  //   this.lexdInfo = tk_x.lexdInfo;

  //   this.#oldRanval = tk_x.#oldRanval;
  //   this.#errMsg_a.become(tk_x.#errMsg_a);
  //   this.stnod_$ = tk_x.stnod_$;
  //   return this;
  // }

  /**
   * @param value_x
   * @const @param strtLoc_x
   * @const @param stopLoc_x
   */
  reset_Token(value_x: T, strtLoc_x?: Loc, stopLoc_x?: Loc): this {
    if (strtLoc_x) this.setStrt(strtLoc_x);
    if (stopLoc_x) this.setStop(stopLoc_x);
    this.value = value_x;
    if (this.isErr) this.clrErr();
    /* `pazmrk_$()` needs `stnod_$` of Token in dirty region. */
    // this.stnod_$ = undefined;
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @primaryconst
   * @primaryconst @param rhs_x
   */
  posS(rhs_x: Token<T>): boolean {
    return this.ran_$.posS(rhs_x.ran_$);
  }
  /** @see {@linkcode posS()} */
  posGE(rhs_x: Token<T>): boolean {
    return !this.posS(rhs_x);
  }
  /** @see {@linkcode posS()} */
  posSE(rhs_x: Token<T>): boolean {
    return this.posS(rhs_x) || this.posE(rhs_x);
  }
  /** @see {@linkcode posS()} */
  posG(rhs_x: Token<T>): boolean {
    return !this.posSE(rhs_x);
  }
  /**
   * @const
   * @const @param rhs_x
   */
  posE(rhs_x: Token<T>): boolean {
    return this.ran_$.posE(rhs_x.ran_$);
  }

  // /**
  //  * @param { Token<T> } ret_x
  //  * @return { Token<T> }
  //  */
  // forwExtend( ret_x )
  // {
  //   if( this.posGE(ret_x) ) ret_x = this;
  //   return ret_x;
  // }
  // backExtend( ret_x )
  // {
  //   if( this.posSE(ret_x) ) ret_x = this;
  //   return ret_x;
  // }

  /**
   * @deprecated
   * @headconst @param rhs
   */
  assert_eq(rhs?: Token<T>) {
    if (this === rhs) return;

    assert(rhs);
    assert(this.lexr_$ === rhs!.lexr_$);
    assert(this.ran_$.posE(rhs!.ran_$));
    assert(this.value === rhs!.value);
  }

  // _dup(): Token<T> {
  //   return new Token(this.lexr_$, this.ran_$.dup(), this.value);
  // }

  /**
   * @deprecated use `toString()` to compare
   * @headconst @param rhs
   */
  _test_eq(rhs?: Token<T>) {
    if (this === rhs) return this;

    console.assert(rhs as any);
    console.assert(this.lexr_$ === rhs!.lexr_$);
    console.assert(this.ran_$.posE(rhs!.ran_$));
    console.assert(this.value === rhs!.value);
    // if( rhs.stnode !== undefined )
    //   console.assert( this.stnode === rhs.stnode );
    // console.log(this.stnode);
    // console.log(rhs.stnode);
    return this;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  // get prevtoken1() { assert(this.prevToken_$); return this.prevToken_$; }
  // get nexttoken1() { assert(this.nextToken_$); return this.nextToken_$; }

  // notAsLinebdry_()
  // {
  //   const strtLine = this.strtLine;
  //   if( strtLine.isFrstToken_$(this) ) strtLine.delFrstTokenBy_$(this.lexr_$);
  //   if( strtLine.isLastToken_$(this) ) strtLine.delLastTokenBy_$(this.lexr_$);
  //   const stopLine = this.stopLine;
  //   if( stopLine.isFrstToken_$(this) ) stopLine.delFrstTokenBy_$(this.lexr_$);
  //   if( stopLine.isLastToken_$(this) ) stopLine.delLastTokenBy_$(this.lexr_$);
  // }

  // correct_line_strt_stop_token_()
  // {
  //   const strtLine = this.strtLine;
  //   const stopLine = this.stopLine;
  //   let tk00 = strtLine.strtToken(this.lexr_$);
  //   let tk01 = strtLine.stopToken_$(this.lexr_$);
  //   let tk10 = stopLine.strtToken(this.lexr_$);
  //   let tk11 = stopLine.stopToken_$(this.lexr_$);

  //   if( this.hasErr )
  //   {
  //     if( tk00 === this ) strtLine.delFrstTokenBy_$(this.lexr_$);
  //     if( tk01 === this ) strtLine.delLastTokenBy_$(this.lexr_$);
  //     if( tk10 === this ) stopLine.delFrstTokenBy_$(this.lexr_$);
  //     if( tk11 === this ) stopLine.delLastTokenBy_$(this.lexr_$);
  //   }
  //   else {
  //     if( this.prevToken_$ && this.prevToken_$.strtLine !== strtLine
  //      || !this.prevToken_$ && this.value === Tok.strtBdry
  //     ) {
  //       strtLine.setFrstToken_$( this );
  //       tk00 = this;
  //     }
  //     else if( strtLine.isFrstToken_$(this) )
  //     {
  //       strtLine.delFrstTokenBy_$( this.lexr_$ );
  //       tk00 = null;
  //     }

  //     if( this.nextToken_$ && this.nextToken_$.stopLine !== stopLine
  //      || !this.nextToken_$ && this.value === Tok.stopBdry
  //     ) {
  //       stopLine.setLastToken_$( this );
  //       tk11 = this;
  //     }
  //     else if( stopLine.isLastToken_$(this) )
  //     {
  //       stopLine.delLastTokenBy_$( this.lexr_$ );
  //       tk11 = null;
  //     }

  //     if( strtLine !== stopLine )
  //     {
  //       if( this.nextToken_$
  //        && (this.nextToken_$ !== tk10 ||
  //            this.nextToken_$.strtLine !== stopLine)
  //       ) {
  //         stopLine.delFrstTokenBy_$( this.lexr_$ );
  //         tk10 = null;
  //       }
  //       if( this.prevToken_$
  //        && (this.prevToken_$ !== tk01 ||
  //            this.prevToken_$.stopLine !== strtLine)
  //       ) {
  //         strtLine.delLastTokenBy_$( this.lexr_$ );
  //         tk01 = null;
  //       }
  //     }
  //   }

  //   if( tk00 && !tk00.linked_ )
  //   {
  //     strtLine.delFrstTokenBy_$(this.lexr_$);
  //     tk00 = null;
  //   }
  //   if( tk01 && !tk01.linked_ )
  //   {
  //     strtLine.delLastTokenBy_$(this.lexr_$);
  //     tk01 = null;
  //   }
  //   if( tk10 && !tk10.linked_ )
  //   {
  //     stopLine.delFrstTokenBy_$(this.lexr_$);
  //     tk10 = null;
  //   }
  //   if( tk11 && !tk11.linked_ )
  //   {
  //     stopLine.delLastTokenBy_$(this.lexr_$);
  //     tk11 = null;
  //   }

  //   let valve = 1000+1;
  //   if( !tk11 )
  //   {
  //     let tk = this;
  //     while( --valve
  //         && tk.nextToken_$
  //         && tk.nextToken_$.stopLine === stopLine
  //     ) {
  //       tk = tk.nextToken_$;
  //     }
  //     assert(valve);
  //     if( !tk.hasErr ) stopLine.setLastToken_$( tk );
  //   }
  //   if( !tk00 )
  //   {
  //     let tk = this;
  //     while( --valve
  //         && tk.prevToken_$
  //         && tk.prevToken_$.strtLine === strtLine
  //     ) {
  //       tk = tk.prevToken_$;
  //     }
  //     assert(valve);
  //     if( !tk.hasErr ) strtLine.setFrstToken_$( tk );
  //   }
  //   // if( !stopLine.nextLine && stopLine.hasStop_$(this.lexr_$) )
  //   // {
  //   //   let tk = stopLine.stopToken_$(this.lexr_$);
  //   //   if( tk.value !== Tok.stopBdry )
  //   //   {
  //   //     while( tk.nextToken_$  && --valve ) tk = tk.nextToken_$;
  //   //     assert(valve);
  //   //     if(tk.value!==Tok.stopBdry)console.log(tk.value);
  //   //     assert( tk.value === Tok.stopBdry );
  //   //   }
  //   // }
  //   // if( !strtLine.prevLine && strtLine.hasStrt_$(this.lexr_$) )
  //   // {
  //   //   let tk = strtLine.strtToken(this.lexr_$);
  //   //   if( tk.value !== Tok.strtBdry )
  //   //   {
  //   //     while( tk.prevToken_$  && --valve ) tk = tk.prevToken_$;
  //   //     assert(valve);
  //   //     if(tk.value!==Tok.strtBdry)console.log(tk.value);
  //   //     assert( tk.value === Tok.strtBdry );
  //   //   }
  //   // }
  // }
  /** Correct `frstLine.#frstToken_m` */
  #correct_line_frstToken(): TokLine<T> {
    const retLn = this.sntFrstLine;
    retLn.delFrstTokenBy_$(this.lexr_$);

    let tk_: Token<T> = this;
    const VALVE = 1_000;
    let valve = VALVE;
    while (tk_.prevToken_$?.sntFrstLine === retLn && --valve) {
      tk_ = tk_.prevToken_$;
    }
    assert(valve, `Loop ${VALVE}±1 times`);
    if (!tk_.isErr) retLn.setFrstToken_$(tk_);
    return retLn;
  }
  /** Correct `lastLine.#lastToken_m` */
  #correct_line_lastToken(): TokLine<T> {
    const retLn = this.sntLastLine;
    retLn.delLastTokenBy_$(this.lexr_$);

    let tk_: Token<T> = this;
    const VALVE = 1_000;
    let valve = VALVE;
    while (tk_.nextToken_$?.sntLastLine === retLn && --valve) {
      tk_ = tk_.nextToken_$;
    }
    assert(valve, `Loop ${VALVE}±1 times`);
    if (!tk_.isErr) retLn.setLastToken_$(tk_);
    return retLn;
  }

  /** @return unlinked `Token<T>` */
  #unlinkPrev() {
    const prevTk = this.prevToken_$;
    if (prevTk) {
      this.prevToken_$ = undefined;
      if (prevTk.nextToken_$ === this) prevTk.nextToken_$ = undefined;
      // prevTk.notAsLinebdry_();
      // prevTk.linked_ = false;
      //jjjj TOCLEANUP
      // if (prevTk !== stndKept_tk_x) prevTk.stnod_$ = undefined;
    }
    return prevTk;
  }
  /** @return unlinked `Token<T>` */
  #unlinkNext() {
    const nextTk = this.nextToken_$;
    if (nextTk) {
      this.nextToken_$ = undefined;
      if (nextTk.prevToken_$ === this) nextTk.prevToken_$ = undefined;
      // nextTk.notAsLinebdry_();
      // nextTk.linked_ = false;
      //jjjj TOCLEANUP
      // if (nextTk !== stndKept_tk_x) nextTk.stnod_$ = undefined;
    }
    return nextTk;
  }

  /**
   * !`retTk_x.prevToken_$` will be untouched. (cf. {@linkcode insertPrev()})\
   * `stnod_$`s do not change.
   * @headconst @param retTk_x
   */
  @out((self: Token<T>, _, args) => {
    assert(args[0] === self.prevToken_$);
    assert(args[0].nextToken_$ === self);
    // assert( args[0].linked_ && self.linked_ );
  })
  linkPrev(retTk_x: Token<T>): Token<T> {
    /*#static*/ if (INOUT) {
      assert(retTk_x !== this);
      assert(retTk_x.posS(this));
    }
    if (this.prevToken_$ !== retTk_x) {
      retTk_x.#unlinkNext();
      retTk_x.nextToken_$ = this;
      this.#unlinkPrev();
      this.prevToken_$ = retTk_x;
      // this.linked_ = true;
      // retTk_x.linked_ = true;
    }

    //jjjj TOCLEANUP
    // if (retTk_x !== stndKept_tk_x) retTk_x.stnod_$ = undefined;

    const frstLn = retTk_x.#correct_line_frstToken();
    const lastLn = retTk_x.#correct_line_lastToken();
    if (this.sntFrstLine !== frstLn) this.#correct_line_frstToken();
    if (this.sntLastLine !== lastLn) this.#correct_line_lastToken();

    return retTk_x;
  }
  /**
   * ! `retTk_x.nextToken_$` will be untouched. (cf. {@linkcode insertNext()})
   * `stnod_$`s do not change.
   * @headconst @param retTk_x
   */
  @out((self: Token<T>, _, args) => {
    assert(args[0] === self.nextToken_$);
    assert(args[0].prevToken_$ === self);
    // assert( args[0].linked_ && self.linked_ );
  })
  linkNext(retTk_x: Token<T>): Token<T> {
    /*#static*/ if (INOUT) {
      assert(retTk_x !== this);
      assert(this.posS(retTk_x));
    }
    if (this.nextToken_$ !== retTk_x) {
      retTk_x.#unlinkPrev();
      retTk_x.prevToken_$ = this;
      this.#unlinkNext();
      this.nextToken_$ = retTk_x;
      // this.linked_ = true;
      // retTk_x.linked_ = true;
    }

    //jjjj TOCLEANUP
    // if (retTk_x !== stndKept_tk_x) retTk_x.stnod_$ = undefined;

    const frstLn = retTk_x.#correct_line_frstToken();
    const lastLn = retTk_x.#correct_line_lastToken();
    if (this.sntFrstLine !== frstLn) this.#correct_line_frstToken();
    if (this.sntLastLine !== lastLn) this.#correct_line_lastToken();

    return retTk_x;
  }

  removeSelf(ret_x: "prev" | "next" = "next"): Token<T> | undefined {
    const prev = this.prevToken_$;
    const next = this.nextToken_$;
    if (prev) {
      prev.#unlinkNext();
      prev.nextToken_$ = next;
    }
    if (next) {
      next.#unlinkPrev();
      next.prevToken_$ = prev;
    }

    let frstLn, lastLn;
    if (prev) {
      frstLn = prev.#correct_line_frstToken();
      lastLn = prev.#correct_line_lastToken();
    }
    if (next) {
      if (next.sntFrstLine != frstLn) next.#correct_line_frstToken();
      if (next.sntLastLine != lastLn) next.#correct_line_lastToken();
    }

    return ret_x === "prev" ? prev : ret_x === "next" ? next : undefined;
  }

  /**
   * `stnod_$`s do not change.
   * @headconst @param retTk_x
   */
  insertPrev(retTk_x: Token<T>) {
    /*#static*/ if (INOUT) {
      assert(retTk_x !== this);
      assert(retTk_x.posS(this));
    }
    if (this.prevToken_$) {
      this.prevToken_$.nextToken_$ = retTk_x;
      retTk_x.#unlinkPrev();
      retTk_x.prevToken_$ = this.prevToken_$;
    } else {
      retTk_x.#unlinkPrev();
    }
    return this.linkPrev(retTk_x);
  }
  /** @see {@linkcode insertPrev()} */
  insertNext(retTk_x: Token<T>) {
    /*#static*/ if (INOUT) {
      assert(retTk_x !== this);
      assert(this.posS(retTk_x));
    }
    if (this.nextToken_$) {
      this.nextToken_$.prevToken_$ = retTk_x;
      retTk_x.#unlinkNext();
      retTk_x.nextToken_$ = this.nextToken_$;
    } else {
      retTk_x.#unlinkNext();
    }
    return this.linkNext(retTk_x);
  }

  // /**
  //  * @return { Stnode<T> } - return validated stnode
  //  */
  // validateAstnode()
  // {
  //   if( this.stnode )
  //   {
  //     if( !this.stnode.directBdryBy$_(this) )
  //       this.stnode = null;
  //   }
  //   return this.stnode;
  // }

  // /**
  //  * @headconst @param { Token<T> } stndKept_tk_x
  //  */
  // nextToken_paz( stndKept_tk_x = null )
  // {
  //   const tk = this.nextToken_$;
  //   if( tk && tk !== stndKept_tk_x ) tk.stnode = null;
  //   return tk;
  // }
  // get nextToken_paz() {
  //   this.stnod_$ = undefined;
  //   return this.nextToken_$;
  // }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Non-undefined if `this` is one of tokens as env for next-level-compiling\
   * `strtBdry` aligns with the start of first such token.
   */
  strtBdry?: Token<BaseTok.strtBdry>;
  /**
   * Non-undefined if `this` is one of tokens as env for next-level-compiling\
   * `stopBdry` aligns with the stop of last such token.
   */
  stopBdry?: Token<BaseTok.stopBdry>;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  get _name_(): string {
    return BaseTok[this.value] ??
      PlainTok[this.value] ??
      SetTok[this.value] ??
      URITok[this.value] ??
      MdextTok[this.value] ??
      PDFTok[this.value] ??
      RMLTok[this.value] ??
      JSLangTok[this.value] ??
      HTMLTok[this.value] ?? "unknown";
  }

  override toString() {
    return `${this._name_}${this.ran_$}${this.lexdInfo ? this.lexdInfo : ""}`;
  }

  override get _oldInfo_(): _OldInfo_ {
    const rv_ = this.#oldRanval ?? this.ran_$.toRanval();
    return {
      sort: [rv_.anchrLidx, rv_.anchrLoff],
      info: `${this._name_}${this.#oldRanval ? "" : "*"}${rv_}`,
    };
  }

  /**
   * @deprecated
   * @const @param rhs_x
   */
  _toString_eq(rhs_x: string) {
    console.assert(this.toString() === rhs_x);
    return this;
  }

  _Repr_(prevN_x?: uint, nextN_x?: uint): [string[], string, string[]] {
    /*#static*/ if (INOUT) {
      if (prevN_x !== undefined) zUint.parse(prevN_x);
      if (nextN_x !== undefined) zUint.parse(nextN_x);
    }
    const prev_a: string[] = [],
      next_a: string[] = [];
    let tk_ = this.prevToken_$;
    prevN_x ??= 100;
    for (let i = prevN_x; i--;) {
      if (!tk_) break;
      prev_a.unshift(tk_.toString());
      tk_ = tk_.prevToken_$;
    }
    tk_ = this.nextToken_$;
    nextN_x ??= 100;
    for (let i = nextN_x; i--;) {
      if (!tk_) break;
      next_a.push(tk_.toString());
      tk_ = tk_.nextToken_$;
    }
    return [prev_a, this.toString(), next_a];
  }

  // get _repr_(): [string | undefined, string, string | undefined] {
  //   return [
  //     this.prevToken_$?.toString(),
  //     this.toString(),
  //     this.nextToken_$?.toString(),
  //   ];
  // }
}
/*64----------------------------------------------------------*/

export type PlainTk = Token<PlainTok>;

export type SetTk = Token<SetTok>;
export const SetTk = Token<SetTok>;

export type URITk = Token<URITok>;
export const URITk = Token<URITok>;

/** `frstLine === lastLine` */
export type MdextTk = Token<MdextTok>;
export const MdextTk = Token<MdextTok>;
//jjjj TOCLEANUP
// /** @final */
// export class MdextTk extends Token<MdextTok> {
//   get line() {
//     return this.strtLoc.line;
//   }

//   override getTexta() {
//     return fail("Not implemented");
//   }
//   override getText() {
//     /*#static*/ if (INOUT) {
//       assert(this.strtLoc.line_$ === this.stopLoc.line_$);
//     }
//     return super.getText();
//   }
// }

export type PDFTk = Token<PDFTok>;
export const PDFTk = Token<PDFTok>;

export type RMLTk = Token<RMLTok>;
export const RMLTk = Token<RMLTok>;

export type JSLangTk = Token<JSLangTok>;
export const JSLangTk = Token<JSLangTok>;

export type HTMLTk = Token<HTMLTok>;
export const HTMLTk = Token<HTMLTok>;
/*80--------------------------------------------------------------------------*/

//kkkk Use a `TokenFac` (ref. `TSegFac`).
/*80--------------------------------------------------------------------------*/
