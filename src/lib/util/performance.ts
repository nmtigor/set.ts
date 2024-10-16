/** 80**************************************************************************
 * @module lib/util/performance
 * @license MIT
 ******************************************************************************/

import { Ranval } from "../compiling/Ranval.ts";
/*80--------------------------------------------------------------------------*/

export const count = {
  newVuu: 0,
  newASTNode: 0, // Count of newly generated `Stnode`s
};
/*80--------------------------------------------------------------------------*/

// const bufr_ = new TokBufr();
// const line_ = new TokLine( bufr_ );
// const loc_ = new TokLoc( line_ );
// const ran_ = new TokRan( loc_ );
// const lexer_ = new Lexr( bufr_ );

export const tmp = {
  // ranval: new Ranval(0, 0),

  // bufr: bufr_,
  // line: line_,
  // lexer: lexer_,
  // token: new Token( lexer_, ran_ ),
  // pazer: new Pazr( bufr_, lexer_ ),

  // vanval: new Vanval( 0, 0 ),

  // eloc : new ELoc( document, 0 ),

  // domrect: new DOMRect(),
  // // selection: new Selection(),

  /**
   * TS workaround
   * (see "strictPropertyInitialization" of tsconfig.json)
   */
  // holder<T>(): T {
  //   return <T> <unknown> undefined;
  // },
} as const;
/*80--------------------------------------------------------------------------*/
