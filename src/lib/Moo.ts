/** 80**************************************************************************
 * @module lib/Moo
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../global.ts";
import type { id_t, int, Runr as IRunr } from "./alias.ts";
import { assert } from "./util/trace.ts";
/*80--------------------------------------------------------------------------*/

export type MooEq<T extends {} | null> = (a: T, b: T) => boolean;
export type MooHandler<T extends {} | null, D = any, I = any> = (
  newval: T,
  oldval: T,
  data?: D,
  info?: I,
) => void;

// type IndexedMooHandler< T > = [ uint, MooHandler<T> ];
// type SortedIndexedMooHandler< T > = SortedArray< IndexedMooHandler<T> >;
interface MooHandlerExt<T extends {} | null, D = any, I = any> {
  handler: MooHandler<T, D, I>;
  match_newval: T | undefined;
  match_oldval: T | undefined;
  forcing: boolean;
  index: number;
}
/**
 * primaryconst: const exclude elements of `#_a`
 * @final
 */
class MooHandlerDB<T extends {} | null, D = any, I = any> {
  readonly #eq: MooEq<T>;

  /**
   * Soted by `index_x` ascendingly
   * Same `index_x` elements are sorted by their adding order.
   */
  readonly #_a: MooHandlerExt<T, D, I>[] = [];
  get len() {
    return this.#_a.length;
  }

  #nforce = 0;
  get forcing_$() {
    return this.#nforce > 0;
  }

  /** @headconst @param eq_x */
  constructor(eq_x: MooEq<T>) {
    this.#eq = eq_x;
  }

  /**
   * @headconst @param h_x
   * @headconst @param match_n_x
   * @headconst @param match_o_x
   * @const @param force_x
   * @const @param index_x [FrstCb_i, LastCb_i]
   * @return `true` if added, `false` if not.
   */
  add(
    h_x: MooHandler<T, D, I>,
    match_n_x?: T,
    match_o_x?: T,
    forcing_x = false,
    index_x = 0,
  ) {
    if (this.#_a.some((_y) => _y.handler === h_x)) return false;

    if (forcing_x) ++this.#nforce;

    let i = this.#_a.findIndex((ext_y) => index_x < ext_y.index);
    if (i < 0) i = this.#_a.length;
    this.#_a.splice(i, 0, {
      handler: h_x,
      match_newval: match_n_x,
      match_oldval: match_o_x,
      forcing: forcing_x,
      index: index_x,
    });
    this.#got.length = 0; //!
    return true;
  }

  /** @primaryconst */
  #strict_eq(v0_x: T | undefined, v1_x: T | undefined) {
    return v0_x === undefined && v1_x === undefined ||
      v0_x !== undefined && v1_x !== undefined && this.#eq(v0_x, v1_x);
  }

  /**
   * @headconst @param h_x
   * @headconst @param match_n_x
   * @headconst @param match_o_x
   * @return `true` if deleted, `false` if not
   */
  del(h_x: MooHandler<T, D, I>, match_n_x?: T, match_o_x?: T) {
    const i = this.#_a.findIndex((ext) => ext.handler === h_x);
    if (i < 0) return false;

    const toDel = this.#_a[i];
    const del_ = this.#strict_eq(toDel.match_newval, match_n_x) &&
      this.#strict_eq(toDel.match_oldval, match_o_x);
    if (del_) {
      if (toDel.forcing) --this.#nforce;

      this.#_a.splice(i, 1);
      this.#got.length = 0; //!
    }
    return del_;
  }

  /** @primaryconst */
  #match(v0_x: T | undefined, v1_x: T) {
    return v0_x === undefined || this.#eq(v0_x, v1_x);
  }

  #newval: T | undefined;
  #oldval: T | undefined;
  #gforce: boolean | undefined;
  #got: MooHandler<T, D, I>[] = [];
  /** Get a sub-array of `#_a` */
  get(n_x: T, o_x: T, gforce_x: boolean): MooHandler<T, D, I>[] {
    if (
      this.#got.length &&
      this.#newval !== undefined && this.#eq(this.#newval, n_x) &&
      this.#oldval !== undefined && this.#eq(this.#oldval, o_x) &&
      this.#gforce === gforce_x
    ) {
      return this.#got;
    }

    this.#newval = n_x;
    this.#oldval = o_x;
    this.#gforce = gforce_x;
    this.#got.length = 0;

    const changed_ = !this.#eq(n_x, o_x);
    this.#_a.forEach((ext) => {
      if (
        this.#match(ext.match_newval, n_x) &&
        this.#match(ext.match_oldval, o_x) &&
        (changed_ || gforce_x || ext.forcing)
      ) {
        this.#got.push(ext.handler);
      }
    });
    return this.#got;
  }

  clear() {
    this.#_a.length = 0;
    this.#got.length = 0;
    this.#nforce = 0;
  }
}

