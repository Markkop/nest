const axios = require('axios')
const parseTrackingItemToText = require('../../utils/parseTrackingItemToText')

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
				return this.sendTextToChatId(ctx.params.text, ctx.params.chatId, ctx.params.parseMode)
			}
		},

		/**
		 * Send a photo to an user via telegram bot
		 * @param { String } message
		 * @returns { Object }
		 */
		sendPhotoToChatId: {
			handler(ctx) {
				return this.sendPhotoToChatId(ctx.params.photoUrl, ctx.params.chatId)
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
		 * Split a long message in small chunks and send them to telegram
		 *
		 * @param { string } text - Text Message to be sent
		 * @param { object } options - Telegram sendMessage options
		 * @returns { Promise<void> }
		 */
		async splitAndSend(text, options) {
			const subtext =  text.substring(0, 4096)
			const twoLineBreaks = subtext.split('\n')
			if (twoLineBreaks.length === 1) return
			twoLineBreaks.splice(-1)
			const previousTextBlock = twoLineBreaks.join('\n')
			if (!previousTextBlock) return
			await this.axios.post('/sendMessage', {
				...options,
				text: previousTextBlock,
				disable_web_page_preview: true
			})
			const remainingText = text.substring(previousTextBlock.length, text.length)
			return this.splitAndSend(remainingText, options)
		},

		/**
		 * Send a message to an user via telegram bot
		 * @param { String } message
		 * @returns { Object } request response
		 */
		async sendTextToChatId(text, chatId, parseMode = 'html') {
			try {
				const telegramParseMode = {
					'html': 'HTML',
					'markdown': 'MarkdownV2'
				}

				const options = {
					text, 
					chat_id: chatId,
					parse_mode: telegramParseMode[parseMode],
					disable_notification: true
				}

				if (text.length >= 4096) {
					await this.splitAndSend(text, options)
				} else {
					await this.axios.post('/sendMessage', options)
				}

				// NOTE: Keeping this commented code to reference it in the blog post
				// if (text.length >= 4096) {
				// 	for (let i = 0; i < text.length; i+=4096) {
				// 		await this.axios.post('/sendMessage', {
				// 			...options,
				// 			text: text.substring(i, i+4096)
				// 		})
				// 	}
				// } else {
				// 	await this.axios.post('/sendMessage', options)
				// }

				return `Message sent to telegram's chat id ${chatId}`
			} catch (error) {
				this.logger.error(error)
			}
		},
		/**
		 * Send a photo to an user via telegram bot
		 * @param { string } photoUrl
		 * @param { string } chatId
		 * @param { string } parseMode
		 * @returns { Object } request response
		 */
		async sendPhotoToChatId(photoUrl, chatId) {
			try {

				const options = {
					photo: photoUrl, 
					chat_id: chatId,
					disable_notification: true
				}

				await this.axios.post('/sendPhoto', options)

				return `Photo sent to telegram's chat id ${chatId}`
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
				this.logger.info('Update received on Telegram Bot', update)
				const message =  update.message
				const messageText = message.text

				const eventsTexts = {
					getMyTrackings: 'get my trackings',
					createNewTracking: 'create new tracking for '
				}

				const hasMatchingEventText = Object.values(eventsTexts).some(text => messageText.includes(text))
				if (!hasMatchingEventText) {
					return
				}

				let responseText = ''
				if (messageText.includes(eventsTexts.getMyTrackings)) {
					const trackingItems = await this.broker.call('trackingmore.getTrackingList')
					for (let index = 0; index < trackingItems.length; index++) {
						const item = trackingItems[index]
						await this.sendTextToChatId(parseTrackingItemToText(item), update.message.from.id)
					}
					return
				}

				if (messageText.includes(eventsTexts.createNewTracking)) {
					const trackingNumber = messageText.split(eventsTexts.createNewTracking)[1]
					const response = await this.broker.call('trackingmore.createTrackingItem', { trackingNumber })
					responseText = JSON.stringify(response, null, 2)
				}

				this.logger.info(`Sending response to ${update.message.from.id}`, responseText)
				const response = await this.sendTextToChatId(responseText, update.message.from.id)
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
