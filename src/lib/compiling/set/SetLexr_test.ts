/** 80**************************************************************************
 * @module lib/compiling/set/SetLexr_test
 * @license MIT
 ******************************************************************************/

import { assertEquals, assertStrictEquals } from "@std/assert";
import { after, afterEach, describe, it } from "@std/testing/bdd";
import type { TestO } from "../_test.ts";
import { ran, redo, repl, rv, test_o, undo } from "../_test.ts";
import { Err } from "../alias.ts";
import { SetBufr } from "./SetBufr.ts";
import { SetLexr } from "./SetLexr.ts";
import { g_count } from "../../util/performance.ts";
import { g_ran_fac } from "../RanFac.ts";
/*80--------------------------------------------------------------------------*/

const bufr = new SetBufr();
const lexr = new SetLexr(bufr);
Object.assign(test_o, { bufr, lexr } as Partial<TestO>);

const init_ = (text_x?: string | string[]) => {
  lexr.reset_Lexr();
  bufr.repl_actr.init(lexr);
  bufr.repl_mo.registHandler((n_y) => bufr.repl_actr.to(n_y));

  if (text_x) repl(rv(0, 0), text_x);
};

const fina_ = () => {
  bufr.reset_Bufr();
  lexr.destructor();
};

afterEach(() => {
  fina_();
  assertEquals(g_count.newToken, g_count.oldToken);
});

after(() => {
  console.log(`g_count.newLoc: ${g_count.newLoc}`);
  console.log(`g_count.newRan: ${g_count.newRan}`);
  console.log(`g_count.newToken: ${g_count.newToken}`);
  console.log(`g_count.oldToken: ${g_count.oldToken}`);
  console.log(`g_ran_fac: ${g_ran_fac}`);
});

describe("SetLexr.lex()", () => {
  it("lex() fuzykey, and its concatTokens$()", () => {
    init_();
    assertEquals(lexr.strtLexTk_$.toString(), "strtBdry[0-0)");
    assertEquals(lexr.stopLexTk_$.toString(), "stopBdry[0-0)");

    repl(rv(0, 0), "d");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-1)"],
      "stopBdry[0-1)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    undo();
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)"],
      "stopBdry[0-0)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    redo();
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-1)"],
      "stopBdry[0-1)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);

    /*
    d
    */
    repl(ran(0)._rv, "ef");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-3)"],
      "stopBdry[0-3)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    /*
    def
    */
    repl(rv(0, 1), "_");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-4)"],
      "stopBdry[0-4)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);

    /*
    d_ef
    */
    repl(rv(0, 1, 0, 2), "\t");
    /*
    d→→→ef
    */
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-1)", "fuzykey[0-2,0-4)"],
      "stopBdry[0-4)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, " ");
    /*
    d→→→ef·
    */
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-1)", "fuzykey[0-2,0-4)"],
      "stopBdry[0-5)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(rv(0, 0), " ");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)"],
      "fuzykey[0-1,0-2)",
      ["fuzykey[0-3,0-5)", "stopBdry[0-6)"],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
  });

  it("lex() quotkey", () => {
    init_();

    repl(rv(0, 0), '"');
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      [],
      "strtBdry[0-0)",
      ["quotkey[0-0,0-1)", "stopBdry[0-1)"],
    ]);
    assertEquals(lexr._err_, [["quotkey[0-0,0-1)", [
      Err.double_quoted_string_open,
    ]]]);
    repl(rv(0, 0), '"');
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "quotkey[0-0,0-2)"],
      "stopBdry[0-2)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    /*
    ""
    */
    repl(rv(0, 1), "\n");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "quotkey[0-0,1-1)"],
      "stopBdry[1-1)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
  });

  it("lex() backslash", () => {
    init_();

    repl(rv(0, 0), "\\");
    /*
    \
    */
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "subtract[0-0,0-1)"],
      "stopBdry[0-1)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(rv(0, 0), "\\");
    /*
    \\
    */
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-2)"],
      "stopBdry[0-2)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    undo();
    repl(ran(0)._rv, "\\");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-2)"],
      "stopBdry[0-2)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);

    fina_();
    init_('"a c"');

    repl(rv(0, 0), "\\");
    /*
    \"a c"
    */
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "fuzykey[0-0,0-3)"],
      "fuzykey[0-4,0-5)",
      ["quotkey[0-5,0-6)", "stopBdry[0-6)"],
    ]);
    assertEquals(lexr._err_, [["quotkey[0-5,0-6)", [
      Err.double_quoted_string_open,
    ]]]);
  });

  it("lex() other SetTok", () => {
    init_();

    repl(ran(0)._rv, "?");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "question[0-0,0-1)"],
      "stopBdry[0-1)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, ">");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      ["strtBdry[0-0)", "question[0-0,0-1)", "joiner[0-1,0-2)"],
      "stopBdry[0-2)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, "∩");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      [
        "strtBdry[0-0)",
        "question[0-0,0-1)",
        "joiner[0-1,0-2)",
        "intersect[0-2,0-3)",
      ],
      "stopBdry[0-3)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, "∪");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      [
        "strtBdry[0-0)",
        "question[0-0,0-1)",
        "joiner[0-1,0-2)",
        "intersect[0-2,0-3)",
        "union[0-3,0-4)",
      ],
      "stopBdry[0-4)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, "(");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      [
        "strtBdry[0-0)",
        "question[0-0,0-1)",
        "joiner[0-1,0-2)",
        "intersect[0-2,0-3)",
        "union[0-3,0-4)",
        "paren_open[0-4,0-5)",
      ],
      "stopBdry[0-5)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
    repl(ran(0)._rv, ")");
    assertEquals(lexr.strtLexTk_$._Repr_(), [
      [
        "strtBdry[0-0)",
        "question[0-0,0-1)",
        "joiner[0-1,0-2)",
        "intersect[0-2,0-3)",
        "union[0-3,0-4)",
        "paren_open[0-4,0-5)",
        "paren_cloz[0-5,0-6)",
      ],
      "stopBdry[0-6)",
      [],
    ]);
    assertStrictEquals(lexr.stopLexTk_$, lexr.strtLexTk_$);
  });
});
/*80--------------------------------------------------------------------------*/
