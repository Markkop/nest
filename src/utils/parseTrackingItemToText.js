const trackingMoreStatus = {
	'not found001': 'Information Received/info received. The package is about to be picked up.',
	'not found002': 'There is no tracking information for this package.',
	transit001: 'shipment on the way',
	transit002: 'Arrival scan Shipment arrived at a hub or sorting center',
	transit003: 'Arrived at delivery facility',
	transit004: 'Arrived at the destination country',
	transit005: 'Customs clearance completed',
	delivered001: 'Shipment delivered successfully',
	delivered002: 'Package picked up by customer',
	delivered003: 'Package delivered to and signed by the customer',
	delivered004: 'Package has been left at the front door or left with your neighbour',
	exception004: 'The package is unclaimed.',
	exception005: 'Delivery exception',
	exception006: 'The package is retained by customs because it\'s prohibited goods.',
	exception007: 'The package is damaged, lost or discarded.',
	exception008: 'The package is canceled before delivering.',
	exception009: 'The package is refused by the addressee',
	exception010: 'The package returned to the sender',
	exception011: 'Returning to sender'
}

/**
 * Parses a tracking item into a friendly text
 * to be sent to Telegram
 * @param {object} item
 * @returns {string} 
 */
module.exports = function parseTrackingItemToText (item) {
	const lastTrackInfo = item.lastTrackInfo || {}
	const lastSubstatus = lastTrackInfo.substatus
	const textLines = [
		`🏷 | <b>ID: ${item.trackingNumber}</b>`,
		`🚚 | <b>Carrier:</b> ${item.carrierCode}`,			
		`⌛️ | <b>Time Elapsed:</b> ${item.timeElapsed} days`,
		`🔗 | <b>Status:</b> ${trackingMoreStatus[item.substatus] || item.substatus}`,
		'🔎 | <b>Last Tracking Info:</b>',
		`At ${lastTrackInfo.Date}:`,
		`- ${lastTrackInfo.StatusDescription}`,
		`- ${trackingMoreStatus[lastSubstatus] || lastSubstatus}`
	]
	if (item.lastEvent) {
		textLines.push(`📜 | <b>Last Event:</b> ${item.lastEvent}`)
	}
	if (item.destinationTrackNumber) {
		textLines.push(`✨ | <b>Destination Track Number:</b> <code>${item.destinationTrackNumber}</code>`)
	} 
	return textLines.join('\n')
}