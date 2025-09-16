/*
Bridge for calling internal Convex functions from http.ts using fully typed
FunctionReferences (STATIC). Intentionally avoids any/unknown.

If typechecking regresses (deep generic instantiation), we can temporarily
revert to a dynamic bridge by importing `internal` with a dynamic require
and returning typed functions. For now, we favor correctness and explicit types.
*/

// Intentionally left as an empty module to satisfy generated imports without
// pulling heavy generic types into this file.
export {}
