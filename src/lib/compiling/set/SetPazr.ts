/** 80**************************************************************************
 * @module lib/compiling/set/SetPazr
 * @license MIT
 ******************************************************************************/

import { assert, fail, traceOut } from "@fe-lib/util/trace.ts";
import { _TRACE, DENO, global, INOUT, TESTING } from "@fe-src/global.ts";
import type { uint } from "../../alias.ts";
import type { Visitor } from "../../util/Visitor.ts";
import { Pazr } from "../Pazr.ts";
import { SetTk } from "../Token.ts";
import { Err } from "../alias.ts";
import type { SetSN } from "./SetSN.ts";
import { SetTok } from "./SetTok.ts";
import { Oprec, type Paren } from "./alias.ts";
import { BinaryErr, BinaryOp } from "./stnode/BinaryOp.ts";
import { FuzykeySeq } from "./stnode/FuzykeySeq.ts";
import { Intersect } from "./stnode/Intersect.ts";
import { Key } from "./stnode/Key.ts";
import { QuotkeySeq } from "./stnode/QuotkeySeq.ts";
import { Rel } from "./stnode/Rel.ts";
import { Set, type UnparenSet } from "./stnode/Set.ts";
import { Subtract } from "./stnode/Subtract.ts";
import { Union } from "./stnode/Union.ts";
/*80--------------------------------------------------------------------------*/

type PazSet_ = {
  readonly oprec?: Oprec;
  readonly paren?: Paren;
  selfParen?: Paren;
  lhs?: Set;
};

/** @final */
export class SetPazr extends Pazr<SetTok> implements Visitor {
  static readonly #VALVE = 100;
  #valve = SetPazr.#VALVE;

