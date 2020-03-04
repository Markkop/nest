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
			handler(ctx) {
				return this.createTask(ctx.params);
			}
		},

		update: {
			handler(ctx) {
				return this.updateTask(ctx.params);
			}
		},

		list: {
			handler(ctx) {
				return this.listTasks();
			}
		},

		log: {
			handler(ctx) {
				const payload = ctx;
				this.logger.info(payload);
				return payload;
			}
		},

		/**
		 * Action to get task from Asana and create it on Habitica.
		 */
		syncTaskFromAsanaById: {
			params: {
				gid: { type: "string" }
			},

			handler(ctx) {
				const response = this.syncTaskFromAsanaById(ctx.params.gid);
				return response;
			}
		},

		/**
		 * Action to get task from Asana and create it on Habitica.
		 */
		syncTaskById: {
			params: {
				taskId: { type: "string" }
			},

			handler(ctx) {
				const response = this.syncTask(ctx.params.taskId);
				return response;
			}
		},

		/**
		 * Get Habitica task by its id
		 */
		getTaskById: {
			params: {
				taskId: { type: "string" }
			},

			handler(ctx) {
				const response = this.getTaskById(ctx.params.taskId);
				return response;
			}
		},
		/**
		 * Action to get user's notifications list
		 *
		 * @returns { Object[] } User's notifcations
		 */
		getNotificationsFromHabitica: {
			handler(ctx) {
				return this.getNotificationsFromHabitica();
			}
		},

		/**
		 * Action to read all user's notifications
		 *
		 * @returns { Object[] } User's notifcations after reading
		 */
		readAllNotifications: {
			handler(ctx) {
				return this.readAllNotifications();
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
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
					`There's been a problem finding the Habitica task related to "${taskId}"`,
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
		 * Get user's notification list
		 *
		 * @returns { Object[]} Notifications TODO: typedef this
		 */
		async getNotificationsFromHabitica() {
			const {
				data: { notifications }
			} = await this.axios.get("/user");
			return notifications;
		},

		/**
		 * Reads all user's notifications
		 *
		 * @returns { Object[] } User's notifcations after reading
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
