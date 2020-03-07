const axios = require("axios");

/**
 * @typedef HabiticaChatMessage
 *
 * @property { String } user
 * @property { String } text
 * @property { String } id
 */

/**
 * @typedef QuestInvited
 * @property { 'questActivity' } webhookType
 * @property { 'questInvited' } type
 * @property { Object } group
 * @property { String } group.id
 * @property { String } group.name
 * @property { Object } quest
 * @property { String } quest.key
 * @property { Object } user
 * @property { String } user._id
 */

/**
 * @typedef Quest
 * @property { String } text
 * @property { String } notes
 * @property { String } completion
 * @property { String } completionChat
 * @property { Number } value
 * @property { String } category
 * @property { Object } boss
 * @property { String } boss.name
 * @property { Number } boss.hp
 * @property { Number } boss.str
 * @property { Number } boss.def
 * @property { Object } boss.rage
 * @property { Object } boss.desperation
 * @property { Object } drop
 * @property { String } drop.items
 * @property { String } drop.gp
 * @property { String } drop.exp
 * @property { String } drop.key
 */

/**
 * @typedef User
 * @property { Object } auth
 * @property { Object } achievements
 * @property { Object } backer
 * @property { Object } contributor
 * @property { Object } purchased
 * @property { Object } flags
 * @property { Object } history
 * @property { Object } items
 * @property { Object } invitations
 * @property { Object } party
 * @property { Object } preferences
 * @property { Object } profile
 * @property { String } profile.name
 * @property { Stats } stats
 * @property { Object } inbox
 * @property { Object } takssOrder
 * @property { Array } challenges
 * @property { Array } guilds
 * @property { Number } _v
 * @property { Number} balance
 * @property { Number } loginIncentives
 * @property { Number } invitesSent
 * @property { Array } pinnedItemsOrder
 * @property { String } _id
 * @property { Array } pushDevices
 * @property { Object } extra
 * @property { Array } tags
 * @property { Object } newMessages
 * @property { String } lastCron
 * @property { String } migration
 * @property { Array } notifications
 * @property { Array } webhooks
 * @property { Object } _ABTests
 * @property { String } _lastPushNotification
 * @property { String } pinnedItems
 * @property { Array } unpinnedItems
 * @property { String } id
 * @property { Boolean } needsCron
 *
 */

/**
 * @typedef Stats
 * @property { Object } buffs
 * @property { Object } training
 * @property { Number } hp
 * @property { Number } mp
 * @property { Number } exp
 * @property { Number } gp
 * @property { Number } lvl
 * @property { String } class
 * @property { Number } points
 * @property { Number } str
 * @property { Number } con
 * @property { Number } int
 * @property { Number } per
 * @property { Number } toNextLevel
 * @property { Number } maxHealth
 * @property { Number } maxMP
 */

module.exports = {
	name: "habitica",

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
		log: {
			/**
			 * Logs params for debugging
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Object } params
			 */
			handler(ctx) {
				this.logger.info(ctx.params);
				return ctx.params;
			}
		},

		onWebhookTrigger: {
			/**
			 * Actions to be done according to the webhook's trigger
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Any }
			 */
			params: {
				type: { type: "string" }
			},
			handler(ctx) {
				const eventMap = {
					questInvited: () => this.onQuestInvite(ctx.params),
					leveledUp: () => this.OnLevelUp(ctx.params)
				};
				return eventMap[ctx.params.type]();
			}
		},

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		createChatMessage: {
			handler(ctx) {
				return this.createChatMessage(ctx.params.message);
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Get user informaton
		 * @returns { User }
		 */
		async getUser() {
			try {
				const {
					data: { data: user }
				} = await this.axios.get("/user");
				return user;
			} catch (error) {
				console.log(error);
				return error;
			}
		},

		/**
		 * Events to happen when the webhook type is leveledUp
		 * @returns  { HabiticaChatMessage }
		 */
		async OnLevelUp() {
			const {
				stats: { toNextLevel, lvl },
				profile: { name }
			} = await this.getUser();

			const message = `${name} just leveled up! More ${toNextLevel} exp to reach level ${Number(lvl) + 1}`;
			return this.createChatMessage(message);
		},

		/**
		 * Events to happen when the webhook type is questInvited
		 * @param { QuestInvited  } questInvitedData
		 * @returns { HabiticaChatMessage }
		 */
		async onQuestInvite(questInvitedData) {
			const {
				quest: { key: questId }
			} = questInvitedData;
			const quest = await this.getQuest(questId);
			const { boss, collect } = quest;
			let message = "";

			if (boss) {
				const { hp } = boss;
				message = `[ NEW QUEST ] ${quest.text} [HP ${hp}/${hp}]`;
			}

			if (collect) {
				const items = Object.values(collect);
				const totalCount = items.reduce((total, item) => total + item.count, 0);
				message = `[ NEW QUEST ] ${quest.text} [${totalCount} items]`;
			}
			return this.createChatMessage(message);
		},

		/**
		 * Get quest data from a given quest id
		 * @param { String  } questId
		 * @returns { Quest }
		 */
		async getQuest(questId) {
			try {
				const {
					data: {
						data: { quests }
					}
				} = await this.axios.get("/content");
				return quests && quests[questId];
			} catch (error) {
				console.log(error);
			}
		},

		/**
		 * Creates a new message in the party's chat
		 * @param { String } message
		 * @returns { HabiticaChatMessage }
		 */
		async createChatMessage(message) {
			try {
				const {
					data: { data: responseData }
				} = await this.axios.post("/groups/party/chat", { message });
				const {
					message: { id, user, text }
				} = responseData;
				const messageCreated = { id, user, text };
				return messageCreated;
			} catch (error) {
				this.logger.error(error);
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
