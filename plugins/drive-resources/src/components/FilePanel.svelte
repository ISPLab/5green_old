<!--
// Copyright © 2024 Hardcore Engineering Inc.
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
  import { WithLookup, type Ref } from '@hcengineering/core'
  import { type File, type FileVersion } from '@hcengineering/drive'
  import { Panel } from '@hcengineering/panel'
  import { createQuery, getBlobHref } from '@hcengineering/presentation'
  import { Button, IconMoreH } from '@hcengineering/ui'
  import view from '@hcengineering/view'
  import { showMenu } from '@hcengineering/view-resources'

  import EditFile from './EditFile.svelte'
  import FileAside from './FileAside.svelte'
  import FileHeader from './FileHeader.svelte'
  import IconDownload from './icons/FileDownload.svelte'
  import IconUpload from './icons/FileUpload.svelte'

  import drive from '../plugin'
  import { replaceOneFile } from '../utils'

  export let _id: Ref<File>
  export let readonly: boolean = false
  export let embedded: boolean = false
  export let kind: 'default' | 'modern' = 'default'

  export function canClose (): boolean {
    return false
  }

  let object: WithLookup<File> | undefined = undefined
  let version: FileVersion | undefined = undefined
  let download: HTMLAnchorElement
  let upload: HTMLInputElement

  const query = createQuery()
  $: query.query(
    drive.class.File,
    { _id },
    (res) => {
      ;[object] = res
      version = object?.$lookup?.file
    },
    {
      lookup: {
        file: drive.class.FileVersion
      }
    }
  )

  function handleDownloadFile (): void {
    if (object != null && download != null) {
      download.click()
    }
  }

  function handleUploadFile (): void {
    if (object != null && upload != null) {
      upload.click()
    }
  }

  async function handleFileSelected (): Promise<void> {
    const files = upload.files
    if (object != null && files !== null && files.length > 0) {
      await replaceOneFile(object._id, files[0])
    }
    upload.value = ''
  }
</script>

{#if object && version}
  <Panel
    {object}
    {embedded}
    {kind}
    allowClose={!embedded}
    isHeader={false}
    useMaxWidth={false}
    on:open
    on:close
    on:update
  >
    <input
      bind:this={upload}
      id="file"
      name="file"
      type="file"
      style="display: none"
      disabled={upload == null}
      on:change={handleFileSelected}
    />

    <svelte:fragment slot="title">
      <FileHeader {object} />
    </svelte:fragment>

    <svelte:fragment slot="utils">
      {#await getBlobHref(undefined, version.file, object.name) then href}
        <a class="no-line" {href} download={object.name} bind:this={download}>
          <Button
            icon={IconDownload}
            iconProps={{ size: 'medium' }}
            kind={'icon'}
            showTooltip={{ label: drive.string.Download }}
            on:click={handleDownloadFile}
          />
        </a>
      {/await}
      <Button
        icon={IconUpload}
        iconProps={{ size: 'medium' }}
        kind={'icon'}
        showTooltip={{ label: drive.string.Upload }}
        on:click={handleUploadFile}
      />
      <Button
        icon={IconMoreH}
        iconProps={{ size: 'medium' }}
        kind={'icon'}
        showTooltip={{ label: view.string.MoreActions }}
        on:click={(ev) => {
          showMenu(ev, { object })
        }}
      />
    </svelte:fragment>

    <svelte:fragment slot="aside">
      <FileAside {object} {readonly} />
    </svelte:fragment>

    <div class="flex-col flex-grow flex-no-shrink step-tb-6">
      <EditFile {object} {readonly} />
    </div>
  </Panel>
{/if}
