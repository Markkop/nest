const Discord = require('discord.js')
const modules = require('../modules')

module.exports = {
  name: 'Discord',

  dependencies: [],

  settings: {
    guildId: '',
    prefix: '!',
    timerMultipliers: {
      m: 60,
      min: 60,
      h: 3600,
      hour: 3600
    },
    roleName: {
      botUser: 'bots_user'
    }
  },

  actions: {},

  events: {},

  methods: {
    /**
     * Sets and Starts a discord message timer.
     *
     * @param { import('discord.js').Message } userMessage - Original user request message.
     * @param { import('discord.js').Message } sentMessage - Discord Message to be updated.
     * @param { number } secondsToCount - Timer duration in seconds.
     * @param { string } title
     * @returns {Promise<boolean>} Timer promise.
     */
    async setAndStartTimer (userMessage, sentMessage, secondsToCount, title) {
      await sentMessage.react('👀')
      const originalTime = secondsToCount
      return setInterval(function () {
        return new Promise(resolve => {
          secondsToCount = secondsToCount - 1

          const isMultipleOfFive = secondsToCount % 3 === 0
          if (isMultipleOfFive) {
            const embed = modules.timer.mountTimerEmbed(originalTime, secondsToCount, userMessage.author.username, title)
            sentMessage.edit({ embed })
          }

          if (secondsToCount > 0) {
            return
          }

          clearInterval(this)
          const reactions = sentMessage.reactions.cache
          const authorId = userMessage.author.id
          const authorMention = `<@${authorId}>`
          const titleText = title ? ` em "${title}"` : ''
          let timesUpMessage = `Fim do tempo${titleText}, ${authorMention}!`
          const watchReaction = reactions.find(reaction => reaction.emoji.name === '👀')
          if (!watchReaction) {
            sentMessage.channel.send(timesUpMessage)
            return resolve(true)
          }

          watchReaction.users.fetch().then(users => {
            const humanWatchers = users.array().filter(user => !user.bot)
            if (humanWatchers.length) {
              const mentions = humanWatchers.map(watcher => `<@${watcher.id}>`)
              mentions.unshift(authorMention)
              const mentionsText = [...new Set(mentions)].join(', ')
              timesUpMessage = `Fim do tempo${titleText}, seu${mentions.length < 1 ? 's' : ''} olhudo: ${mentionsText}`
            }

            sentMessage.channel.send(timesUpMessage)
            return resolve(true)
          })
        })
      }, 1000)
    },

    /**
     * Handles the timer command.
     *
     * @param { import('discord.js').Message } message - Discord message object.
     * @returns { Promise<undefined>} - Return undefined.
     */
    async handleTimerCommand (message) {
      const { args, options } = modules.message.getArgumentsAndOptions(message, '=')
      const helpMessage = `Não entendi, que tal tentar algo como: \`${this.settings.prefix}timer 15m\``
      if (!args || !args[0]) {
        return message.channel.send(helpMessage)
      }

      const [time, unit] = args[0].split(/(\D)/)
      if (!time || !unit) {
        return message.channel.send(helpMessage)
      }

      const secondsToCount = Number(time) * (this.settings.timerMultipliers[unit] || 1)
      const embed = modules.timer.mountTimerEmbed(secondsToCount, secondsToCount, message.author.username, options.title)
      const sentMessage = await message.channel.send({ embed })
      const timer = this.setAndStartTimer(message, sentMessage, secondsToCount, options.title)
      await timer
    },

    /**
     * Sends the user a private message with help.
     *
     * @param { import('discord.js').Message } message - Discord message object.
     * @returns { Promise<undefined>} - Return undefined.
     */
    async handleHelpCommand (message) {
      const embed = modules.help.mountCommandHelpEmbed(message, this)
      return message.author.send({ embed })
    },

    /**
     * Changes the BotUser role and notifies the user using private message.
     *
     * @param { import('discord.js').Message } message - Discord message object.
     * @returns { Promise<undefined>} - Return undefined.
     */
    async handleBotUserPermissionRequest (message) {
      try {
        const { args } = modules.message.getArgumentsAndOptions(message, '=')
        if (!args || !args[0]) {
          const helpMessage = `Você pode usar \`${this.settings.prefix}botuser join\` ou \`${this.settings.prefix}botuser leave\``
          return message.reply(helpMessage)
        }

        let guild = message.guild
        if (!guild) {
          guild = await message.client.guilds.fetch(this.settings.guildId)
        }

        const roleName = this.settings.roleName.botUser
        const botUserRole = guild.roles.cache.find(role => role.name === roleName)

        if (!botUserRole) {
          return message.reply(`Opa, não achei a role ${roleName}`)
        }

        const roleCommands = {
          join: modules.role.handleJoinRole,
          leave: modules.role.handleRemoveRole
        }

        const roleCommand = roleCommands[args[0]]
        if (!roleCommand) {
          return
        }

        const member = message.member || await guild.members.fetch(message.author.id)
        await roleCommand(message, member, botUserRole)

        message.react('✅')
      } catch (error) {
        this.logger.error(error)
        message.react('❌')
      }
    }
  },

  created () {
    this.client = new Discord.Client({ partials: ['MESSAGE', 'CHANNEL', 'REACTION'] })
  },

  started () {
    this.commandHandler = {
      botclub: this.handleBotUserPermissionRequest,
      timer: this.handleTimerCommand,
      help: this.handleHelpCommand,
      time: (message) => message.reply(new Date().toString())
    }

    this.client.on('ready', async () => {
      this.logger.info(`Discord Bot online on ${this.client.guilds.cache.map(ch => ch.name).join(', ')}`)
      this.client.user.setActivity(`${this.settings.prefix}help`, { type: 'PLAYING' })
    })

    this.client.on('message', async (message) => {
      try {
        if (message.author.bot) return

        if (!message.content.startsWith(this.settings.prefix)) return

        const command = modules.message.getCommand(this.settings.prefix, message)
        const handler = this.commandHandler[command]

        if (!handler) return
        await handler(message)
      } catch (error) {
        this.logger.error(error, message)
      }
    })
  },

  stopped () {
    this.client.destroy()
  }
}
