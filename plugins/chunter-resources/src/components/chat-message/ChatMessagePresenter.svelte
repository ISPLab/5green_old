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
  import { Person, PersonAccount } from '@hcengineering/contact'
  import { personAccountByIdStore, personByIdStore } from '@hcengineering/contact-resources'
  import { Class, Doc, getCurrentAccount, Ref, WithLookup } from '@hcengineering/core'
  import { getClient, MessageViewer } from '@hcengineering/presentation'
  import { AttachmentDocList, AttachmentImageSize } from '@hcengineering/attachment-resources'
  import { getDocLinkTitle } from '@hcengineering/view-resources'
  import { Action, Button, IconEdit, ShowMore } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import activity, { ActivityMessage, ActivityMessageViewType, DisplayActivityMessage } from '@hcengineering/activity'
  import { ActivityDocLink, ActivityMessageTemplate } from '@hcengineering/activity-resources'
  import chunter, { ChatMessage, ChatMessageViewlet } from '@hcengineering/chunter'
  import { Attachment } from '@hcengineering/attachment'

  import ChatMessageHeader from './ChatMessageHeader.svelte'
  import ChatMessageInput from './ChatMessageInput.svelte'

  export let value: WithLookup<ChatMessage> | undefined
  export let doc: Doc | undefined = undefined
  export let showNotify: boolean = false
  export let isHighlighted: boolean = false
  export let isSelected: boolean = false
  export let shouldScroll: boolean = false
  export let embedded: boolean = false
  export let withActions: boolean = true
  export let showEmbedded = false
  export let hideFooter = false
  export let skipLabel = false
  export let actions: Action[] = []
  export let hoverable = true
  export let inline = false
  export let hoverStyles: 'borderedHover' | 'filledHover' = 'borderedHover'
  export let withShowMore: boolean = true
  export let attachmentImageSize: AttachmentImageSize = 'auto'
  export let videoPreload = true
  export let hideLink = false
  export let compact = false
  export let type: ActivityMessageViewType = 'default'
  export let onClick: (() => void) | undefined = undefined

  const client = getClient()
  const { pendingCreatedDocs } = client
  const hierarchy = client.getHierarchy()
  const STALE_TIMEOUT_MS = 5000
  const currentAccount = getCurrentAccount()

  let account: PersonAccount | undefined = undefined
  let person: Person | undefined = undefined

  let parentMessage: DisplayActivityMessage | undefined = undefined
  let object: Doc | undefined

  let refInput: ChatMessageInput

  let viewlet: ChatMessageViewlet | undefined
  ;[viewlet] =
    value !== undefined
      ? client.getModel().findAllSync(chunter.class.ChatMessageViewlet, {
        objectClass: value.attachedToClass,
        messageClass: value._class
      })
      : []

  $: accountId = value?.createdBy
  $: account = accountId !== undefined ? $personAccountByIdStore.get(accountId as Ref<PersonAccount>) : undefined
  $: person = account?.person !== undefined ? $personByIdStore.get(account.person) : undefined

  $: value !== undefined &&
    getParentMessage(value.attachedToClass, value.attachedTo).then((res) => {
      parentMessage = res as DisplayActivityMessage
    })

  $: if (doc !== undefined && value?.attachedTo === doc._id) {
    object = doc
  } else if (value !== undefined) {
    void client.findOne(value.attachedToClass, { _id: value.attachedTo }).then((result) => {
      object = result
    })
  }

  let stale = false
  let markStaleId: NodeJS.Timeout | undefined
  $: pending = value?._id !== undefined && $pendingCreatedDocs[value._id]
  $: if (pending) {
    markStaleId = setTimeout(() => {
      stale = true
    }, STALE_TIMEOUT_MS)
  } else {
    if (markStaleId !== undefined) {
      clearTimeout(markStaleId)
      markStaleId = undefined
    }
    stale = false
  }

  async function getParentMessage (_class: Ref<Class<Doc>>, _id: Ref<Doc>): Promise<ActivityMessage | undefined> {
    if (hierarchy.isDerived(_class, activity.class.ActivityMessage)) {
      return await client.findOne<ActivityMessage>(_class, { _id: _id as Ref<ActivityMessage> })
    }
  }

  async function handleEditAction (): Promise<void> {
    isEditing = true
  }

  let isEditing = false
  let additionalActions: Action[] = []

  $: isOwn = account !== undefined && account._id === currentAccount._id

  $: additionalActions = [
    ...(isOwn
      ? [
          {
            label: activity.string.Edit,
            icon: IconEdit,
            group: 'edit',
            action: handleEditAction
          }
        ]
      : []),
    ...actions
  ]

  let attachments: Attachment[] | undefined = undefined
  $: attachments = value?.$lookup?.attachments as Attachment[] | undefined
</script>

{#if inline && object}
  {#await getDocLinkTitle(client, object._id, object._class, object) then title}
    <ActivityDocLink
      {object}
      {title}
      panelComponent={hierarchy.classHierarchyMixin(object._class, view.mixin.ObjectPanel)?.component ??
        view.component.EditDoc}
    />
  {/await}
{:else if value && !inline}
  <ActivityMessageTemplate
    message={value}
    {viewlet}
    {parentMessage}
    {person}
    {showNotify}
    {isHighlighted}
    {isSelected}
    {shouldScroll}
    {embedded}
    withActions={withActions && !isEditing}
    actions={additionalActions}
    {showEmbedded}
    {hideFooter}
    {hoverable}
    {hoverStyles}
    {skipLabel}
    {pending}
    {stale}
    showDatePreposition={hideLink}
    {type}
    {onClick}
  >
    <svelte:fragment slot="header">
      <ChatMessageHeader editedOn={value.editedOn} label={skipLabel ? undefined : viewlet?.label} />
    </svelte:fragment>
    <svelte:fragment slot="content">
      {#if !isEditing}
        {#if withShowMore}
          <ShowMore limit={compact ? 80 : undefined}>
            <div class="clear-mins">
              <MessageViewer message={value.message} />
              <AttachmentDocList {value} {attachments} imageSize={attachmentImageSize} {videoPreload} />
            </div>
          </ShowMore>
        {:else}
          <div class="clear-mins">
            <MessageViewer message={value.message} />
            <AttachmentDocList {value} {attachments} imageSize={attachmentImageSize} {videoPreload} />
          </div>
        {/if}
      {:else if object}
        <ChatMessageInput
          bind:this={refInput}
          chatMessage={value}
          shouldSaveDraft={false}
          focusIndex={1000}
          autofocus
          {object}
          on:submit={() => {
            isEditing = false
          }}
        />
        <div class="flex-row-center gap-2 justify-end mt-2">
          <Button
            label={view.string.Cancel}
            on:click={() => {
              isEditing = false
            }}
          />
          <Button label={activity.string.Update} accent on:click={() => refInput.submit()} />
        </div>
      {/if}
    </svelte:fragment>
  </ActivityMessageTemplate>
{/if}
