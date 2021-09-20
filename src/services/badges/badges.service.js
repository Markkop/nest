module.exports = {
	name: 'badges',

	/**
	 * Service settings.
	 */
	settings: {
	},

	/**
	 * Actions.
	 */
	actions: {
		getCorvoAstralServersBadge: {
			handler() {
				return this.getCorvoAstralServersBadge()
			}
		},
	},

	/**
	 * Methods.
	 */
	methods: {
		async getCorvoAstralServersBadge() {
			try {
				const servers = await this.broker.call('airtable.getCorvoAstralServers')
				return {
					'schemaVersion': 1,
					'label': 'online',
					'message': `${servers} servers`,
					'color': 'brightgreen'
				}
			} catch (error) {
				console.log(error)
			}
		},
	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {
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