type MooCtorP_<T extends {} | null, I = any> = {
  val: T;
  eq_?: MooEq<T>;
  info?: I | undefined;
  active?: boolean;
  forcing?: boolean;
  _name_?: string;
};

export const FrstCb_i = -100;
export const LastCb_i = 100;

type RegistHandlerO_<T extends {} | null> = {
  /** Match new value */
  n?: T | undefined;
  /** Match old value */
  o?: T | undefined;
  /** Forcing or not */
  f?: boolean | undefined;
  /** Inddex [FrstCb_i, LastCb_i] */
  i?: int;
};

type RemoveHandlerO_<T extends {} | null> = {
  /** Match new value */
  n?: T | undefined;
  /** Match old value */
  o?: T | undefined;
};

type OnO_ = {
  /** Forcing or not */
  f?: boolean | undefined;
  /** Inddex [FrstCb_i, LastCb_i] */
  i?: int;
};

/**
 * `Moo` instance concerns about one value, whether it changes or not.\
 * `Moo` instance stores many callbacks.
 */
export class Moo<T extends {} | null, D = any, I = any> {
  static #ID = 0 as id_t;
  readonly id = ++Moo.#ID as id_t;
  readonly _name_: string | undefined;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  readonly #initval: T;
  readonly #eq: MooEq<T>;
  readonly #active: boolean;
  readonly #forcing: boolean;

  #val!: T;
  get val() {
    return this.#val;
  }

  #oldval!: T;
  #newval!: T;
  get newval() {
    return this.#newval;
  }

