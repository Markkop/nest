const axios = require('axios')

module.exports = {
	name: 'trackingmore',

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: 'https://api.trackingmore.com/',
			timeout: 5000,
			headers: {
				'Content-Type': 'application/json',
				'Trackingmore-Api-Key': `${process.env.TRACKINGMORE_APIKEY}`,
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
		onWebhookTrigger: {
			/**
			 * Actions to be done according to the webhook's trigger
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				const content = JSON.stringify(ctx.params)
				this.broker.call('telegram.sendTextToChatId', { text: content, chatId: process.env.TELEGRAM_USERID })
			}
		},

		/**
		 * Gets the tracking result for a given trackingNumber and an
		 * optional carrierCode
		 */
		getTrackingResult: {
			handler(ctx) {
				return this.getTrackingResult(ctx.params.trackingNumber, ctx.params.carrierCode)
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Gets the carrier number for a tracking number
		 * @param { String } trackingNumber
		 * @returns { Promise<String> }
		 */
		async getCarrierCode(trackingNumber) {
			try {
				const response = await this.axios.post('/v2/carriers/detect', { 'tracking_number': trackingNumber})
				const responseData = response.data
				const data = responseData.data
				return data[0].code
			} catch (error) {
				this.logger.error(error)
			}
		},
		/**
		 * Gets the tracking result for a given trackingNumber and an
		 * optional carrierCode
		 * @param { String } trackingNumber
		 * @param { String } [carrierCode]
		 * @returns { Promise<String> }
		 */
		async getTrackingResult(trackingNumber, carrierCode) {
			try {
				if (!carrierCode) {
					carrierCode = await this.getCarrierCode(trackingNumber)
				}
				const response = await this.axios.get(`/v2/trackings/${carrierCode}/${trackingNumber}`)
				const responseData = response.data
				const data = responseData.data
				return data.lastEvent
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
