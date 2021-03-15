
/**
 * Handles the join role user command.
 *
 * @param { import('discord.js').Message } message
 * @param { import('discord.js').GuildMember } member
 * @param { import('discord.js').Role } role
 */
async function handleJoinRole (message, member, role) {
  await member.roles.add(role)
  await message.author.send(`Você recebeu a role \`${role.name}\` 😎`)
}

/**
 * Handles the remove role user command.
 *
 * @param { import('discord.js').Message } message
 * @param { import('discord.js').GuildMember } member
 * @param { import('discord.js').Role } role
 */
async function handleRemoveRole (message, member, role) {
  await member.roles.remove(role)
  await message.author.send(`Você teve a role \`${role.name}\` removida 🔥`)
}

module.exports = {
  handleJoinRole,
  handleRemoveRole
}
