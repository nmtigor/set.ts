/** 80**************************************************************************
 * @module lib/compiling/set/SetPazr_test
 * @license MIT
 ******************************************************************************/

import { assertEquals, assertStrictEquals } from "@std/assert";
import { afterEach, describe, it } from "@std/testing/bdd";
import type { TestO } from "../_test.ts";
import { ran, repl, rv, test_o, undo } from "../_test.ts";
import { Err } from "../alias.ts";
import { SetBufr } from "./SetBufr.ts";
import { SetLexr } from "./SetLexr.ts";
import { SetPazr } from "./SetPazr.ts";
import type { BinaryOp } from "./stnode/BinaryOp.ts";
import type { Rel } from "./stnode/Rel.ts";
import type { Set } from "./stnode/Set.ts";
/*80--------------------------------------------------------------------------*/

const bufr = new SetBufr();
const lexr = new SetLexr(bufr);
const pazr = new SetPazr(bufr, lexr);
Object.assign(test_o, { bufr, lexr, pazr } as Partial<TestO>);

function init(text_x?: string[] | string) {
  lexr.reset();
  pazr.reset();
  bufr.repl_actr.init(lexr, pazr);
  bufr.repl_mo.registHandler((n_y) => bufr.repl_actr.to(n_y));

  if (text_x) repl(rv(0, 0), text_x);
}

afterEach(() => {
  bufr.reset();
});

