/** 80**************************************************************************
 * @module lib/compiling/alias
 * @license MIT
 ******************************************************************************/

import type { Dulstr, lnum_t, loff_t, uint32 } from "../alias.ts";
import type { Chr } from "../alias_v.ts";
import type { BaseTok } from "./BaseTok.ts";
import type { CSSTok } from "./css/CSSTok.ts";
import type { HTMLTok } from "./html/HTMLTok.ts";
import type { JSLangTok } from "./jslang/JSLangTok.ts";
import type { MdextTok } from "./mdext/MdextTok.ts";
import type { PDFTok } from "./pdf/PDFTok.ts";
import type { PlainTok } from "./plain/PlainTok.ts";
import type { RMLTok } from "./rml/RMLTok.ts";
import type { SetTok } from "./set/SetTok.ts";
import type { URITok } from "./uri/URITok.ts";
/*80--------------------------------------------------------------------------*/

export const enum BufrDoState {
  idle = 1,
  doing,
  undoing,
  redoing,
}

/**
 * ! If change `BufrReplState` names, check "ReplActr.ts" first where names are
 *  literally used (in order to show xstate graph correctly).
 */
export enum BufrReplState {
  idle = 1,
  preRepl,
  sufRepl,
  sufRepl_edtr,
}

export type sig_t = uint32;
/*64----------------------------------------------------------*/

export type Locval = [lnum_t, loff_t];

/**
 * BaseTok: [0,100) \
 * PlainTok:  BaseTok ∪ [100,200) \
 * SetTok:    BaseTok ∪ [200,300) \
 * MdextTok:  BaseTok ∪ [300,400) \
 * JSLangTok: BaseTok ∪ [400,600)
 */
export type Tok =
  | BaseTok
  | PlainTok
  | SetTok
  | URITok
  | CSSTok
  | HTMLTok
  | RMLTok
  | MdextTok
  | JSLangTok
  | PDFTok;

/** Dulling map */
export type Dulmap = Map<Chr, Dulstr | Dulstr[]>;
/*80--------------------------------------------------------------------------*/

export const enum Err {
  quoted_string_open = "Quoted string does not closed.",
  block_comment_open = "Block comment does not closed.",
  // unexpected_surrogate = "Unexpected surrogate",
  // unexpected_null_character = "Unexpected null character",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* set */

  /* Set */
  set_unexp_token = "Unexpected token for Set",
  set_no_cloz_paren = "In Set, no closing parentheses.",
  set_no_open_paren = "In Set, no opening parentheses.",

  /* BinaryOp */
  set_subtract_no_rhs = "In Subtract, no rhs.",
  set_intersect_no_rhs = "In Intersect, no rhs.",
  set_union_no_rhs = "In Union, no rhs.",
  set_binaryerr_no_rhs = "In BinaryErr, no rhs.",
  set_inval_binary_op = "In BinaryOp, binary op is invalid.",

  /* Rel */
  set_rel_unexp_token = "Unexpected token for Rel",
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

  html_unexp_null = "unexpected-null-character",
  html_chrref_no_semicolon = "missing-semicolon-after-character-reference",
  html_chrref_null = "null-character-reference",
  html_chrref_exceed = "character-reference-outside-unicode-range",
  html_chrref_surrogate = "surrogate-character-reference",
  html_chrref_nonchr = "noncharacter-character-reference",
  html_chrref_control = "control-character-reference",
  html_tag_inval_1stchr = "invalid-first-character-of-tag-name",
  html_tag_unexp_quesmrk = "unexpected-question-mark-instead-of-tag-name",
  html_tag_no_end = "missing-end-tag-name",
  html_tag_unexp_solidus = "unexpected-solidus-in-tag",
  html_tag_unexp_eqsign = "unexpected-equals-sign-before-attribute-name",
  html_tag_unexp_an_chr = "unexpected-character-in-attribute-name",
  html_tag_unexp_av_chr = "unexpected-character-in-unquoted-attribute-value",
  html_tag_no_av = "missing-attribute-value",
  html_tag_eof = "eof-in-tag",
  html_cmt_inval_open = "incorrectly-opened-comment",
  html_cmt_inval_cloz = "incorrectly-closed-comment",
  html_cmt_abrupt_cloz = "abrupt-closing-of-empty-comment",
  html_cmt_eof = "eof-in-comment",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/
  /* mdext */

  mdext_unexp_cloz = "Unexpected close for Block of mdext",
  /* Link */
  //jjjj TOCLEANUP
  // unrecognizable_linkdest = "The link destination is unrecognizable.",
}
/*80--------------------------------------------------------------------------*/
