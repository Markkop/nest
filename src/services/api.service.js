const ApiGateway = require("moleculer-web");

module.exports = {
	name: "Api",
	mixins: [ApiGateway],

	// More info about settings: https://moleculer.services/docs/0.13/moleculer-web.html
	settings: {
		port: process.env.REST_API_GATEWAY_PORT || 3040,
		path: "/api",
		routes: [
			{
				path: "/webhooks",
				mappingPolicy: "restrict",
				aliases: {
					"POST /tasks": [
						function asanaWebhookHandshake(req, res, next) {
							const hookSecret = req.headers["x-hook-secret"];
							if (hookSecret) {
								res.setHeader("X-Hook-Secret", hookSecret);
							}
							return next();
						},
						"asana.syncByEvents"
					]
				},
				bodyParsers: {
					json: true
				}
			},
			{
				path: "/asana/",
				mappingPolicy: "restrict",
				aliases: {
					"GET /:startDate/:endDate": "asana.getTasksByDateRange",
					"POST /:projectId/sync/:startDate/:endDate":
						"asana.syncProjectTasksByDateRange"
				},
				bodyParsers: {
					json: true
				}
			},
			{
				path: "/habitica/",
				mappingPolicy: "restrict",
				aliases: {
					"GET /tasks/": "habitica.list",
					"POST /task/sync/:gid": "habitica.syncTaskFromAsanaById"
				},
				bodyParsers: {
					json: true
				}
			},
			{
				mappingPolicy: "restrict",
				path: "/status",
				aliases: {
					"GET /"(req, res) {
						res.end(JSON.stringify({ alive: true }));
					}
				},
				bodyParsers: {
					json: true
				}
			}
		]
	},

	methods: {}
};
