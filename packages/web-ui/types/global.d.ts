// Global type declarations for external libraries with TypeScript issues

declare module '@xixixao/uploadstuff/lib/useEvent' {
  export function useEvent<T extends (...args: any[]) => any>(handler: T): T
}

declare module '@xixixao/uploadstuff/lib/useEvent.ts' {
  export function useEvent<T extends (...args: any[]) => any>(handler: T): T
}
