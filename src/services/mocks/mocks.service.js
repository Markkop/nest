/**
 * @typedef Product
 * @property { String } id
 * @property { String } name
 * @property { Number } price
 * @property { Number } oldPrice
 * @property { String } url
 * @property { String } image
 * @property { Object } installments
 * @property { Number } installments.price
 * @property { Number } installments.count
 * @property { Boolean } isAvailable
 * @property { String[] } categories
 * @property { String[] } flags
 * @property { Object } specs
 * @property { String } specs.size
 * @property { String } specs.color
 * @property { Object } reviews
 * @property { Number } reviews.count
 * @property { Number } reviews.average
 */

module.exports = {
	name: 'mocks',

	/**
	 * Service settings.
	 */
	settings: {},

	/**
	 * Actions.
	 */
	actions: {
		getProducts: {
			/**
			 * Get "random" products
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<Product[]> } Asana created task.
			 */
			handler(ctx) {
				return this.generateProducts(ctx.params.qty)
			},
		},
		getProductById: {
			/**
			 * Get a single fake product by its id
			 *
			 * @param { import('moleculer').Context } ctx - Moleculer context.
			 * @returns { Promise.<Product> } Asana created task.
			 */
			handler(ctx) {
				return this.getProductById(ctx.params.id)
			},
		},
	},

	/**
	 * Methods.
	 */
	methods: {
		/**
		 * Genereate products 
		 * @param { Number } qty 
		 * @returns { Product[] }
		 */
		generateProducts(qty = 20) {
			let products = []

			for (let i = 0; i < qty; i++) {
				const id = String(i)
				const product = {
					id: id,
					name: `Product ${String(i)}`,
					price: 49.99,
					oldPrice: 99.99,
					url: 'https://link.com',
					img: `https://source.unsplash.com/300x400/?fashion&sig=${id}`,
					installments: { price: 24.99, count: 2 },
					isAvailable: true,
					categories: ['Calçados', 'Esportivo'],
					flags: ['Promoção'],
					specs: {
						size: ['37', '38', '39'],
						color: ['Cinza', 'Preto'],
					},
					reviews: { count: 5, average: 4 },
				}
				products.push(product)
			}
			return products
		},
		/**
		 * Generate a product
		 * @param { String } id 
		 */
		getProductById(id) {
			const [ product ] = this.generateProducts(1)
			product.id = id
			product.name = `Product ${id}`
			return product
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
	stopped() {},
}
