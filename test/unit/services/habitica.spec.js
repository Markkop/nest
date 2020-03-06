"use strict";

const { ServiceBroker } = require("moleculer");
const HabiticaService = require("../../../src/services/habitica.service");
const contentMock = require("../mocks/content.json");
const axios = require("axios");
const questActivityWebhookMock = require("../mocks/questActivityWebhook.json");

jest.mock("axios");

describe("Test 'habitica' service", () => {
	axios.create.mockImplementationOnce(() => ({
		get: () => Promise.resolve({ data: contentMock }),
		post: () =>
			Promise.resolve({
				data: {
					data: {
						message: {
							text: "[ NEW QUEST ] The Basi-List [HP 100/100]"
						}
					}
				}
			})
	}));

	let broker = new ServiceBroker({ logger: false });
	const service = broker.createService(HabiticaService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'habitica.onWebhookTrigger' action", () => {
		it("should return a chat message on group invite", async () => {
			const res = await broker.call(
				"habitica.onWebhookTrigger",
				questActivityWebhookMock
			);
			expect(res.text).toBe(`[ NEW QUEST ] The Basi-List [HP 100/100]`);
		});
	});
});
