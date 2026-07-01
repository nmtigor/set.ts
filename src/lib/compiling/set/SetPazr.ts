/** 80**************************************************************************
 * @module lib/compiling/set/SetPazr
 * @license MIT
 ******************************************************************************/

import { assert, fail } from "@fe-lib/util.ts";
import { trace, traceOut } from "@fe-lib/util/trace.ts";
import { _TRACE, INOUT } from "@fe-src/preNs.ts";
import type { uint } from "../../alias.ts";
import { Pazr } from "../Pazr.ts";
import { Ranval } from "../Ranval.ts";
import type { SetTk } from "../Token.ts";
import { Token } from "../Token.ts";
import { ErrMsg } from "../util.ts";
import { SetTok } from "./SetTok.ts";
import type { Paren, UnparenSet } from "./alias.ts";
import { Oprec } from "./alias.ts";
import { BinaryErr, BinaryOp } from "./stnode/BinaryOp.ts";
import { FuzykeySeq } from "./stnode/FuzykeySeq.ts";
import { Ids } from "./stnode/Ids.ts";
import { Intersect } from "./stnode/Intersect.ts";
import { Key } from "./stnode/Key.ts";
import { QuotkeySeq } from "./stnode/QuotkeySeq.ts";
import { Rel } from "./stnode/Rel.ts";
import { Set } from "./stnode/Set.ts";
import type { SetSn } from "./stnode/SetSn.ts";
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

  protected override sufPaz$(): void {
    this.gc_$();
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param _x */
  @traceOut(_TRACE)
  private _pazSet(
    _x: PazSetO_ = { oprec: Oprec.lowest, paren: 0, selfParen: 0 },
  ): Set {
    assert(--this.#valve, `Loop ${SetPazr.#VALVE}±1 times`);
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
  //jjjj TOCLEANUP
  //  * If return `undefined`, `strtPazTk$` will not move.
   */
  @traceOut(_TRACE)
  #pazRelKeyIds(): Rel | Key | Ids | SetTk {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazRelKeyIds() >>>>>>>`,
      );
    }
    let srcSn: Key | Ids | SetTk | undefined;
    const unexpTk_a: SetTk[] = [];
    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        srcSn = this.#pazKey();
        break;
      case SetTok.priid:
        srcSn = this.#pazIds();
        break;
      case SetTok.asterisk:
      case SetTok.question:
        srcSn = this.strtPazTk$;
        this.forceForw$();
        break;
      case SetTok.joiner:
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.forceForw$();
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
    this.forceForw$();
    let retSn: Rel;
    if (this.reachPazBdry$()) {
      retSn = new Rel(this, srcSn, jnr_1);
      for (const tk of unexpTk_a) {
        retSn.setErr([
          ErrMsg.set_rel_unexp_tk,
          Ranval.fromRan(tk.ran_$),
          tk.name,
        ]);
      }
      this.errSn_ss$.add(retSn);
      return retSn;
    }

    let relSn: Key | Ids | SetTk | undefined;
    let jnr_2;
    switch ((this.strtPazTk$ as SetTk).value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        relSn = this.#pazKey();
        break;
      case SetTok.priid:
        relSn = this.#pazIds();
        break;
      case SetTok.asterisk:
      case SetTok.question:
        relSn = this.strtPazTk$;
        this.forceForw$();
        break;
      case SetTok.joiner:
        jnr_2 = this.strtPazTk$;
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.forceForw$();
        break;
    }
    if (this.reachPazBdry$()) {
      retSn = new Rel(this, srcSn, jnr_1, relSn, jnr_2);
      for (const tk of unexpTk_a) {
        retSn.setErr([
          ErrMsg.set_rel_unexp_tk,
          Ranval.fromRan(tk.ran_$),
          tk.name,
        ]);
      }
      this.errSn_ss$.add(retSn);
      return retSn;
    }

    if (this.strtPazTk$.value === SetTok.joiner) {
      jnr_2 = this.strtPazTk$;
    }
    if (jnr_2) {
      this.forceForw$();
      if (this.reachPazBdry$()) {
        retSn = new Rel(this, srcSn, jnr_1, relSn, jnr_2, undefined);
        for (const tk of unexpTk_a) {
          retSn.setErr([
            ErrMsg.set_rel_unexp_tk,
            Ranval.fromRan(tk.ran_$),
            tk.name,
          ]);
        }
        if (retSn.isErr) this.errSn_ss$.add(retSn);
        return retSn;
      }
    }

    let tgtSn: Key | Ids | SetTk | undefined;
    switch ((this.strtPazTk$ as SetTk).value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
        tgtSn = this.#pazKey();
        break;
      case SetTok.priid:
        tgtSn = this.#pazIds();
        break;
      case SetTok.asterisk:
      case SetTok.question:
        tgtSn = this.strtPazTk$;
        this.forceForw$();
        break;
      default:
        unexpTk_a.push(this.strtPazTk$);
        this.forceForw$();
        break;
    }
    retSn = new Rel(this, srcSn, jnr_1, relSn, jnr_2, tgtSn);
    for (const tk of unexpTk_a) {
      retSn.setErr([
        ErrMsg.set_rel_unexp_tk,
        Ranval.fromRan(tk.ran_$),
        tk.name,
      ]);
    }
    if (retSn.isErr) this.errSn_ss$.add(retSn);
    return retSn;
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
    const reusdSn = this.#reuseSn((sn_y) => sn_y instanceof Key);
    if (reusdSn) return reusdSn as Key;

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
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new Key(this, sn_a);
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
    const reusdSn = this.#reuseSn((sn_y) => sn_y instanceof FuzykeySeq);
    if (reusdSn) return reusdSn as FuzykeySeq;

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtPazTk$);
      this.forceForw$();
      if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.fuzykey) {
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new FuzykeySeq(this, tk_a);
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
    const reusdSn = this.#reuseSn((sn_y) => sn_y instanceof QuotkeySeq);
    if (reusdSn) return reusdSn as QuotkeySeq;

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtPazTk$);
      this.forceForw$();
      if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.quotkey) {
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new QuotkeySeq(this, tk_a);
  }

  @traceOut(_TRACE)
  #pazIds(): Ids {
    /*#static*/ if (_TRACE) {
      console.log(
        `${trace.indent}>>>>>>> ${this._class_id_}.#pazIds() >>>>>>>`,
      );
    }
    /*#static*/ if (INOUT) {
      assert(this.strtPazTk$.value === SetTok.priid);
    }
    const reusdSn = this.#reuseSn((sn_y) => sn_y instanceof Ids);
    if (reusdSn) return reusdSn as Ids;

    const tk_a: SetTk[] = [];
    const VALVE = 100;
    let valve = VALVE;
    do {
      tk_a.push(this.strtPazTk$);
      this.forceForw$();
      if (this.reachPazBdry$() || this.strtPazTk$.value !== SetTok.priid) {
        break;
      }
    } while (--valve);
    assert(valve, `Loop ${VALVE}±1 times`);
    return new Ids(this, tk_a);
  }

  /** Set `newSn_$` */
  #visitDrtSn(): void {
    /*#static*/ if (INOUT) {
      assert(this.drtSn_$);
    }
    if (this.drtSn_$ instanceof FuzykeySeq) {
      this.newSn_$ = this.#pazFuzykeySeq();
    } else if (this.drtSn_$ instanceof QuotkeySeq) {
      this.newSn_$ = this.#pazQuotkeySeq();
    } else if (this.drtSn_$ instanceof Key) {
      this.newSn_$ = this.#pazKey();
    } else if (this.drtSn_$ instanceof Ids) {
      this.newSn_$ = this.#pazIds();
    } else if (this.drtSn_$ instanceof Rel) {
      const snt = this.#pazRelKeyIds();
      if (snt instanceof Token) this.newSn_$ = undefined;
      else this.newSn_$ = snt;
    } else if (this.drtSn_$ instanceof Set) {
      this.newSn_$ = this._pazSet();
    } else {
      fail("kkkk Not implemented");
    }

    /*#static*/ if (INOUT) {
      assert(this.drtSn_$ !== this.newSn_$);
    }
    this.errSn_ss$.rmv(this.drtSn_$);
  }

  /** @implement */
  protected paz_impl$(): void {
    this.#valve = SetPazr.#VALVE;

    if (this.drtSn_$ instanceof BinaryOp) {
      this.enlrgBdriesTo_$(this.drtSn_$.parent!);
      this.forceForw$(); //!
    }

    if (this.drtSn_$) {
      this.#visitDrtSn();
      if (!this.newSn_$ || this.newSn_$.isErr || !this.reachPazBdry$()) {
        this.enlrgBdriesTo_$(this.drtSn_$.parent!);
        this.forceForw$(); //!
        if (this.drtSn_$) this.#visitDrtSn();
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
      this.drtSn_$.parent!.replaceChild(this.drtSn_$, this.newSn_$!);
    } else {
      this.root$ = this.newSn_$!;
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param chk_x */
  #reuseSn(chk_x: (sn_y: SetSn) => boolean): SetSn | undefined {
    let reusdSn;
    //jjjj TOCLEANUP
    // if (opt_x === "any") {
    for (const sn of this.unrelSn_ss_$) {
      if (chk_x(sn) && sn.frstToken_1 === this.strtPazTk$) {
        reusdSn = sn;
        break;
      }
    }
    //jjjj TOCLEANUP
    // } else {
    //   let minDepth;
    //   for (const sn of this.unrelSn_ss_$) {
    //     if (chk_x(sn) && sn.frstToken_1 === this.strtPazTk$) {
    //       const de_ = sn.depth_1;
    //       if (reusdSn) {
    //         if (de_ < minDepth!) {
    //           reusdSn = sn;
    //           minDepth = de_;
    //         }
    //       } else {
    //         reusdSn = sn;
    //         minDepth = de_;
    //       }
    //     }
    //   }
    // }

    if (reusdSn) {
      this.strtPazTk$ = reusdSn.lastToken_1.nextToken_$!;
      this.unrelSn_ss_$.rmv(reusdSn);
      this.reusdSn_ss_$.add(reusdSn);
    }
    return reusdSn?.detach_$().ensureAllBdries();
  }

  /**
   * `out( _x.lhs)`
   * @headconst @param _x
   */
  #pazLhs_impl(_x: PazSetO_): void {
    const reusdSn = this.#reuseSn((sn_y) =>
      sn_y instanceof Set && !(sn_y.unpanenSet instanceof BinaryOp)
    );
    if (reusdSn) {
      _x.lhs = reusdSn as Set;
      return;
    }

    let snt: UnparenSet | SetTk | undefined;
    if (this.strtPazTk$.value === SetTok.paren_open) {
      const tk_0 = this.strtPazTk$;
      do {
        _x.selfParen += 1;
        this.forceForw$();
        if (this.reachPazBdry$()) {
          _x.lhs = Set.create(this, tk_0, 0);
          //jjjj TOCLEANUP
          // _x.lhs.setErr(ErrMsg.set_no_cloz_paren);

          _x.selfParen = 0;
          this.strtPazTk$ = tk_0.nextToken_$!;
          return;
        }
      } while (this.strtPazTk$.value === SetTok.paren_open);
    }

    switch (this.strtPazTk$.value) {
      case SetTok.fuzykey:
      case SetTok.quotkey:
      case SetTok.priid:
      case SetTok.asterisk:
      case SetTok.question:
      case SetTok.joiner:
        snt = this.#pazRelKeyIds();
        break;
      default:
        snt = this.strtPazTk$;
        this.forceForw$();
        break;
    }
    _x.lhs = Set.create(this, snt, _x.selfParen);
    if (this.reachPazBdry$()) {
      if (_x.selfParen) {
        _x.lhs.setErr(ErrMsg.set_no_cloz_paren);
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
    if (_x.lhs!.isErr) this.errSn_ss$.add(_x.lhs!);
    if (this.reachPazBdry$()) return true;

    const p_ = this.#pazClozParen_impl(_x as Required<PazSetO_>);
    if (_x.lhs!.isErr) this.errSn_ss$.add(_x.lhs!);
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
    this.forceForw$();
    let sn_: BinaryOp;
    if (this.reachPazBdry$()) {
      sn_ = new B_x(this, _x.lhs, op_, undefined);
    } else {
      const rhs = this._pazSet({
        oprec: B_x.oprec,
        paren: _x.selfParen,
        selfParen: 0,
      });
      sn_ = new B_x(this, _x.lhs, op_, rhs);
    }
    if (sn_.isErr) this.errSn_ss$.add(sn_);

    _x.lhs = Set.create(this, sn_, _x.selfParen);
    if (this.reachPazBdry$()) {
      if (_x.selfParen) {
        _x.lhs.setErr(ErrMsg.set_no_cloz_paren);
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
    if (_x.lhs.isErr) this.errSn_ss$.add(_x.lhs);
    if (this.reachPazBdry$()) return true;

    const p_ = this.#pazClozParen_impl(_x);
    if (_x.lhs!.isErr) this.errSn_ss$.add(_x.lhs!);
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
      this.forceForw$();
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
      lhs.setErr(ErrMsg.set_no_open_paren);
    }
    if (this.reachPazBdry$()) {
      if (retParen) {
        lhs.paren_$ = lhs.paren + retParen;
        lhs.setErr(ErrMsg.set_no_cloz_paren);
      }
      return undefined;
    }
    return retParen;
  }
}
/*80--------------------------------------------------------------------------*/
