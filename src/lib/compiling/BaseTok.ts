/** 80**************************************************************************
 * @module lib/compiling/BaseTok
 * @license MIT
 ******************************************************************************/

/*80--------------------------------------------------------------------------*/

export enum BaseTok {
  unknown = 0,
  strtBdry,
  stopBdry,

  _max,
}
console.assert(BaseTok._max <= 100);
/*80--------------------------------------------------------------------------*/
