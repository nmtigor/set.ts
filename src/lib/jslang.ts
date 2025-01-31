/** 80**************************************************************************
 * @module lib/jslang
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../global.ts";
import type {
  AbstractConstructor,
  Brand,
  Constructor,
  FloatArray,
  Func,
  IntegerArray,
  ts_t,
  uint,
  uint8,
} from "./alias.ts";
import { int } from "./alias.ts";
import { assert } from "./util/trace.ts";
/*80--------------------------------------------------------------------------*/

declare global {
  /* Ref. https://github.com/microsoft/TypeScript/issues/44253#issuecomment-1199936073 */
  interface ObjectConstructor {
    /**
     * Determines whether an object has a property with the specified name.
     * @param o An object.
     * @param v A property name.
     */
    hasOwn<T extends PropertyKey>(
      o: Readonly<Record<T, unknown>>,
      v: unknown,
    ): v is T;

    hasOwn(o: object, v: PropertyKey): boolean;
  }
}

/**
 * Ref. https://lodash.com/docs/4.17.15#isObjectLike
 */
/* jjjj How `value is object` work with `int`, etc (see lib/alias)? But writing
function contents directly works! It has no influences on runtime! */
// export function isObjectLike(value: unknown): value is object {
export function isObjectLike(value: unknown): boolean {
  return value != null && typeof value === "object";
}

let valve_ = 0;
/**
 * ! Compare deeply Object, Array only.
 * ! Compare enumerable own string-properties only.
 *
 * @headconst @param lhs_x
 * @headconst @param rhs_x
 */
function eq_impl(lhs_x: unknown, rhs_x: unknown): boolean {
  /*#static*/ if (INOUT) {
    assert(valve_--, "There is element referencing its ancestor.");
  }
  if (
    lhs_x === rhs_x ||
    Number.isNaN(lhs_x) && Number.isNaN(rhs_x) //! Notice, `NaN === NaN` is false.
  ) {
    return true;
  }

  if (Array.isArray(lhs_x)) {
    if (!Array.isArray(rhs_x)) return false;

    if (lhs_x.length !== rhs_x.length) return false;
    if (!lhs_x.length && !rhs_x.length) return true;

    for (let i = lhs_x.length; i--;) {
      if (!eq_impl(lhs_x[i], rhs_x[i])) {
        return false;
      }
    }
    return true;
  }

  if (
    lhs_x instanceof Int8Array ||
    lhs_x instanceof Uint8Array ||
    lhs_x instanceof Uint8ClampedArray ||
    lhs_x instanceof Int16Array ||
    lhs_x instanceof Uint16Array ||
    lhs_x instanceof Int32Array ||
    lhs_x instanceof Uint32Array ||
    lhs_x instanceof Float32Array ||
    lhs_x instanceof Float64Array
  ) {
    return lhs_x.eq(rhs_x);
  }

  if (isObjectLike(lhs_x)) {
    if (!isObjectLike(rhs_x) || Array.isArray(rhs_x)) return false;

    const keys_lhs = Object.keys(lhs_x as object);
    const keys_rhs = Object.keys(rhs_x as object);
    if (keys_lhs.length !== keys_rhs.length) return false;
    if (!keys_lhs.length && !keys_rhs.length) return true;

    for (const key of keys_lhs) {
      if (
        !Object.hasOwn(rhs_x as object, key) ||
        !eq_impl((lhs_x as object)[key], (rhs_x as object)[key])
      ) {
        return false;
      }
    }
    return true;
  }

  return false;
}
export function eq(lhs_x: unknown, rhs_x: unknown, valve_x = 100): boolean {
  valve_ = valve_x;
  return eq_impl(lhs_x, rhs_x);
}

declare global {
  interface Object {
    eq(rhs_x: unknown, valve_x?: uint): boolean;
  }
}

/**
 * @headconst @param rhs
 * @const @param valve_x
 */
