const { Errors } = require("moleculer");

class AsanaError extends Errors.MoleculerError {
	constructor(msg, error) {
		super(
			`${msg}: ${error.message}`,
			error.status,
			"ASANA_ERROR",
			error.value
		);
	}
}

module.exports = { AsanaError };