describe("SetPazr.paz_impl$()", () => {
  it("pazKey_$()", () => {
    init();

    repl(rv(0, 0), "abc");
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(pazr.root?._newInfo, "Set,0 [ fuzykey[0-0,0-3) ]");
    assertEquals(
      pazr.root?.toString(),
      "Set,0 ( Key,1 ( FuzykeySeq,2 ( fuzykey[0-0,0-3))))",
    );

    repl(rv(0, 1), " ");
    /*
    a bc
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-2,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", [
      "Key,1",
      "FuzykeySeq,2 ( fuzykey[0-0,0-1) fuzykey[0-2,0-4))",
    ]]);

    repl(rv(0, 3, 0, 4), '"c"');
    /*
    a b"c"
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), quotkey[0-3,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", [
      "Key,1",
      "FuzykeySeq,2 ( fuzykey[0-0,0-1) fuzykey[0-2,0-3))",
      "QuotkeySeq,2 ( quotkey[0-3,0-6))",
    ]]);
  });

  it("pazRel_$()", () => {
    init();
    let r_: Rel;

    repl(rv(0, 0), ">");
    assertEquals(pazr._err, [
      ["Rel,1", [
        Err.lack_of_rel_src,
        Err.lack_of_rel_rel,
        Err.lack_of_rel_2nd,
        Err.lack_of_rel_tgt,
      ]],
    ]);
    assertEquals(pazr.root?._newInfo, "Set,0 [ joiner[0-0,0-1) ]");
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: undefined,
      jnr_1: "joiner[0-0,0-1)",
      rel: undefined,
      jnr_2: undefined,
      tgt: undefined,
    }]]);

    repl(ran(0)._rv, "?");
    /*
    >?
     */
    assertEquals(pazr._err, [
      ["Rel,1", [
        Err.lack_of_rel_src,
        Err.lack_of_rel_2nd,
        Err.lack_of_rel_tgt,
      ]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ joiner[0-0,0-1), question[0-1,0-2) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: undefined,
      jnr_1: "joiner[0-0,0-1)",
      rel: "question[0-1,0-2)",
      jnr_2: undefined,
      tgt: undefined,
    }]]);

    repl(ran(0)._rv, "?");
    /*
    >??
     */
    assertEquals(pazr._err, [
      ["Rel,1", [Err.lack_of_rel_src, Err.lack_of_rel_2nd]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ joiner[0-0,0-1), question[0-2,0-3) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: undefined,
      jnr_1: "joiner[0-0,0-1)",
      rel: "question[0-1,0-2)",
      jnr_2: undefined,
      tgt: "question[0-2,0-3)",
    }]]);

    repl(rv(0, 2), ">");
    /*
    >?>?
     */
    assertEquals(pazr._err, [["Rel,1", [Err.lack_of_rel_src]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ joiner[0-0,0-1), question[0-3,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: undefined,
      jnr_1: "joiner[0-0,0-1)",
      rel: "question[0-1,0-2)",
      jnr_2: "joiner[0-2,0-3)",
      tgt: "question[0-3,0-4)",
    }]]);

    repl(rv(0, 0), "\\>");
    /*
    \>>?>?
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-2), question[0-5,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: ["Key,2", "FuzykeySeq,3 ( fuzykey[0-0,0-2))"],
      jnr_1: "joiner[0-2,0-3)",
      rel: "question[0-3,0-4)",
      jnr_2: "joiner[0-4,0-5)",
      tgt: "question[0-5,0-6)",
    }]]);

    repl(rv(0, 3, 0, 4), "(");
    /*
    \>>(>?
     */
    assertEquals(pazr._err, [
      ["Rel,1", [
        Err.lack_of_rel_rel,
        `${Err.unexpected_token_for_rel}: paren_open[0-3,0-4)`,
      ]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-2), question[0-5,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: ["Key,2", "FuzykeySeq,3 ( fuzykey[0-0,0-2))"],
      jnr_1: "joiner[0-2,0-3)",
      rel: undefined,
      jnr_2: "joiner[0-4,0-5)",
      tgt: "question[0-5,0-6)",
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,3 [ fuzykey[0-0,0-2) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), ["Key,2 [ fuzykey[0-0,0-2) ]"]);
    r_ = (pazr.root as Set)._c(0) as Rel;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), r_._c(0));

    repl(rv(0, 3, 0, 4), `"("`);
    /*
    \>>"(">?
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-2), question[0-7,0-8) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: ["Key,2", "FuzykeySeq,3 ( fuzykey[0-0,0-2))"],
      jnr_1: "joiner[0-2,0-3)",
      rel: ["Key,2", "QuotkeySeq,3 ( quotkey[0-3,0-6))"],
      jnr_2: "joiner[0-6,0-7)",
      tgt: "question[0-7,0-8)",
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,3 [ fuzykey[0-0,0-2) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), ["Key,2 [ fuzykey[0-0,0-2) ]"]);
    r_ = (pazr.root as Set)._c(0) as Rel;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), r_._c(0));
  });

  it("pazSet_$() without parentheses", () => {
    init();
    let b_: BinaryOp, b_1: BinaryOp;

    repl(rv(0, 0), "1∩");
    assertEquals(pazr._err, [["Intersect,1", [Err.lack_of_intersect_rhs]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), intersect[0-1,0-2) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"]],
      op: "intersect[0-1,0-2)",
      rhs: undefined,
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);

    repl(ran(0)._rv, "2");
    /*
    1∩2
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-2,0-3) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"]],
      op: "intersect[0-1,0-2)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-2,0-3))"]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), ["Set,2 [ fuzykey[0-0,0-1) ]"]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(0));

    repl(ran(0)._rv, "\\");
    /*
    1∩2\
     */
    assertEquals(pazr._err, [["Subtract,3", [Err.lack_of_subtract_rhs]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), subtract[0-3,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"]],
      op: "intersect[0-1,0-2)",
      rhs: ["Set,2", ["Subtract,3", {
        lhs: ["Set,4", ["Key,5", "FuzykeySeq,6 ( fuzykey[0-2,0-3))"]],
        op: "subtract[0-3,0-4)",
        rhs: undefined,
      }]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-0,0-1) ]",
      "FuzykeySeq,6 [ fuzykey[0-2,0-3) ]",
      "Key,5 [ fuzykey[0-2,0-3) ]",
      "Intersect,1 [ fuzykey[0-0,0-1), fuzykey[0-2,0-3) ]",
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-2,0-3) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-0,0-1) ]",
      "Set,4 [ fuzykey[0-2,0-3) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(1)?._c(0)?._c(0));

    repl(ran(0)._rv, "3");
    /*
    1∩2\3
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-4,0-5) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"]],
      op: "intersect[0-1,0-2)",
      rhs: ["Set,2", ["Subtract,3", {
        lhs: ["Set,4", ["Key,5", "FuzykeySeq,6 ( fuzykey[0-2,0-3))"]],
        op: "subtract[0-3,0-4)",
        rhs: ["Set,4", ["Key,5", "FuzykeySeq,6 ( fuzykey[0-4,0-5))"]],
      }]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-0,0-1) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-0,0-1) ]",
      "Set,4 [ fuzykey[0-2,0-3) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(1)?._c(0)?._c(0));

    repl(ran(0)._rv, "∪");
    /*
    1∩2\3∪
     */
    assertEquals(pazr._err, [["Union,1", [Err.lack_of_union_rhs]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), union[0-5,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Union,1", {
      lhs: ["Set,2", ["Intersect,3", {
        lhs: ["Set,4", ["Key,5", "FuzykeySeq,6 ( fuzykey[0-0,0-1))"]],
        op: "intersect[0-1,0-2)",
        rhs: ["Set,4", ["Subtract,5", {
          lhs: ["Set,6", ["Key,7", "FuzykeySeq,8 ( fuzykey[0-2,0-3))"]],
          op: "subtract[0-3,0-4)",
          rhs: ["Set,6", ["Key,7", "FuzykeySeq,8 ( fuzykey[0-4,0-5))"]],
        }]],
      }]],
      op: "union[0-5,0-6)",
      rhs: undefined,
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "Key,5 [ fuzykey[0-0,0-1) ]",
      "Key,7 [ fuzykey[0-2,0-3) ]",
      "FuzykeySeq,8 [ fuzykey[0-4,0-5) ]",
      "Key,7 [ fuzykey[0-4,0-5) ]",
      "Subtract,3 [ fuzykey[0-2,0-3), fuzykey[0-4,0-5) ]",
      "Set,2 [ fuzykey[0-2,0-3), fuzykey[0-4,0-5) ]",
      "Intersect,1 [ fuzykey[0-0,0-1), fuzykey[0-4,0-5) ]",
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-4,0-5) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,4 [ fuzykey[0-0,0-1) ]",
      "Set,6 [ fuzykey[0-2,0-3) ]",
      "Set,6 [ fuzykey[0-4,0-5) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    b_1 = (b_._c(0) as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_1._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_1._c(1)?._c(0)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(2), b_1._c(1)?._c(0)?._c(1));

    repl(ran(0)._rv, "4");
    /*
    1∩2\3∪4
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), fuzykey[0-6,0-7) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Union,1", {
      lhs: ["Set,2", ["Intersect,3", {
        lhs: ["Set,4", ["Key,5", "FuzykeySeq,6 ( fuzykey[0-0,0-1))"]],
        op: "intersect[0-1,0-2)",
        rhs: ["Set,4", ["Subtract,5", {
          lhs: ["Set,6", ["Key,7", "FuzykeySeq,8 ( fuzykey[0-2,0-3))"]],
          op: "subtract[0-3,0-4)",
          rhs: ["Set,6", ["Key,7", "FuzykeySeq,8 ( fuzykey[0-4,0-5))"]],
        }]],
      }]],
      op: "union[0-5,0-6)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-6,0-7))"]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-0,0-1), fuzykey[0-4,0-5) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(0));
  });

  it("pazSet_$() with paren_open", () => {
    init();
    let b_: BinaryOp;

    repl(rv(0, 0), "(∩1");
    assertEquals(pazr._err, [
      ["Set,2", [`${Err.unexpected_token_for_set}: intersect[0-1,0-2)`]],
      ["BinaryErr,1", [
        `${Err.invalid_binary_op}: fuzykey[0-2,0-3)`,
        Err.lack_of_err_rhs,
      ]],
      ["Set,0", [Err.lack_of_closing_paren]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), fuzykey[0-2,0-3) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "(", ["BinaryErr,1", {
      lhs: ["Set,2", "intersect[0-1,0-2)"],
      op: "fuzykey[0-2,0-3)",
      rhs: undefined,
    }], ")"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);

    repl(rv(0, 1), ")");
    /*
    ()∩1
     */
    assertEquals(pazr._err, [
      ["Set,2", [
        `${Err.unexpected_token_for_set}: paren_cloz[0-1,0-2)`,
      ]],
      ["Set,0", [Err.lack_of_closing_paren]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), fuzykey[0-3,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "(", ["Intersect,1", {
      lhs: ["Set,2", "paren_cloz[0-1,0-2)"],
      op: "intersect[0-2,0-3)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-3,0-4))"]],
    }], ")"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);

    repl(rv(0, 1), "0");
    /*
    (0)∩1
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), fuzykey[0-4,0-5) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-1,0-2))"], ")"],
      op: "intersect[0-3,0-4)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-4,0-5))"]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-3,0-4) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1));

    repl(rv(0, 0), "((");
    /*
    (((0)∩1
     */
    assertEquals(pazr._err, [["Set,0", [Err.lack_of_closing_paren]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), fuzykey[0-6,0-7) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "((", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-3,0-4))"], ")"],
      op: "intersect[0-5,0-6)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-6,0-7))"]],
    }], "))"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-4,0-5) ]",
      "Set,2 [ paren_open[0-0,0-1), paren_cloz[0-2,0-3) ]",
      "Intersect,1 [ paren_open[0-0,0-1), fuzykey[0-4,0-5) ]",
      "Set,0 [ paren_open[0-0,0-1), fuzykey[0-4,0-5) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-4,0-5) ]",
      "Key,3 [ fuzykey[0-1,0-2) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(0)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1));

    repl(ran(0)._rv, ")");
    /*
    (((0)∩1)
     */
    assertEquals(pazr._err, [["Set,0", [Err.lack_of_closing_paren]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), paren_cloz[0-7,0-8) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "((", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-3,0-4))"], ")"],
      op: "intersect[0-5,0-6)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-6,0-7))"]],
    }], "))"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,4 [ fuzykey[0-6,0-7) ]",
      "Key,3 [ fuzykey[0-6,0-7) ]",
      "Set,2 [ paren_open[0-2,0-3), paren_cloz[0-4,0-5) ]",
      "Intersect,1 [ paren_open[0-2,0-3), fuzykey[0-6,0-7) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Set,2 [ fuzykey[0-6,0-7) ]",
      "Key,3 [ fuzykey[0-3,0-4) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(0)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1));

    /* This is a rare case that FildterDepth_ shows its restriction. */
    repl(ran(0)._rv, ")");
    /*
    (((0)∩1))
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), paren_cloz[0-8,0-9) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "((", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-3,0-4))"], ")"],
      op: "intersect[0-5,0-6)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-6,0-7))"]],
    }], "))"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "Intersect,1 [ paren_open[0-2,0-3), fuzykey[0-6,0-7) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), []);
  });

  it("pazSet_$() with paren_cloz", () => {
    init();
    let b_: BinaryOp;

    repl(ran(0)._rv, "1)");
    assertEquals(pazr._err, [["Set,0", [Err.lack_of_opening_paren]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), paren_cloz[0-1,0-2) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "(", [
      "Key,1",
      "FuzykeySeq,2 ( fuzykey[0-0,0-1))",
    ], ")"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);

    repl(rv(0, 0), "0)∩");
    /*
    0)∩1)
     */
    assertEquals(pazr._err, [
      ["Set,2", [Err.lack_of_opening_paren]],
      ["Set,2", [Err.lack_of_opening_paren]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), paren_cloz[0-4,0-5) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"], ")"],
      op: "intersect[0-2,0-3)",
      rhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-3,0-4))"], ")"],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,4 [ fuzykey[0-0,0-1) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), ["Key,3 [ fuzykey[0-0,0-1) ]"]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1)?._c(0));

    repl(ran(0)._rv, ")");
    /*
    0)∩1))
     */
    assertEquals(pazr._err, [
      ["Set,2", [Err.lack_of_opening_paren]],
      ["Set,2", [Err.lack_of_opening_paren]],
    ]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ fuzykey[0-0,0-1), paren_cloz[0-5,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-0,0-1))"], ")"],
      op: "intersect[0-2,0-3)",
      rhs: ["Set,2", "((", [
        "Key,3",
        "FuzykeySeq,4 ( fuzykey[0-3,0-4))",
      ], "))"],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-3,0-4) ]",
      "Key,3 [ fuzykey[0-0,0-1) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(0)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1)?._c(0));

    repl(rv(0, 0), "((");
    /*
    ((0)∩1))
     */
    assertEquals(pazr._err, [["Set,0", [Err.lack_of_opening_paren]]]);
    assertEquals(
      pazr.root?._newInfo,
      "Set,0 [ paren_open[0-0,0-1), paren_cloz[0-7,0-8) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", "((", ["Intersect,1", {
      lhs: ["Set,2", "(", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-2,0-3))"], ")"],
      op: "intersect[0-4,0-5)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-5,0-6))"]],
    }], "))"]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,4 [ fuzykey[0-0,0-1) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-3,0-4) ]",
      "Key,3 [ fuzykey[0-0,0-1) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(1), b_._c(0)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(1)?._c(0));
  });
});