Reflect.defineProperty(Object.prototype, "eq", {
  value(this: Object, rhs_x: unknown, valve_x = 100) {
    valve_ = valve_x;
    return eq_impl(this, rhs_x);
  },
});

// Reflect.defineProperty( Object.prototype, "_toString_eq", {
//   enumerable: false,
//   value: function( rhs_x:string )
//   {
//     console.assert( this.toString() === rhs_x );
//     return this;
//   }
// })
/*80--------------------------------------------------------------------------*/

declare global {
  //! Make sure non-`enumerable`
  interface Array<T> {
    /** @const @param ary_x */
    become_Array(ary_x: T[]): this;
    /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

    /**
     * @headconst @param rhs
     * @const @param valve_x
     */
    eq(rhs_x: unknown, valve_x?: uint): boolean;

    /** @const @param ary_x */
    fillArray(ary_x: T[]): this;
    /** @const @param ary_x */
    fillArrayBack(ary_x: T[]): this;

    swap(i_x: uint, j_x: uint): this;
  }

  // interface ArrayConstructor {
  //   /**
  //    * Creates an array from an async iterable, iterable, or array-like object.
  //    * @param iterable An async iterable, iterable, or array-like object to convert to an array.
  //    */
  //   fromAsync<T>(iterable: AsyncIterable<T> | Iterable<T> | ArrayLike<T>): T[];

  //   /**
  //    * Creates an array from an async iterable, iterable, or array-like object.
  //    * @param iterable An async iterable, iterable, or array-like object to convert to an array.
  //    * @param mapfn A mapping function to call on every element of the array.
  //    * @param thisArg Value of 'this' used to invoke the mapfn.
  //    */
  //   fromAsync<T, U>(
  //     iterable: AsyncIterable<T> | Iterable<T> | ArrayLike<T>,
  //     mapfn: (v: T, k: number) => U,
  //     thisArg?: any,
  //   ): U[];
  // }
}

Reflect.defineProperty(Array.prototype, "become_Array", {
  value(this: any[], ary_x: any[]) {
    this.length = ary_x.length;
    return this.fillArrayBack(ary_x);
  },
});

Reflect.defineProperty(Array.prototype, "eq", {
  value(this: any[], rhs_x: unknown, valve_x = 100) {
    valve_ = valve_x;
    return eq_impl(this, rhs_x);
  },
});

Reflect.defineProperty(Array.prototype, "fillArray", {
  value(this: any[], ary_x: any[]) {
    /*#static*/ if (INOUT) {
      assert(ary_x.length <= this.length);
    }
    for (let i = 0, LEN = this.length; i < LEN; ++i) {
      this[i] = ary_x[i];
    }
    return this;
  },
});
Reflect.defineProperty(Array.prototype, "fillArrayBack", {
  value(this: any[], ary_x: any[]) {
    /*#static*/ if (INOUT) {
      assert(ary_x.length <= this.length);
    }
    for (let i = this.length; i--;) {
      this[i] = ary_x[i];
    }
    return this;
  },
});

Reflect.defineProperty(Array.prototype, "swap", {
  value(this: any[], i_x: uint, j_x: uint) {
    const t_ = this[j_x];
    this[j_x] = this[i_x];
    this[i_x] = t_;
    return this;
  },
});
/*80--------------------------------------------------------------------------*/

declare global {
  interface Number {
    /**
     * `in( 0 <= digits && digits <= 20 )`
     */
    fixTo(digits?: uint8): number;

    reprRatio(fixTo_x?: uint8): string;
  }

  interface NumberConstructor {
    apxE(f0: number, f1: number): boolean;
    apxS(f0: number, f1: number): boolean;
    apxSE(f0: number, f1: number): boolean;
    apxG(f0: number, f1: number): boolean;
    apxGE(f0: number, f1: number): boolean;

    /**
     * [min,max]
     * ! [min,max) normaally, but could achieve `max` because of `Math.round()`.
     */
    getRandom(max: number, min?: number, fixt?: uint): number;

    /**
     * Ref. https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice#parameters
     * @const @param in_x
     * @const @param to_x
     */
    normalize(in_x: int, to_x: uint): uint;
  }
}

