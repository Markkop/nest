const axios = require('axios')
const {decode} = require('html-entities')
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
		getEmailImageBasedOnOrderAndSize(htmlString) {
			const imgMatches = htmlString.match(/<img[^>]*?src\s*=\s*[""']?([^'"" >]+?)[ '""][^>]*?>/g)
			if (!imgMatches) return
			return imgMatches.find(img => {
				const heightMatch = img.match(/height="([^"]+)"/)
				if (!heightMatch) {
					const widthMatch = img.match(/width="([^"]+)"/)
					if (!widthMatch) return false
					const width = Number(widthMatch[1])	
					if (Number.isNaN(width)) return false
					return width > 500
				}
				const height = Number(heightMatch[1])
				if (Number.isNaN(height)) return false
				return height > 100
			})
		},

		async onWebhookTrigger({html}) {
			try {
				const imgHtmlString = this.getEmailImageBasedOnOrderAndSize(html)
				if (imgHtmlString) {
					const imageMatch = imgHtmlString.match(/src="([^"]+)"/)
					await this.broker.call('telegram.sendPhotoToChatId', { photoUrl: imageMatch[1] , chatId: process.env.TELEGRAM_USERID})
				}

				const parsedHtml = html
					.replace(/<p[^>]+>(.|\n)*?<\/p>/g, match => '\n' + match.replace(/\n/g, ''))
					.replace(/<li[^>]+>((.|\n)*?)<\/li>/g, (match, p1) => `\n* ${p1.replace(/\n/g, '')}`)
					.replace(/<a([^>]+)><\/a>/g, '')
					.replace(/<a([^>]+)>((.|\n)*?)<\/a>/g, match => match.replace(/\n/g, ''))
					.replace(/<span([^>]+)>((.|\n)*?)<\/span>/g, match => match.replace(/\n/g, ''))
					.replace(/<h1([^>]*)>((.|\n)*?)<\/h1>/g, (match, p1, p2) => `\n<b>${p2.replace(/\n/g, '')}</b>\n`)
					.replace(/<h2([^>]*)>((.|\n)*?)<\/h2>/g, (match, p1, p2) => `\n<b>${p2.replace(/\n/g, '')}</b>\n`)
					.replace(/<h3([^>]*)>((.|\n)*?)<\/h3>/g, (match, p1, p2) => `\n<b>${p2.replace(/\n/g, '')}</b>\n`)
					.replace(/<ul([^>]*)>((.|\n)*?)<\/ul>/g, (match, p1, p2) => `\n${p2}\n`)
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

				const decodedHtml = decode(filteredHtml)

				const text = decodedHtml
					.replace(/<b>\n*<\/b>/g, '')
					.replace(/<a([^>]+)><\/a>/g, '')
					.replace(/\n\s*\n\s*\n/g, '\n\n')
					.replace(/&nbsp;/g, ' ')
					.replace(/\n\n\s*/g, '\n\n')
					.replace(/<(([^<]*)@([^>]*))>/g, '')
				
				// NOTE: Keeping this commented code to reference it in the blog post
				// const hrefs = [...text.matchAll(/href="(.*?)"/g)]
				// let shortText = text
				// if (shortText.length >= 4096) {
				// 	for (let index = 0; index < hrefs.length; index++) {
				// 		const [, url ] = hrefs[index]
				// 		const shortUrl = await this.shortUrl(url)
				// 		shortText = shortText.replace(url, shortUrl)
				// 	}
				// }

				// this.logger.info(JSON.stringify(text))
				this.broker.call('telegram.sendTextToChatId', { text: text , chatId: process.env.TELEGRAM_USERID, parseMode: 'html' })
				return text
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
