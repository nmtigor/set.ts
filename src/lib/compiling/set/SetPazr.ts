/** 80**************************************************************************
 * @module lib/compiling/set/SetPazr
 * @license MIT
 ******************************************************************************/

import { assert, fail } from "@fe-lib/util.ts";
import { trace, traceOut } from "@fe-lib/util/trace.ts";
import { _TRACE, INOUT } from "@fe-src/preNs.ts";
import type { uint } from "../../alias.ts";
import { Pazr } from "../Pazr.ts";
import type { SetTk } from "../Token.ts";
import { Token } from "../Token.ts";
import { Err } from "../alias.ts";
import { SetTok } from "./SetTok.ts";
import { Oprec, type Paren } from "./alias.ts";
import { BinaryErr, BinaryOp } from "./stnode/BinaryOp.ts";
import { FuzykeySeq } from "./stnode/FuzykeySeq.ts";
import { Intersect } from "./stnode/Intersect.ts";
import { Key } from "./stnode/Key.ts";
import { QuotkeySeq } from "./stnode/QuotkeySeq.ts";
import { Rel } from "./stnode/Rel.ts";
import { Set, type UnparenSet } from "./stnode/Set.ts";
import type { SetSN } from "./stnode/SetSN.ts";
import { Subtract } from "./stnode/Subtract.ts";
import { Union } from "./stnode/Union.ts";
/*80--------------------------------------------------------------------------*/

type PazSetO_ = {
  readonly oprec: Oprec;
  readonly paren: Paren;
  selfParen: Paren;
  lhs?: Set;
};

/** @final */
export class SetPazr extends Pazr<SetTok> {
  static readonly #VALVE = 100;
  #valve = SetPazr.#VALVE;

