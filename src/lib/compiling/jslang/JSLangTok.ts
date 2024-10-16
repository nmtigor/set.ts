/** 80**************************************************************************
 * @module lib/compiling/jslang/JSLangTok
 * @license MIT
 ******************************************************************************/

import { BaseTok } from "../BaseTok.ts";
/*80--------------------------------------------------------------------------*/

enum JSLangTok_ {
  /* Other */
  leftParentheses = 800,
  rightParentheses,
  leftBracket,
  rightBracket,
  leftCurly,
  dollarLeftCurly,
  rightCurly,
  colon,
  semicolon,
  dotDotDot,

  comment,

  as,
  from,

  /* Expressions */
  throw,
  new,
  target,
  delete,
  var,
  let,
  const,
  typeof,
  instanceof,
  in,
  of,
  void,
  yield,
  await,

  /* Operators */
  lessThan,
  greaterThan,
  lessOrEqual,
  greaterOrEqual,
  equal,
  notEqual,
  identity,
  notIdentity,

  leftShift,
  rightShift,
  leftShiftAssign,
  rightShiftAssign,
  unsignedRightShift,
  unsignedRightShiftAssign,
  and,
  or,
  xor,
  andAssign,
  orAssign,
  xorAssign,
  tilde,

  add,
  min,
  mul,
  div,
  mod,
  pow,
  addAssign,
  minAssign,
  mulAssign,
  divAssign,
  modAssign,
  powAssign,
  plusPlus,
  minusMinus,

  assign,
  not,
  arrow,
  dot,
  comma,
  question,
  questionQuestion,
  questionDot,
  questionQuestionAssign,

  andAnd,
  orOr,
  andAndAssign,
  orOrAssign,

  /* Literals */
  null,
  true,
  false,
  numericLiteral,
  stringLiteral,
  regexpLiteral,
  templateLiteral,

  /* Leaf operators */
  identifier,
  this,
  super,

  /* Aggregates */
  class,
  extends,
  interface,
  implements,
  enum,
  import,
  export,
  private,
  protected,
  package,
  public,
  static,
  get,
  set,

  function,
  async,

  /* Statements */
  if,
  else,
  while,
  for,
  do,
  switch,
  case,
  default,
  break,
  continue,
  with,
  return,
  try,
  catch,
  finally,
  debugger,

  _max,
}
console.assert(JSLangTok_._max <= 1_000);

export type JSLangTok = BaseTok | JSLangTok_;
export const JSLangTok = { ...BaseTok, ...JSLangTok_ };
/*80--------------------------------------------------------------------------*/
