---
title: Types
description: Primitive types, type aliases, and casting.
sidebar:
  order: 2
---

Ilex has various built-in types. Variables are zero-initialized by default (see [Variables & Constants](/guide/01_variables)).

## Numeric Types

### Integers

| Type | Description |
|------|-------------|
| `s8` `s16` `s32` `s64` `s128` | Signed integers |
| `u8` `u16` `u32` `u64` `u128` | Unsigned integers |
| `int` | Signed 32-bit integer (alias for `s32`) |
| `uint` | Unsigned 32-bit integer (alias for `u32`) |
| `byte` | Alias for `u8` |
| `intptr` `uintptr` | Pointer-sized integers |

All integer types default to `0`.

### Floats

| Type | Description |
|------|-------------|
| `f16` `f32` `f64` `f128` | Floating-point types |
| `float` | 32-bit float (alias for `f32`) |
| `double` | 64-bit float (alias for `f64`) |

All float types default to `0.0`.

### Numeric Literals

```ilex
x := 42;    // int
y := 3.14;  // double (f64)
z := 3.14f; // float (f32)
w := 3.14d; // double (f64), explicit
```

Ilex supports hex, octal, and binary literals:
```ilex
x := 0xFF;      // hex (or 0xff)
y := 0q72;      // octal (uses q because o is less readable)
z := 0b1011011; // binary
```

Underscores can be used for readability:
```ilex
x := 1_000_000;
y := 0xFF_AA_12;
z := 0xBAD_F00D;
```

## Booleans

| Type | Description |
|------|-------------|
| `b8` `b16` `b32` `b64` | Sized booleans |
| `bool` | Boolean (alias for `b1` or `b8`) |

All boolean types default to `false`.

## Characters and Strings

| Type | Description |
|------|-------------|
| `char` | Unicode codepoint (same width as `u32`), defaults to `'\0'` |
| `string` | Immutable string, defaults to `""` |
| `cstring` | Null-terminated C string (internally `^u8`), defaults to `null` |

`cstring` is meant for interfacing with C libraries. It is not interchangeable with `string`, use `strings::to_cstring()` and `strings::from_cstring()` for conversion.

Raw strings use backticks:
```ilex
str := `this\is\'a\raw\string`;
```

## Other Built-in Types

| Type | Description |
|------|-------------|
| `typeid` | Opaque handle for runtime type identity, obtained via `typeid_of(T)`. Supports `==` and `!=` only. |
| `rawptr` | Untyped pointer (like `void*` in C). Used for C interop. |

## Type Aliases

Custom type aliases are created with `typedef`:
```ilex
typedef Custom as int;
mut var: Custom = 42;
assert(typename_of(var) == "Custom");
```

Non-distinct aliases are fully interchangeable with their base type:
```ilex
typedef Custom as int;
mut a: Custom;
mut b: int;
a = b;       // Valid
if a == b {} // Valid
```

## Distinct Types

Use `#[distinct]` to create a type that is not implicitly convertible to its base:
```ilex
#[distinct] typedef Custom as int;
mut a: Custom;
mut b: int;

a = b;               // Compile error
a = cast(b, Custom); // Valid

if a == b {}            // Compile error
if cast(a, int) == b {} // Valid
if int(a) == b {}       // Also valid
```

Distinct types can have a custom default value:
```ilex
#[distinct, init_to=1] typedef Month as int;
mut month: Month; // month is 1
```

## Casting

Types in Ilex are not implicitly converted (with a few exceptions listed below). There are four casting operators:

### `cast(value, type)`

The standard cast. Can be preferred because it is searchable and clear:
```ilex
x: s8 = 100;
y := cast(x, s32);
```

### `type(value)`

Functional form. Sometimes easier to read in nested expressions:
```ilex
return u8(abs(s8(n)));

// Compared to the equivalent with cast:
return cast(abs(cast(n, s8)), u8);
```

### `recast(value, type)`

Bit reinterpretation between types of the same size (like `reinterpret_cast` in C++):
```ilex
mut x: f32 = 12.0;
y := recast(x, u32);
```

### `auto_cast(value)`

Casts to whatever type the assignment target expects. Convenient but potentially unsafe:
```ilex
x := 12.f;
mut y: int;
y = auto_cast(x); // Equivalent to cast(x, type_of(y))
```

### Casting in Practice

```ilex
x := 12;
y := 42;
mut z: f64 = x / y;                       // Error, no implicit int to f64
mut z: f64 = cast(x, f64) / cast(y, f64); // Valid
mut z: f64 = f64(x) / f64(y);             // Valid
mut z: f64 = cast(x / y, f64);            // Valid but probably not what you want
```

## Implicit Conversions

Ilex has very few implicit conversions:

1. **Float upcasting**: `f16` -> `f32` -> `f64` -> `f128`
```ilex
mut x: f16 = 1.0;
mut y: f32 = x; // Valid
mut z: f64 = y; // Valid
```

2. **Boolean context**: `int`, `uint`, pointers (`^T`), and optionals (`T?`) can be used directly in conditions
(though I may change my mind on this):
```ilex
x := 12;
if x {}   // Compiler inserts: if x != 0

p: ^int = null;
if p {}   // Compiler inserts: if p != null

opt? := 7;
if opt {} // Compiler inserts: if opt != null
```

3. **Non-distinct type aliases** are interchangeable with their base type.

## The `unknown` Type

`unknown` is a compile-time resolved type for function parameters. The compiler monomorphizes the function for each concrete type used at call sites:

```ilex
fn process(val: unknown) {}
process(42);
process("hello");
```

`unknown` is **not** a runtime type. It cannot be used for variable declarations, struct fields, or return types.

For variadic `unknown` parameters, each argument may be a different type. Use `#for` to iterate at compile time:

```ilex
fn println(args: ..unknown) {
    #for const arg in args {
        when type_of(arg) {
            int:    write_int(arg);
            string: write_string(arg);
            else:   write_generic(arg);
        }
    }
}
```

Each call site generates a specialized version with direct calls. No branching, no boxing, no allocation.

## SIMD Types

SIMD stands for single instruction, multiple data. It is a type of parallel processing where one instruction
operates on multiple data points at the same time.
```ilex
simd<N, T>
typedef Vec4f as simd<4, f32>;
```
