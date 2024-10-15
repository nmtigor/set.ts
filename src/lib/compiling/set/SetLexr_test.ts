/** 80**************************************************************************
 * @module lib/compiling/set/SetLexr_test
 * @license MIT
 ******************************************************************************/

import { assertEquals, assertStrictEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import type { TestO } from "../_test.ts";
import { ran, redo, repl, rv, test_o, undo } from "../_test.ts";
import { Err } from "../alias.ts";
import { SetBufr } from "./SetBufr.ts";
import { SetLexr } from "./SetLexr.ts";
/*80--------------------------------------------------------------------------*/

const bufr = new SetBufr();
const lexr = new SetLexr(bufr);
Object.assign(test_o, { bufr, lexr } as Partial<TestO>);

function init(text_x?: string) {
  bufr.setLines(text_x);
  lexr.reset();
  bufr.repl_actr.init(lexr);
  bufr.repl_mo.registHandler((n_y) => bufr.repl_actr.to(n_y));
}

describe("lex()", () => {
  afterEach(() => {
    bufr.reset();
  });

  it("lex() fuzykey, and its concatTokens$()", () => {
    init();
    assertEquals(lexr.strtToken_$.toString(), "strtBdry[0-0)");
    assertEquals(lexr.stopToken_$.toString(), "stopBdry[0-0)");

    repl(rv(0, 0), "d");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "fuzykey[0-0,0-1)"], "stopBdry[0-1)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    undo();
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)"], "stopBdry[0-0)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    redo();
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "fuzykey[0-0,0-1)"], "stopBdry[0-1)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);

    /*
    d
     */
    repl(ran(0).toRanval(), "ef");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-3)"],
        "stopBdry[0-3)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    /*
    def
     */
    repl(rv(0, 1), "_");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-4)"],
        "stopBdry[0-4)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);

    /*
    d_ef
     */
    repl(rv(0, 1, 0, 2), "\t");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-1)", "fuzykey[0-2,0-4)"],
        "stopBdry[0-4)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), " ");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-1)", "fuzykey[0-2,0-4)"],
        "stopBdry[0-5)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(rv(0, 0), " ");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)"],
        "fuzykey[0-1,0-2)",
        ["fuzykey[0-3,0-5)", "stopBdry[0-6)"],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
  });

  it("lex() quotkey", () => {
    init();

    repl(rv(0, 0), '"');
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        [],
        "strtBdry[0-0)",
        ["quotkey[0-0,0-1)", "stopBdry[0-1)"],
      ],
    );
    assertEquals(lexr._err, [["quotkey[0-0,0-1)", [Err.double_quoted_string]]]);
    repl(rv(0, 0), '"');
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "quotkey[0-0,0-2)"], "stopBdry[0-2)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    /*
    ""
     */
    repl(rv(0, 1), "\n");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "quotkey[0-0,1-1)"], "stopBdry[1-1)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
  });

  it("lex() backslash", () => {
    init();

    repl(rv(0, 0), "\\");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "subtract[0-0,0-1)"], "stopBdry[0-1)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(rv(0, 0), "\\");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-2)"],
        "stopBdry[0-2)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    undo();
    repl(ran(0).toRanval(), "\\");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-2)"],
        "stopBdry[0-2)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);

    bufr.reset();
    init();
    repl(rv(0, 0), '"a c"');

    repl(rv(0, 0), "\\");
    /*
    \"a c"
     */
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "fuzykey[0-0,0-3)"],
        "fuzykey[0-4,0-5)",
        ["quotkey[0-5,0-6)", "stopBdry[0-6)"],
      ],
    );
    assertEquals(lexr._err, [["quotkey[0-5,0-6)", [Err.double_quoted_string]]]);
  });

  it("lex() other SetTok", () => {
    init();

    repl(ran(0).toRanval(), "?");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [["strtBdry[0-0)", "question[0-0,0-1)"], "stopBdry[0-1)", []],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), ">");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        ["strtBdry[0-0)", "question[0-0,0-1)", "joiner[0-1,0-2)"],
        "stopBdry[0-2)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), "∩");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        [
          "strtBdry[0-0)",
          "question[0-0,0-1)",
          "joiner[0-1,0-2)",
          "intersect[0-2,0-3)",
        ],
        "stopBdry[0-3)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), "∪");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
        [
          "strtBdry[0-0)",
          "question[0-0,0-1)",
          "joiner[0-1,0-2)",
          "intersect[0-2,0-3)",
          "union[0-3,0-4)",
        ],
        "stopBdry[0-4)",
        [],
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), "(");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
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
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
    repl(ran(0).toRanval(), ")");
    assertEquals(
      lexr.strtToken_$._Repr(),
      [
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
      ],
    );
    assertStrictEquals(lexr.stopToken_$, lexr.strtToken_$);
  });
});
/*80--------------------------------------------------------------------------*/
