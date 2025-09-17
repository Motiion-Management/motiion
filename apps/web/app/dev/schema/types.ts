import { type Node } from '@xyflow/react'

export type TableField = {
  name: string
  isOptional: boolean
  type: string
  hasReference?: boolean
  referenceTable?: string
}

export type Table = {
  name: string
  fields: TableField[]
  isReferenced?: boolean
}

export type TableReference = {
  target: string
  source: string
  name: string
}

export type TableNodeType = Node<Table, 'table'>
