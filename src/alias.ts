/** 80**************************************************************************
 * @module alias
 * @license MIT
 ******************************************************************************/

import type { UChr } from "./lib/alias.ts";
import { _TRACE, global, RESIZ, TESTING } from "./global.ts";
import type { HTMLVCo } from "@fe-lib/cv.ts";
/*80--------------------------------------------------------------------------*/

export const D_db = "root_1";
/*49-------------------------------------------*/

export const D_be = "premsys-be";
/*49-------------------------------------------*/

export const D_fe = "set.ts";
/*36------------------------------*/

export const D_fe_pdf = `${D_fe}/src/pdf`;
export const D_fp_src = `${D_fe_pdf}/pdf.ts-src`;
export const D_fp_test = `${D_fe_pdf}/pdf.ts-test`;
export const D_fp_web = `${D_fe_pdf}/pdf.ts-web`;
/*36------------------------------*/

export const D_fe_test = `${D_fe}/src/test`;
export const D_ft_pdfts = `${D_fe_test}pdf.ts`;
/*49-------------------------------------------*/

export const D_cy = `${D_fe}_ui-testing`;
/*49-------------------------------------------*/

export const D_pdfts = "pdf.ts";
/*49-------------------------------------------*/

export const D_pdfcy = `${D_pdfts}_ui-testing`;
/*49-------------------------------------------*/

export const D_cmts = "commonmark.ts";
/*49-------------------------------------------*/

export const D_sets = "set.ts";
/*64----------------------------------------------------------*/
/* Relative to `D_fe` */
/*====================*/

export const D_src_pdf = "src/pdf";
export const D_sp_src = `${D_src_pdf}/pdf.ts-src`;
export const D_sp_test = `${D_src_pdf}/pdf.ts-test`;
export const D_sp_web = `${D_src_pdf}/pdf.ts-web`;
/*49-------------------------------------------*/

export const D_res_pdf = "res/pdf";
export const D_rp_pdfs = `${D_res_pdf}/test/pdfs`;
export const D_rp_images = `${D_res_pdf}/test/images`;
export const D_rp_web = `${D_res_pdf}/pdf.ts-web`;
/*36------------------------------*/

export const D_rp_external = `${D_res_pdf}/pdf.ts-external`;
export const D_rpe_cmap = `${D_rp_external}/bcmaps`;
export const D_rpe_sfont = `${D_rp_external}/standard_fonts`;
/*49-------------------------------------------*/

export const D_gen_pdf = "gen/pdf";
export const D_gp_src = `${D_gen_pdf}/pdf.ts-src`;
/*49-------------------------------------------*/

export const D_tmp_pdf = "tmp/pdf";
/*80--------------------------------------------------------------------------*/

// export const g_getRootVCo: () => HTMLVCo | undefined = () => global.vco as any;
export const g_getRootVCo = () => global.vco as HTMLVCo | undefined;

export const g_onresize = () => {
  /*#static*/ if (_TRACE && RESIZ) {
    console.log(
      `%c${global.indent}>>>>>>> window.on("resize") >>>>>>>`,
      "color:#ffcd4a",
    );
  }
  /*#static*/ if (_TRACE && RESIZ) {
    console.log(
      `${global.dent}w:${document.documentElement.clientWidth}, h:${document.documentElement.clientHeight}`,
    );
    global.outdent;
  }
};

export const g_onerror = (evt_x: ErrorEvent) => {
  const rootVCo = g_getRootVCo();
  if (rootVCo) rootVCo.el.style.backgroundColor = "#61bed4";

  /*#static*/ if (!TESTING) {
    rootVCo?.ci.reportError?.(evt_x.error);
  }
};

export const g_onunhandledrejection = (evt_x: PromiseRejectionEvent) => {
  const rootVCo = g_getRootVCo();
  if (rootVCo) rootVCo.el.style.backgroundColor = "#b6d361";

  /*#static*/ if (!TESTING) {
    rootVCo?.ci.reportError?.(evt_x.reason);
  }
};
/*80--------------------------------------------------------------------------*/

export const fontFamilyBase = [
  "Noto Sans",
  // "Noto Sans Traditional Chinese",
  // "Noto Sans Simplified Chinese",
  // "Rubik",

  "system-ui",
  // "Microsoft YaHei",
  // "微软雅黑",
  // "STHei",
  // "华文黑体",
  // "Helvetica Neue",
  // "Helvetica",
  // "Arial",
  // "sans-serif",
].join(",");
export const fontFamilyMono = [
  "Source Code Pro",

  "monospace",
].join(",");
// export const fontFamily1 = `"Open Sans", "Helvetica Neue", Arial, sans-serif`;
/* Fallback system font:
https://bitsofco.de/the-new-system-font-stack/
*/
/*64----------------------------------------------------------*/
/* zIndex */

