//
// Copyright © 2022 Hardcore Engineering Inc.
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
//

import { chunterId, type ThreadMessage } from '@hcengineering/chunter'
import core, {
  type Account,
  TxOperations,
  type Class,
  type Doc,
  type Domain,
  type Ref,
  type Space,
  DOMAIN_TX
} from '@hcengineering/core'
import {
  tryMigrate,
  tryUpgrade,
  type MigrateOperation,
  type MigrationClient,
  type MigrationUpgradeClient
} from '@hcengineering/model'
import activity, { migrateMessagesSpace, DOMAIN_ACTIVITY } from '@hcengineering/model-activity'
import notification from '@hcengineering/notification'
import contactPlugin, { type PersonAccount } from '@hcengineering/contact'
import { DOMAIN_NOTIFICATION } from '@hcengineering/model-notification'

import chunter from './plugin'
import { DOMAIN_CHUNTER } from './index'

export const DOMAIN_COMMENT = 'comment' as Domain

export async function createDocNotifyContexts (
  client: MigrationUpgradeClient,
  tx: TxOperations,
  attachedTo: Ref<Doc>,
  attachedToClass: Ref<Class<Doc>>
): Promise<void> {
  const users = await client.findAll(core.class.Account, {})
  const docNotifyContexts = await client.findAll(notification.class.DocNotifyContext, {
    user: { $in: users.map((it) => it._id) },
    attachedTo,
    attachedToClass
  })
  for (const user of users) {
    if (user._id === core.account.System) {
      continue
    }
    const docNotifyContext = docNotifyContexts.find((it) => it.user === user._id)

    if (docNotifyContext === undefined) {
      await tx.createDoc(notification.class.DocNotifyContext, core.space.Space, {
        user: user._id,
        attachedTo,
        attachedToClass,
        hidden: false
      })
    }
  }
}

export async function createGeneral (client: MigrationUpgradeClient, tx: TxOperations): Promise<void> {
  const current = await tx.findOne(chunter.class.Channel, { _id: chunter.space.General })
  if (current !== undefined) {
    if (current.autoJoin === undefined) {
      await tx.update(current, {
        autoJoin: true
      })
      await joinEmployees(current, tx)
    }
  } else {
    const createTx = await tx.findOne(core.class.TxCreateDoc, {
      objectId: chunter.space.General
    })

    if (createTx === undefined) {
      await tx.createDoc(
        chunter.class.Channel,
        core.space.Space,
        {
          name: 'general',
          description: 'General Channel',
          topic: 'General Channel',
          private: false,
          archived: false,
          members: await getAllEmployeeAccounts(tx),
          autoJoin: true
        },
        chunter.space.General
      )
    }
  }

  await createDocNotifyContexts(client, tx, chunter.space.General, chunter.class.Channel)
}

async function getAllEmployeeAccounts (tx: TxOperations): Promise<Ref<PersonAccount>[]> {
  const employees = await tx.findAll(contactPlugin.mixin.Employee, { active: true })
  const accounts = await tx.findAll(contactPlugin.class.PersonAccount, {
    person: { $in: employees.map((it) => it._id) }
  })
  return accounts.map((it) => it._id)
}

async function joinEmployees (current: Space, tx: TxOperations): Promise<void> {
  const accs = await getAllEmployeeAccounts(tx)
  const newMembers: Ref<Account>[] = [...current.members]
  for (const acc of accs) {
    if (!newMembers.includes(acc)) {
      newMembers.push(acc)
    }
  }
  await tx.update(current, {
    members: newMembers
  })
}

export async function createRandom (client: MigrationUpgradeClient, tx: TxOperations): Promise<void> {
  const current = await tx.findOne(chunter.class.Channel, { _id: chunter.space.Random })
  if (current !== undefined) {
    if (current.autoJoin === undefined) {
      await tx.update(current, {
        autoJoin: true
      })
      await joinEmployees(current, tx)
    }
  } else {
    const createTx = await tx.findOne(core.class.TxCreateDoc, {
      objectId: chunter.space.Random
    })

    if (createTx === undefined) {
      await tx.createDoc(
        chunter.class.Channel,
        core.space.Space,
        {
          name: 'random',
          description: 'Random Talks',
          topic: 'Random Talks',
          private: false,
          archived: false,
          members: await getAllEmployeeAccounts(tx),
          autoJoin: true
        },
        chunter.space.Random
      )
    }
  }

  await createDocNotifyContexts(client, tx, chunter.space.Random, chunter.class.Channel)
}

async function convertCommentsToChatMessages (client: MigrationClient): Promise<void> {
  await client.update(
    DOMAIN_COMMENT,
    { _class: 'chunter:class:Comment' as Ref<Class<Doc>> },
    { _class: chunter.class.ChatMessage }
  )
  await client.move(DOMAIN_COMMENT, { _class: chunter.class.ChatMessage }, DOMAIN_ACTIVITY)
}

async function removeBacklinks (client: MigrationClient): Promise<void> {
  await client.deleteMany(DOMAIN_COMMENT, { _class: 'chunter:class:Backlink' as Ref<Class<Doc>> })
  await client.deleteMany(DOMAIN_ACTIVITY, {
    _class: activity.class.DocUpdateMessage,
    objectClass: 'chunter:class:Backlink' as Ref<Class<Doc>>
  })
}

async function removeOldClasses (client: MigrationClient): Promise<void> {
  const classes = [
    'chunter:class:ChunterMessage',
    'chunter:class:Message',
    'chunter:class:Comment',
    'chunter:class:Backlink'
  ] as Ref<Class<Doc>>[]

  for (const _class of classes) {
    await client.deleteMany(DOMAIN_CHUNTER, { _class })
    await client.deleteMany(DOMAIN_ACTIVITY, { attachedToClass: _class })
    await client.deleteMany(DOMAIN_ACTIVITY, { objectClass: _class })
    await client.deleteMany(DOMAIN_NOTIFICATION, { attachedToClass: _class })
    await client.deleteMany(DOMAIN_TX, { objectClass: _class })
    await client.deleteMany(DOMAIN_TX, { 'tx.objectClass': _class })
  }
}

export const chunterOperation: MigrateOperation = {
  async migrate (client: MigrationClient): Promise<void> {
    await tryMigrate(client, chunterId, [
      {
        state: 'create-chat-messages',
        func: convertCommentsToChatMessages
      },
      {
        state: 'remove-backlinks',
        func: removeBacklinks
      },
      {
        state: 'migrate-chat-messages-space',
        func: async (client) => {
          await migrateMessagesSpace(
            client,
            chunter.class.ChatMessage,
            ({ attachedTo }) => attachedTo,
            ({ attachedToClass }) => attachedToClass
          )
        }
      },
      {
        state: 'migrate-thread-messages-space',
        func: async (client) => {
          await migrateMessagesSpace(
            client,
            chunter.class.ThreadMessage,
            (msg) => (msg as ThreadMessage).objectId,
            (msg) => (msg as ThreadMessage).objectClass
          )
        }
      },
      {
        state: 'remove-old-classes-v1',
        func: async (client) => {
          await removeOldClasses(client)
        }
      }
    ])
  },
  async upgrade (state: Map<string, Set<string>>, client: () => Promise<MigrationUpgradeClient>): Promise<void> {
    await tryUpgrade(state, client, chunterId, [
      {
        state: 'create-defaults-v2',
        func: async (client) => {
          const tx = new TxOperations(client, core.account.System)
          await createGeneral(client, tx)
          await createRandom(client, tx)
        }
      }
    ])
  }
}
