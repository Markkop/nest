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
		 * Send a message to an user via telegram bot
		 * @param { String } message
		 * @returns { Object }
		 */
		sendTextToChatId: {
			handler(ctx) {
				return this.sendTextToChatId(ctx.params.text, ctx.params.chatId)
			}
		},

		/**
		 * Get task from Asana and send to telegram bot
		 */
		syncTaskFromAsanaById: {
			params: {
				gid: { type: 'string' }
			},

			/**
			 * Send a text message to telegram bot based on an Asana task gid
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Object } 
			 */
			handler(ctx) {
				const response = this.syncTaskFromAsanaById(ctx.params.gid)
				return response
			}
		},
	},

	/**
	 * Methods.
	 */
	methods: {
		
		/**
		 * Get task from Asana and send to telegram bot
		 *
		 * @param { Number } gid - Task gid.
		 * @returns { Promise.<Object> }
		 */
		async syncTaskFromAsanaById(gid) {
			const asanaTask = await this.broker.call('asana.getAsanaTaskById', {
				gid
			})

			const { name } = asanaTask

			const syncdTask = await this.sendTextToChatId(name, process.env.TELEGRAM_USERID)
			this.logger.info('Task sent to telegram', name)
			return syncdTask
		},

		/**
		 * Send a message to an user via telegram bot
		 * @param { String } message
		 * @returns { Object } request response
		 */
		async sendTextToChatId(text, chatId) {
			try {
				const {
					data 
				} = await this.axios.post('/sendMessage', { text, 'chat_id': chatId })
				return data
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