/* Stacking context: Windl */
export const ToolbarResizer_z = 8;
export const SwipteNailLifting_z = 6;
export const Popmenu_z = 5;
export const PopfoldActiv_z = 4;
export const PopfoldInact_z = 3;
export const Pocusd_z = 2;
/*80--------------------------------------------------------------------------*/

export const ClickExtent = 2;
/**
 * @const @param x
 * @const @param y
 * @const @param x_0
 * @const @param y_0
 * @const @param extent_x
 */
export function isClick(
  x: number,
  y: number,
  x_0: number,
  y_0: number,
  extent_x = ClickExtent,
): boolean {
  // console.log({ x, y, x_0, y_0 });
  return Math.abs(x_0 - x) <= extent_x &&
    Math.abs(y_0 - y) <= extent_x;
}
/*64----------------------------------------------------------*/

/** in millisecond */
export const HoldDuration = 1_000;
/*64----------------------------------------------------------*/

/** In milliseconds */
export const SpeedGran = 200;

export const SwipeValve = .08;
export type SwipeData = {
  ts_1: number;
  val_1: number;
  ts_2: number;
  val_2: number;
};
export const enum Swipe {
  dn = 1,
  up = -1,
  no = 0,
}
export function isSwipe(_x: SwipeData): Swipe {
  const speed = _x.ts_2 <= _x.ts_1
    ? 0
    : (_x.val_2 - _x.val_1) / (_x.ts_2 - _x.ts_1);
  return Math.abs(speed) <= SwipeValve
    ? Swipe.no
    : speed > 0
    ? Swipe.dn
    : Swipe.up;
}
/*80--------------------------------------------------------------------------*/

// deno-fmt-ignore
/**
 * Ref. https://w3c.github.io/uievents-key/
 */
export const enum Key {
  /* 3.2. Modifier Keys */
  Alt, Control, Shift, Meta,
  /* 3.3. Whitespace Keys */
  Enter, Tab,
  /* 3.4. Navigation Keys */
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp,
  End, Home,
  PageDown, PageUp,
  /* 3.5. Editing Keys */
  Backspace, Delete,
  /* 3.6. UI Keys */
  Escape,
  /* 3.9. General-Purpose Function Keys */
  F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12,
}

export type Keybinding =
  | `${Key | UChr}`
  | `${Key}+${Key | UChr}`
  | `${Key}+${Key}+${Key | UChr}`;
/*80--------------------------------------------------------------------------*/

export const LOG_cssc = {
  selectionchange: "#cb9b8b",
  selectionchange_1: "#ff8257",

  xstate_transition: "#2196f3",
  xstate_entry: "#1ba39a",
  xstate_exit: "#506e6c",
  intrs: "#f68e78",
  resiz: "#fdf717",

  performance: "#00ff00",

  runhere: "#ff0000",
};
/*80--------------------------------------------------------------------------*/

/* Adding, deleting, order-changing values of `BeReturn` or its sub-enum need to
change all dbs correspondingly. */
export enum BeReturn {
  success,
  invalid_db, //kkkk
  fail_nostrt,
  fail_connection,
  fail_unknown,
  _max,
}
console.assert(BeReturn._max <= 10);
/*80--------------------------------------------------------------------------*/

// export const PALEGRUP = Object.freeze([
//   "editor-dev", // 0
//   "editor",     // 1
//   "premsys",    // 2
//   "datetime",   // 3
//   "gic",        // 4
// ]);
// /** @enum */
// const PG_ = Object.freeze({
//   editor_dev: 0,
//   editor: 1,
//   premsys: 2,
//   datetime: 3,
//   gic: 4,
// });

// export const PALETYPE = Object.freeze([
//   "全局", // 0
//   "尺寸控制", // 1
//   "MdextCodeEditor", // 2
//   "MdextRichEditor", // 3
//   "PlainEdtr", // 4
//   "日历", // 5
// ]);
// /** @enum */
// const PT_ = Object.freeze({
//   glob: 0,
//   size_ctrl: 1,
//   code_edtr: 2,
//   rich_edtr: 3,
//   plan_edtr: 4,
//   calr: 5,
// });
/*80--------------------------------------------------------------------------*/
