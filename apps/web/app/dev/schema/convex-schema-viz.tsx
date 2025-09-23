'use client'
import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  type Node,
  ReactFlow
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import schema from '@packages/backend/convex/schema'

import { Table, TableField } from './types'

import { TableNode } from './table-node'

// going to put most of the code here. we don't need to maintain state for reactflow since
// the schema is fixed.

const getTablesFromConvexSchema = (): Table[] => {
  const tables: Table[] = []
  const isTableReferenced: Record<string, boolean> = {}

  // Helper to unwrap optional unions like union(T, null)
  const unwrapOptional = (v: any): { base: any; optional: boolean } => {
    if (v && v.kind === 'union' && Array.isArray(v.members)) {
      const nullMember = v.members.find((m: any) => m?.kind === 'null')
      if (nullMember) {
        const nonNull = v.members.find((m: any) => m?.kind !== 'null')
        if (nonNull) return { base: nonNull, optional: true }
      }
    }
    return { base: v, optional: v?.isOptional !== 'required' }
  }

  // First pass: collect which tables are referenced by any field
  for (const [, definition] of Object.entries(schema.tables)) {
    const objectFields: Record<string, any> = (definition as any).validator
      .fields
    for (const [, field] of Object.entries(objectFields)) {
      const { base } = unwrapOptional(field)
      if (base?.kind === 'id') {
        isTableReferenced[base.tableName] = true
      } else if (base?.kind === 'array') {
        const { base: elemBase } = unwrapOptional((base as any).element)
        if (elemBase?.kind === 'id') {
          isTableReferenced[elemBase.tableName] = true
        }
      }
    }
  }

  // Second pass: build tables and fields with correct isReferenced
  for (const [table, definition] of Object.entries(schema.tables)) {
    const fields: TableField[] = []
    const objectFields: Record<string, any> = (definition as any).validator
      .fields
    for (const [fieldName, field] of Object.entries(objectFields)) {
      const { base, optional } = unwrapOptional(field)

      let hasReference = false
      let referenceTable: string | undefined
      if (base?.kind === 'id') {
        hasReference = true
        referenceTable = base.tableName
      } else if (base?.kind === 'array') {
        const { base: elemBase } = unwrapOptional((base as any).element)
        if (elemBase?.kind === 'id') {
          hasReference = true
          referenceTable = elemBase.tableName
        }
      }

      const tableField: TableField = {
        name: fieldName,
        type: base?.kind ?? 'unknown',
        isOptional: !!optional,
        hasReference,
        referenceTable
      }

      fields.push(tableField)
    }

    tables.push({
      name: table,
      fields,
      isReferenced: !!isTableReferenced[table]
    })
  }

  return tables
}

const tables: Table[] = getTablesFromConvexSchema()

const calculateRequiredNumberOfGridRowsForNodes = (): number => {
  let numberOfRows = 1
  while (true) {
    if (numberOfRows ** 2 >= tables.length) break
    numberOfRows++
  }

  return numberOfRows
}

const generateNodes = (tables: Table[]): Node[] => {
  // Place nodes in a near-square grid using deterministic row/column math
  const gridSize = calculateRequiredNumberOfGridRowsForNodes()

  return tables.map((table, index) => {
    const row = Math.floor(index / gridSize)
    const col = index % gridSize
    const x = col * 300
    const y = row * 300

    return {
      id: table.name,
      position: { x, y },
      data: table,
      type: 'table'
    }
  })
}

const generateEdges = (tables: Table[]): Edge[] => {
  const edges: Edge[] = []
  for (const table of tables) {
    for (const field of table.fields) {
      if (field.hasReference) {
        const target = field.referenceTable as string
        edges.push({
          id: `${table.name}.${field.name}->${target}`,
          source: table.name,
          target,
          animated: true,
          sourceHandle: `${table.name}.${field.name}`,
          targetHandle: target,
          style: {
            strokeWidth: 2,
            stroke: '#e1ad01'
          }
        })
      }
    }
  }

  return edges
}

const nodes: Node[] = generateNodes(tables)

const edges: Edge[] = generateEdges(tables)

const nodeTypes = {
  table: TableNode
}

export const ConvexSchemaViz = () => {
  return (
    <div className="h-dvh w-dvw">
      <ReactFlow
        fitView
        fitViewOptions={{ padding: 0.4 }}
        defaultNodes={nodes}
        defaultEdges={edges}
        proOptions={{
          // this is open source, but show them some love/money if you want to use this for profit!
          hideAttribution: true
        }}
        colorMode="dark"
        nodeTypes={nodeTypes}
      >
        <Background color="#222" variant={BackgroundVariant.Lines} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
