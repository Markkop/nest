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
		},
		getCraigslistCities: {
			handler(ctx) {
				return this.getCraigslistCities();
			}
		}
	},

	/**
	 * Methods.
	 */
	methods: {
		async getCraigslistCities() {
			const browser = await puppeteer.launch();
			const page = await browser.newPage();
			await page.goto("https://geo.craigslist.org/iso/us");
			const html = await page.content();
			const $ = await cheerio.load(html);
			const listItems = $("li a");
			const citiesUrls = [];
			listItems.each(function() {
				const baseUrl = $(this).attr("href");
				citiesUrls.push(baseUrl);
			});
			await browser.close();
			return citiesUrls;
		},

		async getMotorhome() {
			try {
				const query = "motorhome";
				const minPrice = 1000;
				const maxPrice = 3000;
				const citiesBaseUrl = await this.getCraigslistCities();
				citiesBaseUrl.length = 10;

				const browser = await puppeteer.launch();
				const page = await browser.newPage();
				let index = 0;

				const scrapCraigslistPage = async (results, citiesBaseUrl) => {
					if (index === citiesBaseUrl.length) {
						return results;
					}

					const cityBaseUrl = citiesBaseUrl[index];
					index++;

					const url = `${cityBaseUrl}/search/sss?query=${query}&sort=rel&min_price=${minPrice}&max_price=${maxPrice}`;
					this.logger.info(`Scrapping ${url}`);
					await page.goto(url);

					const html = await page.content();
					const $ = await cheerio.load(html);

					const resultsCount = Number($(".totalcount").html());
					const resultsPerPage = 120;
					const pagesCount = Math.ceil(resultsCount / resultsPerPage);
					this.logger.info(`Found ${resultsCount} results within ${pagesCount} pages`);

					for (let index = 0; index < pagesCount; index++) {
						results = results.concat(await this.extractData($, resultsCount));
						if (index != pagesCount - 1) {
							await page.click('a[title="next page"]');
						}
					}
					this.logger.info(`Collected ${results.length} from ${index}/${citiesBaseUrl.length} cities`);
					return scrapCraigslistPage(results, citiesBaseUrl);
				};

				return scrapCraigslistPage([], citiesBaseUrl);
			} catch (error) {
				this.logger.error(error);
			}
		},

		async extractData(cheerio, resultsCount) {
			const $ = cheerio;
			const products = $(".result-row");

			const totalProducts = [];
			products.each(function() {
				if (totalProducts.length === resultsCount) {
					return;
				}

				totalProducts.push({
					title: $(this)
						.find(".result-title")
						.text(),
					url: $(this)
						.find(".result-title")
						.attr("href"),
					price: $(this)
						.find(".result-price")
						.html(),
					img:
						$(this)
							.find(".swipe img")
							.attr("src") ||
						$(this)
							.find(".result-image img")
							.attr("src"),
					date: $(this)
						.find(".result-date")
						.text()
				});
			});

			return totalProducts;
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
