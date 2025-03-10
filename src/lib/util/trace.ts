/** 80**************************************************************************
 * @module lib/util/trace
 * @license MIT
 ******************************************************************************/

import { g_getRootVCo } from "@fe-src/alias.ts";
import { global, INOUT, TESTING } from "../../global.ts";
import type { ts_t } from "../alias.ts";
/*80--------------------------------------------------------------------------*/

/**
 * @const @param assertion
 * @const @param msg
 */
export function assert(
  assertion: any,
  ...data: any[]
  // meta?: { url: string },
) {
  // if (!assertion && meta) {
  //   const match = meta.url.match(/\/([^\/]+\.js)/);
  //   // console.log(match);
  //   if (match) msg += ` (${match[1]})`;
  // }
  /*#static*/ if (!TESTING) {
    console.assert(assertion, ...data);
  }

  if (!assertion) throw new Error(data[0], { cause: data });
}

export function fail(...data: any[]): never {
  /*#static*/ if (!TESTING) {
    console.assert(false, ...data);
  }

  throw new Error(data[0], { cause: data });
}

export function warn(
  ...data: any[]
  // meta?: { url: string }
) {
  /*#static*/ if (TESTING) return;

  // if (meta) {
  //   const match = meta.url.match(/\/([^\/]+\.js)/);
  //   if (match) msg += ` (${match[1]})`;
  // }
  console.warn(...data);
}

let reporting_: Error | undefined;
let count_reported_ = 0;
const MAX_reported_ = 2;

export interface ErrorJ {
  // ts: ts_t;
  name: string;
  message: string;
  // stack: ReturnType<typeof computeStackTrace_>;
}
export interface ReportedError {
  err_j: ErrorJ | undefined;
  ts: ts_t;
}

declare global {
  interface Error {
    toJ(): ErrorJ;
  }
}

Reflect.defineProperty(Error.prototype, "toJ", {
  value(this: Error) {
    return {
      // ts: Date.now(),
      name: this.name,
      message: this.message,
      // actionlist: actionlist_.toval(),
      // stack: computeStackTrace_(this),
    };
  },
});

/**
 * @headconst @param err_x
 */
export const reportError = async <E extends Error>(err_x: E) => {
  if (reporting_) return;
  reporting_ = err_x;

  // const trace_js = JSON.stringify( computeStackTrace_(err_x) );
  // console.log( trace_js );

  const err_j = err_x?.toJ(); //! `err_x` seems still  could be `null` at runtime
  // console.log(err_j);
  g_getRootVCo()?.showReportedError?.({
    err_j,
    ts: Date.now() as ts_t,
  });

  reporting_ = undefined;

  // const url = new URL( `/logerr`, window.location.toString() );
  // if( url.hostname === "localhost" )
  //      url.port = "7272";
  // else url.host = "datni.nmtigor.org";
  // const data_be = {
  //   data_fe: JSON.stringify( err_j ),
  //   ts: err_j?.ts ?? Date.now(),
  // };
  // const res = await fetch( url.toString(), {
  //   method: "PUT",
  //   body: JSON.stringify( data_be ),
  //   headers: {
  //     "Content-Type": "application/json",
  //     // "X-PReMSys-Report": "",
  //   },
  // });

  // if( res.ok )
  // {
  //   g_getRootVCo()?.showReportedError?.( data_be.data_fe );

  //   count_reported_++;
  //   if( count_reported_ > MAX_reported_ )
  //     console.warn( `Has reported ${count_reported_} errors. Please pause and wait for debugging.` );

  //   // actionlist_.reset();

  //   console.assert( reporting_ === err_x );
  //   reporting_ = undefined;
  // }
  // else console.error( res );
};
/*80--------------------------------------------------------------------------*/

/**
 * Ref. https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators
 * @headconst @param _tgt_x
 * @headconst @param ctx_x
 */
export const bind = (_tgt_x: unknown, ctx_x: ClassMethodDecoratorContext) => {
  const methodName = ctx_x.name;
  assert(
    !ctx_x.private,
    `'bound' cannot decorate private properties like ${methodName as string}.`,
  );
  ctx_x.addInitializer(function (this: any) {
    this[methodName] = this[methodName].bind(this);
  });
};

/**
 * Ref. https://devblogs.microsoft.com/typescript/announcing-typescript-5-0/#decorators
 * @const @param _x
 */
export const traceOut = (_x: boolean) => {
  return <This, Return, Args extends any[]>(
    tgt_x: (this: This, ...args: Args) => Return,
  ) => {
    return _x
      ? function (this: This, ...args: Args): Return {
        const ret = tgt_x.call(this, ...args);
        global.outdent;
        return ret;
      }
      : tgt_x;
  };
};

