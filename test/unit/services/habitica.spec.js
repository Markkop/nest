"use strict";

const { ServiceBroker } = require("moleculer");
const HabiticaService = require("../../../src/services/habitica.service");
const contentMock = require("../mocks/content.json");
const axios = require("axios");
const questActivityWebhookMock = require("../mocks/questActivityWebhook.json");

jest.mock("axios");

describe("Test 'habitica' service", () => {
	describe("Test 'habitica.onWebhookTrigger' action", () => {
		it("should return a chat message on group invite", async () => {
			axios.create.mockImplementationOnce(() => ({
				get: () => Promise.resolve({ data: contentMock }),
				post: (path, payload) => Promise.resolve({ data: { data: { message: { text: payload.message } } } })
			}));

			let broker = new ServiceBroker({ logger: false });
			broker.createService(HabiticaService);
			await broker.start();
			const res = await broker.call("habitica.onWebhookTrigger", questActivityWebhookMock);
			broker.stop();
			expect(res.text).toBe(`[ NEW QUEST ] The Basi-List [HP 100/100]`);
		});
	});
});
