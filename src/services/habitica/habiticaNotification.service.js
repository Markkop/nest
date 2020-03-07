const axios = require("axios");

/**
 * @typedef HabiticaNotification
 *
 * @property { String } id
 * @property { Object } data
 * @property { Object } data.group
 * @property { String } data.group.id
 * @property { String } data.group.name
 * @property { Boolean } seen
 * @property { String } type
 */

module.exports = {
	name: "habiticaNotification",

	mixins: [axios],

	/**
	 * Service settings.
	 */
	settings: {
		axios: {
			baseURL: "https://habitica.com/api/v3/",
			timeout: 5000,
			headers: {
				"Content-Type": "application/json",
				"x-api-user": `${process.env.HABITICA_USER}`,
				"x-api-key": `${process.env.HABITICA_TOKEN}`,
				"x-client": `${process.env.HABITICA_USER}-Testing`
			}
		}
	},

	/**
	 * Actions.
	 */
	actions: {
		list: {
			/**
			 * Gets current user's notifications from Habitica
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaNotification[] } Habitica user's notification list
			 */
			handler(ctx) {
				return this.getNotificationsFromHabitica();
			}
		},

		readAll: {
			/**
			 * Reads all user's notifications from Habitica
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { HabiticaNotification[] } Habitica user's notification list
			 */
			handler(ctx) {
				return this.readAllNotifications();
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Gets current user's notifications from Habitica
		 *
		 * @returns { HabiticaNotification[] } Habitica user's notification list
		 */
		async getNotificationsFromHabitica() {
			const {
				data: { notifications }
			} = await this.axios.get("/user");
			return notifications;
		},

		/**
		 * Reads all user's notifications from Habitica
		 *
		 * @returns { HabiticaNotification[] } Habitica user's notification list
		 */
		async readAllNotifications() {
			const notifications = await this.getNotificationsFromHabitica();
			const readNotificationById = async ({ id }) => this.axios.post(`/notifications/${id}/read `);
			return Promise.all(notifications.map(readNotificationById));
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
		});
	},

	/**
	 * Service started lifecycle event handler.
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler.
	 */
	stopped() {}
};
