const axios = require("axios");

/**
 * @typedef Webhook
 * @property { String } type
 * @property { String } label
 * @property { Boolean } enabled
 * @property { String } id
 * @property { QuestActivityOptions|UserActivityOptions } options
 * @property { String } createdAt
 * @property { String } updatedAt
 * @property { String } url
 */

/**
 * @typedef UserActivityOptions
 * @property { Boolean } petHatched
 * @property { Boolean } mountRaised
 * @property { Boolean } leveledUp
 */

/**
 * @typedef QuestActivityOptions
 * @property { Boolean } questStarted:
 * @property { Boolean } questFinished
 * @property { Boolean } questInvited
 */

module.exports = {
	name: "habiticaWebhook",

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
			params: {
				id: { type: "string", optional: true },
				url: { type: "string" },
				lable: { type: "string", optional: true },
				enable: { type: "boolean", optional: true },
				type: { type: "string", optional: true },
				options: { type: "object", optional: true }
			},
			/**
			 * Creates a new webook
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Webhook }
			 */
			handler(ctx) {
				return this.createWebhook(ctx.params);
			}
		},

		delete: {
			params: {
				id: { type: "string" },
				url: { type: "string", optional: true },
				lable: { type: "string", optional: true },
				enable: { type: "boolean", optional: true },
				type: { type: "string", optional: true },
				options: { type: "object", optional: true }
			},
			/**
			 * Deletes a Webhook
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Webhook[] } User's webhooks
			 */
			handler(ctx) {
				return this.deleteWebhook(ctx.params.id);
			}
		},

		update: {
			params: {
				id: { type: "string" },
				url: { type: "string", optional: true },
				lable: { type: "string", optional: true },
				enable: { type: "boolean", optional: true },
				type: { type: "string", optional: true },
				options: { type: "object", optional: true }
			},
			/**
			 * Updates a Webhook
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Webhook } Habitica updated Webhook.
			 */
			handler(ctx) {
				const id = ctx.params.id;
				delete ctx.params.id;
				return this.updateWebhook(id, { ...ctx.params });
			}
		},

		list: {
			/**
			 * Lists user's webhooks
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Webhook[] } webhooks
			 */
			handler(ctx) {
				return this.listHabiticaWebhooks();
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Create a new webook
		 * @param { Webhook } webhook
		 * @returns { Webhook }
		 */
		async createWebhook(webhook) {
			const {
				data: { data: responseWebhook }
			} = await this.axios.post("/user/webhook", webhook);
			return responseWebhook;
		},

		/**
		 * Updates a webook
		 * @param { String } id
		 * @param { Webhook } webhook
		 * @returns { Webhook }
		 */
		async updateWebhook(id, webhook) {
			const {
				data: { data: responseWebhook }
			} = await this.axios.put(`/user/webhook/${id}`, webhook);
			return responseWebhook;
		},

		/**
		 * Deletes a webook
		 * @param { id } id webhook id
		 * @returns { Webhook[] }
		 */
		async deleteWebhook(id) {
			const {
				data: { data: webhooks }
			} = await this.axios.delete(`/user/webhook/${id}`);
			return webhooks;
		},

		/**
		 * Get user's webhooks
		 * @returns { Webhook[] }
		 */
		async listHabiticaWebhooks() {
			const {
				data: { data: webhooks }
			} = await this.axios.get("/user/webhook");
			return webhooks;
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
