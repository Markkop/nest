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
		 * Get task from Asana and send to telegram bot, if
		 * it's in the correct role section
		 *
		 * @param { Number } gid - Task gid.
		 * @returns { Promise.<Object> }
		 */
		async syncTaskFromAsanaById(gid) {
			const asanaTask = await this.broker.call('asana.getAsanaTaskById', {
				gid
			})

			const { name, projects, memberships } = asanaTask
			const isRoleSection = memberships.some(membership => membership.section.gid === '1166479981872937')
			this.logger.info('info', memberships, isRoleSection)
			if (!isRoleSection) {
				return
			}

			const project = projects[0] && projects[0].gid

			const text = '🔥 <b>Hey, Shopbacker.</b> Your pool has been updated:'+
			`\n<a href="https://app.asana.com/0/${project}/${gid}">${name}</a>`

			const response = await this.sendTextToChatId(text, process.env.TELEGRAM_USERID)
			return response
		},

		/**
		 * Send a message to an user via telegram bot
		 * @param { String } message
		 * @returns { Object } request response
		 */
		async sendTextToChatId(text, chatId) {
			try {
				const options = {
					text, 
					chat_id: chatId,
					parse_mode: 'HTML',
					disable_notification: true
				}
				const { data } = await this.axios.post('/sendMessage', options)
				this.logger.info('Task sent to telegram', text)
				return data
			} catch (error) {
				this.logger.error(error)
			}
		},
		/**
		 * Send a message to an user via telegram bot
		 * @param { String } message
		 * @returns { Object } request response
		 */
		async onWebhookTrigger(update) {
			try {
				this.logger.info('Update received on Telegram Bpt', update)
				const message =  update.message
				const text = message.text
				const getTrackingText = 'get tracking for '
				if (!text.includes(getTrackingText)) {
					return
				}
				const splittedText = text.split(getTrackingText)
				const trackingNumber = splittedText[1]
				const trackingResult = await this.broker.call('trackingmore.getTrackingResult', { trackingNumber })
				let responseText = trackingResult
				if (!trackingResult) {
					responseText = 'No result found'
				}
				this.logger.info(`Sending response to ${update.from.id}`, responseText)
				const response = await this.sendTextToChatId(responseText, update.from.id)
				return response
			} catch (error) {
				this.logger.error(error)
				return error
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