export const out = <This, Return, Args extends any[]>(
  _x: (self_y: This, ret_y: Return, args_y: Args) => void,
) => {
  return (tgt_x: (this: This, ...args: Args) => Return) => {
    return /*#static*/ INOUT
      ? function (this: This, ...args: Args): Return {
        const ret = tgt_x.call(this, ...args);
        _x(this, ret, args);
        return ret;
      }
      : tgt_x;
  };
};
/*80--------------------------------------------------------------------------*/

interface StackElement_ {
  url: string | undefined;
  line: number | undefined;
  column: number | undefined;
  func: string;
  args: string[];
}

// Ref. sentry-javascript
// https://github.com/getsentry/sentry-javascript/blob/master/packages/browser/src/stack-parsers.ts

// /**
//  * Computes a stack trace for an exception.
//  * @headconst @param err_x
//  */
// function computeStackTrace_(err_x: Error) {
//   let ret: StackElement_[] | undefined;

//   try {
//     // This must be tried first because Opera 10 *destroys*
//     // its stacktrace property if you try to access the stack
//     // property first!!
//     ret = computeStackTraceFromStacktraceProp_(err_x);
//   } catch (e) {
//     console.log(e);
//   }

//   if (!ret) {
//     try {
//       ret = computeStackTraceFromStackProp_(err_x);
//     } catch (e) {
//       console.log(e);
//     }
//   }

//   return ret;
// }

// /**
//  * Computes stack trace information from the stacktrace property.
//  * Opera 10+ uses this property.
//  * @headconst @param err_x
//  */
// function computeStackTraceFromStacktraceProp_(err_x: any) {
//   // Access and store the stacktrace property before doing ANYTHING
//   // else to it because Opera is not very good at providing it
//   // reliably in other circumstances.
//   if (!err_x.stacktrace) return undefined;

//   const ret: StackElement_[] = [];

//   const opera10Regex =
//       / line (\d+).*script (?:in )?(\S+)(?:: in function (\S+))?$/i,
//     opera11Regex =
//       / line (\d+), column (\d+)\s*(?:in (?:<anonymous function: ([^>]+)>|([^\)]+))\((.*)\))? in (.*):\s*$/i;
//   const lines = err_x.stacktrace.split("\n");
//   let element: StackElement_,
//     parts: RegExpExecArray | null;
//   for (let i = 0, j = lines.length; i < j; i += 2) {
//     if ((parts = opera10Regex.exec(lines[i]))) {
//       element = {
//         url: parts[2],
//         line: +parts[1],
//         column: undefined,
//         func: parts[3],
//         args: [],
//       };
//     } else if ((parts = opera11Regex.exec(lines[i]))) {
//       element = {
//         url: parts[6],
//         line: +parts[1],
//         column: +parts[2],
//         func: parts[3] || parts[4],
//         args: parts[5] ? parts[5].split(",") : [],
//       };
//     } else continue;

//     // if( !element.func && element.line )
//     // {
//     //   element.func = guessFunctionName(element.url, element.line);
//     // }
//     // if( element.line )
//     // {
//     //   try {
//     //     element.context = gatherContext(element.url, element.line);
//     //   } catch( exc) {}
//     // }

//     // if( !element.context )
//     // {
//     //   element.context = [ lines[i+1] ];
//     // }

//     ret.push(element);
//   }

//   return ret.length ? ret : undefined;
// }

// /**
//  * Computes stack trace information from the stack property.
//  * Chrome and Gecko use this property.
//  * @headconst @param err_x
//  */
// function computeStackTraceFromStackProp_(err_x: Error) {
//   if (!err_x.stack) return undefined;

//   const ret: StackElement_[] = [];

//   const chrome =
//       /^\s*at (?:(.*?) ?\()?((?:file|https?|blob|chrome-extension|native|eval|webpack|<anonymous>|[a-z]:|\/).*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,
//     gecko =
//       /^\s*(.*?)(?:\((.*?)\))?(?:^|@)((?:file|https?|blob|chrome|webpack|resource|moz-extension).*?:\/.*?|\[native code\]|[^@]*bundle)(?::(\d+))?(?::(\d+))?\s*$/i,
//     winjs =
//       /^\s*at (?:((?:\[object object\])?.+) )?\(?((?:file|ms-appx|https?|webpack|blob):.*?):(\d+)(?::(\d+))?\)?\s*$/i;

//   // Used to additionally parse URL/line/column from eval frames
//   const geckoEval = /(\S+) line (\d+)(?: > eval line \d+)* > eval/i,
//     chromeEval = /\((\S*)(?::(\d+))(?::(\d+))\)/;

