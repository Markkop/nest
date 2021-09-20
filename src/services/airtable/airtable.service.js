const axios = require('axios')

module.exports = {
	name: 'airtable',

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: 'https://api.airtable.com/v0/',
			timeout: 5000,
			headers: {
				Authorization: `Bearer ${process.env.CORVO_ASTRAL_SERVERS_AIRTABLE_TOKEN}`,
				'Content-Type': 'application/json'
			}
		}
	},

	/**
	 * Actions.
	 */
	actions: {
		getCorvoAstralServers: {
			handler() {
				return this.getCorvoAstralServers()
			}
		},
	},

	/**
	 * Methods.
	 */
	methods: {
		async getCorvoAstralServers() {
			try {
				const { data } = await this.axios.get(`${process.env.CORVO_ASTRAL_SERVERS_AIRTABLE_TABLE_PATH}/${process.env.CORVO_ASTRAL_SERVERS_AIRTABLE_RECORD_ID}`)
				return data.fields.Name
			} catch (error) {
				console.log(error)
			}
		},
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
