const axios = require('axios')

module.exports = {
	name: 'trello',

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: 'https://api.trello.com/1/',
			timeout: 5000,
			headers: {
				'Content-Type': 'application/json',
			}
		}
	},

	/**
	 * Actions.
	 */
	actions: {
		log: {
			/**
			 * Logs params for debugging
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Object } params
			 */
			handler(ctx) {
				this.logger.info(ctx.params)
				return ctx.params
			}
		},
		onWebhookTrigger: {
			/**
			 * Actions to be done according to the webhook's trigger
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				this.logger.info('Received trello webhook update', ctx.params)
			}
		},
		onHeadRequest: {
			/**
			 * Action to respond to a head request for the webhook endpoint
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				return 'ok'
			}
		},
	},

	/**
	 * Methods.
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {
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
