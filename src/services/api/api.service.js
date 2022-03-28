const ApiGateway = require('moleculer-web')

module.exports = {
	name: 'Api',
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.PORT || 3040,
		path: '/api',
		routes: [
			{
				path: '/webhooks',
				mappingPolicy: 'restrict',
				aliases: {
					'POST /habitica': 'habitica.onWebhookTrigger',
					'POST /trackingmore': 'trackingmore.onWebhookTrigger',
					'POST /telegram': 'telegram.onWebhookTrigger',
					'POST /newsletter': 'newsletter.onWebhookTrigger',
					'POST /trello': 'trello.onWebhookTrigger',
					'HEAD /trello': 'trello.onHeadRequest',
				},
				bodyParsers: {
					json: {
						strict: false,
						limit: '10MB'
					},
				}
			},
			{
				path: '/asana/',
				mappingPolicy: 'restrict',
				aliases: {
					'GET /:startDate/:endDate': 'asana.getTasksByDateRange'
				},
				bodyParsers: {
					json: true
				}
			},
			{
				path: '/habitica/',
				mappingPolicy: 'restrict',
				aliases: {
					'GET /tasks/': 'habiticaTask.list',
					'POST /task/sync/:gid': 'habiticaTask.syncTaskFromAsanaById'
				},
				bodyParsers: {
					json: true
				}
			},
			{
				mappingPolicy: 'restrict',
				path: '/status',
				aliases: {
					'GET /'(req, res) {
						res.end(JSON.stringify({ alive: true }))
					}
				},
				bodyParsers: {
					json: true
				}
			},
			{
				mappingPolicy: 'restrict',
				path: '/mocks',
				aliases: {
					'GET /products': 'mocks.getProducts',
					'GET /product/:id': 'mocks.getProductById',
				},
				bodyParsers: {
					json: true
				},
				cors: {
					origin: ['http://localhost:3000', 'https://fashionista-markkop.netlify.com' ],
					methods: ['GET'],
					credentials: false
				},
			},
			{
				mappingPolicy: 'restrict',
				path: '/corvo-astral-servers',
				aliases: {
					'GET /': 'badges.getCorvoAstralServersBadge',
				},
				bodyParsers: {
					json: true
				},
			},
			{
				mappingPolicy: 'restrict',
				path: '/drift-bot-servers',
				aliases: {
					'GET /': 'badges.getDriftBotServersBadge',
				},
				bodyParsers: {
					json: true
				},
			},
			{
				mappingPolicy: 'restrict',
				path: '/json',
				aliases: {
					'GET /': 'json.getJson',
				},
				bodyParsers: {
					json: true
				}
			}
		]
	},

	methods: {}
}
