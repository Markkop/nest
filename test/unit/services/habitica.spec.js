"use strict";

const { ServiceBroker } = require("moleculer");
const HabiticaService = require("../../../src/services/habitica.service");

describe("Test 'habitica' service", () => {
	let broker = new ServiceBroker({ logger: false });
	const service = broker.createService(HabiticaService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'habitica.onWebhookTrigger' action", () => {
		it("should return a chat message on group invite", async () => {
			const webhookData = {
				webhookType: "questActivity",
				type: "questInvited",
				group: {
					id: "c451a4e4-7ae7-4084-99c1-a59f89010354",
					name: "[ Tic Tic Powers ]"
				},
				quest: { key: "basilist" },
				user: { _id: "40387571-91ee-489e-960f-278bf8fd503b" }
			};
			service.axios = {
				post: () => ({
					data: {
						data: {
							message: {
								user: "Mark Kop",
								text: "[ QUEST INVITE ] basilist"
							}
						}
					}
				})
			};
			const res = await broker.call(
				"habitica.onWebhookTrigger",
				webhookData
			);
			expect(res.text).toBe(`[ QUEST INVITE ] basilist`);
		});
	});
});
