module.exports = {
	name: 'newsletter',

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
				return this.onWebhookTrigger(ctx.params)
			}
		},
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Logs
		 * @param { String } message
		 * @returns { Object } request response
		 */
		async onWebhookTrigger(data) {
			try {
				this.logger.info('Update received on Newsletter endpoint', JSON.stringify(data,2,null))
				return data
			} catch (error) {
				this.logger.error(error)
				return error
			}
		}
	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {},

	/**
	 * Service started lifecycle event handler.
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler.
	 */
	stopped() {}
}