//   const lines = err_x.stack.split("\n");
//   let element: StackElement_,
//     parts: RegExpExecArray | null,
//     submatch;
//   for (let i = 0, j = lines.length; i < j; ++i) {
//     if ((parts = chrome.exec(lines[i]))) {
//       const isNative = parts[2] && parts[2].indexOf("native") === 0; // start of line
//       const isEval = parts[2] && parts[2].indexOf("eval") === 0; // start of line
//       if (isEval && (submatch = chromeEval.exec(parts[2]))) {
//         // throw out eval line/column and use top-most line/column number
//         parts[2] = submatch[1]; // url
//         // NOTE: It's messing out our integration tests in Karma, let's see if we can live with it – Kamil
//         // parts[3] = submatch[2]; // line
//         // parts[4] = submatch[3]; // column
//       }
//       element = {
//         url: !isNative ? parts[2] : undefined,
//         func: parts[1] || "?",
//         args: isNative ? [parts[2]] : [],
//         line: parts[3] ? +parts[3] : undefined,
//         column: parts[4] ? +parts[4] : undefined,
//       };
//     } else if ((parts = winjs.exec(lines[i]))) {
//       element = {
//         url: parts[2],
//         func: parts[1] || "?",
//         args: [],
//         line: +parts[3],
//         column: parts[4] ? +parts[4] : undefined,
//       };
//     } else if ((parts = gecko.exec(lines[i]))) {
//       const isEval = parts[3] && parts[3].indexOf(" > eval") > -1;
//       if (isEval && (submatch = geckoEval.exec(parts[3]))) {
//         // throw out eval line/column and use top-most line number
//         parts[3] = submatch[1];
//         // NOTE: It's messing out our integration tests in Karma, let's see if we can live with it – Kamil
//         // parts[4] = submatch[2];
//         // parts[5] = null; // no column when eval
//       } else if (
//         i === 0 && !parts[5] && (<any> err_x).columnNumber !== undefined
//       ) {
//         // FireFox uses this awesome columnNumber property for its top frame
//         // Also note, Firefox's column number is 0-based and everything else expects 1-based,
//         // so adding 1
//         // NOTE: this hack doesn't work if top-most frame is eval
//         ret[0].column = (<any> err_x).columnNumber + 1;
//       }
//       element = {
//         url: parts[3],
//         func: parts[1] || "?",
//         args: parts[2] ? parts[2].split(",") : [],
//         line: parts[4] ? +parts[4] : undefined,
//         column: parts[5] ? +parts[5] : undefined,
//       };
//     } else continue;

//     // if( !element.func && element.line )
//     // {
//     //   element.func = guessFunctionName(element.url, element.line);
//     // }

//     // if (TraceKit.remoteFetching && element.url && element.url.substr(0, 5) === "blob:") {
//     //   // Special case for handling JavaScript loaded into a blob.
//     //   // We use a synchronous AJAX request here as a blob is already in
//     //   // memory - it's not making a network request.  This will generate a warning
//     //   // in the browser console, but there has already been an error so that's not
//     //   // that much of an issue.
//     //   let xhr = new XMLHttpRequest();
//     //   xhr.open("GET", element.url, false);
//     //   xhr.send("");

//     //   // If we failed to download the source, skip this patch
//     //   if (xhr.status === 200) {
//     //     let source = xhr.responseText || "";

//     //     // We trim the source down to the last 300 characters as sourceMappingURL is always at the end of the file.
//     //     // Why 300? To be in line with: https://github.com/getsentry/sentry/blob/4af29e8f2350e20c28a6933354e4f42437b4ba42/src/sentry/lang/javascript/processor.py#L164-L175
//     //     source = source.slice(-300);

//     //     // Now we dig out the source map URL
//     //     let sourceMaps = source.match(/\/\/# sourceMappingURL=(.*)$/);

//     //     // If we don't find a source map comment or we find more than one, continue on to the next element.
//     //     if (sourceMaps) {
//     //       let sourceMapAddress = sourceMaps[1];

//     //       // Now we check to see if it's a relative URL.
//     //       // If it is, convert it to an absolute one.
//     //       if (sourceMapAddress.charAt(0) === "~") {
//     //         sourceMapAddress = getLocationOrigin() + sourceMapAddress.slice(1);
//     //       }

//     //       // Now we strip the ".map" off of the end of the URL and update the
//     //       // element so that Sentry can match the map to the blob.
//     //       element.url = sourceMapAddress.slice(0, -4);
//     //     }
//     //   }
//     // }

//     // element.context = element.line ? gatherContext(element.url, element.line) : null;

//     ret.push(element);
//   }

//   // const reference = /^(.*) is undefined$/.exec(err_x.message);
//   // if (stack[0] && stack[0].line && !stack[0].column && reference) {
//   //   stack[0].column = findSourceInLine(reference[1], stack[0].url, stack[0].line);
//   // }

//   return ret.length ? ret : undefined;
// }
/*80--------------------------------------------------------------------------*/
