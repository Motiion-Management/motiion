declare module '@xixixao/uploadstuff/lib/useEvent' {
  export function useEvent<T extends (...args: any[]) => any>(handler?: T): T
}

declare module '@xixixao/uploadstuff/lib/useEvent.ts' {
  export function useEvent<T extends (...args: any[]) => any>(handler?: T): T
}

declare module '@xixixao/uploadstuff' {
  export * from '@xixixao/uploadstuff/lib/index'
  export function useEvent<T extends (...args: any[]) => any>(handler?: T): T
}
