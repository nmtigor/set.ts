/** 80**************************************************************************
 * Ref. [@std/ulid@1.0.0](https://github.com/denoland/std/tree/main/ulid)
 *    * Correct `monotonicFactory()`
 *
 * @module lib/util/ulid
 * @license MIT
 ******************************************************************************/

import type { ts_t } from "../alias.ts";
import type { Ts_t, ULID } from "../alias_v.ts";
import * as Is from "./is.ts";
/*80--------------------------------------------------------------------------*/

/** Type for a ULID generator function. */
type GenULID_ = (seedTime?: number) => string;

// These values should NEVER change. If
// they do, we're no longer making ulids!
const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
const ENCODING_LEN = ENCODING.length;
const TIME_MAX = Math.pow(2, 48) - 1;
const TIME_LEN = 10;
const RANDOM_LEN = 16;
export const ULID_LEN = TIME_LEN + RANDOM_LEN;
/*64----------------------------------------------------------*/

function replaceCharAt(str: string, index: number, char: string) {
  return str.substring(0, index) + char + str.substring(index + 1);
}

function incrementBase32(str: string): string {
  let index = str.length;
  let char;
  let charIndex;
  const maxCharIndex = ENCODING_LEN - 1;
  while (--index >= 0) {
    char = str[index]!;
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw new TypeError("Incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      str = replaceCharAt(str, index, ENCODING[0]!);
      continue;
    }
    return replaceCharAt(str, index, ENCODING[charIndex + 1]!);
  }
  throw new Error("Cannot increment this string");
}
/*64----------------------------------------------------------*/

/**
 * Extracts the number of milliseconds since the Unix epoch that had passed when
 * the ULID was generated. If the ULID is malformed, an error will be thrown.
 *
 * @example Decode the time from a ULID
 * ```ts
 * import { decodeTime, ulid } from "@std/ulid";
 * import { assertEquals } from "@std/assert";
 *
 * const timestamp = 150_000;
 * const ulidString = ulid(timestamp);
 *
 * assertEquals(decodeTime(ulidString), timestamp);
 * ```
 *
 * @const @param ulid_x The ULID to extract the timestamp from.
 * @return The number of milliseconds since the Unix epoch that had passed when
 *    the ULID was generated.
 * @throw {@linkcode Error}
 */
export function decodeTime(ulid_x: ULID): Ts_t {
  if (ulid_x.length !== ULID_LEN) {
    throw new Error(`ULID must be exactly ${ULID_LEN} characters long`);
  }
  const time = ulid_x
    .substring(0, TIME_LEN)
    .split("")
    .reverse()
    .reduce((carry, char, index) => {
      const encodingIndex = ENCODING.indexOf(char);
      if (encodingIndex === -1) {
        throw new Error(`Invalid ULID character found: ${char}`);
      }
      return (carry += encodingIndex * Math.pow(ENCODING_LEN, index));
    }, 0);
  if (time > TIME_MAX) {
    throw new RangeError(
      `ULID timestamp component exceeds maximum value of ${TIME_MAX}`,
    );
  }
  return time as Ts_t;
}

function encodeTime(timestamp: number): string {
  if (!Is.int(timestamp) || timestamp < 0 || timestamp > TIME_MAX) {
    throw new RangeError(
      `Time must be a positive integer less than ${TIME_MAX}`,
    );
  }
  let str = "";
  for (let len = TIME_LEN; len > 0; len--) {
    const mod = timestamp % ENCODING_LEN;
    str = ENCODING[mod] + str;
    timestamp = Math.floor(timestamp / ENCODING_LEN);
  }
  return str;
}

function encodeRandom(): string {
  let str = "";
  const bytes = crypto.getRandomValues(new Uint8Array(RANDOM_LEN));
  for (const byte of bytes) {
    str += ENCODING[byte % ENCODING_LEN];
  }
  return str;
}
/*64----------------------------------------------------------*/

/** Generates a monotonically increasing ULID. */
function monotonicFactory(encodeRand = encodeRandom): GenULID_ {
  let lastTime = 0;
  /* It is possible that `seedTime <= lastTime` on the first run, e.g., in
  cypress testing with `cy.clock()`, in which case, both are 0. */
  let lastRandom = encodeRand();
  return function ulid(seedTime: number = Date.now()): string {
    if (seedTime <= lastTime) {
      const incrementedRandom = (lastRandom = incrementBase32(lastRandom));
      return encodeTime(lastTime) + incrementedRandom;
    }
    lastTime = seedTime;
    const newRandom = (lastRandom = encodeRand());
    return encodeTime(seedTime) + newRandom;
  };
}

/**
 * Generate a ULID that monotonically increases even for the same millisecond,
 * optionally passing the current time. If the current time is not passed, it
 * will default to `Date.now()`.
 *
 * Unlike the {@linkcode ulid} function, this function is guaranteed to return
 * strictly increasing ULIDs, even for the same seed time, but only if the seed
 * time only ever increases. If the seed time ever goes backwards, the ULID will
 * still be generated, but it will not be guaranteed to be monotonic with
 * previous ULIDs for that same seed time.
 *
 * @example Generate a monotonic ULID
 * ```ts no-assert
 * import { monotonicUlid } from "@std/ulid";
 *
 * monotonicUlid(); // 01HYFKHG5F8RHM2PM3D7NSTDAS
 * monotonicUlid(); // 01HYFKHG5F8RHM2PM3D7NSTDAT
 * monotonicUlid(); // 01HYFKHHX8H4BRY8BYHAV1BZ2T
 * ```
 *
 * @example Generate a monotonic ULID with a seed time
 * ```ts no-assert
 * import { monotonicUlid } from "@std/ulid";
 *
 * // Strict ordering for the same timestamp, by incrementing the least-significant random bit by 1
 * monotonicUlid(150000); // 0000004JFHJJ2Z7X64FN2B4F1Q
 * monotonicUlid(150000); // 0000004JFHJJ2Z7X64FN2B4F1R
 * monotonicUlid(150000); // 0000004JFHJJ2Z7X64FN2B4F1S
 * monotonicUlid(150000); // 0000004JFHJJ2Z7X64FN2B4F1T
 * monotonicUlid(150000); // 0000004JFHJJ2Z7X64FN2B4F1U
 *
 * // A different timestamp will reset the random bits
 * monotonicUlid(150001); // 0000004JFHJJ2Z7X64FN2B4F1P
 *
 * // A previous seed time will not guarantee ordering, and may result in a
 * // ULID lower than one with the same seed time generated previously
 * monotonicUlid(150000); // 0000004JFJ7XF6D76ES95SZR0X
 * ```
 *
 * @const @param seedTime_x The time to base the ULID on, in milliseconds since
 *    the Unix epoch. Defaults to `Date.now()`.
 * @return A ULID that is guaranteed to be strictly increasing for the same seed
 *    time.
 */
export const monotonicUlid = (seedTime_x: ts_t = Date.now()): ULID =>
  monotonicFactory()(seedTime_x) as ULID;
/* This stucks when "deno task denoflare push cf". */
// export const monotonicUlid: ULID = monotonicFactory();
/*80--------------------------------------------------------------------------*/

/*jjjj Compress 26 bytes to 22 bytes: https://share.google/aimode/qBINbPgQPa0CIDDgF */
