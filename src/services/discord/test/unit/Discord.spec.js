const { ServiceBroker } = require('moleculer')
const Discord = require('discord.js')
const testUtils = require('../testUtils')
const DiscordService = require('../../src/services/Discord.service')

describe('Discord', () => {
  const broker = new ServiceBroker({ logger: false })
  const discordService = broker.createService(DiscordService)

  beforeAll(() => broker.start())

  afterAll(() => broker.stop())

  it('Assigns an instance of Discord API client to the "client" property', () => {
    expect(discordService.client).toBeInstanceOf(Discord.Client)
  })

  describe('methods', () => {
    describe('handleBotUserPermissionRequest', () => {
      it('gives the "bots_user" role to the user', async () => {
        const userMessage = '!botclub join'
        const message = testUtils.mockMessage(userMessage, { guildRoles: [{ name: 'bots_user' }] })

        await discordService.handleBotUserPermissionRequest(message)
        expect(message.author.send).toBeCalledWith('Você recebeu a role `bots_user` 😎')
      })

      it('replies the user if no role was found', async () => {
        const userMessage = '!botclub join'
        const message = testUtils.mockMessage(userMessage)

        await discordService.handleBotUserPermissionRequest(message)
        expect(message.reply).toBeCalledWith('Opa, não achei a role bots_user')
      })

      it('removes the "bots_user" role from the user', async () => {
        const userMessage = '!botclub leave'
        const message = testUtils.mockMessage(userMessage, { guildRoles: [{ name: 'bots_user' }] })

        await discordService.handleBotUserPermissionRequest(message)
        expect(message.author.send).toBeCalledWith('Você teve a role `bots_user` removida 🔥')
      })
    })
  })

  describe('handleTimerCommand', () => {
    it('creates a timer message', async () => {
      const userMessage = '!timer 15m'
      const message = testUtils.mockMessage(userMessage)

      await discordService.handleTimerCommand(message)

      expect(message.channel.send).toBeCalledWith(expect.objectContaining({
        embed: {
          color: '#008000',
          description: 'Iniciado por Mark',
          fields: [
            {
              inline: true,
              name: 'Restante',
              value: '`00:15:00`'
            },
            {
              inline: true,
              name: 'Inicial',
              value: '`00:15:00`'
            }
          ],
          thumbnail: {
            url: 'https://i.imgur.com/vBWt5Fc.png'
          },
          title: 'Timer'
        }
      })
      )
    })

    describe('creates a timer message with different units', () => {
      [
        {
          timeAndUnit: '15m',
          expectedTime: '00:15:00'
        },
        {
          timeAndUnit: '15min',
          expectedTime: '00:15:00'
        },
        {
          timeAndUnit: '15hour',
          expectedTime: '15:00:00'
        },
        {
          timeAndUnit: '15h',
          expectedTime: '15:00:00'
        },
        {
          timeAndUnit: '15s',
          expectedTime: '00:00:15'
        }
      ].forEach(({ timeAndUnit, expectedTime }) => {
        it(timeAndUnit, async () => {
          const userMessage = `!timer ${timeAndUnit}`
          const message = testUtils.mockMessage(userMessage)

          await discordService.handleTimerCommand(message)
          expect(message.channel.send).toBeCalledWith(expect.objectContaining({
            embed: expect.objectContaining({
              title: 'Timer',
              fields: expect.arrayContaining([
                expect.objectContaining({
                  value: expect.stringContaining(expectedTime)
                })
              ])
            })
          }))
        })
      })
    })
  })
})
