const axios = require('axios')

module.exports = {
	name: 'trello',

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: 'https://api.trello.com/1',
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
		onWebhookTrigger: {
			/**
			 * Actions to be done according to the webhook's trigger
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				const eventMap = {
					addMemberToCard: () => this.onAddMemberToCard(ctx.params.action),
				}
				return eventMap[ctx.params.action.type]()
			}
		},
		onHeadRequest: {
			/**
			 * Action to respond to a head request for the webhook endpoint
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				return 'ok'
			}
		},
		createWebhook: {
			params: {
				description: { type: 'string' },
				callbackURL: { type: 'string' },
				idModel: { type: 'string' }
			},
			/**
			 * Create a Trello Webhook
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				return this.createWebhook(ctx.params.description, ctx.params.callbackURL, ctx.params.idModel)
			}
		},
		getWebhooks: {
			/**
			 * Create a Trello Webhook
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			handler(ctx) {
				return this.getWebhooks()
			}
		},
		getCard: {
			/**
			 * Gets a Trello Card
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { TrelloCard }
			 */
			handler(ctx) {
				return this.getCard(ctx.params.cardId)
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
	     * Create a Trello Webhook
  		 * @param { String } description
  		 * @param { String } callbackURL
  		 * @param { String } idModel
		 * @returns { Object } request response
		 */
		async createWebhook(description, callbackURL, idModel) {
			try {
				const options = {
					description,
					callbackURL,
					idModel
				}
				this.logger.info('Requesting Webhook creation', options)
				const { data } = await this.axios.post(`/tokens/${process.env.TRELLO_TOKEN}/webhooks/?key=${process.env.TRELLO_KEY}`, options)
				this.logger.info('Webhook creation response', data)
				return data
			} catch (error) {
				this.logger.error(error)
				if (error.isAxiosError) {
					return error.response.data.message
				}
			}
		},
		/**
	     * Get Trello Webhooks associated with the user token
		 * @returns { Object } request response
		 */
		async getWebhooks() {
			try {
				const { data } = await this.axios.get(`/tokens/${process.env.TRELLO_TOKEN}/webhooks?key=${process.env.TRELLO_KEY}`)
				return data
			} catch (error) {
				this.logger.error(error)
				if (error.isAxiosError) {
					return error.response.data.message
				}
			}
		},
		/**
		 * Gets Card from Trello
		 * @param {string} cardId 
		 * @returns {TrelloCard}
		 */
		async getCard(cardId) {
			try {
				const { data } = await this.axios.get(`/cards/${cardId}?key=${process.env.TRELLO_KEY}`)
				return data
			} catch (error) {
				this.logger.error(error)
				if (error.isAxiosError) {
					return error.response.data.message
				}
			}
		},
		/**
		 * When adding a member to a card
		 */
		async onAddMemberToCard(action) {
			return this.broker.call('habiticaTask.syncTaskFromTrelloByAction', action)
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
