
/**
 * Get command word from user message.
 *
 * @param {number} durationInSeconds - Time duration in seconds.
 * @returns {string} Formatted time as HH:MM:SS.
 */
function formatTime (durationInSeconds) {
  const hours = Math.floor(durationInSeconds / 60 / 60)
  const minutes = Math.floor(durationInSeconds / 60) - (hours * 60)
  const seconds = durationInSeconds % 60

  const hoursText = hours.toString().padStart(2, '0')
  const minutesText = minutes.toString().padStart(2, '0')
  const secondsText = seconds.toString().padStart(2, '0')

  return `\`${hoursText}:${minutesText}:${secondsText}\``
}

/**
 * Mounts the timer message embed.
 *
 * @param { number } startingTime
 * @param { number } timeLeft
 * @param { string } authorName
 * @param { string } [title="Timer"]
 * @returns { import('discord.js').MessageEmbed }
 */
function mountTimerEmbed (startingTime, timeLeft, authorName, title = 'Timer') {
  const criticalPercentage = 25
  const timeLeftPercentageColors = {
    100: '#008000',
    50: '#ffff00',
    [criticalPercentage]: '#ff0000',
    1: '#808080'
  }

  const timePercentageLeft = (timeLeft / startingTime) * 100
  const percentageMarker = Object.keys(timeLeftPercentageColors).reverse().reduce((marker, percentageMarker) => {
    return timePercentageLeft < percentageMarker ? percentageMarker : marker
  }, 100)

  let color = timeLeftPercentageColors[percentageMarker]

  if (timePercentageLeft < criticalPercentage && timeLeft % 2) {
    color = timeLeftPercentageColors['50']
  }

  return {
    title,
    color,
    description: `Iniciado por ${authorName}`,
    thumbnail: {
      url: 'https://i.imgur.com/vBWt5Fc.png'
    },
    fields: [
      {
        name: 'Restante',
        value: formatTime(timeLeft),
        inline: true
      },
      {
        name: 'Inicial',
        value: formatTime(startingTime),
        inline: true
      }
    ]
  }
}

module.exports = {
  mountTimerEmbed,
  formatTime
}
