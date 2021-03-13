'use strict'

const { ServiceBroker } = require('moleculer')
const TrelloService = require('../../../src/services/trello/trello.service')
const HabiticaTaskService = require('../../../src/services/habitica/habiticaTask.service')
const onAddMemberToCardMock = require('../mocks/trello/onAddMemberToCardWebhook.json')
const cardMock = require('../mocks/trello/cardMock.json')
const axios = require('axios')

jest.mock('axios')

describe('Test \'trello\' service', () => {
	describe('Test \'trello.onWebhookTrigger\' action', () => {
		it('should post to habitica new task creation', async () => {
			// Axios Creation on Trello Service
			axios.create.mockImplementationOnce(() => ({
				get: () => Promise.resolve({ data: cardMock }),
			}))

			// Axios Creation on Habitica Service
			axios.create.mockImplementationOnce(() => ({
				get: () => Promise.resolve({ data: { data: [] } }),
				post: (path, payload) => Promise.resolve({ data: { data: payload } })
			}))

			let broker = new ServiceBroker({ logger: false })
			broker.createService(TrelloService)
			broker.createService(HabiticaTaskService)
			await broker.start()
			const res = await broker.call('trello.onWebhookTrigger', onAddMemberToCardMock)
			broker.stop()
			expect(res.text).toBe(':trophy: Organizar CodeCon')
		})
	})
})
