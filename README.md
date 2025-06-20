This implements a format for searching texts with the following grammar:

```
Quotkey:
    " any string without `"` "
QuotkeySeq:
    (Quotkey \s*)? Quotkey
Fuzykey:
    nonempty trimed string which is not Set, has no white spaces, has no `"` pair
FuzykeySeq:
    (Fuzykey \s+)? Fuzykey
Key:
    (QuotkeySeq | FuzykeySeq)+
Rel:
    (Key | \?)? \s* > \s* (Key | \?)? \s* > \s* (Key | \?)?
Substract:
    Set \s* \ \s* Set
Intersect:
    Set \s* ∩ \s* Set
Union:
    Set \s* ∪ \s* Set
UnparenthesizedSet:
    Intersect | Substract | Union | Rel | Key
ParenthesizedSet: 
    \( \s* UnparenthesizedSet \s* \)
Set:
    UnparenthesizedSet | PparenthesizedSet
```

For example, searching videos about TypeScript or JavaScript unrelated to Deno
can be

```
video > contain > ? ∩ (typescript ∪ javascript) \ deno
```

This uses a compiling mechanism, i.e., compile while editing. It finds the
smallest dirty node, and recompiles that node only, reusing unrelated nodes
within the dirty node. So it is very efficient for editing.

### unittest

```bash
cd /path_to/set.ts/src/test
# deno 2.3.1
deno test -RN # 2 passed (15 steps)
```
