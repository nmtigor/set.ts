/** 80**************************************************************************
 * Ref. [Understanding B-Trees](https://youtu.be/K1a2Bk8NrYQ)
 *
 * @module lib/util/Tree
 * @license MIT
 ******************************************************************************/

import { _TREE } from "../../preNs.ts";
import type { int, uint } from "../alias.ts";
import "../jslang.ts";
import { assert, out } from "../util.ts";
/*80--------------------------------------------------------------------------*/

/** `>=2` */
const Max_ = 4;
const Min_ = Math.floor(Max_ / 2);

type Eval_<T> = (pl_y: T) => boolean;

export type PlRepr = string;
export type TpRepr = TnRepr[];
export type TnRepr = PlRepr | [PlRepr, TpRepr];

export abstract class TreeNode<T> {
  readonly payload: T | undefined;

  /* ctnr */
  /**
   * @package read, write
   * @protected readonly
   */
  ctnr: TreePlat<T> | undefined;

  get parent_$(): TreeNode<T> | undefined {
    return this.ctnr?.host;
  }

  /** @final */
  get inLeaf(): boolean {
    return !!this.ctnr?.isLeaf;
  }
  /* ~ */

  /* plat_$ */
  plat_$: TreePlat<T> | undefined;

  offPlat_$(): TreePlat<T> | undefined {
    const tp_ = this.plat_$;
    if (tp_) {
      tp_.host = undefined;
      this.plat_$ = undefined;
    }
    return tp_;
  }

  /** @headconst @param _x */
  addPlat_$(_x: TreePlat<T>): void {
    /*#static*/ if (_TREE) {
      assert(!this.plat_$);
      assert(!_x.host);
    }
    _x.host = this;
    this.plat_$ = _x;
  }

  /**
   * transfer
   * @headconst @param tgt_x
   */
  // @out((self: TreeNode<T>, _, args) => {
  //   assert(!self.plat_$);
  //   assert(args[0].plat_$);
  // }, _TREE)
  tfrPlat_$(tgtTn_x: TreeNode<T>): void {
    /*#static*/ if (_TREE) {
      assert(this.plat_$);
      assert(!tgtTn_x.plat_$);
    }
    this.plat_$!.host = tgtTn_x;
    tgtTn_x.plat_$ = this.plat_$!;
    this.plat_$ = undefined;
  }

  /**
   * change
   * @headconst @param tp_x
   */
  chgPlat_$(tp_x: TreePlat<T>): void {
    /*#static*/ if (_TREE) {
      assert(this.plat_$);
      assert(!tp_x.host);
    }
    this.plat_$!.host = undefined;
    this.plat_$ = tp_x;
    tp_x.host = this;
  }
  /* ~ */

  /** @final */
  get free(): boolean {
    return !this.ctnr && !this.plat_$;
  }

