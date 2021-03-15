/**
 * Mocks the send message function to have its react
 * method mocked and to return the same content.
 *
 * @param { import('discord.js').Message } message
 * @returns { import('discord.js').Message }
 */
function mockSendMessage (message) {
  if (typeof message === 'object') {
    message.react = jest.fn()
  }
  return message
}

/**
 * Mocks a channel message to match properties from a Discord Message.
 *
 * @returns { import('discord.js').GuildMember }
 */
function mockGuildMember () {
  return {
    roles: {
      add: jest.fn(),
      remove: jest.fn()
    }
  }
}

/**
 * Mocks a channel message to match properties from a Discord Message.
 *
 * @param {string} content - Message content.
 * @param {object} options - Custom mocks.
 * @returns {object} Mocked message.
 */
function mockMessage (content, options = {}) {
  return {
    react: jest.fn(),
    content: content,
    reply: jest.fn(mockSendMessage),
    channel: {
      send: jest.fn(mockSendMessage)
    },
    author: {
      id: 111,
      username: 'Mark',
      send: jest.fn(mockSendMessage)
    },
    guild: {
      id: 100,
      name: 'GuildName',
      roles: {
        cache: options.guildRoles || []
      },
      members: {
        fetch: jest.fn(mockGuildMember)
      }
    }
  }
}

module.exports = {
  mockMessage,
  mockSendMessage
}
