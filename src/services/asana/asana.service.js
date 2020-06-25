const Asana = require('asana')
const { Errors } = require('moleculer')
const { AsanaError } = require('../../utils/errors')
const axios = require('axios')

/**
 * @typedef AsanaWebhook
 * @property { Number } gid
 * @property { Boolean } active
 * @property { import('asana').resources.Projects.Type } resource
 * @property { 'webhook' } resource_type
 * @property { String } target
 */

module.exports = {
	name: 'asana',

	/**
	 * Service settings.
	 */
	settings: {
		$secureSettings: ['asana.token', 'axios.headers.Authorization'],
		asana: {
			headers: {
				'asana-enable': 'string_ids,new_sections'
			},
			workspace: process.env.WORKSPACE,
			token: process.env.ASANA_TOKEN
		},
		axios: {
			baseURL: 'https://app.asana.com/api/1.0/',
			timeout: 5000,
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${process.env.ASANA_TOKEN}`
			}
		}
	},

	/**
	 * Actions.
	 */
	actions: {
		create: {
			/**
			 * Task schema validation.
			 */
			params: {
				name: { type: 'string' },
				notes: { type: 'string', optional: true },
				memberships: {
					type: 'array',
					items: {
						type: 'object',
						props: {
							project: { type: 'string' },
							section: { type: 'string' }
						}
					}
				}
			},
			/**
			 * Creates a task into wanted project.
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<import('asana').resources.Tasks.Type> } Asana created task.
			 */
			handler(ctx) {
				return this.createTask(ctx.params)
			}
		},

		update: {
			params: {
				id: { type: 'string' },
				data: { type: 'object' }
			},
			/**
			 * Updates a task based on its id.
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<import('asana').resources.Tasks.Type> } Asana updated task.
			 */
			handler(ctx) {
				return this.updateTask(ctx.params.id, ctx.params.data)
			}
		},

		remove: {
			params: {
				id: { type: 'string' }
			},
			/**
			 * Deletes a task based on its id.
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<void> } Promise to delete action.
			 */
			handler(ctx) {
				return this.deleteTask(ctx.params.id)
			}
		},

		user: {
			/**
			 * Retrieves current client user info.
			 *
			 * @returns { Promise.<import('asana').resources.Users.Type> } Asana User Type.
			 */
			handler() {
				return this.getUser()
			}
		},

		workspace: {
			params: {
				name: { type: 'string' }
			},
			/**
			 * Finds any workspace matching the given name.
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<import('asana').resources.Workspaces.Type> } Asana workspace.
			 */
			handler(ctx) {
				return this.getWorkspaceByName(ctx.params.name)
			}
		},

		projects: {
			/**
			 * Get all Asana workspace projects.
			 *
			 * @returns { import('asana').resources.Projects.Type[] } - List of workspace projects.
			 */
			handler() {
				return this.getWorkspaceProjects()
			}
		},

		sections: {
			params: {
				project: { type: 'string' }
			},
			/**
			 * Get all sections from a given Asana project.
			 *
			 * @param { import('muleculer').Context } ctx - Molecular context.
			 * @returns { import('asana').resources.Sections.Type[] } Asana sections.
			 */
			handler(ctx) {
				return this.client.sections.findByProject(ctx.params.project)
			}
		},

		syncByEvents: {
			/**
			 * Create Habitica task based on received asana events
			 * @param { import('muleculer').Context } ctx - Molecular context.
			 * @returns { import('../habitica/habiticaTask.service').HabiticaTask) }
			 */
			handler(ctx) {
				this.syncTasksByEvents(ctx.params.events)
				return { ack: true }
			}
		},

		webhooks: {
			/**
			 * Get current webhooks for the used workspace
			 * @param { import('muleculer').Context } ctx - Molecular context.
			 * @returns { AsanaWebhook } Asana webhook
			 */
			handler(ctx) {
				return this.getWorkspaceWebhooks()
			}
		},

		getAsanaTaskById: {
			params: {
				gid: { type: 'string' }
			},
			/**
			 * Get Asana task by Id.
			 *
			 * @param { import('muleculer').Context } ctx - Molecular context.
			 * @returns { import('asana').resources.Tasks.Type } Asana task.
			 */
			handler(ctx) {
				const gid = Number(ctx.params.gid)
				const asanaTask = this.getAsanaTaskById(gid)
				return asanaTask
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Dispatch actions to Habitica and Telegram Services
		 * @param { import('asana').resources.Events.Type[] } events
		 * @returns { Object[] }
		 */
		async syncTasksByEvents(events = []) {
			try {
				const uniqueIdsToSyncWithHabitica = []
				const uniqueIdsToSendToTelegram = []
				const assignedTask = await this.getAsanaTaskById('1167854517839477')
				const assignee = (assignedTask && assignedTask.assignee) || {}
				const isUserAssigned = assignee.gid === process.env.ASSIGNEE_GID
				events.forEach(event => {
					this.logger.info('Received webhook event', event)
					const taskId = typeof event.resource === 'object' ? event.resource.gid : event.resource
					if (event.resource.resource_type !== 'task') {
						return
					}

					if (!uniqueIdsToSyncWithHabitica.includes(taskId)) {
						uniqueIdsToSyncWithHabitica.push(taskId)
					}

					const isUniqueId = !uniqueIdsToSendToTelegram.includes(taskId)
					if (isUserAssigned && isUniqueId) {
						uniqueIdsToSendToTelegram.push(taskId)
					}
				})
				
				const habiticaTasks = await Promise.all(
					uniqueIdsToSyncWithHabitica.map(gid =>
						this.broker.call('habiticaTask.syncTaskFromAsanaById', {
							gid
						})
					)
				)

				const telegramTasks = await Promise.all(
					uniqueIdsToSendToTelegram.map(gid =>
						this.broker.call('telegram.syncTaskFromAsanaById', {
							gid
						})
					)
				)
				return [habiticaTasks, telegramTasks]
			} catch (error) {
				throw new AsanaError('There\'s been a problem with task sync', error)
			}
		},

		/**
		 * Get an Asana task by its id.
		 *
		 * @param { string } gid - Task gid.
		 * @returns { Promise.<import('asana').resources.Tasks.Type> } Related task found.
		 */
		async getAsanaTaskById(gid) {
			try {
				const task = await this.client.tasks.findById(gid)
				return task
			} catch (error) {
				throw new AsanaError(`There's been a problem finding the Asana task related to "${gid}"`, error)
			}
		},

		/**
		 * Creates a task into Asana wanted project.
		 *
		 * @param { import('asana').resources.Tasks.Type } taskData - Asana task create params.
		 * @returns { Promise.<import('asana').resources.Tasks.Type> } Asana created task.
		 */
		async createTask(taskData) {
			try {
				const asanaTask = await this.client.tasks.create({
					workspace: this.settings.asana.workspace,
					...taskData
				})
				return asanaTask
			} catch (error) {
				throw new AsanaError('Could not create Asana task', error)
			}
		},

		/**
		 * Updates the given task content at Asana.
		 *
		 * @param { string } gid - Asana task id.
		 * @param { import('asana').resources.Tasks.CreateParams } taskData - Task data to be updated.
		 * @returns { Promise.<import('asana').resources.Tasks.Type> } - Asana updated task.
		 */
		async updateTask(gid, taskData) {
			try {
				const asanaTask = await this.client.tasks.update(gid, taskData)
				return asanaTask
			} catch (error) {
				throw new AsanaError('Could not update Asana task', error)
			}
		},

		/**
		 * Finds any workspace matching the given name.
		 *
		 * @param { string } name - Name to be found.
		 * @returns { Promise.<import('asana').resources.Workspaces.Type> } Asana workspace.
		 */
		async getWorkspaceByName(name) {
			try {
				const { data: workspaces } = await this.client.workspaces.findAll()
				return workspaces.find(workspace => workspace.name === name) || {}
			} catch (error) {
				throw new AsanaError(`There's been an error finding the workspace ${name}`, error)
			}
		},

		/**
		 * Retrieves Asana current client user info.
		 *
		 * @returns { Promise.<import('asana').resources.Users.Type> } Asana User Type.
		 */
		async getUser() {
			try {
				const user = await this.client.users.me()
				return user
			} catch (err) {
				throw new Errors.MoleculerError('Could not find the Asana client user', 404)
			}
		},

		/**
		 * Get current webhooks for the used workspace
		 * @returns { AsanaWebhook } Asana webhook
		 */
		async getWorkspaceWebhooks() {
			try {
				const {
					data: { data: webhooks }
				} = await this.axios.get('/webhooks', {
					params: {
						workspace: this.settings.asana.workspace
					}
				})
				return webhooks
			} catch (error) {
				throw new AsanaError('Could not get the workspace webhooks', error)
			}
		}
	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {
		this.client = Asana.Client.create({
			defaultHeaders: this.settings.asana.headers
		}).useAccessToken(this.settings.asana.token)
		this.client.dispatcher.retryOnRateLimit = true
		this.axios = axios.create({
			baseURL: this.settings.axios.baseURL,
			timeout: this.settings.axios.timeout,
			headers: this.settings.axios.headers
		})
	},

	/**
	 * Service started lifecycle event handler.
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler.
	 */
	stopped() {}
}