const Tolerance_ = 2 ** -30; // ~= 0.000_000_001
Number.apxE = (f0, f1) => Math.abs(f0 - f1) <= Tolerance_;
Number.apxS = (f0, f1) => f0 < f1 - Tolerance_;
Number.apxSE = (f0, f1) => f0 <= f1 + Tolerance_;
Number.apxG = (f0, f1) => f0 > f1 + Tolerance_;
Number.apxGE = (f0, f1) => f0 >= f1 - Tolerance_;
Number.getRandom = (max, min = 0, fixto = 0) =>
  min + (Math.random() * (max - min)).fixTo(fixto);
// Number.normalize = (in_x, to_x) => {
//   if (!to_x) return -1;

//   let ret = in_x % to_x;
//   if (ret < 0) ret += to_x;
//   return ret;
// };
Number.normalize = (in_x, to_x) => {
  let ret = Math.clamp(-to_x, in_x, to_x);
  if (ret < 0) ret += to_x;
  return ret;
};

Number.prototype.fixTo = function (this, digits = 0) {
  const mul = 10 ** digits;
  return Math.round(this.valueOf() * mul) / mul;
};

Number.prototype.reprRatio = function (this, fixTo_x = 2) {
  let x_ = this.valueOf();
  const n_ = Number.apxS(x_, 0);
  x_ = Math.abs(x_);
  const f_ = Number.apxG(x_, 0) && Number.apxS(x_, 1);
  let ret = x_.fixTo(fixTo_x).toString();
  if (f_) ret = ret.slice(1);
  if (n_) ret = `-${ret}`;
  return ret;
};
/*81-----------------------------------------------------------------------------
 * TypedArray
** ---------- */

function iaEq_impl<TA extends IntegerArray>(lhs_x: TA, rhs_x: TA) {
  if (rhs_x.length !== lhs_x.length) return false;

  for (let i = lhs_x.length; i--;) {
    if (rhs_x[i] !== lhs_x[i]) return false;
  }
  return true;
}
function faEq_impl<TA extends FloatArray>(lhs_x: TA, rhs_x: TA) {
  if (rhs_x.length !== lhs_x.length) return false;

  for (let i = lhs_x.length; i--;) {
    if (!Number.apxE(rhs_x[i], lhs_x[i])) return false;
  }
  return true;
}