  // constructor(bufr_x: SetBufr, lexr_x: SetLexr) {
  //   super(bufr_x, lexr_x);
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * `in( this.drtSn_$ )`
   */
  #upDrtSn() {
    this.errSn_sa$.reset(); //!
    this.drtSn_$ = this.setPazRegion$(this.drtSn_$!.parent_$);
    this.invalidateBdries$();
    this.strtToken$ = this.strtToken$.nextToken_$!; //!
  }

  /** @implement */
  protected paz_impl$() {
    this.#valve = SetPazr.#VALVE;

    if (this.drtSn_$ instanceof BinaryOp) this.#upDrtSn();

    if (this.drtSn_$) {
      this.visit(this.drtSn_$);
      if (!this.newSn_$ || this.newSn_$.isErr || !this.reachRigtBdry()) {
        this.#upDrtSn();
        if (this.drtSn_$) this.visit(this.drtSn_$);
        else this.newSn_$ = this.pazSet_$();
      }
    } else {
      this.newSn_$ = this.pazSet_$();
    }
    /*#static*/ if (INOUT) {
      assert(!this.drtSn_$ || !this.drtSn_$.isRoot);
      assert(this.newSn_$);
    }
    if (this.drtSn_$) {
      this.drtSn_$.parent_$!.replaceChild(this.drtSn_$, this.newSn_$!);
    } else {
      this.root$ = this.newSn_$!;
    }
    // this.drtSn_$ = undefined;
    // this.newSn_$ = this.root$;
    // if (this.hasErr) console.log("_err: ", this._err);
    // // else console.log(`root$: ${this.root$}`);
    // else console.log("root$: ", this.root$!._repr());
  }

  /**
   * @headconst @param _x
   */
  @traceOut(_TRACE)
  //kkkk TOCLEANUP
  // pazSet_$({
  //   oprec = Oprec.lowest,
  //   paren = 0,
  //   selfParen = 0,
  //   lhs,
  // }: PazSet_): Set {
  pazSet_$(_x = {} as PazSet_): Set {
    /*#static*/ if (_TRACE) {
      console.log(
        `${global.indent}>>>>>>> ${this._type_id}.pazSet_$() >>>>>>>`,
      );
    }
    (_x as any).oprec ??= Oprec.lowest;
    (_x as any).paren ??= 0;
    _x.selfParen ??= 0;
    assert(this.#valve--, `Loop ${SetPazr.#VALVE} times`);
    /*#static*/ if (INOUT) {
      assert(!this.reachRigtBdry());
      if (!_x.lhs) assert(_x.selfParen === 0);
    }
    if (!_x.lhs) {
      //kkkk TOCLEANUP
      // let snt: UnparenSet | SetTk | undefined;
      // if (this.strtToken$.value === SetTok.paren_open) {
      //   const curTk_save = this.strtToken$;
      //   do {
      //     ++_x.selfParen;
      //     this.strtToken$ = this.strtToken$.nextToken_$!;
      //     if (this.reachRigtBdry()) {
      //       snt = this.strtToken$ = curTk_save;
      //       _x.lhs = new Set(snt, 0);
      //       _x.lhs.setErr(Err.lack_of_closing_paren);
      //       this.errSn_sa$.add(_x.lhs);
      //       return _x.lhs;
      //     }
      //   } while (this.strtToken$.value === SetTok.paren_open);
      // }

      // switch (this.strtToken$.value) {
      //   case SetTok.fuzykey:
      //   case SetTok.quotkey:
      //   case SetTok.question:
      //   case SetTok.joiner:
      //     snt = this.pazRelKey_$()!;
      //     break;
      //   default:
      //     snt = this.strtToken$;
      //     this.strtToken$ = this.strtToken$.nextToken_$!;
      //     break;
      // }
      // _x.lhs = new Set(snt, _x.selfParen);
      // if (this.reachRigtBdry()) {
      //   if (_x.selfParen) {
      //     _x.lhs.setErr(Err.lack_of_closing_paren);
      //   }
      //   if (_x.lhs.isErr) this.errSn_sa$.add(_x.lhs);
      //   return _x.lhs;
      // }
      this.#pazLhs(_x as Required<PazSet_>);
      if (this.reachRigtBdry()) return _x.lhs!;

      const p_ = this.#pazClozParen(_x as Required<PazSet_>);
      if (_x.lhs!.isErr) this.errSn_sa$.add(_x.lhs!);
      if (p_ === undefined) return _x.lhs!;

      _x.selfParen = p_;
    }

    const B_ = /* final switch */ {
      [SetTok.subtract]: Subtract,
      [SetTok.intersect]: Intersect,
      [SetTok.union]: Union,
    }[this.strtToken$.value as uint] ?? BinaryErr;
    this.#pazRhsOf(B_, _x as Required<PazSet_>);
    return _x.lhs!;
  }

  /**
   * Count as `Rel` if there is at least one joiner.
   *
   * If return `undefined`, `strtToken$` will not move.
   */
  @traceOut(_TRACE)
  pazRelKey_$(): Rel | Key | SetTk {
    /*#static*/ if (_TRACE) {
      console.log(
        `${global.indent}>>>>>>> ${this._type_id}.pazRelKey_$() >>>>>>>`,
      );
    }
    let srcSn: Key | SetTk | undefined;
    const unexpTk_a: SetTk[] = [];
    switch (this.strtToken$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        srcSn = this.pazKey_$();
        break;
      case SetTok.question:
        srcSn = this.strtToken$;
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
      case SetTok.joiner:
        break;
      default:
        unexpTk_a.push(this.strtToken$);
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
    }
    if (this.reachRigtBdry() || this.strtToken$.value !== SetTok.joiner) {
      if (unexpTk_a.length) {
        /*#static*/ if (INOUT) {
          assert(unexpTk_a.length === 1 && !srcSn);
        }
        srcSn = unexpTk_a[0];
      }
      return srcSn!;
    }

    const jnr_1 = this.strtToken$;
    this.strtToken$ = this.strtToken$.nextToken_$!;
    let ret: Rel | undefined;
    if (this.reachRigtBdry()) {
      ret = new Rel(srcSn, jnr_1);
      unexpTk_a.forEach((tk_y) => {
        ret!.setErr(`${Err.unexpected_token_for_rel}: ${tk_y}`);
      });
      this.errSn_sa$.add(ret);
      return ret;
    }

    let relSn: Key | SetTk | undefined;
    let jnr_2;
    switch (this.strtToken$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        relSn = this.pazKey_$();
        break;
      case SetTok.question:
        relSn = this.strtToken$;
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
      case SetTok.joiner:
        jnr_2 = this.strtToken$;
        break;
      default:
        unexpTk_a.push(this.strtToken$);
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
    }
    if (this.reachRigtBdry()) {
      ret = new Rel(srcSn, jnr_1, relSn, jnr_2);
      unexpTk_a.forEach((tk_y) => {
        ret!.setErr(`${Err.unexpected_token_for_rel}: ${tk_y}`);
      });
      this.errSn_sa$.add(ret);
      return ret;
    }

    if (this.strtToken$.value === SetTok.joiner) {
      jnr_2 = this.strtToken$;
    }
    if (jnr_2) {
      this.strtToken$ = this.strtToken$.nextToken_$!;
      if (this.reachRigtBdry()) {
        ret = new Rel(srcSn, jnr_1, relSn, jnr_2, undefined);
        unexpTk_a.forEach((tk_y) => {
          ret!.setErr(`${Err.unexpected_token_for_rel}: ${tk_y}`);
        });
        if (ret.isErr) this.errSn_sa$.add(ret);
        return ret;
      }
    }

    let tgtSn: Key | SetTk | undefined;
    switch (this.strtToken$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        tgtSn = this.pazKey_$();
        break;
      case SetTok.question:
        tgtSn = this.strtToken$;
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
      default:
        unexpTk_a.push(this.strtToken$);
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
    }
    ret = new Rel(srcSn, jnr_1, relSn, jnr_2, tgtSn);
    unexpTk_a.forEach((tk_y) => {
      ret!.setErr(`${Err.unexpected_token_for_rel}: ${tk_y}`);
    });
    if (ret.isErr) this.errSn_sa$.add(ret);
    return ret;
  }

  @traceOut(_TRACE)
  pazKey_$(): Key {
    /*#static*/ if (_TRACE) {
      console.log(
        `${global.indent}>>>>>>> ${this._type_id}.pazKey_$() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(
        this.strtToken$.value === SetTok.fuzykey ||
          this.strtToken$.value === SetTok.quotkey,
      );
    }
    for (const sn of this.unrelSn_sa$) {
      if (sn instanceof Key && sn.frstToken === this.strtToken$) {
        this.strtToken$ = sn.lastToken.nextToken_$!;
        /*#static*/ if (!(DENO && TESTING)) {
          this.unrelSn_sa$.delete(sn);
        }
        return sn.ensureAllBdry();
      }
    }

    const sn_a: (FuzykeySeq | QuotkeySeq)[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      sn_a.push(
        this.strtToken$.value === SetTok.fuzykey
          ? this.pazFuzykeySeq_$()
          : this.pazQuotkeySeq_$(),
      );
      if (
        this.reachRigtBdry() ||
        this.strtToken$.value !== SetTok.fuzykey &&
          this.strtToken$.value !== SetTok.quotkey
      ) break;
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new Key(sn_a);
  }

  @traceOut(_TRACE)
  pazFuzykeySeq_$(): FuzykeySeq {
    /*#static*/ if (_TRACE) {
      console.log(
        `${global.indent}>>>>>>> ${this._type_id}.pazFuzykeySeq_$() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.strtToken$.value === SetTok.fuzykey);
    }
    for (const sn of this.unrelSn_sa$) {
      if (sn instanceof FuzykeySeq && sn.frstToken === this.strtToken$) {
        this.strtToken$ = sn.lastToken.nextToken_$!;
        /*#static*/ if (!(DENO && TESTING)) {
          this.unrelSn_sa$.delete(sn);
        }
        return sn.ensureAllBdry();
      }
    }

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtToken$);
      this.strtToken$ = this.strtToken$.nextToken_$!;
      if (this.reachRigtBdry() || this.strtToken$.value !== SetTok.fuzykey) {
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new FuzykeySeq(tk_a);
  }

  @traceOut(_TRACE)
  pazQuotkeySeq_$(): QuotkeySeq {
    /*#static*/ if (_TRACE) {
      console.log(
        `${global.indent}>>>>>>> ${this._type_id}.pazQuotkeySeq_$() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.strtToken$.value === SetTok.quotkey);
    }
    for (const sn of this.unrelSn_sa$) {
      if (sn instanceof QuotkeySeq && sn.frstToken === this.strtToken$) {
        this.strtToken$ = sn.lastToken.nextToken_$!;
        /*#static*/ if (!(DENO && TESTING)) {
          this.unrelSn_sa$.delete(sn);
        }
        return sn.ensureAllBdry();
      }
    }

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtToken$);
      this.strtToken$ = this.strtToken$.nextToken_$!;
      if (this.reachRigtBdry() || this.strtToken$.value !== SetTok.quotkey) {
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new QuotkeySeq(tk_a);
  }

  /**
   * @headconst @param _x
   */
  #pazLhs(_x: Required<PazSet_>): void {
    for (const sn of this.unrelSn_sa$) {
      if (sn instanceof Set && sn.frstToken === this.strtToken$) {
        this.strtToken$ = sn.lastToken.nextToken_$!;
        /*#static*/ if (!(DENO && TESTING)) {
          this.unrelSn_sa$.delete(sn);
        }
        _x.lhs = sn.ensureAllBdry();
        return;
      }
    }

    let snt: UnparenSet | SetTk | undefined;
    if (this.strtToken$.value === SetTok.paren_open) {
      const curTk_save = this.strtToken$;
      do {
        ++_x.selfParen;
        this.strtToken$ = this.strtToken$.nextToken_$!;
        if (this.reachRigtBdry()) {
          snt = this.strtToken$ = curTk_save;
          _x.lhs = new Set(snt, 0);
          _x.lhs.setErr(Err.lack_of_closing_paren);
          this.errSn_sa$.add(_x.lhs);
          return;
        }
      } while (this.strtToken$.value === SetTok.paren_open);
    }

    switch (this.strtToken$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
      case SetTok.question:
      case SetTok.joiner:
        snt = this.pazRelKey_$()!;
        break;
      default:
        snt = this.strtToken$;
        this.strtToken$ = this.strtToken$.nextToken_$!;
        break;
    }
    _x.lhs = new Set(snt, _x.selfParen);
    if (this.reachRigtBdry()) {
      if (_x.selfParen) {
        _x.lhs.setErr(Err.lack_of_closing_paren);
      }
      if (_x.lhs.isErr) this.errSn_sa$.add(_x.lhs);
    }
  }

  /**
   * @headconst @param B_x
   * @headconst @param _x
   */
  #pazRhsOf(
    B_x: typeof Subtract | typeof Intersect | typeof Union | typeof BinaryErr,
    _x: Required<PazSet_>,
  ): void {
    if (_x.oprec >= B_x.oprec) return;

    const op_ = this.strtToken$;
    this.strtToken$ = this.strtToken$.nextToken_$!;
    let sn_: Subtract | Intersect | Union | BinaryErr;
    if (this.reachRigtBdry()) {
      sn_ = new B_x(_x.lhs, op_, undefined);
    } else {
      const rhs = this.pazSet_$({ oprec: B_x.oprec, paren: _x.selfParen });
      sn_ = new B_x(_x.lhs, op_, rhs);
    }
    if (sn_.isErr) this.errSn_sa$.add(sn_);

    _x.lhs = new Set(sn_, _x.selfParen);
    if (this.reachRigtBdry()) {
      if (_x.selfParen) {
        _x.lhs.setErr(Err.lack_of_closing_paren);
      }
      if (_x.lhs.isErr) this.errSn_sa$.add(_x.lhs);
      return;
    }

    const p_ = this.#pazClozParen(_x);
    if (_x.lhs.isErr) this.errSn_sa$.add(_x.lhs);
    if (p_ === undefined) return;

    _x.selfParen = p_;
    this.pazSet_$(_x);
  }

  /**
   * Do not run `if (lhs.isE  rr) this.errSn_sa$.add(out_x);` here
   * @const @param paren
   * @const @param selfParen
   * @out @param lhs
   */
  #pazClozParen(
    { paren, selfParen, lhs }: Required<PazSet_>,
  ): Paren | undefined {
    let ret = selfParen;
    if (this.strtToken$.value !== SetTok.paren_cloz) {
      lhs.paren_$ = 0;
      return ret;
    }

    let paren_1: Paren = 0;
    let curTk_1: SetTk | undefined;
    do {
      if (ret > 0) --ret;
      else {
        if (!paren_1) curTk_1 = this.strtToken$;
        ++paren_1;
      }
      this.strtToken$ = this.strtToken$.nextToken_$!;
    } while (
      !this.reachRigtBdry() &&
      this.strtToken$.value === SetTok.paren_cloz
    );
    if (ret) {
      lhs.paren_$ = selfParen - ret;
    } else if (paren) {
      if (paren_1) {
        this.strtToken$ = curTk_1!;
        return undefined;
      }
    } else if (paren_1) {
      lhs.paren_$ = lhs.paren + paren_1;
      lhs.setErr(Err.lack_of_opening_paren);
    }
    if (this.reachRigtBdry()) {
      if (ret) {
        lhs.paren_$ = lhs.paren + ret;
        lhs.setErr(Err.lack_of_closing_paren);
      }
      return undefined;
    }
    return ret;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Assign `newSn_$`
   * @implement
   */
  visit(visitable: SetSN) {
    if (visitable instanceof FuzykeySeq) {
      this.newSn_$ = this.pazFuzykeySeq_$();
    } else if (visitable instanceof QuotkeySeq) {
      this.newSn_$ = this.pazQuotkeySeq_$();
    } else if (visitable instanceof Key) {
      this.newSn_$ = this.pazKey_$();
    } else if (visitable instanceof Rel) {
      const snt = this.pazRelKey_$();
      if (snt instanceof SetTk) this.newSn_$ = undefined;
      else this.newSn_$ = snt;
    } else if (visitable instanceof Set) {
      this.newSn_$ = this.pazSet_$();
    } else {
      fail("Not implemented");
    }

    if (this.drtSn_$) {
      /*#static*/ if (INOUT) {
        assert(this.drtSn_$ !== this.newSn_$);
      }
      this.errSn_sa$.delete(this.drtSn_$);
    }
  }
}
/*80--------------------------------------------------------------------------*/