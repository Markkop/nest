const axios = require("axios");
const cheerio = require("cheerio");

module.exports = {
	name: "scrapper",

	mixins: [axios],

	/**
	 * Actions.
	 */
	actions: {
		getMotorhome: {
			handler(ctx) {
				return this.getMotorhome(ctx.params);
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		async getMotorhome() {
			try {
				const url =
					"https://lasvegas.craigslist.org/search/sss?query=motorhome&sort=rel&min_price=1000&max_price=3000";
				const options = {
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.100 Safari/537.36"
					}
				};
				const { data: html } = await axios(url, options);
				const $ = cheerio.load(html);
				const result = $(".result-row ");
				const product = [];

				result.each(function() {
					const title = $(this)
						.find(".result-title")
						.text();

					product.push({ title });
				});

				return product;
			} catch (error) {
				console.log(error);
				return error;
			}
		}
	},

	/**
	 * Service created lifecycle event handler.
	 */
	created() {},

	/**
	 * Service started lifecycle event handler.
	 */
	started() {},

	/**
	 * Service stopped lifecycle event handler.
	 */
	stopped() {}
};
