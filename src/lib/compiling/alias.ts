/** 80**************************************************************************
 * @module lib/compiling/alias
 * @license MIT
 ******************************************************************************/

import type { Chr, Dulstr, lnum_t, loff_t, uint32 } from "../alias.ts";
import type { BaseTok } from "./BaseTok.ts";
import type { JSLangTok } from "./jslang/JSLangTok.ts";
import type { MdextTok } from "./mdext/MdextTok.ts";
import type { PDFTok } from "./pdf/PDFTok.ts";
import type { PlainTok } from "./plain/PlainTok.ts";
import type { RMLTok } from "./rml/RMLTok.ts";
import type { SetTok } from "./set/SetTok.ts";
import type { URITok } from "./uri/URITok.ts";
import type { HTMLTok } from "./html/HTMLTok.ts";
/*80--------------------------------------------------------------------------*/

export type Locval = [lnum_t, loff_t];

/**
 * ! If change `BufrReplState` names, check "ReplActr.ts" first where names are
 * literally used (in order to show xstate graph correctly).
 */
export enum BufrReplState {
  idle = 1,
  prerepl,
  sufrepl,
  sufrepl_edtr,
}

export const enum BufrDoState {
  idle = 1,
  doing,
  undoing,
  redoing,
}

export type sig_t = uint32;

/**
 * BaseTok: [0,100) \
 * PlainTok:  BaseTok ∪ [100,200) \
 * SetTok:    BaseTok ∪ [200,300) \
 * MdextTok:  BaseTok ∪ [300,400) \
 * JSLangTok: BaseTok ∪ [400,600)
 */
export type Tok =
  | BaseTok // <= 100
  | PlainTok // <= 200
  | SetTok // <= 300
  | URITok // <= 400
  | MdextTok // <= 500
  | PDFTok // <= 600
  | RMLTok // <= 800
  | JSLangTok // <= 1000
  | HTMLTok; // <= 1100

/** Dulling map */
export type Dulmap = Map<Chr, Dulstr | Dulstr[]>;
/*80--------------------------------------------------------------------------*/

export const enum Err {
  double_quoted_string = "Double quoted string does not closed.",
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /* Set */
  set_unexpected_token = "Unexpected token for Set",
  lack_of_closing_paren = "Lack of closing parentheses",
  lack_of_opening_paren = "Lack of opening parentheses",
  /* BinaryOp */
  subtract_lack_of_rhs = "In Subtract, lack of rhs",
  intersect_lack_of_rhs = "In Intersect, lack of rhs",
  union_lack_of_rhs = "In Union, lack of rhs",
  binaryerr_lack_of_rhs = "In BinaryErr, lack of rhs",
  invalid_binary_op = "Invalid binary op",
  /* Rel */
  rel_unexpected_token = "Unexpected token for Rel",
  rel_lack_of_srt = "In Rel, lack of src or rel ro tgt",
  rel_lack_of_2nd = 'In Rel, lack of 2nd joiner ">"',
  /*64||||||||||||||||||||||||||||||||||||||||||||||||||||||||||*/

  /* SetextHeading */
  unexpected_close = "Unexpected close",
  /* Link */
  //jjjj TOCLEANUP
  // unrecognizable_linkdest = "The link destination is unrecognizable.",
}
/*80--------------------------------------------------------------------------*/