  // constructor(bufr_x: SetBufr, lexr_x: SetLexr) {
  //   super(bufr_x, lexr_x);
  // }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param _x */
  @traceOut(_TRACE)
  private _pazSet(
    _x: PazSetO_ = { oprec: Oprec.lowest, paren: 0, selfParen: 0 },
  ): Set {
    assert(this.#valve--, `Loop ${SetPazr.#VALVE} times`);
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}._pazSet() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(!this.reachPazBdry$());
      if (!_x.lhs) assert(_x.selfParen === 0);
    }
    if (!_x.lhs) {
      if (this.#pazLhs(_x)) return _x.lhs!;
    }

    const B_ = /* final switch */ {
      [SetTok.subtract]: Subtract,
      [SetTok.intersect]: Intersect,
      [SetTok.union]: Union,
    }[this.strtPazTk$.value as uint] ?? BinaryErr;
    if (_x.oprec < B_.oprec) {
      if (this.#pazRhsOf(B_, _x as Required<PazSetO_>)) return _x.lhs!;

      this._pazSet(_x);
    }
    return _x.lhs!;
  }

  /**
   * Count as `Rel` if there is at least one joiner.
   *
   * If return `undefined`, `strtPazTk$` will not move.
   */
  @traceOut(_TRACE)
  #pazRelKey(): Rel | Key | SetTk {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazRelKey() >>>>>>>`,
      );
    }
    let srcSn: Key | SetTk | undefined;
    const unexpTk_a: SetTk[] = [];
    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        srcSn = this.#pazKey();
        break;
      case SetTok.question:
        srcSn = this.strtPazTk$;
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
      case SetTok.joiner:
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
    }
    if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.joiner) {
      if (unexpTk_a.length) {
        /*#static*/ if (INOUT) {
          assert(unexpTk_a.length === 1 && !srcSn);
        }
        srcSn = unexpTk_a[0];
      }
      return srcSn!;
    }

    const jnr_1 = this.strtPazTk$;
    this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
    let ret: Rel | undefined;
    if (this.reachPazBdry$()) {
      ret = new Rel(srcSn, jnr_1);
      for (const tk of unexpTk_a) {
        ret.setErr(`${Err.set_rel_unexpected_token}: ${tk}`);
      }
      this.errSn_sa$.add(ret);
      return ret;
    }

    let relSn: Key | SetTk | undefined;
    let jnr_2;
    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        relSn = this.#pazKey();
        break;
      case SetTok.question:
        relSn = this.strtPazTk$;
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
      case SetTok.joiner:
        jnr_2 = this.strtPazTk$;
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
    }
    if (this.reachPazBdry$()) {
      ret = new Rel(srcSn, jnr_1, relSn, jnr_2);
      for (const tk of unexpTk_a) {
        ret.setErr(`${Err.set_rel_unexpected_token}: ${tk}`);
      }
      this.errSn_sa$.add(ret);
      return ret;
    }

    if (this.strtPazTk$.value === SetTok.joiner) {
      jnr_2 = this.strtPazTk$;
    }
    if (jnr_2) {
      this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
      if (this.reachPazBdry$()) {
        ret = new Rel(srcSn, jnr_1, relSn, jnr_2, undefined);
        for (const tk of unexpTk_a) {
          ret.setErr(`${Err.set_rel_unexpected_token}: ${tk}`);
        }
        if (ret.isErr) this.errSn_sa$.add(ret);
        return ret;
      }
    }

    let tgtSn: Key | SetTk | undefined;
    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        tgtSn = this.#pazKey();
        break;
      case SetTok.question:
        tgtSn = this.strtPazTk$;
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
    }
    ret = new Rel(srcSn, jnr_1, relSn, jnr_2, tgtSn);
    for (const tk of unexpTk_a) {
      ret.setErr(`${Err.set_rel_unexpected_token}: ${tk}`);
    }
    if (ret.isErr) this.errSn_sa$.add(ret);
    return ret;
  }

  @traceOut(_TRACE)
  #pazKey(): Key {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazKey() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(
        this.strtPazTk$.value === SetTok.fuzykey ||
          this.strtPazTk$.value === SetTok.quotkey,
      );
    }
    for (const sn of this.unrelSn_sa_$) {
      if (sn instanceof Key && sn.frstToken === this.strtPazTk$) {
        this.strtPazTk$ = sn.lastToken.nextToken_$!;
        this.unrelSn_sa_$.rmv(sn);
        this.takldSn_sa_$.add(sn);
        return sn.ensureAllBdry();
      }
    }

    const sn_a: (FuzykeySeq | QuotkeySeq)[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      sn_a.push(
        this.strtPazTk$.value === SetTok.fuzykey
          ? this.#pazFuzykeySeq()
          : this.#pazQuotkeySeq(),
      );
      if (
        this.reachPazBdry$() ||
        this.strtPazTk$.value !== SetTok.fuzykey &&
          this.strtPazTk$.value !== SetTok.quotkey
      ) break;
    } while (valve--);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new Key(sn_a);
  }

  @traceOut(_TRACE)
  #pazFuzykeySeq(): FuzykeySeq {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazFuzykeySeq() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.strtPazTk$.value === SetTok.fuzykey);
    }
    for (const sn of this.unrelSn_sa_$) {
      if (sn instanceof FuzykeySeq && sn.frstToken === this.strtPazTk$) {
        this.strtPazTk$ = sn.lastToken.nextToken_$!;
        this.unrelSn_sa_$.rmv(sn);
        this.takldSn_sa_$.add(sn);
        return sn.ensureAllBdry();
      }
    }

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtPazTk$);
      this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
      if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.fuzykey) {
        break;
      }
    } while (valve--);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new FuzykeySeq(tk_a);
  }

  @traceOut(_TRACE)
  #pazQuotkeySeq(): QuotkeySeq {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazQuotkeySeq() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.strtPazTk$.value === SetTok.quotkey);
    }
    for (const sn of this.unrelSn_sa_$) {
      if (sn instanceof QuotkeySeq && sn.frstToken === this.strtPazTk$) {
        this.strtPazTk$ = sn.lastToken.nextToken_$!;
        this.unrelSn_sa_$.rmv(sn);
        this.takldSn_sa_$.add(sn);
        return sn.ensureAllBdry();
      }
    }

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtPazTk$);
      this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
      if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.quotkey) {
        break;
      }
    } while (valve--);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new QuotkeySeq(tk_a);
  }

  /** @implement */
  protected paz_impl$() {
    this.#valve = SetPazr.#VALVE;

    if (this.drtSn_$ instanceof BinaryOp) {
      this.enlrgBdriesTo_$(this.drtSn_$.parent_$!);
      this.strtPazTk$ = this.strtPazTk$.nextToken_$!; //!
    }

    if (this.drtSn_$) {
      this.visit(this.drtSn_$);
      if (!this.newSn_$ || this.newSn_$.isErr || !this.reachPazBdry$()) {
        this.enlrgBdriesTo_$(this.drtSn_$.parent_$!);
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!; //!
        if (this.drtSn_$) this.visit(this.drtSn_$);
        else this.newSn_$ = this._pazSet();
      }
    } else {
      this.newSn_$ = this._pazSet();
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
    // else console.log("root$: ", this.root$!._repr_());
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * `out( _x.lhs)`
   * @headconst @param _x
   */
  #pazLhs_impl(_x: PazSetO_): void {
    for (const sn of this.unrelSn_sa_$) {
      if (sn instanceof Set && sn.frstToken === this.strtPazTk$) {
        this.strtPazTk$ = sn.lastToken.nextToken_$!;
        this.unrelSn_sa_$.rmv(sn);
        this.takldSn_sa_$.add(sn);
        _x.lhs = sn.ensureAllBdry();
        return;
      }
    }

    let snt: UnparenSet | SetTk | undefined;
    if (this.strtPazTk$.value === SetTok.paren_open) {
      const tk_0 = this.strtPazTk$;
      do {
        _x.selfParen++;
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        if (this.reachPazBdry$()) {
          _x.lhs = new Set(tk_0, 0);
          _x.lhs.setErr(Err.set_no_cloz_paren);

          _x.selfParen = 0;
          this.strtPazTk$ = tk_0.nextToken_$!;
          return;
        }
      } while (this.strtPazTk$.value === SetTok.paren_open);
    }

    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
      case SetTok.question:
      case SetTok.joiner:
        snt = this.#pazRelKey()!;
        break;
      default:
        snt = this.strtPazTk$;
        this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
        break;
    }
    _x.lhs = new Set(snt, _x.selfParen);
    if (this.reachPazBdry$()) {
      if (_x.selfParen) {
        _x.lhs.setErr(Err.set_no_cloz_paren);
      }
    }
  }
  /**
   * `out( _x.lhs)`
   * @headborrow @headconst @param _x
   * @return Done or not
   */
  #pazLhs(_x: PazSetO_): boolean {
    this.#pazLhs_impl(_x);
    if (_x.lhs!.isErr) this.errSn_sa$.add(_x.lhs!);
    if (this.reachPazBdry$()) return true;

    const p_ = this.#pazClozParen_impl(_x as Required<PazSetO_>);
    if (_x.lhs!.isErr) this.errSn_sa$.add(_x.lhs!);
    if (p_ === undefined) return true;

    _x.selfParen = p_;
    return false;
  }

  /**
   * Wrap the `B_x` instance with a new `Set`, then set it back to `_x.lhs`
   * @headconst @param B_x
   * @headborrow @headconst @param _x
   */
  #pazRhsOf_impl(
    B_x: typeof Subtract | typeof Intersect | typeof Union | typeof BinaryErr,
    _x: Required<PazSetO_>,
  ): void {
    const op_ = this.strtPazTk$;
    this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
    let sn_: BinaryOp;
    if (this.reachPazBdry$()) {
      sn_ = new B_x(_x.lhs, op_, undefined);
    } else {
      const rhs = this._pazSet({
        oprec: B_x.oprec,
        paren: _x.selfParen,
        selfParen: 0,
      });
      sn_ = new B_x(_x.lhs, op_, rhs);
    }
    if (sn_.isErr) this.errSn_sa$.add(sn_);

    _x.lhs = new Set(sn_, _x.selfParen);
    if (this.reachPazBdry$()) {
      if (_x.selfParen) {
        _x.lhs.setErr(Err.set_no_cloz_paren);
      }
    }
  }
  /**
   * @headconst @param B_x
   * @headborrow @headconst @param _x
   * @return Done or not
   */
  #pazRhsOf(
    B_x: typeof Subtract | typeof Intersect | typeof Union | typeof BinaryErr,
    _x: Required<PazSetO_>,
  ): boolean {
    this.#pazRhsOf_impl(B_x, _x);
    if (_x.lhs.isErr) this.errSn_sa$.add(_x.lhs);
    if (this.reachPazBdry$()) return true;

    const p_ = this.#pazClozParen_impl(_x);
    if (_x.lhs!.isErr) this.errSn_sa$.add(_x.lhs!);
    if (p_ === undefined) return true;

    _x.selfParen = p_;
    return false;
  }

  /**
   * @headconst @param _x
   * @const @param selfParen
   * @out @param lhs
   */
  #pazClozParen_impl(
    { paren, selfParen, lhs }: Required<PazSetO_>,
  ): Paren | undefined {
    let retParen = selfParen;
    if (this.strtPazTk$.value !== SetTok.paren_cloz) {
      lhs.paren_$ = 0;
      return retParen;
    }

    let paren_1: Paren = 0;
    let tk_1: SetTk | undefined;
    do {
      if (retParen > 0) retParen--;
      else {
        if (paren_1 === 0) tk_1 = this.strtPazTk$;
        paren_1++;
      }
      this.strtPazTk$ = this.strtPazTk$.nextToken_$!;
    } while (
      !this.reachPazBdry$() &&
      this.strtPazTk$.value === SetTok.paren_cloz
    );
    if (retParen) {
      lhs.paren_$ = selfParen - retParen;
    } else if (paren) {
      if (paren_1) {
        this.strtPazTk$ = tk_1!;
        return undefined;
      }
    } else if (paren_1) {
      lhs.paren_$ = lhs.paren + paren_1;
      lhs.setErr(Err.set_no_open_paren);
    }
    if (this.reachPazBdry$()) {
      if (retParen) {
        lhs.paren_$ = lhs.paren + retParen;
        lhs.setErr(Err.set_no_cloz_paren);
      }
      return undefined;
    }
    return retParen;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * Set `newSn_$`
   * @headconst @param sn_x
   */
  visit(sn_x: SetSN) {
    if (sn_x instanceof FuzykeySeq) {
      this.newSn_$ = this.#pazFuzykeySeq();
    } else if (sn_x instanceof QuotkeySeq) {
      this.newSn_$ = this.#pazQuotkeySeq();
    } else if (sn_x instanceof Key) {
      this.newSn_$ = this.#pazKey();
    } else if (sn_x instanceof Rel) {
      const snt = this.#pazRelKey();
      if (snt instanceof Token) this.newSn_$ = undefined;
      else this.newSn_$ = snt;
    } else if (sn_x instanceof Set) {
      this.newSn_$ = this._pazSet();
    } else {
      fail("jjjj Not implemented");
    }

    if (this.drtSn_$) {
      /*#static*/ if (INOUT) {
        assert(this.drtSn_$ !== this.newSn_$);
      }
      this.errSn_sa$.rmv(this.drtSn_$);
    }
  }
}
/*80--------------------------------------------------------------------------*/
