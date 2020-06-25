const axios = require('axios')

module.exports = {
	name: 'telegram',

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: `https://api.telegram.org/bot${process.env.TELEGRAM_BOTID}/`,
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

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		sendTextToChatId: {
			handler(ctx) {
				return this.sendTextToChatId(ctx.params.text, ctx.params.chatId)
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		
		/**
		 * Get task from Asana, saves it in the x's servers
		 *
		 * @param { Number } gid - Task gid.
		 * @returns { Promise.<x> }
		 */
		async syncTaskFromAsanaById(gid) {
			const asanaTask = await this.broker.call('asana.getAsanaTaskById', {
				gid
			})

			const { name } = asanaTask

			const syncdTask = await this.sendTextToChatId(name, process.env.TELEGRAM_USERID)
			this.logger.info('Task sent to telegram', asanaTask)
			return syncdTask
		},

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		async sendTextToChatId(text, chatId) {
			try {
				const {
					data: { data: responseData }
				} = await this.axios.post('/sendMessage', { text, 'chat_id': chatId })
				return responseData
			} catch (error) {
				this.logger.error(error)
			}
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
