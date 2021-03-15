const modules = require('../../src/modules')

describe('module', () => {
  describe('message', () => {
    it('get arguments and options correctly', () => {
      const message = { content: '.equip o eterno raridade=mítico' }
      const { args, options } = modules.message.getArgumentsAndOptions(message, '=')
      expect(args).toEqual(['o', 'eterno'])
      expect(options).toEqual({ raridade: 'mítico' })
    })

    it('get options with quotes', () => {
      const message = { content: '.comando algum argumento opcao1="azul claro" opcao2="banana"' }
      const { args, options } = modules.message.getArgumentsAndOptions(message, '=')
      expect(args).toEqual(['algum', 'argumento'])
      expect(options).toEqual({ opcao1: 'azul claro', opcao2: 'banana' })
    })

    it('get options with and without quotes', () => {
      const message = { content: '.comando algum argumento opcao1=azul opcao2="banana"' }
      const { args, options } = modules.message.getArgumentsAndOptions(message, '=')
      expect(args).toEqual(['algum', 'argumento'])
      expect(options).toEqual({ opcao1: 'azul', opcao2: 'banana' })
    })

    it('get command correctly', () => {
      const message = { content: '.calc base 20 dmg 30 res 10' }
      const command = modules.message.getCommand('.', message)
      expect(command).toEqual('calc')
    })
  })

  describe('timer', () => {
    it('formats a time in seconds', () => {
      const formattedTime = modules.timer.formatTime(1000)
      expect(formattedTime).toEqual('`00:16:40`')
    })
  })
})
