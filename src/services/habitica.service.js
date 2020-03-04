const axios = require("axios");

/**
 * @typedef HabiticaTask
 *
 * @property { String } _id
 * @property { String } userId
 * @property { String } text
 * @property { String } [alias]
 * @property { String } type
 * @property { String } [notes]
 * @property { Number } [value]
 * @property { Number } [priority]
 * @property { Date } [date]
 * @property { String } [attribute]
 * @property { String } createdAt
 * @property { String } [updatedAt]
 * @property { Boolean } [completed]
 */

/**
 * @typedef HabiticaNotification
 *
 * @property { String } id
 * @property { Object } data
 * @property { Object } data.group
 * @property { String } data.group.id
 * @property { String } data.group.name
 * @property { Boolean } seen
 * @property { String } type
 */

/**
 * @typedef HabiticaChatMessage
 *
 * @property { String } user
 * @property { String } text
 * @property { String } id
 */

module.exports = {
	name: "habitica",

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: "https://habitica.com/api/v3/",
			timeout: 5000,
			headers: {
				"Content-Type": "application/json",
				"x-api-user": `${process.env.HABITICA_USER}`,
				"x-api-key": `${process.env.HABITICA_TOKEN}`,
				"x-client": `${process.env.HABITICA_USER}-Testing`
			}
		}
	},

	/**
	 * Actions.
	 */
	actions: {
		create: {
			/**
			 * Creates a task
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaTask } Habitica created task.
			 */
			handler(ctx) {
				return this.createTask(ctx.params);
			}
		},

		update: {
			/**
			 * Updates a task
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaTask } Habitica updated task.
			 */
			handler(ctx) {
				return this.updateTask(ctx.params);
			}
		},

		list: {
			/**
			 * Lists all tasks
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaTask[] } Habitica tasks
			 */
			handler(ctx) {
				return this.listTasks();
			}
		},

		log: {
			/**
			 * Logs params for debugging
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Object } params
			 */
			handler(ctx) {
				this.logger.info(ctx.params);
				return ctx.params;
			}
		},

		onWebhookTrigger: {
			/**
			 * Actions to be done according to the webhook's trigger
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			params: {
				type: { type: "string" }
			},
			handler(ctx) {
				const eventMap = {
					questInvited: () => this.onQuestInvite(ctx.params)
				};
				return eventMap[ctx.params.type]();
			}
		},
		/**
		 * Action to get task from Asana and create it on Habitica.
		 */
		syncTaskFromAsanaById: {
			params: {
				gid: { type: "string" }
			},

			/**
			 * Creates or updates a task on habitica based on an Asana task gid
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaTask } Habitica created or updated task.
			 */
			handler(ctx) {
				const response = this.syncTaskFromAsanaById(ctx.params.gid);
				return response;
			}
		},

		getTaskById: {
			params: {
				taskId: { type: "string" }
			},

			/**
			 * Gets an Habitica task by its id
			 * 			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaTask } Habitica  task.
			 */
			handler(ctx) {
				const response = this.getTaskById(ctx.params.taskId);
				return response;
			}
		},

		getNotificationsFromHabitica: {
			/**
			 * Gets current user's notifications from Habitica
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaNotification[] } Habitica user's notification list
			 */
			handler(ctx) {
				return this.getNotificationsFromHabitica();
			}
		},

		readAllNotifications: {
			/**
			 * Reads all user's notifications from Habitica
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaNotification[] } Habitica user's notification list
			 */
			handler(ctx) {
				return this.readAllNotifications();
			}
		},

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		createChatMessage: {
			handler(ctx) {
				return this.createChatMessage(ctx.params.message);
			}
		}
	},

	/**
	 * @typedef QuestInvited
	 * @property { 'questActivity' } webhookType
	 * @property { 'questInvited' } type
	 * @property { Object } group
	 * @property { String } group.id
	 * @property { String } group.name
	 * @property { Object } quest
	 * @property { String } quest.key
	 * @property { Object } user
	 * @property { String } user._id
	 */

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Events to happen when the webhook type is questInvited
		 * @param { QuestInvited  } questInvitedData
		 * @returns { HabiticaChatMessage }
		 */
		async onQuestInvite(questInvitedData) {
			const message = `[ QUEST INVITE ] ${questInvitedData.quest.key}`;
			return this.createChatMessage(message);
		},

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		async createChatMessage(message) {
			const {
				data: { data: responseData }
			} = await this.axios.post("/groups/party/chat", { message });
			const {
				message: { id, user, text }
			} = responseData;
			const messageCreated = { id, user, text };
			return messageCreated;
		},

		async listTasks() {
			try {
				const {
					data: { data: tasks }
				} = await this.axios.get("/tasks/user");
				return tasks;
			} catch (error) {
				console.log(error);
				return [{ error }];
			}
		},

		/**
		 * Updates a web Habitica task
		 *
		 * @param { HabiticaTask } taskData task
		 * @returns { Promise.<HabiticaTask> } updated web task
		 */
		async updateTask(taskData) {
			try {
				const {
					data: { data: task }
				} = await this.axios.put(`/tasks/${taskData.id}`, taskData);
				return task;
			} catch (error) {
				console.log(error);
				return error;
			}
		},

		/**
		 * Creates a task in Habiticas's website
		 *
		 * @param { HabiticaTask } taskData - Habitica task create params.
		 * @returns { Promise.<HabiticaTask> } created web task
		 */
		async createTask(taskData) {
			try {
				const {
					data: { data: task }
				} = await this.axios.post("/tasks/user", taskData);
				return task;
			} catch (error) {
				console.log(error);
				return error;
			}
		},

		/**
		 * Get task from Asana, saves it in the Habitica's servers
		 *
		 * @param { Number } gid - Task gid.
		 * @returns { Promise.<HabiticaTask> }
		 */
		async syncTaskFromAsanaById(gid) {
			const asanaTask = await this.broker.call("asana.getAsanaTaskById", {
				gid
			});

			const { assignee } = asanaTask;
			if (!assignee || assignee.gid !== process.env.ASSIGNEE_GID) {
				return { syncd: "not" };
			}

			const syncdTask = await this.deduplicateTask(asanaTask);
			this.logger.info("Synchronized task", syncdTask.id);
			return syncdTask;
		},

		/**
		 * Parses Asana's Task to Habitica's Task.
		 *
		 * @param { import('asana').resources.Tasks.Type } asanaTask - Asana Task.
		 * @returns { HabiticaTask } Habitica task.
		 */
		parseTaskFromAsana(asanaTask) {
			const { name, due_on, gid, projects, created_at } = asanaTask;
			const project = projects[0] && projects[0].gid;
			const habiticaTask = {
				gid,
				text: name,
				type: "todo",
				date: due_on,
				notes: `[Ir para a task](https://app.asana.com/0/${project}/${gid})`,
				priority: 2,
				createdAt: created_at
			};
			return habiticaTask;
		},

		/**
		 * Get an Habitica task by its id.
		 *
		 * @param { string } id - Task id.
		 * @returns { Promise.<HabiticaTask> } Related task found.
		 */
		async getTaskById(id) {
			try {
				const {
					data: { data: task }
				} = await this.axios.get(`/tasks/${id}`);
				return task;
			} catch (error) {
				const { response } = error;

				if (response && response.status === 404) {
					console.log(response.data.message);
					return null;
				}

				console.log(error);
				throw new Error(
					`There's been a problem finding the Habitica task related to "${id}"`,
					error
				);
			}
		},

		/**
		 * Parses the task to a normalized format and updates it
		 * or creates a new task
		 *
		 * @param { import('asana').resources.Tasks.Type } asanaTask - Task from asana
		 * @returns { Promise.<HabiticaTask> } updated task state.
		 */
		async deduplicateTask(asanaTask) {
			try {
				const habiticaTask = this.parseTaskFromAsana(asanaTask);
				const {
					data: { data: tasks }
				} = await this.axios.get("/tasks/user");
				const existingTask = tasks.find(
					task => task.notes && task.notes.includes(asanaTask.gid)
				);
				if (existingTask) {
					habiticaTask.id = existingTask.id;
					habiticaTask._id = existingTask._id;
					return this.updateTask(habiticaTask);
				}

				return this.createTask(habiticaTask);
			} catch (error) {
				const { message } = error;
				throw new Error(`Could not sync task: ${message}`, error);
			}
		},

		/**
		 * Gets current user's notifications from Habitica
		 *
		 * @returns { HabiticaNotification[] } Habitica user's notification list
		 */
		async getNotificationsFromHabitica() {
			const {
				data: { notifications }
			} = await this.axios.get("/user");
			return notifications;
		},

		/**
		 * Reads all user's notifications from Habitica
		 *
		 * @returns { HabiticaNotification[] } Habitica user's notification list
		 */
		async readAllNotifications() {
			const notifications = await this.getNotificationsFromHabitica();
			const readNotificationById = async ({ id }) =>
				this.axios.post(`/notifications/${id}/read `);
			return Promise.all(notifications.map(readNotificationById));
		}
	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {
		this.axios = axios.create({
			baseURL: this.settings.axios.baseURL,
			timeout: this.settings.axios.timeout,
			headers: this.settings.axios.headers
		});
	},

	/**
	 * Service started lifecycle event handler.
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler.
	 */
	stopped() {}
};
