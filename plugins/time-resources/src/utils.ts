import type { WorkSlot, ToDo } from '@hcengineering/time'
import type { DefSeparators } from '@hcengineering/ui'
import core, { type Class, type Client, type Doc, type Ref, type Space } from '@hcengineering/core'
import { DAY, HOUR, MINUTE } from '@hcengineering/ui'
import { translate } from '@hcengineering/platform'
import time from '@hcengineering/time'
import { type TextEditorMode, type AnyExtension } from '@hcengineering/text-editor'
import { SvelteNodeViewRenderer } from '@hcengineering/text-editor-resources'
import { getClient } from '@hcengineering/presentation'

import ToDoItemNodeView from './components/text-editor/node-view/ToDoItemNodeView.svelte'
import ToDoListNodeView from './components/text-editor/node-view/ToDoListNodeView.svelte'
import { TodoItemExtension, TodoListExtension } from './text-editor-extensions'
import timePlugin from './plugin'

export * from './types'

export function getNearest (events: WorkSlot[]): WorkSlot | undefined {
  const now = Date.now()
  events.sort((a, b) => a.date - b.date)
  return (
    events.find((event) => event.date <= now && event.dueDate >= now) ??
    events.find((event) => event.date >= now) ??
    events[events.length - 1]
  )
}

/**
 * @public
 */
export const timeSeparators: DefSeparators = [
  { minSize: 18, size: 18, maxSize: 22.5, float: 'navigator' },
  null,
  { minSize: 20, size: 41.25, maxSize: 90 }
]

/**
 * @public
 */
export const teamSeparators: DefSeparators = [{ minSize: 12.5, size: 17.5, maxSize: 22.5, float: 'navigator' }, null]

export async function ToDoTitleProvider (client: Client, ref: Ref<ToDo>, doc?: ToDo): Promise<string> {
  const object = doc ?? (await client.findOne(time.class.ToDo, { _id: ref }))

  if (object === undefined) return ''

  return object.title
}

function isTodoableClass (objectClass: Ref<Class<Doc>>): boolean {
  const hierarchy = getClient().getHierarchy()

  try {
    const todosCollection = hierarchy.getAttribute(objectClass, 'todos')

    return todosCollection !== undefined && todosCollection.type._class === core.class.Collection
  } catch (e) {
    return false
  }
}

function isTodoable (
  mode: TextEditorMode,
  objectId?: Ref<Doc>,
  objectClass?: Ref<Class<Doc>>,
  objectSpace?: Ref<Space>
): boolean {
  return (
    mode === 'full' &&
    objectId !== undefined &&
    objectClass !== undefined &&
    objectSpace !== undefined &&
    isTodoableClass(objectClass)
  )
}

export function createTodoItemExtension (mode: TextEditorMode, ctx: any): AnyExtension | undefined {
  if (!isTodoable(mode, ctx.objectId, ctx.objectClass, ctx.objectSpace)) {
    return
  }

  const { objectId, objectClass, objectSpace } = ctx

  return TodoItemExtension.extend({
    addNodeView () {
      return SvelteNodeViewRenderer(ToDoItemNodeView, {
        contentAs: 'li',
        contentClass: 'todo-item',
        componentProps: { objectId, objectClass, objectSpace },
        ignoreMutation: () => true
      })
    }
  }).configure({
    HTMLAttributes: {
      class: 'todo-item'
    }
  })
}

export function createTodoListExtension (mode: TextEditorMode, ctx: any): AnyExtension | undefined {
  if (!isTodoable(mode, ctx.objectId, ctx.objectClass, ctx.objectSpace)) {
    return
  }

  return TodoListExtension.extend({
    addNodeView () {
      return SvelteNodeViewRenderer(ToDoListNodeView, { ignoreMutation: () => true })
    }
  }).configure({
    HTMLAttributes: {
      class: 'todo-list'
    }
  })
}

export function calculateEventsDuration (events: WorkSlot[]): number {
  const points = events.flatMap((event) => [
    { time: event.date, type: 'start' },
    { time: event.dueDate, type: 'end' }
  ])

  points.sort((a, b) => a.time - b.time)

  let activeEvents = 0
  let duration = 0
  let lastTime = 0

  points.forEach((point) => {
    if (activeEvents > 0) {
      duration += point.time - lastTime
    }
    activeEvents += point.type === 'start' ? 1 : -1
    lastTime = point.time
  })

  return duration
}

export async function formatEventsDuration (duration: number, language: string): Promise<string> {
  let text = ''
  const days = Math.floor(duration / DAY)
  if (days > 0) {
    text += await translate(timePlugin.string.Days, { days }, language)
  }
  const hours = Math.floor((duration % DAY) / HOUR)
  if (hours > 0) {
    text += ' '
    text += await translate(timePlugin.string.Hours, { hours }, language)
  }
  const minutes = Math.floor((duration % HOUR) / MINUTE)
  if (minutes > 0) {
    text += ' '
    text += await translate(timePlugin.string.Minutes, { minutes }, language)
  }
  text = text.trim()
  return text
}