describe("SetSN.replaceChild()", () => {
  it("visit FuzykeySeq, QuotkeySeq; Key.replaceChild()", () => {
    init("a b");

    repl(rv(0, 1), "0");
    /*
    a0 b
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.drtSn_$?._oldInfo,
      "FuzykeySeq,2 [ fuzykey[0-0,0-1), fuzykey[0-2,0-3) ]",
    );
    assertEquals(
      pazr.newSn_$?._newInfo,
      "FuzykeySeq,2 [ fuzykey[0-0,0-2), fuzykey[0-3,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", [
      "Key,1",
      "FuzykeySeq,2 ( fuzykey[0-0,0-2) fuzykey[0-3,0-4))",
    ]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), []);

    repl(rv(0, 2), `""`);
    /*
    a0"" b
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.drtSn_$?._oldInfo,
      "Key,1 [ fuzykey[0-0,0-2), fuzykey[0-3,0-4) ]",
    );
    assertEquals(
      pazr.newSn_$?._newInfo,
      "Key,1 [ fuzykey[0-0,0-2), fuzykey[0-5,0-6) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", [
      "Key,1",
      "FuzykeySeq,2 ( fuzykey[0-0,0-2))",
      "QuotkeySeq,2 ( quotkey[0-2,0-4))",
      "FuzykeySeq,2 ( fuzykey[0-5,0-6))",
    ]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), []);
  });

  it("visit Key; Rel.replaceChild()", () => {
    init('a>b"d" c>?');
    let r_: Rel;

    repl(rv(0, 3, 0, 6), "");
    /*
    a>b c>?
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.drtSn_$?._oldInfo,
      "Key,2 [ fuzykey[0-2,0-3), fuzykey[0-7,0-8) ]",
    );
    assertEquals(
      pazr.newSn_$?._newInfo,
      "Key,2 [ fuzykey[0-2,0-3), fuzykey[0-4,0-5) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: ["Key,2", "FuzykeySeq,3 ( fuzykey[0-0,0-1))"],
      jnr_1: "joiner[0-1,0-2)",
      rel: [
        "Key,2",
        "FuzykeySeq,3 ( fuzykey[0-2,0-3))",
        "FuzykeySeq,3 ( fuzykey[0-4,0-5))",
      ],
      jnr_2: "joiner[0-5,0-6)",
      tgt: "question[0-6,0-7)",
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "FuzykeySeq,3 [ fuzykey[0-2,0-3) ]",
      "FuzykeySeq,3 [ fuzykey[0-7,0-8) ]",
    ]);
    r_ = (pazr.root as Set)._c(0) as Rel;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), r_._c(1)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(1), r_._c(1)?._c(1));

    undo();
    /*
    a>b"d" c>?
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.drtSn_$?._oldInfo,
      "Key,2 [ fuzykey[0-2,0-3), fuzykey[0-4,0-5) ]",
    );
    assertEquals(
      pazr.newSn_$?._newInfo,
      "Key,2 [ fuzykey[0-2,0-3), fuzykey[0-7,0-8) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Rel,1", {
      src: ["Key,2", "FuzykeySeq,3 ( fuzykey[0-0,0-1))"],
      jnr_1: "joiner[0-1,0-2)",
      rel: [
        "Key,2",
        "FuzykeySeq,3 ( fuzykey[0-2,0-3))",
        "QuotkeySeq,3 ( quotkey[0-3,0-6))",
        "FuzykeySeq,3 ( fuzykey[0-7,0-8))",
      ],
      jnr_2: "joiner[0-8,0-9)",
      tgt: "question[0-9,0-10)",
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), []);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "FuzykeySeq,3 [ fuzykey[0-2,0-3) ]",
      "FuzykeySeq,3 [ fuzykey[0-4,0-5) ]",
    ]);
    r_ = (pazr.root as Set)._c(0) as Rel;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), r_._c(1)?._c(0));
    assertStrictEquals(pazr.takldSn_sa_$.at(1), r_._c(1)?._c(2));
  });

  it("visit Set; BinaryOp.replaceChild()", () => {
    init("(a)\\b");
    let b_: BinaryOp;

    repl(rv(0, 1), " ");
    /*
    ( a)\b
     */
    assertEquals(pazr.root?.hasErr_1, false);
    assertEquals(
      pazr.drtSn_$?._oldInfo,
      "Set,2 [ paren_open[0-0,0-1), paren_cloz[0-2,0-3) ]",
    );
    assertEquals(
      pazr.newSn_$?._newInfo,
      "Set,2 [ paren_open[0-0,0-1), paren_cloz[0-3,0-4) ]",
    );
    assertEquals(pazr.root?._repr(), ["Set,0", ["Subtract,1", {
      lhs: ["Set,2", "(", [
        "Key,3",
        "FuzykeySeq,4 ( fuzykey[0-2,0-3))",
      ], ")"],
      op: "subtract[0-4,0-5)",
      rhs: ["Set,2", ["Key,3", "FuzykeySeq,4 ( fuzykey[0-5,0-6))"]],
    }]]);
    assertEquals(pazr.unrelSn_sa_$._repr(), [
      "FuzykeySeq,4 [ fuzykey[0-1,0-2) ]",
    ]);
    assertEquals(pazr.takldSn_sa_$._repr(), [
      "Key,3 [ fuzykey[0-1,0-2) ]",
    ]);
    b_ = (pazr.root as Set)._c(0) as BinaryOp;
    assertStrictEquals(pazr.takldSn_sa_$.at(0), b_._c(0)?._c(0));
  });
});
/*80--------------------------------------------------------------------------*/
