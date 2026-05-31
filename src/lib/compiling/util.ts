/** 80**************************************************************************
 * @module lib/compiling/util
 * @license MIT
 ******************************************************************************/

import { INOUT } from "../../preNs.ts";
import type { loff_t, unum } from "../alias.ts";
import type { Id_t, UInt16 } from "../alias_v.ts";
import { assert } from "../util.ts";
import * as Is from "../util/is.ts";
import { SortedIdo, SortedSet } from "../util/SortedSet.ts";
import type { Locval, Tok } from "./alias.ts";
import type { Line } from "./Line.ts";
import type { Ranval } from "./Ranval.ts";
import type { Snt } from "./Snt.ts";
import { Stnode } from "./Stnode.ts";
import type { Token } from "./Token.ts";
/*80--------------------------------------------------------------------------*/

export type LineData = [
  /**
   * Record of `Token<any>`s whose `frstLine` is this Line and
   * `prevToken_$?.frstLine` is not.
   */
  frstTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,
  /**
   * Record of `Token<any>`s whose `lastLine` is this Line and
   * `nextToken_$?.lastLine` is not.
   */
  lastTk: Record</** Lexr.id */ Id_t, Token<any> | undefined> | undefined,

  //jjjj TOCLEANUP
  // frstTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,
  // lastTSeg: Record</** Tfmr.id */ Id_t, TSeg | undefined> | undefined,

  blockSize: Record</** EdtrBaseScrolr.id */ Id_t, unum> | undefined,
  //jjjj TOCLEANUP
  // fsrec_a: Record</** EdtrBaseScrolr.id */ Id_t, FSRec[]> | undefined,
];

export const lineFrstTkO = (_x: LineData) => _x[0] ??= {};
export const lineLastTkO = (_x: LineData) => _x[1] ??= {};

//jjjj TOCLEANUP
// export const lineFrstTSegO = (_x: LineData) => _x[2] ??= {};
// export const lineLastTSegO = (_x: LineData) => _x[3] ??= {};
// export const clearLineFrstTSeg = (_x?: LineData) => !_x || (_x[2] = undefined);
// export const clearLineLastTSeg = (_x?: LineData) => !_x || (_x[3] = undefined);

export const lineBSizeO = (_x: LineData) => _x[2] ??= {};
// export const lineFsrecaO = (_x: LineData) => _x[5] ??= {};
/*64----------------------------------------------------------*/

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const frstNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = strt_x;
  if (Is.func(ucod_x)) {
    for (; i_ < stop_x; i_++) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ < stop_x; i_++) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ < stop_x; i_++) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};

/**
 * @const @param ucod_x
 * @const @param ln_x
 * @const @param strt_x
 * @const @param stop_x
 */
export const lastNon = (
  ucod_x: UInt16 | UInt16[] | ((_: UInt16) => boolean),
  ln_x: Line,
  strt_x: loff_t = 0,
  stop_x: loff_t = ln_x.uchrLen,
): loff_t | -1 => {
  /*#static*/ if (INOUT) {
    assert(strt_x <= stop_x);
  }
  let i_ = stop_x - 1;
  if (Is.func(ucod_x)) {
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x(ln_x.ucodAt(i_))) break;
    }
  } else if (Is.array(ucod_x)) {
    //jjjj TOCLEANUP
    // const LEN = ucod_x.length;
    for (; i_ >= strt_x; i_--) {
      if (!ucod_x.includes(ln_x.ucodAt(i_))) break;
      //jjjj TOCLEANUP
      // const ucod = ln_x.ucodAt(i_);
      // let j_ = 0;
      // for (; j_ < LEN && ucod !== ucod_x[j_]; j_++);
      // if (j_ === LEN) break;
    }
  } else {
    for (; i_ >= strt_x; i_--) {
      if (ln_x.ucodAt(i_) !== ucod_x) break;
    }
  }
  return i_;
};
/*80--------------------------------------------------------------------------*/

export abstract class LexdInfo {
  static #ID = 0 as Id_t;
  readonly id = ++LexdInfo.#ID as Id_t;
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  destructor(): void {}
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  //jjjj TOCLEANUP
  // /** @const */
  // become(li_x: LexdInfo) {}

  toString(): string {
    return "";
  }
}
/*80--------------------------------------------------------------------------*/

export const sntFrstTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.frstToken : snt_x;

export const sntLastTk = <T extends Tok>(
  snt_x: Stnode<T> | Token<T>,
): Token<T> => snt_x instanceof Stnode ? snt_x.lastToken : snt_x;
/*80--------------------------------------------------------------------------*/