declare global {
  interface Int8Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Uint8Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Uint8ClampedArray {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Int16Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Uint16Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Int32Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Uint32Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Float32Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
  interface Float64Array {
    /**
     * @const @param rhs_x
     */
    eq(rhs_x: unknown): boolean;
  }
}

Reflect.defineProperty(Int8Array.prototype, "eq", {
  value(this: Int8Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Int8Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Uint8Array.prototype, "eq", {
  value(this: Uint8Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Uint8Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Uint8ClampedArray.prototype, "eq", {
  value(this: Uint8ClampedArray, rhs_x: unknown) {
    if (!(rhs_x instanceof Uint8ClampedArray)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Int16Array.prototype, "eq", {
  value(this: Int16Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Int16Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Uint16Array.prototype, "eq", {
  value(this: Uint16Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Uint16Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Int32Array.prototype, "eq", {
  value(this: Int32Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Int32Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Uint32Array.prototype, "eq", {
  value(this: Uint32Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Uint32Array)) return false;

    return iaEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Float32Array.prototype, "eq", {
  value(this: Float32Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Float32Array)) return false;

    return faEq_impl(this, rhs_x);
  },
});
Reflect.defineProperty(Float64Array.prototype, "eq", {
  value(this: Float64Array, rhs_x: unknown) {
    if (!(rhs_x instanceof Float64Array)) return false;

    return faEq_impl(this, rhs_x);
  },
});
/*80--------------------------------------------------------------------------*/

//#region Stringified_<>
/* Ref. https://youtu.be/z7pDvyVhUnE */

type Stringified_<T> = Brand<string, T>;

type JsonifiedValue_<T> = T extends string | number | boolean | null ? T
  : T extends { toJSON(): infer R } ? R
  : T extends undefined | Func ? never
  : T extends object ? JsonifiedObject_<T>
  : never;
type JsonifiedObject_<T> = {
  [Key in keyof T as [JsonifiedValue_<T[Key]>] extends [never] ? never : Key]:
    JsonifiedValue_<T[Key]>;
};
//#endregion

declare global {
  interface JSON {
    stringify<T>(
      value: T,
      replacer?: null | undefined,
      space?: string | number,
    ): Stringified_<T>;
    parse<T>(
      text: Stringified_<T>,
      reviver?: null | undefined,
    ): JsonifiedObject_<T>;
  }
}
/*80--------------------------------------------------------------------------*/

declare global {
  interface Date {
    myformat(): string;
    getShiChen():
      | "子"
      | "丑"
      | "寅"
      | "卯"
      | "辰"
      | "巳"
      | "午"
      | "未"
      | "申"
      | "酉"
      | "戌"
      | "亥";
  }

  interface DateConstructor {
    date: Date;
    setHours(
      refdate: Date,
      hours: number,
      min?: number,
      sec?: number,
      ms?: number,
    ): number;
    setDate(refdate: Date, date: number): number;
    setMonth(refdate: Date, month: number, date?: number): number;
    setFullYear(
      refdate: Date,
      year: number,
      month?: number,
      date?: number,
    ): number;

    _lastNow: ts_t;
    now_1(): ts_t;
  }
}

Date.prototype.myformat = function (this): string {
  // let month_s;
  // switch( this.getMonth() )
  // {
  // case 0: month_s = "Jan"; break;
  // case 1: month_s = "Feb"; break;
  // case 2: month_s = "Mar"; break;
  // case 3: month_s = "Apr"; break;
  // case 4: month_s = "May"; break;
  // case 5: month_s = "Jun"; break;
  // case 6: month_s = "Jul"; break;
  // case 7: month_s = "Aug"; break;
  // case 8: month_s = "Sep"; break;
  // case 9: month_s = "Oct"; break;
  // case 10: month_s = "Nov"; break;
  // default: month_s = "Dec"; break;
  // }

  // const _0 = ( v ) => `${v<10?"0":""}${v}`;

  const tz = this.getTimezoneOffset();

  return [
    [
      `${this.getFullYear()}`,
      `${this.getMonth() + 1}`.padStart(2, "0"),
      `${this.getDate()}`.padStart(2, "0"),
    ].join("-"),
    [
      `${this.getHours()}`.padStart(2, "0"),
      `${this.getMinutes()}`.padStart(2, "0"),
      `${this.getSeconds()}`.padStart(2, "0"),
    ].join(":"),
    [
      `${tz <= 0 ? "+" : "-"}`,
      `${Math.floor(Math.abs(tz) / 60)}`.padStart(2, "0"),
      `${Math.abs(tz) % 60}`.padStart(2, "0"),
    ].join(""),
  ].join(" ");
};

Date.prototype.getShiChen = function (this) {
  switch (this.getHours()) {
    case 23:
    case 0:
      return "子";
    case 1:
    case 2:
      return "丑";
    case 3:
    case 4:
      return "寅";
    case 5:
    case 6:
      return "卯";
    case 7:
    case 8:
      return "辰";
    case 9:
    case 10:
      return "巳";
    case 11:
    case 12:
      return "午";
    case 13:
    case 14:
      return "未";
    case 15:
    case 16:
      return "申";
    case 17:
    case 18:
      return "酉";
    case 19:
    case 20:
      return "戌";
    default:
      return "亥";
  }
};

Date.date = new Date();
Date.setHours = (refdate, hours, min, sec, ms) => {
  Date.date.setTime(refdate.getTime());
  if (ms !== undefined) {
    return Date.date.setHours(hours, min, sec, ms);
  } else if (sec !== undefined) {
    return Date.date.setHours(hours, min, sec);
  } else if (min !== undefined) {
    return Date.date.setHours(hours, min);
  } else {
    return Date.date.setHours(hours);
  }
};
Date.setDate = (refdate, date) => {
  Date.date.setTime(refdate.getTime());
  return Date.date.setDate(date);
};
Date.setMonth = (refdate, month, date) => {
  Date.date.setTime(refdate.getTime());
  if (date !== undefined) {
    return Date.date.setMonth(month, date);
  } else {
    return Date.date.setMonth(month);
  }
};
Date.setFullYear = (refdate, year, month, date) => {
  Date.date.setTime(refdate.getTime());
  if (date !== undefined) {
    return Date.date.setFullYear(year, month, date);
  } else if (month !== undefined) {
    return Date.date.setFullYear(year, month);
  } else {
    return Date.date.setFullYear(year);
  }
};

Date.now_1 = () => {
  let ts_ = Date.now();
  if (ts_ <= Date._lastNow) ts_ += .01;
  // console.log(
  //   `%c${global.dent}>>>>>>>>>>>>> Date.now_1(): ${ts_}`,
  //   "color:red",
  // );
  return Date._lastNow = ts_ as ts_t;
};
/*80--------------------------------------------------------------------------*/

declare global {
  interface Math {
    /**
     * If `min > max`, `min` has a higher priority than `max`.
     */
    clamp(min: number, val: number, max: number): number;

    // minn( ...values:(number|bigint)[] ):number|bigint;
    // maxn( ...values:(number|bigint)[] ):number|bigint;
  }
}

Math.clamp = (min_x: number, val_x: number, max_x: number) =>
  Math.max(min_x, Math.min(val_x, max_x));

// Math.minn = ( ...values ) =>
// {
//   let ret:number|bigint = Infinity;
//   values.forEach( v => {
//     if( v < ret ) ret = v;
//   })
//   return ret;
// }
// Math.maxn = ( ...values ) =>
// {
//   let ret:number|bigint = -Infinity;
//   values.forEach( v => {
//     if( v > ret ) ret = v;
//   })
//   return ret;
// }
/*80--------------------------------------------------------------------------*/

declare global {
  interface ReadableStream<R = any> {
    [Symbol.asyncIterator](): AsyncIterableIterator<R>;
  }
}

/**
 * Ref. https://stackoverflow.com/a/77377871
 */
ReadableStream.prototype[Symbol.asyncIterator] ??= async function* <R = any>(
  this: ReadableStream<R>,
) {
  const reader = this.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
};
/*80--------------------------------------------------------------------------*/

/**
 * class X extends mix( Y, Z )
 * ! Should always companion with an interface declaration
 *
 * @param mixins_x
 *  Last element has the highest precedence, and so on.
 */
export function mix<C extends Constructor | AbstractConstructor>(
  Base_x: C,
  ...mixins_x: (Constructor | AbstractConstructor)[]
) {
  abstract class Mix extends Base_x {}
  // console.log( Mix );

  function copyProperties(source: object, target: object) {
    // console.log( target );
    // console.log( source );
    for (const key of Reflect.ownKeys(source)) {
      // console.log( key );
      if (key in target) {
        // console.log( `${key} in ${target}` );
        continue;
      }

      if (
        key !== "constructor" &&
        key !== "prototype" &&
        key !== "name"
      ) {
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (desc !== undefined) Object.defineProperty(target, key, desc);
      }
    }
  }

  function deepcopyProperties(source: object, target: object) {
    let o: object | null = source;
    while (o) {
      copyProperties(o, target);
      o = Reflect.getPrototypeOf(o);
    }
  }

  for (let i = mixins_x.length; i--;) {
    deepcopyProperties(mixins_x[i].prototype, Mix.prototype);
    deepcopyProperties(mixins_x[i], Mix); // Add static stuff
  }

  return Mix;
}
/*80--------------------------------------------------------------------------*/