  /** @const @param pl_x */
  constructor(pl_x?: T) {
    this.payload = pl_x;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  abstract get locIdx_$(): uint;
  abstract get size_1(): uint;

  /**! NOT removed from `ctnr` (if  any) */
  off_$(): TreePlat<T> | undefined {
    const tp_ = this.offPlat_$();
    this.ctnr = undefined;
    return tp_;
  }

  /**
   * transfer
   * @final
   * @headconst @param tgt_x
   * @const @param i_x
   */
  @out((_, ret, args) => {
    assert(ret.free);
    assert(args[0].ctnr);
  }, _TREE)
  tfr_$(tgt_x: TreeNode<T>, i_x: uint): this {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
      assert(tgt_x.free);
    }
    if (this.plat_$) {
      this.tfrPlat_$(tgt_x);
    }
    this.ctnr![i_x] = tgt_x;
    tgt_x.ctnr = this.ctnr;
    this.ctnr = undefined;
    return this;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  get nextUp_$(): PayloadTn<T> | undefined {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    const tp_ = this.ctnr!;
    return this === tp_.at(-1)
      ? this.parent_$?.nextUp_$
      : tp_.plTnAt_$(this.locIdx_$ + 1);
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  abstract get prev(): PayloadTn<T> | undefined;
  abstract get next(): PayloadTn<T> | undefined;

  /** `in( 0 <= i_x && i_x < this.size_1)` */
  /** @const @param i_x */
  abstract get_$(i_x: uint): PayloadTn<T>;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get _depth_(): uint {
    let depth_ = 0;

    const VALVE = 100;
    let valve = VALVE;
    for (let pa = this.parent_$; pa && --valve; pa = pa.parent_$) {
      depth_ += 1;
    }
    assert(valve, `Loop ${VALVE}±1 times`);

    return depth_;
  }

  /**
   * @final
   * @const @param treDepth_x
   */
  _valid_(treDepth_x: uint): boolean {
    return this.plat_$?._valid_(treDepth_x) ?? this._depth_ === treDepth_x;
  }

  abstract get _treRepr_(): TnRepr;
}

export class PayloadTn<T> extends TreeNode<T> {
  declare readonly payload: T;

  /* ctnr */
  createCtnrTp() {
    return new TreePlat<T>(new EmptyTn<T>(), this).init_TreePlat();
  }
  /* ~ */

  /** @const @param pl_x */
  constructor(pl_x: T) {
    super(pl_x);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final @implement */
  @out((self: PayloadTn<T>, ret) => {
    assert(1 <= ret && ret < self.ctnr!.length);
  }, _TREE)
  get locIdx_$(): uint {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    return this.ctnr!.indexOf(this);
  }

  /** @final @implement */
  get size_1(): uint {
    return 1 + (this.plat_$?.size_1 ?? 0);
  }

  /** @final */
  get idx_1(): uint {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    let idx_ = this.ctnr!.idx_1_$;
    for (const tn of this.ctnr!) {
      if (tn === this) break;

      idx_ += tn.size_1;
    }
    return idx_;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @headconst @param retTn_x */
  @out((_, ret) => {
    assert(ret.ctnr);
  }, _TREE)
  insertPrev(retTn_x: PayloadTn<T>): PayloadTn<T> {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
      assert(retTn_x.free);
    }
    if (this.inLeaf) {
      this.ctnr!.insertBefo_$(this.locIdx_$, retTn_x);
    } else {
      this.ctnr![this.locIdx_$ - 1].plat_$!.insertLast_$(retTn_x);
    }
    return retTn_x;
  }

  /** @headconst @param retTn_x */
  @out((_, ret) => {
    assert(ret.ctnr);
  }, _TREE)
  insertNext(retTn_x: PayloadTn<T>): PayloadTn<T> {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
      assert(retTn_x.free);
    }
    if (this.inLeaf) {
      this.ctnr!.insertBefo_$(this.locIdx_$ + 1, retTn_x);
    } else {
      this.plat_$!.insertFrst_$(retTn_x);
    }
    return retTn_x;
  }

  /** @return Removed or not */
  @out((self: PayloadTn<T>, ret) => {
    if (ret) assert(self.free);
    else assert(self.ctnr);
  }, _TREE)
  rmvSelf(): boolean {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    const ctnrTp = this.ctnr!;
    /* Tree MUST have at least one PayloadTn.
     */ if (ctnrTp.isLeaf && !ctnrTp.host && ctnrTp.length === 2) {
      return false;
    }

    const p_: RmvP<T> = {};
    ctnrTp.rmv_$(this.locIdx_$, p_);
    p_.leaf?.adj_$();
    return true;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  get lastDn_$(): PayloadTn<T> {
    return this.plat_$?.last_$ ?? this;
  }

  /** @final @implement */
  get prev(): PayloadTn<T> | undefined {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    let tn_: PayloadTn<T> | undefined;
    const tp_ = this.ctnr!;
    if (this === tp_.locFrst_$) {
      if (this.inLeaf) {
        tn_ = tp_.locZero_$.prev;
      } else {
        tn_ = tp_.locZero_$.plat_$!.last_$;
      }
    } else {
      tn_ = tp_.plTnAt_$(this.locIdx_$ - 1).lastDn_$;
    }
    return tn_;
  }

  /** @final @implement */
  get next(): PayloadTn<T> | undefined {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    return this.inLeaf ? this.nextUp_$ : this.plat_$!.frst_$;
  }

  /** @final @implement */
  get_$(i_x: uint): PayloadTn<T> {
    return i_x === 0 ? this : this.plat_$!.get_$(i_x - 1);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  // /** For testing only */
  // override toString() {
  //   return `pl: ${this.payload}`;
  // }

  /** @final @implement */
  get _treRepr_(): TnRepr {
    return this.inLeaf
      ? `${this.payload}`
      : [`${this.payload}`, this.plat_$!._treRepr_];
  }
}

export class EmptyTn<T> extends TreeNode<T> {
  declare readonly payload: undefined;

  constructor() {
    super();
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final @implement */
  get locIdx_$(): uint {
    return 0;
  }

  /** @final @implement */
  get size_1(): uint {
    return this.plat_$?.size_1 ?? 0;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** @final @implement */
  get prev(): PayloadTn<T> | undefined {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    const pa_ = this.parent_$;
    return pa_ instanceof EmptyTn ? pa_.prev : pa_ as PayloadTn<T> | undefined;
  }

  /** @final @implement */
  get next(): PayloadTn<T> {
    /*#static*/ if (_TREE) {
      assert(this.ctnr);
    }
    return this.inLeaf ? this.ctnr!.locFrst_$ : this.plat_$!.frst_$;
  }

  /** @final @implement */
  get_$(i_x: uint): PayloadTn<T> {
    return this.plat_$!.get_$(i_x);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final @implement */
  get _treRepr_(): TnRepr {
    return this.inLeaf ? "" : ["", this.plat_$!._treRepr_];
  }
}
/*64----------------------------------------------------------*/

type RmvP<T> = {
  leaf?: TreePlat<T>;
};

export class TreePlat<T> extends Array<TreeNode<T>> {
  /**
   * @package read, write
   * @protected readonly
   */
  host: TreeNode<T> | undefined;
  // /** @final */
  // get isRoot() {
  //   return !this.host;
  // }

  /** @final */
  get isLeaf() {
    return !this[0].plat_$;
  }

  /** @final */
  get over(): boolean {
    return this.length > Max_ + 1;
  }
  /** @final */
  get full(): boolean {
    return this.length === Max_ + 1;
  }
  /** @final */
  get locValid(): boolean {
    return this.every((tn_y, i_y) =>
      i_y === 0 ? tn_y instanceof EmptyTn : tn_y instanceof PayloadTn
    ) &&
      ((Min_ + 1 <= this.length || !this.host) && this.length <= Max_ + 1);
  }
  /**
   * deflated
   * @final
   */
  get defl(): boolean {
    return this.length === Min_ + 1;
  }
  /** @final */
  get undr(): boolean {
    return this.length < Min_ + 1;
  }

  get locZero_$(): EmptyTn<T> {
    return this[0] as EmptyTn<T>;
  }
  get locFrst_$(): PayloadTn<T> {
    return this[1] as PayloadTn<T>;
  }
  get locLast_$(): PayloadTn<T> {
    return this.at(-1) as PayloadTn<T>;
  }
  /**
   * `in( 1 <= i_x && i_x < this.length)`
   * @const @param i_x
   */
  plTnAt_$(i_x: uint): PayloadTn<T> {
    return this[i_x] as PayloadTn<T>;
  }

  // get locMidl_$(): PayloadTn<T> {
  //   /*#static*/ if (_TREE) {
  //     assert(this.full || this.over);
  //   }
  //   return this[Min_ + 1] as PayloadTn<T>;
  // }
  // get locMidlNext_$(): PayloadTn<T> {
  //   /*#static*/ if (_TREE) {
  //     assert(this.full || this.over);
  //   }
  //   return this[Min_ + 2] as PayloadTn<T>;
  // }

  get frst_$(): PayloadTn<T> {
    return this.locZero_$.next;
  }
  get last_$(): PayloadTn<T> {
    return this.locLast_$.lastDn_$;
  }

  protected size$: uint | -1 = -1;
  invSize_$(): void {
    if (this.size$ < 0) return;

    this.size$ = -1;
    this.host?.ctnr?.invSize_$();
  }

  /* tree_$ */
  tree_$?: Tree<T>;
  // get tree_1(): Tree<T> {
  //   let tp_: TreePlat<T> = this;
  //   const VALVE = 100;
  //   let valve = VALVE;
  //   for (; !tp_.tree_$ && --valve; tp_ = tp_.host!.ctnr!);
  //   assert(valve, `Loop ${VALVE}±1 times`);
  //   return tp_.tree_$!;
  // }

  /**
   * transfer
   * @headconst @param tgt_x
   */
  @out((self: TreePlat<T>, _, args) => {
    assert(!self.tree_$);
    assert(args[0].tree_$);
  }, _TREE)
  tfrTree_$(tgt_x: TreePlat<T>): void {
    /*#static*/ if (_TREE) {
      assert(this.tree_$);
      assert(!tgt_x.host && !tgt_x.tree_$);
    }
    this.tree_$!.root_$ = tgt_x;
    tgt_x.tree_$ = this.tree_$!;
    delete this.tree_$;
  }
  /* ~ */

  /*! Do not modify `Array.constructor()`, because it will be called implicitly
  by `splice()`, etc. */
  constructor(...args: any[]) {
    super(...args);
  }

  #inited_TreePlat = false;
  init_TreePlat(): this {
    /*#static*/ if (_TREE) {
      assert(!this.#inited_TreePlat);
      assert(
        this.length === 2 &&
          this[0] instanceof EmptyTn &&
          this[1] instanceof PayloadTn,
      );
    }
    this[0].ctnr = this;
    this[1].ctnr = this;

    this.#inited_TreePlat = true;
    return this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get size_1(): uint {
    let size_ = this.size$;
    if (size_ >= 0) return size_;

    size_ = 0;
    if (this.isLeaf) {
      size_ += this.length - 1;
    } else {
      for (const tn of this) size_ += tn.size_1;
    }
    return this.size$ = size_;
  }

  get idx_1_$(): uint {
    if (!this.host) return 0;

    let idx_: uint;
    if (this.host instanceof PayloadTn) {
      idx_ = this.host.idx_1 + 1;
    } else {
      idx_ = this.host.ctnr!.idx_1_$;
    }
    return idx_;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * downwards
   * @headconst @param retTn_x
   */
  insertFrst_$(retTn_x: PayloadTn<T>): void {
    if (this.isLeaf) {
      this.insertBefo_$(1, retTn_x);
    } else {
      this[0].plat_$!.insertFrst_$(retTn_x);
    }
  }
  /**
   * downwards
   * @headconst @param retTn_x
   */
  insertLast_$(retTn_x: PayloadTn<T>): void {
    if (this.isLeaf) {
      this.insertBefo_$(this.length, retTn_x);
    } else {
      this.at(-1)!.plat_$!.insertLast_$(retTn_x);
    }
  }

  /**
   * upwards
   * @const @param i_x
   * @headconst @param tn_x
   */
  @out((self: TreePlat<T>) => {
    assert(self.locValid);
  }, _TREE)
  insertBefo_$(i_x: uint, tn_x: PayloadTn<T>): void {
    /*#static*/ if (_TREE) {
      assert(1 <= i_x && i_x <= this.length);
      assert(!tn_x.ctnr);
    }
    this.splice(i_x, 0, tn_x);
    this.invSize_$();
    tn_x.ctnr = this;
    if (!this.over) return;

    const tn_1 = this.plTnAt_$(Min_ + 2);
    tn_1.ctnr = undefined;
    const tp_1 = tn_1.createCtnrTp();
    for (let j = Min_ + 3; j < this.length; j++) {
      tp_1.push(this[j]);
      this[j].ctnr = tp_1;
    }

    const tn_0 = this.plTnAt_$(Min_ + 1);
    tn_0.ctnr = undefined;
    if (tn_0.plat_$) {
      tn_0.tfrPlat_$(tp_1.locZero_$);
    }
    tn_0.addPlat_$(tp_1);

    let tp_0: TreePlat<T>;
    if (this.host) {
      tp_0 = this.host.ctnr!;
      tp_0.insertBefo_$(this.host.locIdx_$ + 1, tn_0);
    } else {
      /*#static*/ if (_TREE) {
        assert(this.tree_$);
      }
      tp_0 = tn_0.createCtnrTp();
      tp_0.locZero_$.addPlat_$(this);
      this.tfrTree_$(tp_0);
    }

    this.length = Min_ + 1;
  }

  /**
   * downwards
   * @out @param rmvP_x
   */
  #rmvFrst(rmvP_x: RmvP<T>): PayloadTn<T> {
    if (!this.isLeaf) {
      return this.locZero_$.plat_$!.#rmvFrst(rmvP_x);
    }

    const retTn = this.locFrst_$;
    if (this.host && this.defl) {
      rmvP_x.leaf = this;
    }
    this.splice(1, 1);
    this.invSize_$();
    retTn.ctnr = undefined;
    return retTn;
  }
  /**
   * downwards
   * @out @param rmvP_x
   */
  #rmvLast(rmvP_x: RmvP<T>): PayloadTn<T> {
    const tn_ = this.locLast_$;
    if (!this.isLeaf) return tn_.plat_$!.#rmvLast(rmvP_x);

    if (this.host && this.defl) {
      rmvP_x.leaf = this;
    }
    this.pop();
    this.invSize_$();
    tn_.ctnr = undefined;
    return tn_;
  }

  /**
   * downwards
   * @const @param i_x
   * @out @param rmvP_x
   */
  @out((_, ret) => {
    assert(ret.free);
  }, _TREE)
  rmv_$(i_x: uint, rmvP_x: RmvP<T>): PayloadTn<T> {
    /*#static*/ if (_TREE) {
      assert(1 <= i_x && i_x < this.length);
    }
    const retTn = this.plTnAt_$(i_x);
    if (this.isLeaf) {
      if (this.host && this.defl) {
        rmvP_x.leaf = this;
      }
      this.splice(i_x, 1);
      this.invSize_$();
      retTn.ctnr = undefined;
      return retTn;
    }

    const leftTp = this[i_x - 1].plat_$!;
    const rigtTp = this[i_x].plat_$!;
    let tn_: PayloadTn<T>;
    if (rigtTp.length >= leftTp.length) {
      tn_ = rigtTp.#rmvFrst(rmvP_x);
    } else {
      tn_ = leftTp.#rmvLast(rmvP_x);
    }
    retTn.tfr_$(tn_, i_x);

    return retTn;
  }

  /** upwards */
  @out((self: TreePlat<T>) => {
    assert(self.locValid);
  }, _TREE)
  adj_$() {
    /*#static*/ if (_TREE) {
      assert(this.host?.ctnr);
      assert(this.undr);
    }
    const tp_0 = this.host!.ctnr!;
    const i_0 = this.host!.locIdx_$;
    const leftTp = i_0 > 0 ? tp_0[i_0 - 1].plat_$! : undefined;
    const rigtTp = tp_0.at(i_0 + 1)?.plat_$;
    /*#static*/ if (_TREE) {
      assert(leftTp || rigtTp);
    }
    let tp_1: TreePlat<T>;
    if (rigtTp && !rigtTp.defl) {
      tp_1 = (!leftTp || leftTp.length <= rigtTp.length) ? rigtTp : leftTp;
    } else {
      tp_1 = leftTp ?? rigtTp!;
    }
    if (tp_1.defl) {
      let tn_1: TreeNode<T>;
      if (tp_1 === leftTp) {
        tn_1 = tp_0[i_0];
        tn_1.off_$();
        tp_0[i_0 - 1].chgPlat_$(this); //!
        tp_0.splice(i_0, 1);
        tp_0.invSize_$();
        this.splice(1, 0, ...tp_1.slice(1), tn_1);
        this.invSize_$();
        for (let i = 1; i < tp_1.length; i++) {
          tp_1[i].ctnr = this;
        }
        tn_1.ctnr = this;
        if (!this.isLeaf) {
          this.locZero_$.tfrPlat_$(tn_1);
          tp_1.locZero_$.tfrPlat_$(this.locZero_$);
        }
      } else {
        tn_1 = tp_0[i_0 + 1];
        tn_1.off_$();
        tp_0.splice(i_0 + 1, 1);
        tp_0.invSize_$();
        this.push(tn_1, ...tp_1.slice(1));
        this.invSize_$();
        tn_1.ctnr = this;
        for (let i = 1; i < tp_1.length; i++) {
          tp_1[i].ctnr = this;
        }
        if (!this.isLeaf) {
          tp_1.locZero_$.tfrPlat_$(tn_1);
        }
      }
      if (tp_0.undr) {
        if (tp_0.host) {
          tp_0.adj_$();
        } else if (tp_0.length === 1) {
          this.host = undefined;
          tp_0.tfrTree_$(this);
        }
      }
    } else {
      let tn_0: PayloadTn<T>,
        tn_1: TreeNode<T>,
        tp_2: TreePlat<T> | undefined;
      if (tp_1 === leftTp) {
        tn_0 = tp_1.locLast_$;
        tp_2 = tn_0.off_$();
        tp_1.pop();
        tp_1.invSize_$();
        tn_1 = tp_0[i_0].tfr_$(tn_0, i_0);
        this.splice(1, 0, tn_1);
        this.invSize_$;
        tn_1.ctnr = this;
        if (tp_2) {
          this.locZero_$.tfrPlat_$(tn_1);
          this.locZero_$.addPlat_$(tp_2);
        }
      } else {
        tn_0 = tp_1.locFrst_$;
        tp_2 = tn_0.off_$();
        tp_1.splice(1, 1);
        tp_1.invSize_$();
        tn_1 = tp_0[i_0 + 1].tfr_$(tn_0, i_0 + 1);
        this.push(tn_1);
        this.invSize_$();
        tn_1.ctnr = this;
        if (tp_2) {
          tp_1.locZero_$.tfrPlat_$(tn_1);
          tp_1.locZero_$.addPlat_$(tp_2);
        }
      }
    }
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /** `in( 0 <= i_x && i_x < this.size_1)` */
  get_$(i_x: uint): PayloadTn<T> {
    let tn_: PayloadTn<T>;
    for (const tn of this) {
      if (i_x < tn.size_1) {
        tn_ = tn.get_$(i_x);
        break;
      }

      i_x -= tn.size_1;
    }
    return tn_!;
  }

  /**
   * @final
   * @const
   * @headconst @param fn_x
   */
  getMin_$(fn_x: Eval_<T>): T | undefined {
    let ret = undefined;
    let i_ = this.length;
    for (; i_-- > 1;) {
      const pl_ = this.plTnAt_$(i_).payload;
      if (fn_x(pl_)) ret = pl_;
      else break;
    }
    return ret
      ? (this[i_].plat_$?.getMin_$(fn_x) ?? ret)
      : this[i_].plat_$?.getMin_$(fn_x);
  }
  /**
   * @final
   * @const
   * @headconst @param fn_x
   */
  getMax_$(fn_x: Eval_<T>): T | undefined {
    let ret = undefined;
    let i_ = 1;
    for (; i_ < this.length; i_++) {
      const pl_ = this.plTnAt_$(i_).payload;
      if (fn_x(pl_)) ret = pl_;
      else break;
    }
    return ret
      ? (this[i_ - 1].plat_$?.getMax_$(fn_x) ?? ret)
      : this[i_ - 1].plat_$?.getMax_$(fn_x);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @const @param treDepth_x
   */
  _valid_(treDepth_x: uint): boolean {
    return this.locValid && this.every((tn) => tn._valid_(treDepth_x));
  }

  //jjjj TOCLEANUP
  // /** For testing only */
  // override toString() {
  //   return `${this.constructor.name}[${this.length - 1}]: ${this.last_$}`;
  // }

  get _treRepr_(): TpRepr {
    /* Strangely, `this.map()` will call `TreePlat.constructor()` for each `tn`. */
    // return this.map((tn) => tn._treRepr_);
    return Array.from(this, (tn) => tn._treRepr_);
  }
}
/*64----------------------------------------------------------*/

/** MUST contain at least one TreeNode */
export class Tree<T> {
  root_$: TreePlat<T>;

  /** @headconst @param rootTp_x */
  constructor(rootTp_x: TreePlat<T>) {
    this.root_$ = rootTp_x;
    this.root_$.tree_$ = this;
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get size_1(): uint {
    return this.root_$.size_1;
  }
  /*49|||||||||||||||||||||||||||||||||||||||||||*/

  /**
   * @final
   * @const @param i_x
   */
  get(i_x: int): PayloadTn<T> {
    const i_ = i_x < 0 ? this.size_1 + i_x : i_x;
    return this.root_$.get_$(
      Math.clamp(0, i_, this.size_1 - 1),
    );
  }

  /**
   * @final
   * @const
   * @headconst @param fn_x
   */
  getMin(fn_x: Eval_<T>): T | undefined {
    return this.root_$.getMin_$(fn_x);
  }

  /**
   * @final
   * @const
   * @headconst @param fn_x
   */
  getMax(fn_x: Eval_<T>): T | undefined {
    return this.root_$.getMax_$(fn_x);
  }
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /** @final */
  get _depth_(): uint {
    let depth_ = 0;

    const VALVE = 100;
    let valve = VALVE;
    for (let tp_ = this.root_$[0].plat_$; tp_ && --valve; tp_ = tp_[0].plat_$) {
      depth_ += 1;
    }
    assert(valve, `Loop ${VALVE}±1 times`);

    return depth_;
  }

  /** @final */
  get _valid_(): boolean {
    return this.root_$._valid_(this._depth_);
  }

  /** @final */
  get _treRepr_(): TpRepr {
    return this.root_$._treRepr_;
  }

  /** @final */
  get _seqRepr_(): PlRepr[] {
    const ret: PlRepr[] = [];

    let tn_: PayloadTn<T> | undefined = this.root_$.frst_$;
    const VALVE = this.size_1 * 2;
    let valve = VALVE;
    while (tn_ && --valve) {
      ret.push(`${tn_.payload}`);
      tn_ = tn_.next;
    }
    assert(valve, `Loop ${VALVE}±1 times`);

    return ret;
  }

  /** @final */
  get _revRepr_(): PlRepr[] {
    const ret: PlRepr[] = [];

    let tn_: PayloadTn<T> | undefined = this.root_$.last_$;
    const VALVE = this.size_1 * 2;
    let valve = VALVE;
    while (tn_ && --valve) {
      ret.push(`${tn_.payload}`);
      tn_ = tn_.prev;
    }
    assert(valve, `Loop ${VALVE}±1 times`);

    return ret;
  }
}
/*80--------------------------------------------------------------------------*/