  #handler_db_: MooHandlerDB<T, D> | undefined;
  get #handler_db() {
    return this.#handler_db_ ??= new MooHandlerDB<T, D, I>(this.#eq);
  }
  get nCb() {
    return this.#handler_db_ ? this.#handler_db_.len : 0;
  }

  #forcingOnce = false;
  set forceOnce(forcing_x: boolean) {
    this.#forcingOnce = forcing_x;
  }
  force(): this {
    this.#forcingOnce = true;
    return this;
  }

  get #forcing_() {
    return this.#forcing || this.#forcingOnce;
  }

  #data: D | undefined;
  set data(data_x: D) {
    // // #if INOUT
    //   assert( this.#data === undefined );
    // // #endif
    this.#data = data_x;
  }
  setData(data_x: D): this {
    this.#data = data_x;
    return this;
  }

  readonly #info;

  constructor({
    val,
    eq_ = (a: T, b: T) => a === b,
    info,
    active = false,
    forcing = false,
    _name_,
  }: MooCtorP_<T, I>) {
    this.#initval = val;
    this.#eq = eq_;
    this.#info = info;
    this.#active = active;
    this.#forcing = forcing;
    this._name_ = _name_;

    this.reset_Moo();
  }

  /**
   * Not invoking any callbacks
   * @final
   */
  setMoo(val: T): this {
    this.#val = this.#newval = val;
    return this;
  }

  /** @final */
  reset_Moo(): this {
    this.setMoo(this.#initval);
    if (this.nCb) {
      this.#handler_db_ = undefined;
      //! Do not `#handler_db_.clear()` because `#handler_db_` could be shared.
      // this.#handler_db_.clear();
    }
    this.#forcingOnce = this.#forcing;
    return this;
  }

  /**
   * Small index callbacks will be called first
   * Same index callbacks will be called by adding order
   * @final
   */
  registHandler(
    h_x: MooHandler<T, D, I>,
    { n, o, f, i = 0 } = {} as RegistHandlerO_<T>,
  ) {
    /*#static*/ if (INOUT) {
      assert(FrstCb_i <= i && i <= LastCb_i);
    }
    this.#handler_db.add(h_x, n, o, f, i);
    // console.log( `this.#handler_db.size=${this.#handler_db.size}` );
  }
  /** @final */
  removeHandler(h_x: MooHandler<T, D, I>, { n, o } = {} as RemoveHandlerO_<T>) {
    this.#handler_db.del(h_x, n, o);
    // console.log( `this.#handler_db.size=${this.#handler_db.size}` );
  }
  /**
   * @final
   * @headconst @param h_x
   * @h2ndconst @param o_x
   */
  registOnceHandler(h_x: MooHandler<T, D, I>, o_x?: RegistHandlerO_<T>) {
    const wrap_ = (n_y: T, o_y: T, d_y?: D) => {
      h_x(n_y, o_y, d_y);
      this.removeHandler(wrap_, o_x);
    };
    this.registHandler(wrap_, o_x);
  }

  /**
   * Force `match_n_x`, ignore `match_o_x`
   * @final
   */
  on(n_x: T, h_x: MooHandler<T, D, I>, { f, i = 0 } = {} as OnO_) {
    this.registHandler(h_x, { n: n_x, f, i });
  }
  /**
   * Force `match_n_x`, ignore `match_o_x`
   * @final
   */
  off(n_x: T, h_x: MooHandler<T, D, I>) {
    this.removeHandler(h_x, { n: n_x });
  }
  /**
   * Force `match_n_x`, ignore `match_o_x`
   * @final
   */
  once(n_x: T, h_x: MooHandler<T, D, I>, { f, i = 0 } = {} as OnO_) {
    this.registOnceHandler(h_x, { n: n_x, f, i });
  }

  static _count = 0;
  /** @primaryconst @param n_x only potentially changed by  `#eq` */
  set val(n_x: T) {
    if (
      this.#eq(n_x, this.#val) &&
      !this.#forcing_ &&
      !this.#handler_db.forcing_$
    ) {
      return;
    }

    this.#oldval = this.#val;
    this.#newval = n_x;
    if (this.#active) this.#val = n_x;
    this.#handler_db.get(n_x, this.#oldval, this.#forcing_)
      .forEach((h_y) => {
        h_y(n_x, this.#oldval, this.#data, this.#info);
        // /*#static*/ if (DEV) Moo._count += 1;
      });
    this.#val = n_x;
    this.#forcingOnce = this.#forcing;
    this.#data = undefined; // it is used once

    // if( this.once_ ) this.#handler_db.clear();

    // /*#static*/ if (DEV) {
    //   console.log(
    //     `[${this._name_ ?? `Moo_${this.id}`}]\t\tMoo._count = ${Moo._count}`,
    //   );
    // }
  }

  refreshMoo() {
    this.force().val = this.#val;
  }

  shareHandlerTo(rhs: Moo<T, D, I>) {
    /*#static*/ if (INOUT) {
      assert(rhs.nCb === 0 || rhs.#handler_db_ === this.#handler_db_);
    }
    // console.log( rhs.#handler_db );
    rhs.#handler_db_ = this.#handler_db_;
  }
}
// new Moo(undefined); // error
// new Moo(null); // ok
// new Moo(2); // ok
/*80--------------------------------------------------------------------------*/

/** @final */
export class Runr<D = any, I = any> implements IRunr {
  #_mo = new Moo<boolean, D, I>({ val: true, forcing: true });

  set data(data_x: D) {
    this.#_mo.data = data_x;
  }

  add(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.on(true, _x);
  }

  del(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.off(true, _x);
  }

  /** @implement */
  run() {
    this.#_mo.val = true;
  }
}

/** @final */
export class Boor<D = any, I = any> {
  #_mo;
  get val() {
    return this.#_mo.val;
  }
  force(): this {
    this.#_mo.force();
    return this;
  }
  set val(_x: boolean) {
    this.#_mo.val = _x;
  }
  tru() {
    this.#_mo.val = true;
  }
  fos() {
    this.#_mo.val = false;
  }

  set data(data_x: D) {
    this.#_mo.data = data_x;
  }

  constructor(forcing = false, info?: I) {
    this.#_mo = new Moo<boolean, D, I>({ val: false, info, forcing });
  }

  onTru(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.on(true, _x);
  }
  offTru(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.off(true, _x);
  }

  onFos(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.on(false, _x);
  }
  offFos(_x: (n_y: boolean, o_y: boolean, d_y?: D, i_y?: I) => void) {
    this.#_mo.off(false, _x);
  }
}
/*80--------------------------------------------------------------------------*/
