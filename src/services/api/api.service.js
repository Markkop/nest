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
					'POST /tasks': [
						function asanaWebhookHandshake(req, res, next) {
							const hookSecret = req.headers['x-hook-secret']
							if (hookSecret) {
								res.setHeader('X-Hook-Secret', hookSecret)
							}
							return next()
						},
						'asana.syncByEvents'
					],
					'POST /habitica': 'habitica.onWebhookTrigger'
				},
				bodyParsers: {
					json: true
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
			}
		]
	},

	methods: {}
}
