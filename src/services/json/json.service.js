module.exports = {
	name: 'json',

	/**
	 * Service settings.
	 */
	settings: {
	},

	/**
	 * Actions.
	 */
	actions: {
		getJson: {
			handler(ctx) {
				return this.getJson(ctx.params.stringifiedJson)
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		getJson(stringifiedJson) {
			try {
				return '<div>'+ JSON.stringify(JSON.parse(JSON.parse(stringifiedJson))) + '</div>'
			} catch (error) {
				console.log(error)
			}
		}
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
