<!--
// Copyright © 2023 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import attachment, { Attachment } from '@hcengineering/attachment'
  import contact from '@hcengineering/contact'
  import core, { Account, Doc, Ref, generateId, type Blob } from '@hcengineering/core'
  import { IntlString, getResource, setPlatformStatus, unknownError } from '@hcengineering/platform'
  import { KeyedAttribute, createQuery, getClient, uploadFile } from '@hcengineering/presentation'
  import { getCollaborationUser, getObjectLinkFragment } from '@hcengineering/view-resources'
  import textEditor, { type RefAction, type TextEditorHandler } from '@hcengineering/text-editor'
  import {
    AttachIcon,
    CollaborativeAttributeBox,
    TableIcon,
    addTableHandler,
    defaultRefActions,
    getModelRefActions
  } from '@hcengineering/text-editor-resources'
  import { AnySvelteComponent, getEventPositionElement, getPopupPositionElement, navigate } from '@hcengineering/ui'
  import view from '@hcengineering/view'

  import AttachmentsGrid from './AttachmentsGrid.svelte'

  export let object: Doc
  export let key: KeyedAttribute
  export let placeholder: IntlString
  export let focusIndex = -1
  export let boundary: HTMLElement | undefined = undefined
  export let refContainer: HTMLElement | undefined = undefined

  export let enableAttachments: boolean = true
  export let useAttachmentPreview: boolean = false
  export let readonly: boolean = false

  const client = getClient()

  const user = getCollaborationUser()
  let userComponent: AnySvelteComponent | undefined
  void getResource(contact.component.CollaborationUserAvatar).then((component) => {
    userComponent = component
  })

  let editor: CollaborativeAttributeBox

  let refActions: RefAction[] = []
  let extraActions: RefAction[] = []
  let modelRefActions: RefAction[] = []

  $: if (enableAttachments && !readonly) {
    extraActions = [
      {
        label: textEditor.string.Attach,
        icon: AttachIcon,
        action: handleAttach,
        order: 1001
      },
      {
        label: textEditor.string.Table,
        icon: TableIcon,
        action: handleTable,
        order: 1501
      }
    ]
  } else {
    extraActions = []
  }

  void getModelRefActions().then((actions) => {
    modelRefActions = actions
  })
  $: refActions = readonly
    ? []
    : defaultRefActions
      .concat(extraActions)
      .concat(modelRefActions)
      .sort((a, b) => a.order - b.order)

  let progress = false
  let attachments: Attachment[] = []

  const query = createQuery()
  $: query.query(
    attachment.class.Attachment,
    {
      attachedTo: object._id
    },
    (res) => {
      attachments = res
    },
    {
      lookup: {
        file: core.class.Blob
      }
    }
  )

  let inputFile: HTMLInputElement

  export function isFocused (): boolean {
    return editor?.isFocused() ?? false
  }

  export function handleTable (element: HTMLElement, editorHandler: TextEditorHandler, event?: MouseEvent): void {
    const position = event !== undefined ? getEventPositionElement(event) : getPopupPositionElement(element)

    addTableHandler(editorHandler.insertTable, position)
  }

  export function handleAttach (): void {
    inputFile.click()
  }

  async function fileSelected (): Promise<void> {
    if (readonly) return
    progress = true
    const list = inputFile.files
    if (list === null || list.length === 0) return
    for (let index = 0; index < list.length; index++) {
      const file = list.item(index)
      if (file !== null) {
        await createAttachment(file)
      }
    }
    inputFile.value = ''
    progress = false
  }

  async function createAttachment (file: File): Promise<{ file: Ref<Blob>, type: string } | undefined> {
    try {
      const uuid = await uploadFile(file)
      const _id: Ref<Attachment> = generateId()
      const attachmentDoc: Attachment = {
        _id,
        _class: attachment.class.Attachment,
        collection: 'attachments',
        modifiedOn: 0,
        modifiedBy: '' as Ref<Account>,
        space: object.space,
        attachedTo: object._id,
        attachedToClass: object._class,
        name: file.name,
        file: uuid,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      }

      await client.addCollection(
        attachment.class.Attachment,
        object.space,
        object._id,
        object._class,
        'attachments',
        attachmentDoc,
        attachmentDoc._id
      )
      return { file: uuid, type: file.type }
    } catch (err: any) {
      await setPlatformStatus(unknownError(err))
    }
  }

  function isAllowedPaste (evt: ClipboardEvent): boolean {
    let t: HTMLElement | null = evt.target as HTMLElement

    if (refContainer === undefined) {
      return true
    }

    while (t != null) {
      t = t.parentElement
      if (t === refContainer) {
        return true
      }
    }

    return false
  }

  export async function pasteAction (evt: ClipboardEvent): Promise<void> {
    if (readonly) return
    if (!isAllowedPaste(evt)) {
      return
    }

    const items = evt.clipboardData?.items ?? []
    for (const index in items) {
      const item = items[index]
      if (item.kind === 'file') {
        const blob = item.getAsFile()
        if (blob !== null) {
          await createAttachment(blob)
        }
      }
    }
  }

  export async function fileDrop (e: DragEvent): Promise<void> {
    if (readonly) return
    progress = true
    const list = e.dataTransfer?.files
    if (list !== undefined && list.length !== 0) {
      for (let index = 0; index < list.length; index++) {
        const file = list.item(index)
        if (file !== null) {
          await createAttachment(file)
        }
      }
    }
    progress = false
  }

  async function removeAttachment (attachment: Attachment): Promise<void> {
    progressItems.push(attachment._id)
    progressItems = progressItems

    await client.removeCollection(
      attachment._class,
      attachment.space,
      attachment._id,
      attachment.attachedTo,
      attachment.attachedToClass,
      'attachments'
    )

    await editor.removeAttachment(attachment.file)
  }

  let progressItems: Ref<Doc>[] = []
</script>

<input
  bind:this={inputFile}
  disabled={inputFile == null}
  multiple
  type="file"
  name="file"
  id="fileInput"
  style="display: none"
  on:change={fileSelected}
/>

{#key object?._id}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div
    class="flex-col clear-mins"
    on:paste={(ev) => pasteAction(ev)}
    on:dragover|preventDefault={() => {}}
    on:dragleave={() => {}}
    on:drop|preventDefault|stopPropagation={(ev) => {
      void fileDrop(ev)
    }}
  >
    <CollaborativeAttributeBox
      bind:this={editor}
      {object}
      {key}
      {user}
      {userComponent}
      {focusIndex}
      {placeholder}
      {boundary}
      {refActions}
      {readonly}
      attachFile={async (file) => {
        return await createAttachment(file)
      }}
      on:open-document={async (event) => {
        const doc = await client.findOne(event.detail._class, { _id: event.detail._id })
        if (doc != null) {
          const location = await getObjectLinkFragment(client.getHierarchy(), doc, {}, view.component.EditDoc)
          navigate(location)
        }
      }}
      on:focus
      on:blur
      on:update
    />
    {#if (attachments.length > 0 && enableAttachments) || progress}
      <AttachmentsGrid
        {attachments}
        {readonly}
        {progress}
        {progressItems}
        {useAttachmentPreview}
        on:remove={async (evt) => {
          if (evt.detail !== undefined) {
            await removeAttachment(evt.detail)
          }
        }}
      />
    {/if}
  </div>
{/key}
