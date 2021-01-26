const axios = require('axios')
const parseTrackingItemToText = require('../../utils/parseTrackingItemToText')

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
				this.logger.info('Received trackingmore webhook update', ctx.params)
				const item = this.mapTrackingItem(ctx.params.data)
				const text = parseTrackingItemToText(item)
				this.broker.call('telegram.sendTextToChatId', { text, chatId: process.env.TELEGRAM_USERID })
			}
		},

		/**
		 * Get all linked trackings
		 */
		getTrackingList: {
			handler() {
				return this.getTrackingList()
			}
		},

		/**
		 * Get carrier code
		 */
		getCarrierCode: {
			handler(ctx) {
				return this.getCarrierCode(ctx.params.trackingNumber)
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
		},
		/**
		 * Creates a new tracking item
		 */
		createTrackingItem: {
			handler(ctx) {
				return this.createTrackingItem(ctx.params.trackingNumber, ctx.params.carrierCode)
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
				const carriers = responseData.data
				if (!carriers.length) {
					return ''
				}
				const cainiaoCarrier = carriers.find(carrier => carrier.code === 'cainiao')
				if (cainiaoCarrier) {
					return cainiaoCarrier.code
				}
				return carriers[0].code
			} catch (error) {
				this.logger.error(error)
			}
		},
		/**
		 * Get all linked trackings
		 * @returns { Promise<Array> }
		 */
		async getTrackingList() {
			try {
				const response = await this.axios.get('/v2/trackings/get')
				const responseData = response.data
				const data = responseData.data
				const items = data.items.map(this.mapTrackingItem)
				this.logger.info('Tracking list acquired', items)
				return items
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
				const trackingItem = responseData.data
				return this.mapTrackingItem(trackingItem)
			} catch (error) {
				this.logger.error(error)
			}
		},
		/**
		 * Create a new tracking
		 * @param { String } trackingNumber
		 * @param { String } [carrierCode]
		 * @returns { Promise<Any> }
		 */
		async createTrackingItem(trackingNumber, carrierCode) {
			try {
				if (!carrierCode) {
					carrierCode = await this.getCarrierCode(trackingNumber)
				}
				const body = {
					'tracking_number': trackingNumber,
					'carrier_code': carrierCode
				}
				const response = await this.axios.post('/v2/trackings/post', body)
				const responseData = response.data
				if (responseData.meta.code !== 200) {
					return responseData.meta
				}
				return responseData.data
			} catch (error) {
				this.logger.error(error)
			}
		},
		mapTrackingItem(item) {
			let timeElapsed = item.itemTimeLength
			const itemOriginInfo = item.origin_info || {}
			const trackInfo = itemOriginInfo.trackinfo || []
			if (!timeElapsed && trackInfo.length) {
				const firstEvent = trackInfo[trackInfo.length - 1]
				const today = new Date(Date.now())
				const timeDiff = Math.abs(today - new Date(firstEvent.Date))
				const daysDiff = timeDiff / 1000 / 60 / 60 / 24
				timeElapsed = Math.round(daysDiff)
			}
			return {
				trackingNumber: item.tracking_number,
				carrierCode: item.carrier_code,
				timeElapsed: timeElapsed,
				substatus: item.substatus,
				lastTrackInfo: item.origin_info && item.origin_info.trackinfo[0],
				lastEvent: item.lastEvent,
				destinationTrackNumber: item.destination_track_number
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
