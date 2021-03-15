const { getArgumentsAndOptions } = require('./message')

const helpMessages = (prefix) => ({
  help: 'Nice try',
  botclub: `Entre ou saia do clube de usuários com o comando \`${prefix}botclub join\` e \`leave\``,
  timer: `Acione um contador que pode ajudar com as dailies usando \`${prefix}timer 15m\` ou \`30s\`, por exemplo`
})

/**
 * Mounts the help message embed.
 *
 * @param { import('discord.js').Message } message
 * @param { import('moleculer').Service } discordService
 * @returns { import('discord.js').MessageEmbed }
 */
function mountCommandHelpEmbed (message, discordService) {
  const { settings: { prefix } } = discordService
  const commandsList = Object.keys(discordService.commandHandler)
  const commandsListText = commandsList.map(command => `\`${command}\``).join(', ')
  const { args } = getArgumentsAndOptions(message)
  const command = args[0]
  const helpMessage = helpMessages(prefix)

  return {
    color: 'LIGHT_GREY',
    title: ':grey_question: Ajuda',
    description: helpMessage[command] || helpMessage.default,
    fields: [
      {
        name: 'Comandos disponíveis',
        value: commandsListText
      }
    ]
  }
}

module.exports = {
  mountCommandHelpEmbed
}
