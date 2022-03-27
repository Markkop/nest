const axios = require('axios')
const FilterHTML = require('filterhtml')

module.exports = {
	name: 'newsletter',
	mixins: [axios],

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
			timeout: 180000,
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
					.replace(/<p[^>]+>(.|\n)*?<\/p>/g, match => '\n' + match.replace(/\n/g, ''))
					.replace(/<a([^>]+)><\/a>/g, '')
					.replace(/<a([^>]+)>((.|\n)*?)<\/a>/g, match => match.replace(/\n/g, ''))
					.replace(/<span([^>]+)>((.|\n)*?)<\/span>/g, match => match.replace(/\n/g, ''))
					.replace(/h1|h2|h3/g, 'b')
					.replace(/<li[^>]*>/g, '<p>\n* ')
					.replace(/<\/li>/g, '</p>')
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
					.replace(/<b>\n*<\/b>/g, '')
					.replace(/<a([^>]+)><\/a>/g, '')
					.replace(/\n\s*\n\s*\n/g, '\n\n')
					.replace(/&nbsp;/g, ' ')
					.replace(/\n\n\s*/g, '\n\n')
				
				const hrefs = [...text.matchAll(/href="(.*?)"/g)]
				let shortText = text
				if (shortText.length >= 4096) {
					for (let index = 0; index < hrefs.length; index++) {
						const [, url ] = hrefs[index]
						const shortUrl = await this.shortUrl(url)
						shortText = shortText.replace(url, shortUrl)
					}
				}

				this.logger.info(JSON.stringify(shortText))
				this.broker.call('telegram.sendTextToChatId', { text: shortText , chatId: process.env.TELEGRAM_USERID, parseMode: 'html' })
				return shortText
			} catch (error) {
				this.logger.error(error)
				return error
			}
		},

		async shortUrl(url) {
			const { data } = await axios(`https://cdpt.in/shorten?url=${url}`)
			return data
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
