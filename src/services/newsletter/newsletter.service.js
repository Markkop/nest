const FilterHTML = require('filterhtml')

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
		async onWebhookTrigger({data}) {
			try {
				const parsedHtml = data
					.replace(/<p[^>]+>(.|\n)*?<\/p>/g, match => match.replace(/\n/g, ''))
					.replace(/<a([^>]+)>((.|\n)*?)<\/a>/g, match => match.replace(/\n/g, ''))
					.replace(/<span([^>]+)>((.|\n)*?)<\/span>/g, match => match.replace(/\n/g, '')+ '\n')
					.replace(/<br>/g, '\n')

				const filteredHtml = FilterHTML.filter_html(parsedHtml, {
					'a': {
						'href': 'url'
					},
					'b': {},
					'strong': {},
					'i': {},
					'em': {},
					'u': {},
					's': {},
					'pre': {},
				})
				const text = filteredHtml
					.replace(/\n\s*\n\s*\n/g, '\n\n')
					.replace(/&nbsp;/g, ' ')
	
				this.broker.call('telegram.sendTextToChatId', { text , chatId: process.env.TELEGRAM_USERID, parseMode: 'html' })
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