export type _OldInfo_ = {
  sort: Locval;
  info: string;
};

export class SortedSnt_id<T extends Snt = Snt> extends SortedIdo<T> {
  _repr_(): string[] {
    const ret: _OldInfo_[] = [];
    for (const v of this) ret.push(v._oldInfo_);
    return ret.sort((a_y, b_y) => {
      const lv_a = a_y.sort;
      const lv_b = b_y.sort;
      return lv_a[0] < lv_b[0]
        ? -1
        : lv_a[0] === lv_b[0] && lv_a[1] < lv_b[1]
        ? -1
        : lv_a[1] === lv_b[1]
        ? 0
        : 1;
    }).map((_y) => _y.info);
  }
}

/** @final */
export class SortedTk_id extends SortedSnt_id<Token<any>> {}
/** @final */
export class SortedSn_id extends SortedSnt_id<Stnode<any>> {}
/*80--------------------------------------------------------------------------*/

export const enum ErrMsg {
  quoted_string_open = "Quoted string does not closed.",
  block_comment_open = "Block comment does not closed.",
  // unexpected_surrogate = "Unexpected surrogate",
  // unexpected_null_character = "Unexpected null character",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* set */

  /* Set */
  set_unexp_tk = "Unexpected token for Set",
  set_no_cloz_paren = "In Set, no closing parentheses.",
  set_no_open_paren = "In Set, no opening parentheses.",

  /* BinaryOp */
  set_subtract_no_rhs = "In Subtract, no rhs.",
  set_intersect_no_rhs = "In Intersect, no rhs.",
  set_union_no_rhs = "In Union, no rhs.",
  set_binaryerr_no_rhs = "In BinaryErr, no rhs.",
  set_inval_binary_op = "In BinaryOp, binary op is invalid.",

  /* Rel */
  set_rel_unexp_tk = "Unexpected token for Rel",
  set_rel_no_srt = "In Rel of set, no src or rel or tgt.",
  set_rel_no_2nd = 'In Rel of set, no 2nd joiner ">".',
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* uri */

  ipv4_leading_0 = "Redundant leading 0 in one dec-octet field for IPv4",
  ipv4_exceed_255 = "In IPv4, exceed 255 in one dec-octet field.",
  ipv6_no_2nd_colon = 'In IPv6, expect 2nd colon of "::".',
  ipv6_no_enough_h16 = "In IPv6, there are no enough h16.",
  ipv6_no_h16 = "In IPv6, no h16.",
  ip_no_open_bracket = "In IPv6 or IPv7, no opening bracket.",
  ip_no_cloz_bracket = "In IPv6 or IPv7, no closing bracket.",

  uri_inval_tail = "Invalid tail for URI",

  uri_pathpart_conflict = "In PathPart of uri, path parts conflict.",
  uri_no_authority = "In PathPart of uri, no authority before path-abempty.",
  uri_no_scheme = "In URI, no scheme.",
  uri_unexp_scheme = "Unexpected token for URI",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* css */

  css_inval_esc = "Invalid escape",
  css_bad_url = "Bad URL",

  css_func_open = "Function does not closed.",
  css_simple_block_open = "Simple block does not closed.",
  css_atrule_open = "At-rule is incomplete.",
  css_qurule_open = "Qualified rule is incomplete.",
  css_qurule_no_prelude = "Qualified rule has no prelude.",
  // css_root_unexp_child = "Root contains unexpected child Stnode.",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* html */

  /*
  lex error messages
  ref. [3.2.2 Parse errors](https://html.spec.whatwg.org/multipage/parsing.html#parse-errors)
  */
  html_unexp_null = "unexpected-null-character",
  html_surrogate = "surrogate-in-input-stream",
  html_unexp_nonchr = "noncharacter-in-input-stream",
  html_unexp_ctrl = "control-character-in-input-stream",

  html_doctype_no_name = "missing-doctype-name",
  html_doctype_nosp_name = "missing-whitespace-before-doctype-name",
  html_doctype_name_inval = "invalid-character-sequence-after-doctype-name",
  html_doctype_sys_nosp = "missing-whitespace-after-doctype-system-keyword",
  html_doctype_sys_noid = "missing-doctype-system-identifier",
  html_doctype_sysid_noquot = "missing-quote-before-doctype-system-identifier",
  html_doctype_sysid_abrupt = "abrupt-doctype-system-identifier",
  html_doctype_sysid_unexp =
    "unexpected-character-after-doctype-system-identifier",
  html_doctype_eof = "eof-in-doctype",
  html_tagname_inval_1stchr = "invalid-first-character-of-tag-name",
  html_tagname_unexp_quesmrk = "unexpected-question-mark-instead-of-tag-name",
  html_tagname_eof = "eof-before-tag-name",
  html_tag_unexp_solidus = "unexpected-solidus-in-tag",
  html_tag_unexp_eqsign = "unexpected-equals-sign-before-attribute-name",
  html_tag_an_unexp_chr = "unexpected-character-in-attribute-name",
  html_tag_an_dup = "duplicate-attribute",
  html_tag_av_unexp_chr = "unexpected-character-in-unquoted-attribute-value",
  html_tag_av_no = "missing-attribute-value",
  html_tag_nosp_attrs = "missing-whitespace-between-attributes",
  html_tag_eof = "eof-in-tag",
  html_endtag_no = "missing-end-tag-name",
  html_endtag_attrs = "end-tag-with-attributes",
  html_endtag_solidus = "end-tag-with-trailing-solidus",
  html_comment_inval_open = "incorrectly-opened-comment",
  html_comment_inval_cloz = "incorrectly-closed-comment",
  html_comment_abrupt_cloz = "abrupt-closing-of-empty-comment",
  html_comment_nested = "nested-comment",
  html_comment_eof = "eof-in-comment",
  html_chrref_null = "null-character-reference",
  html_chrref_exceed = "character-reference-outside-unicode-range",
  html_chrref_nonchr = "noncharacter-character-reference",
  html_chrref_control = "control-character-reference",
  html_chrref_unknown = "unknown-named-character-reference",
  html_chrref_surrogate = "surrogate-character-reference",
  html_chrref_no_digits = "absence-of-digits-in-numeric-character-reference",
  html_chrref_no_semicolon = "missing-semicolon-after-character-reference",

  html_script_cmt_eof = "eof-in-script-html-comment-like-text",
  html_cdata_html = "cdata-in-html-content",
  html_cdata_eof = "eof-in-cdata",
  /* ~ */

  /*
  paz error messages
  ref. https://github.com/html5lib/html5lib-python/blob/master/html5lib/constants.py
  */
  "null-character" = "null-character",
  "invalid-codepoint" = "invalid-codepoint",
  "incorrectly-placed-solidus" = "incorrectly-placed-solidus",
  "incorrect-cr-newline-entity" = "incorrect-cr-newline-entity",
  "illegal-windows-1252-entity" = "illegal-windows-1252-entity",
  "cant-convert-numeric-entity" = "cant-convert-numeric-entity",
  "illegal-codepoint-for-numeric-entity" =
    "illegal-codepoint-for-numeric-entity",
  "numeric-entity-without-semicolon" = "numeric-entity-without-semicolon",
  "expected-numeric-entity-but-got-eof" = "expected-numeric-entity-but-got-eof",
  "expected-numeric-entity" = "expected-numeric-entity",
  "named-entity-without-semicolon" = "named-entity-without-semicolon",
  "expected-named-entity" = "expected-named-entity",
  "attributes-in-end-tag" = "attributes-in-end-tag",
  "self-closing-flag-on-end-tag" = "self-closing-flag-on-end-tag",
  "expected-tag-name-but-got-right-bracket" =
    "expected-tag-name-but-got-right-bracket",
  "expected-tag-name-but-got-question-mark" =
    "expected-tag-name-but-got-question-mark",
  "expected-tag-name" = "expected-tag-name",
  "expected-closing-tag-but-got-right-bracket" =
    "expected-closing-tag-but-got-right-bracket",
  html_no_endtag = "expected-closing-tag-but-got-eof",
  "expected-closing-tag-but-got-char" = "expected-closing-tag-but-got-char",
  "eof-in-tag-name" = "eof-in-tag-name",
  "expected-attribute-name-but-got-eof" = "expected-attribute-name-but-got-eof",
  "eof-in-attribute-name" = "eof-in-attribute-name",
  "invalid-character-in-attribute-name" = "invalid-character-in-attribute-name",
  "duplicate-attribute" = "duplicate-attribute",
  "expected-end-of-tag-name-but-got-eof" =
    "expected-end-of-tag-name-but-got-eof",
  "expected-attribute-value-but-got-eof" =
    "expected-attribute-value-but-got-eof",
  "expected-attribute-value-but-got-right-bracket" =
    "expected-attribute-value-but-got-right-bracket",
  "equals-in-unquoted-attribute-value" = "equals-in-unquoted-attribute-value",
  "unexpected-character-in-unquoted-attribute-value" =
    "unexpected-character-in-unquoted-attribute-value",
  "invalid-character-after-attribute-name" =
    "invalid-character-after-attribute-name",
  "unexpected-character-after-attribute-value" =
    "unexpected-character-after-attribute-value",
  "eof-in-attribute-value-double-quote" = "eof-in-attribute-value-double-quote",
  "eof-in-attribute-value-single-quote" = "eof-in-attribute-value-single-quote",
  "eof-in-attribute-value-no-quotes" = "eof-in-attribute-value-no-quotes",
  "unexpected-EOF-after-solidus-in-tag" = "unexpected-EOF-after-solidus-in-tag",
  "unexpected-character-after-solidus-in-tag" =
    "unexpected-character-after-solidus-in-tag",
  "expected-dashes-or-doctype" = "expected-dashes-or-doctype",
  "unexpected-bang-after-double-dash-in-comment" =
    "unexpected-bang-after-double-dash-in-comment",
  "unexpected-space-after-double-dash-in-comment" =
    "unexpected-space-after-double-dash-in-comment",
  "incorrect-comment" = "incorrect-comment",
  "eof-in-comment" = "eof-in-comment",
  "eof-in-comment-end-dash" = "eof-in-comment-end-dash",
  "unexpected-dash-after-double-dash-in-comment" =
    "unexpected-dash-after-double-dash-in-comment",
  "eof-in-comment-double-dash" = "eof-in-comment-double-dash",
  "eof-in-comment-end-space-state" = "eof-in-comment-end-space-state",
  "eof-in-comment-end-bang-state" = "eof-in-comment-end-bang-state",
  "unexpected-char-in-comment" = "unexpected-char-in-comment",
  "need-space-after-doctype" = "need-space-after-doctype",
  "expected-doctype-name-but-got-right-bracket" =
    "expected-doctype-name-but-got-right-bracket",
  "expected-doctype-name-but-got-eof" = "expected-doctype-name-but-got-eof",
  "eof-in-doctype-name" = "eof-in-doctype-name",
  "eof-in-doctype" = "eof-in-doctype",
  "expected-space-or-right-bracket-in-doctype" =
    "expected-space-or-right-bracket-in-doctype",
  "unexpected-end-of-doctype" = "unexpected-end-of-doctype",
  "unexpected-char-in-doctype" = "unexpected-char-in-doctype",
  "eof-in-innerhtml" = "eof-in-innerhtml",
  html_unexp_doctype = "unexpected-doctype",
  html_nonroot_html = "non-html-root",
  "expected-doctype-but-got-eof" = "expected-doctype-but-got-eof",
  html_unknown_doctype = "unknown-doctype",
  html_unexp_chr_doctype = "expected-doctype-but-got-chars",
  html_unexp_opntag_doctype = "expected-doctype-but-got-start-tag",
  html_unexp_endtag_doctype = "expected-doctype-but-got-end-tag",
  html_html_unexp_endtag = "end-tag-after-implied-root",
  "expected-named-closing-tag-but-got-eof" =
    "expected-named-closing-tag-but-got-eof",
  html_two_heads = "two-heads-are-not-better-than-one",
  html_unexp_endtag = "unexpected-end-tag",
  html_head_unexp_opntag = "unexpected-start-tag-out-of-my-head",
  html_unexp_opntag = "unexpected-start-tag",
  "missing-end-tag" = "missing-end-tag",
  "missing-end-tags" = "missing-end-tags",
  html_unexp_opntag_to_endtag = "unexpected-start-tag-implies-end-tag",
  "unexpected-start-tag-treated-as" = "unexpected-start-tag-treated-as",
  "deprecated-tag" = "deprecated-tag",
  "unexpected-start-tag-ignored" = "unexpected-start-tag-ignored",
  "expected-one-end-tag-but-got-another" =
    "expected-one-end-tag-but-got-another",
  html_endtag_early = "end-tag-too-early",
  "end-tag-too-early-named" = "end-tag-too-early-named",
  html_endtag_early_1 = "end-tag-too-early-ignored",
  "adoption-agency-1.1" = "adoption-agency-1.1",
  "adoption-agency-1.2" = "adoption-agency-1.2",
  "adoption-agency-1.3" = "adoption-agency-1.3",
  "adoption-agency-4.4" = "adoption-agency-4.4",
  "unexpected-end-tag-treated-as" = "unexpected-end-tag-treated-as",
  "no-end-tag" = "no-end-tag",
  "unexpected-implied-end-tag-in-table" = "unexpected-implied-end-tag-in-table",
  "unexpected-implied-end-tag-in-table-body" =
    "unexpected-implied-end-tag-in-table-body",
  "unexpected-char-implies-table-voodoo" =
    "unexpected-char-implies-table-voodoo",
  "unexpected-hidden-input-in-table" = "unexpected-hidden-input-in-table",
  "unexpected-form-in-table" = "unexpected-form-in-table",
  "unexpected-start-tag-implies-table-voodoo" =
    "unexpected-start-tag-implies-table-voodoo",
  "unexpected-end-tag-implies-table-voodoo" =
    "unexpected-end-tag-implies-table-voodoo",
  "unexpected-cell-in-table-body" = "unexpected-cell-in-table-body",
  "unexpected-cell-end-tag" = "unexpected-cell-end-tag",
  "unexpected-end-tag-in-table-body" = "unexpected-end-tag-in-table-body",
  "unexpected-implied-end-tag-in-table-row" =
    "unexpected-implied-end-tag-in-table-row",
  "unexpected-end-tag-in-table-row" = "unexpected-end-tag-in-table-row",
  "unexpected-select-in-select" = "unexpected-select-in-select",
  "unexpected-input-in-select" = "unexpected-input-in-select",
  "unexpected-start-tag-in-select" = "unexpected-start-tag-in-select",
  "unexpected-end-tag-in-select" = "unexpected-end-tag-in-select",
  "unexpected-table-element-start-tag-in-select-in-table" =
    "unexpected-table-element-start-tag-in-select-in-table",
  "unexpected-table-element-end-tag-in-select-in-table" =
    "unexpected-table-element-end-tag-in-select-in-table",
  "unexpected-char-after-body" = "unexpected-char-after-body",
  "unexpected-start-tag-after-body" = "unexpected-start-tag-after-body",
  "unexpected-end-tag-after-body" = "unexpected-end-tag-after-body",
  "unexpected-char-in-frameset" = "unexpected-char-in-frameset",
  "unexpected-start-tag-in-frameset" = "unexpected-start-tag-in-frameset",
  "unexpected-frameset-in-frameset-innerhtml" =
    "unexpected-frameset-in-frameset-innerhtml",
  "unexpected-end-tag-in-frameset" = "unexpected-end-tag-in-frameset",
  "unexpected-char-after-frameset" = "unexpected-char-after-frameset",
  "unexpected-start-tag-after-frameset" = "unexpected-start-tag-after-frameset",
  "unexpected-end-tag-after-frameset" = "unexpected-end-tag-after-frameset",
  "unexpected-end-tag-after-body-innerhtml" =
    "unexpected-end-tag-after-body-innerhtml",
  "expected-eof-but-got-char" = "expected-eof-but-got-char",
  "expected-eof-but-got-start-tag" = "expected-eof-but-got-start-tag",
  "expected-eof-but-got-end-tag" = "expected-eof-but-got-end-tag",
  "eof-in-table" = "eof-in-table",
  "eof-in-select" = "eof-in-select",
  "eof-in-frameset" = "eof-in-frameset",
  "eof-in-script-in-script" = "eof-in-script-in-script",
  "eof-in-foreign-lands" = "eof-in-foreign-lands",
  "non-void-element-with-trailing-solidus" =
    "non-void-element-with-trailing-solidus",
  "unexpected-html-element-in-foreign-content" =
    "unexpected-html-element-in-foreign-content",
  html_unexp_endtag_html = "unexpected-end-tag-before-html",
  "unexpected-inhead-noscript-tag" = "unexpected-inhead-noscript-tag",
  "eof-in-head-noscript" = "eof-in-head-noscript",
  "char-in-head-noscript" = "char-in-head-noscript",
  html_XXX = "XXX-undefined-error",
  /* ~ */
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* mdext */

  mdext_unexp_cloz = "Unexpected close for Block of mdext",
  /* Link */
  //jjjj TOCLEANUP
  // unrecognizable_linkdest = "The link destination is unrecognizable.",
}

export type ErrRv = [ErrMsg, Ranval, string?];

export type Err = ErrMsg | ErrRv;

/** @final */
export class SortedErr extends SortedSet<Err> {
  /** @headconst @param val_a_x */
  constructor(val_a_x?: Err[]) {
    super(
      (a, b) => Is.array(a) && Is.array(b) ? a[1].posS(b[1]) : false,
      val_a_x,
      (a, b) => a === b,
    );
  }
}
/*80--------------------------------------------------------------------------*/
