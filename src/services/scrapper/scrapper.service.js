const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

module.exports = {
	name: "scrapper",

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
			const url =
				"https://lasvegas.craigslist.org/search/sss?query=motorhome&sort=rel&min_price=1000&max_price=3000";
			return puppeteer
				.launch()
				.then(browser => browser.newPage())
				.then(page => {
					return page.goto(url).then(function() {
						return page.content();
					});
				})
				.then(html => {
					const $ = cheerio.load(html);
					const products = $(".result-row");

					const newsHeadlines = [];
					products.each(function() {
						newsHeadlines.push({
							title: $(this)
								.find(".result-title")
								.text()
						});
					});

					console.log(newsHeadlines);
					return newsHeadlines;
				})
				.catch(console.error);
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
