window.onload = function () {
	// Fancybox
	let fancybox = document.querySelector('[data-fancybox]');
	if (fancybox) {
		Fancybox.bind('[data-fancybox]', {
			on: {
				init: (fancybox, slide) => {
					document
						.querySelector('body')
						.classList.add('body-not-scroll');
					initScrollBar();
				},
				shouldClose: (fancybox, slide) => {
					document
						.querySelector('body')
						.classList.remove('body-not-scroll');
					initScrollBar();
				},
			},
			closeButton: 'outside',
		});
	}
	// FB pixel
	function FBAddToWishlist() {
		try {
			fbq('track', 'AddToWishlist');
		} catch (err) {
			console.error(err);
		}
	}

	function FBAddToCart(id, data) {
		let obj = data.cart.find((o) => o.product_id === id);

		try {
			fbq('track', 'AddToCart', {
				content_ids: [obj.product_sku],
				currency: 'UAH',
			});
		} catch (err) {
			console.error(err);
		}
	}

	function FBPurchase(data) {
		let products = [];
		data.products.forEach((i) => {
			products.push(i.product_sku);
		});

		try {
			fbq('track', 'Purchase', {
				content_ids: [products],
				content_type: 'product_group',
				value: 0.0,
				currency: 'UAH',
			});
		} catch (err) {
			console.error(err);
		}
	}

	function FBCompleteRegistration() {
		let orderingWrapper = document.querySelector('.ordering__wrapper');

		if (!orderingWrapper) {
			try {
				fbq('track', 'CompleteRegistration');
			} catch (err) {
				console.error(err);
			}
		}
	}

	function FBAddPaymentInfo() {
		try {
			fbq('track', 'AddPaymentInfo');
		} catch (err) {
			console.error(err);
		}
	}

	function FBInitiateCheckout() {
		let products = [];
		let sku = document.querySelectorAll('.basket__info-art');
		sku.forEach((i) => {
			let text = i.textContent;
			let textSku = text.replace('Арт.', '');
			products.push(textSku.trim());
		});

		try {
			fbq('track', 'InitiateCheckout', {
				content_ids: [products],
				content_type: 'product_group',
				currency: 'UAH',
			});
		} catch (err) {
			console.error(err);
		}
	}

	function FBViewContent(ids, type) {
		try {
			fbq('track', 'ViewContent', {
				content_ids: [ids],
				content_type: type,
			});
		} catch (err) {
			console.error(err);
		}
	}
	// init social auth
	document.querySelectorAll('.social__auth-action').forEach((i) => {
		i.addEventListener('click', FBCompleteRegistration, false);
	});
	// init InitiateCheckout method
	let orderingWrapper = document.querySelector('.ordering__wrapper');
	if (orderingWrapper) {
		let modal = document.getElementById('orderModal');
		if (!modal.classList.contains('show')) {
			FBInitiateCheckout();
		}
	}
	// init product page
	let productPageSku = document.querySelector('.card__description-art');
	if (productPageSku) {
		let text = productPageSku.textContent;
		let textSku = text.replace('Арт.', '');
		let id = textSku.trim();

		FBViewContent(id, 'product');
	}
	// init catalog
	let catalog = document.querySelector('.grid__catalog-wrapper');
	if (catalog) {
		let ids = [];
		let dataSku = document.querySelectorAll('[data-sku]');
		dataSku.forEach((i) => {
			ids.push(i.getAttribute('data-sku'));
		});

		FBViewContent(ids, 'product_group');
	}
	//clear cookie for init preloader
	window.onbeforeunload = () => {
		let firstLoad = sessionStorage.getItem('firstLoad');

		if (!firstLoad) {
			document.cookie =
				'firstLoad=false; expires=Thu, 01 Jan 1970 00:00:00 GMT;';
		}
	};
	// need to work with promo or sertificate inputs in checkout page
	function initSaleCode(data) {
		if (data.coincidence_code_validation === undefined) {
			initSaleCodeOtherMethods(data);
		} else {
			initSaleCodePayMethod(data);
		}
	}

	function initSaleCodeOtherMethods(data) {
		let promoInput = document.querySelector('.shopping__inform-promo');
		let sertificateInput = document.querySelector(
			'.shopping__inform-certificate'
		);
		let errorDiscount = document.querySelector('.discount-error');

		if (
			data.coincidence_code_validation_promo.includes('**') ||
			data.coincidence_code_validation_sertif.includes('**')
		) {
			errorDiscount.classList.add('gray');
		} else {
			errorDiscount.classList.remove('gray');
		}

		if (data.coincidence_code_validation_promo !== '') {
			errorDiscount.textContent = data.coincidence_code_validation_promo;
			errorDiscount.style.display = 'block';
			promoInput.classList.remove('valid-promocode');
		} else if (data.coincidence_code_validation_sertif !== '') {
			errorDiscount.style.display = 'block';
			errorDiscount.textContent = data.coincidence_code_validation_sertif;
			promoInput.classList.remove('valid-promocode');
		} else if (promoInput.value !== '') {
			errorDiscount.textContent = '';
			errorDiscount.style.display = 'none';
			promoInput.classList.add('valid-promocode');
		} else if (sertificateInput.value !== '') {
			errorDiscount.textContent = '';
			errorDiscount.style.display = 'none';
			sertificateInput.classList.add('valid-promocode');
		}
	}

	function initSaleCodePayMethod(data) {
		let promoInput = document.querySelector('.shopping__inform-promo');
		let sertificateInput = document.querySelector(
			'.shopping__inform-certificate'
		);
		let errorDiscount = document.querySelector('.discount-error');

		if (data.coincidence_code_validation.includes('**')) {
			errorDiscount.classList.add('gray');
			promoInput.classList.add('valid-promocode');
		} else {
			errorDiscount.classList.remove('gray');
		}

		if (data.coincidence_code_validation !== '') {
			errorDiscount.style.display = 'block';
			errorDiscount.textContent = data.coincidence_code_validation;
			sertificateInput.classList.remove('valid-promocode');
		} else if (promoInput.value !== '') {
			errorDiscount.textContent = '';
			errorDiscount.style.display = 'none';
			promoInput.classList.add('valid-promocode');
		} else if (sertificateInput.value !== '') {
			errorDiscount.textContent = '';
			errorDiscount.style.display = 'none';
			sertificateInput.classList.add('valid-promocode');
		}
	}
	// observer for body change overflow/padding of bootstrap modals
	let observer = new MutationObserver(function (mutations) {
		mutations.forEach(function (mutationRecord) {
			let bodyStyle = mutationRecord.target.attributes.style.value;
			let header = document.querySelector('header');

			if (bodyStyle.includes('padding-right')) {
				let item = bodyStyle.split(' ');
				let px = item[1].split(';');
				target.classList.add('body-not-scroll');
				header.style.paddingRight = px[0];
			} else {
				header.style.paddingRight = '';
				target.classList.remove('body-not-scroll');
			}
		});
	});
	// init sroll fun
	function initScrollBar() {
		let body = document.querySelector('body');

		if (body.classList.contains('body-not-scroll')) {
			let div = document.createElement('div');

			div.style.overflowY = 'scroll';
			div.style.width = '50px';
			div.style.height = '50px';

			document.body.append(div);
			let scrollWidth = div.offsetWidth - div.clientWidth;

			div.remove();

			if (scrollWidth != 0) {
				body.style.paddingRight = `${scrollWidth}px`;
			}
		} else {
			body.style.paddingRight = '';
		}
	}

	let target = document.querySelector('body');
	observer.observe(target, { attributes: true, attributeFilter: ['style'] });
	// custom hidden fun.
	function hiding(show_el, style, hide_el = null) {
		if (style == 'inline' && hide_el == null) {
			show_el.style.display = 'inline-block';
		}
		if (style == 'inline' && hide_el !== null) {
			show_el.style.display = 'inline-block';
			hide_el.style.display = 'none';
		}
		if (style == 'block') {
			show_el.style.display = 'block';
			hide_el.style.display = 'none';
		}
		if (style == 'flex' && hide_el) {
			show_el.style.display = 'flex';
			hide_el.style.display = 'none';
		}
		if (style == 'flex' && hide_el == null) {
			show_el.style.display = 'flex';
		}
		if (style == 'none') {
			show_el.style.display = 'none';
		}
	}

	//slider cards
	let productCard = document.querySelector('.product-card-swiper');
	let productCardSwiper;
	if (productCard) {
		productCardSwiper = new Swiper('.product-card-swiper', {
			watchOverflow: true,
			slidesPerView: 1,
			navigation: {
				nextEl: '.product-card-swiper-next',
				prevEl: '.product-card-swiper-prev',
			},
		});
	}
	//remove all childs
	function removeAllChildNodes(parent) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	}
	//needs for revrite dropped cart in checkout page
	function droppedCartData() {
		// let lastname = document.getElementById('lastname').value;
		// let firstname = document.getElementById('firstname').value;
		// // let custTel = document.getElementById('customer_telephone').value;
		// // let telephone = '';
		// // if (custTel !== '' && !custTel.includes('_')) {
		// // 	telephone = custTel
		// // 		.replace('(', '')
		// // 		.replace(')', '')
		// // 		.replace('+', '');
		// // }
		// let comment = document.getElementById('comment').value;
		// let orderMethod = document.getElementById('orderMethod');
		// let regions = document.getElementById('regions');
		// let cities = document.getElementById('cities');
		// let warehouses = document.getElementById('warehouses');
		// let shop = document.getElementById('shop');
		// let pay = document.getElementById('pay');
		// let payCode = '';
		// let payment_method = '';
		// if (pay.value == 1) {
		// 	payCode = 'cash';
		// 	payment_method = 'наличными';
		// } else if (pay.value == 2) {
		// 	payCode = 'liqpay';
		// 	payment_method = 'безналичный расчет';
		// }
		// let promo = document.querySelector('.shopping__inform-promo').value;
		// let sertificate = document.querySelector(
		// 	'.shopping__inform-certificate'
		// ).value;
		// let ukrIndex = document.getElementById('ukrIndex');
		// let ukrRegion = document.getElementById('ukrRegion');
		// let ukrSettlement = document.getElementById('ukrSettlement');
		// let justinIndex = document.getElementById('justinIndex');
		// let justinRegion = document.getElementById('justinRegion');
		// let justinSettlement = document.getElementById('justinSettlement');
		// let requestRegions = '';
		// let requestCities = '';
		// let requestWarehouses = '';
		// let NpRegionsID = regions.querySelector('option:checked');
		// let NpCitiesID = cities.querySelector('option:checked');
		// let NpWarehousesID = warehouses.querySelector('option:checked');
		// if (orderMethod.value == '') {
		// 	requestRegions = '';
		// 	requestCities = '';
		// 	requestWarehouses = '';
		// } else if (orderMethod.value === 'flat') {
		// 	requestRegions = '';
		// 	requestCities = '';
		// 	requestWarehouses = shop.options[shop.selectedIndex].text;
		// } else if (orderMethod.value === 'novaposhta') {
		// 	if (regions.options[regions.selectedIndex] !== undefined) {
		// 		requestRegions = regions.options[regions.selectedIndex].text;
		// 	}
		// 	if (cities.options[cities.selectedIndex] !== undefined) {
		// 		requestCities = cities.options[cities.selectedIndex].text;
		// 	}
		// 	if (warehouses.options[warehouses.selectedIndex] !== undefined) {
		// 		requestWarehouses =
		// 			warehouses.options[warehouses.selectedIndex].text;
		// 	}
		// } else if (orderMethod.value === 'ukposhta') {
		// 	requestRegions = ukrRegion.value;
		// 	requestCities = ukrSettlement.value;
		// 	if (ukrIndex.options[ukrIndex.selectedIndex] !== undefined) {
		// 		let address = ukrIndex.options[ukrIndex.selectedIndex].text;
		// 		requestWarehouses = address.split(',')[0];
		// 	}
		// } else if (orderMethod.value === 'justin') {
		// 	requestRegions = justinRegion.value;
		// 	requestCities = justinSettlement.value;
		// 	if (justinIndex.options[justinIndex.selectedIndex] !== undefined) {
		// 		requestWarehouses =
		// 			justinIndex.options[justinIndex.selectedIndex].text;
		// 	}
		// }
		// return {
		// 	lastname: lastname,
		// 	firstname: firstname,
		// 	// telephone: telephone,
		// 	comment: comment,
		// 	shipping_country: 'Украина',
		// 	shipping_code: orderMethod.value,
		// 	shipping_method:
		// 		orderMethod.options[orderMethod.selectedIndex].text,
		// 	shipping_firstname: firstname,
		// 	shipping_lastname: lastname,
		// 	shipping_zone: requestRegions,
		// 	shipping_city: requestCities,
		// 	shipping_address_1: requestWarehouses,
		// 	payment_firstname: firstname,
		// 	payment_lastname: lastname,
		// 	payment_code: payCode,
		// 	payment_method: payment_method,
		// 	payment_country: 'Украина',
		// 	payment_zone: requestRegions,
		// 	payment_city: requestCities,
		// 	payment_address_1: requestWarehouses,
		// 	promocode_number: promo,
		// 	sertificate_number: sertificate,
		// 	NpRegionsID: NpRegionsID ? NpRegionsID.value : '',
		// 	NpCitiesID: NpCitiesID ? NpCitiesID.value : '',
		// 	NpWarehousesID: NpWarehousesID ? NpWarehousesID.value : '',
		// };
	}
	function sendDroppedCartData(data) {
		// $.ajax({
		// 	url: `index.php?route=checkout/dropped_cart/index`,
		// 	type: 'post',
		// 	data: data,
		// 	dataType: 'json',
		// 	success: function (data) {},
		// 	error: function (err) {
		// 		throw new Error(err);
		// 	},
		// });
	}

	//! basket
	//init add product to basket in catalogs pages
	let stockStatus;
	let id;
	let shop;
	let size;
	let cityShop;
	let cityId;

	function isStokStatus(clazz, i) {
		document
			.querySelectorAll('.card__description-size.active-size')
			.forEach((i) => {
				i.classList.remove('active-size');
			});

		if (stockStatus == 1 && (clazz == 13 || clazz == 14)) {
			i.classList.toggle('active-size');
		} else if (stockStatus == 1 && clazz == 12) {
			shopAddAjax(shop);
			addAjax(id, shop);
		} else if (stockStatus == 1 && clazz == 11) {
			shopAddAjax(shop);
			addAjax(id, shop, size);
		} else if (stockStatus == 2 && clazz == 13) {
			if (size == 'ONE') {
				preOrder(id, shop);
			} else {
				preOrder(id, shop, size);
			}
		} else if (stockStatus == 2 && clazz == 12) {
			preOrder(id, shop);
		} else if (stockStatus == 2 && clazz == 11) {
			preOrder(id, shop, size);
		} else if (stockStatus == 3 && clazz == 12) {
			informAbout(id);
		} else if (stockStatus == 3 && clazz == 11) {
			informAbout(id, size);
		} else if (stockStatus == 3 && clazz == 13) {
			if (size == 'ONE') {
				informAbout(id);
			} else {
				informAbout(id, size);
			}
		} else if (
			(stockStatus == 2 && clazz == 14) ||
			(stockStatus == 3 && clazz == 14)
		) {
			preOrder(cityId, cityShop, size);
			$('#availability').modal('hide');
		} else if (
			(stockStatus == 1 && clazz == 15) ||
			(stockStatus == 1 && clazz == 17)
		) {
			shopAddAjax(shop);
			addAjax(id, shop);
		} else if (
			(stockStatus == 2 && clazz == 15) ||
			(stockStatus == 2 && clazz == 17)
		) {
			preOrder(id, shop);
		} else if (
			(stockStatus == 3 && clazz == 15) ||
			(stockStatus == 3 && clazz == 17)
		) {
			informAbout(id);
		} else if (stockStatus == 1 && clazz == 16) {
			shopAddAjax(shop);
			addAjax(id, shop);
		} else if (
			(stockStatus == 2 && clazz == 16) ||
			(stockStatus == 3 && clazz == 16)
		) {
			preOrder(id, shop);
		}
	}

	function stockStatusListener(e) {
		i = this;
		stockStatus = i.getAttribute('data-stock-status');
		let parent = i.parentNode;
		let clList = parent.classList;
		id = parent.getAttribute('data-id');
		shop = parent.getAttribute('data-shop');
		size = i.textContent;
		let clazz;
		let citySizes =
			i.parentNode.parentNode.parentNode.classList.contains(
				'city__sizes'
			);
		cityShop = i.parentNode.parentNode.parentNode.getAttribute('data-shop');
		cityId = i.parentNode.parentNode.parentNode.getAttribute('data-id');

		if (
			window.matchMedia('(min-width: 640px)').matches &&
			clList.contains('product__sizes-container')
		) {
			clazz = 11;
			isStokStatus(clazz, i);
		} else if (
			window.matchMedia('(min-width: 640px)').matches &&
			clList.contains('product__buy-container')
		) {
			clazz = 12;
			isStokStatus(clazz, i);
		} else if (
			clList.contains('card__description__sizes-block') &&
			!citySizes
		) {
			clazz = 13;
			isStokStatus(clazz, i);
		} else if (citySizes) {
			clazz = 14;
			isStokStatus(clazz, i);
		} else if (clList.contains('buy__container')) {
			clazz = 15;
			isStokStatus(clazz, i);
		} else if (clList.contains('city__sizes')) {
			$('#availability').modal('hide');
			clazz = 16;
			isStokStatus(clazz, i);
		} else if (clList.contains('table__btns-container')) {
			clazz = 17;
			isStokStatus(clazz, i);
		}
	}

	function initStockStatus() {
		document.querySelectorAll('[data-stock-status]').forEach((i) => {
			i.addEventListener('click', stockStatusListener, false);
		});
	}
	initStockStatus();

	function informAbout(id, size = 'ONE') {
		let showSize = infoAvailability.querySelector('.pre-size');
		removeAllChildNodes(showSize);

		showSize.insertAdjacentHTML(
			'afterbegin',
			`<button type="button" class="card__description-size" data-confirm=${id}>${size}</button>`
		);

		$(infoAvailability).modal();
	}

	function preOrder(id, shop, size = 'ONE') {
		let modal = document.querySelector('#preOrderModal');
		let basketSize = modal.querySelector('.pre-size');
		removeAllChildNodes(basketSize);

		basketSize.insertAdjacentHTML(
			'afterbegin',
			`<button type="button" class="card__description-size" data-shop="${shop}" data-confirm=${id}>${size}</button>`
		);

		$('#preOrderModal').modal();
	}

	//shop ajax (buy product)
	function shopAddAjax(shop) {
		let data = {
			shop_id: shop,
		};

		$.ajax({
			url: 'index.php?route=product/product/resorvedOfflineProduct',
			type: 'post',
			data: data,
			dataType: 'json',
			success: function (data) {},
			error: function (err) {
				throw new Error(err);
			},
		});
	}
	// add to basket (buy product)
	function addAjax(id, shop, size = '') {
		let data = {
			product_id: id,
			quantity: 1,
			shop_id: shop,
			option: {
				[id]: size,
			},
		};

		$.ajax({
			url: 'index.php?route=checkout/cart/add',
			type: 'post',
			data: data,
			dataType: 'json',
			success: function (data) {
				basketRendering(data);
				// pixel
				FBAddToCart(id, data);
			},
			error: function (err) {
				throw new Error(err);
			},
		});
	}
	// draw basket
	function basketRendering(data) {
		let basketContainer = document.querySelector('.basket__items');
		let basketTotal = document.querySelector('.basket__count-container');
		removeAllChildNodes(basketContainer);
		removeAllChildNodes(basketTotal);

		basketTotal.insertAdjacentHTML(
			'beforeend',
			`
            <div class="basket__count">
                <div class="basket__count-title">${data.total[0].product_total_title}</div>
                <div class="basket__count-price">${data.total[0].product_total_price}</div>
            </div>
        `
		);

		data.cart.forEach((i) => {
			basketContainer.insertAdjacentHTML(
				'beforeend',
				`
                <div class="basket__item">
                    <a href="${i.product_href}" class="basket__img">
                        <img src="${i.product_thumb}" alt="">
                    </a>
                    <div class="basket__info">
                        <div class="basket__info-title">
                            <a href="${i.product_href}" class="basket__info-title-text">${i.product_name}</a>
                            <div role="button" class="_icon-cancel" data-remove-id=${i.cart_id}></div>
                        </div>
                        <div class="basket__info-art">Арт. ${i.product_sku}</div>
                        <div class="basket__info__details">
                            <div class="basket__info__details-sub">
                                <div class="basket__info__details-size">${i.product_size}</div>
                                <div class="basket__info__details-amount">
                                    <div class="spinner-basket-container">
                                        <div class="spinner-border spinner-basket" role="status">
                                            <span class="sr-only">Загрузка...</span>
                                        </div>
                                    </div>
                                    <button class="step stepDown" type="button" data-edit-id="${i.cart_id}">-</button>
                                    <input type="number" min="1" max="${i.max}" value="${i.product_quantity}" readonly="" class="details-amount">
                                    <button class="step stepUp" type="button" data-edit-id="${i.cart_id}">+</button>
                                </div>
                            </div>
                            <div class="basket__info__price">
                                <div class="basket__info__price-title">${i.product_title}</div>
                                <div class="basket__info__price-cost">${i.product_price}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `
			);
		});

		basketWrapp.classList.toggle('show-effect');
		basketModal.classList.toggle('active-modal-basket');

		setToBasketIcon(data.total[0].products_total_count);
		removeInit();
		isEmpty();
		stepEdit();
	}
	let headerbag = document.querySelector('.header-bag');
	let basketModal = document.querySelector('#menu__mobile-modal');
	let basketWrapp;
	let closeBasket;
	let basketContinue;
	let orderPage = document.querySelector('.ordering__wrapper');
	let infoAvailability = document.getElementById('infoAvailability');
	//let body = document.querySelector('body');

	if (headerbag) {
		basketWrapp = document.querySelector('.header__basket-wrapper');
		closeBasket = basketWrapp.querySelector('.close-basket');
		basketContinue = basketWrapp.querySelector('.basket__submit-continue');
	}

	// show/close basket
	if (headerbag) {
		headerbag.addEventListener('click', (e) => {
			if (e.target.classList.contains('header-bag')) {
				basketWrapp.classList.toggle('show-effect');
				basketModal.classList.toggle('active-modal-basket');
			}
			isEmpty();
		});

		closeBasket.addEventListener('click', (e) => {
			basketWrapp.classList.toggle('show-effect');
			basketModal.classList.toggle('active-modal-basket');
		});

		basketContinue.addEventListener('click', (e) => {
			basketWrapp.classList.toggle('show-effect');
			basketModal.classList.toggle('active-modal-basket');
		});

		document.addEventListener('click', function (e) {
			let target = e.target;
			detectClickOut(basketWrapp, headerbag, target);
		});
	}

	//working functions
	function detectClickOut(container, icon, target) {
		let itsContainer = target == container || container.contains(target);
		let itsBtn = target == icon;
		let isActive = container.classList.contains('show-effect');

		if (!itsContainer && !itsBtn && isActive) {
			basketWrapp.classList.toggle('show-effect');
			basketModal.classList.toggle('active-modal-basket');
		}
	}

	function isEmpty() {
		let basketContent = document.querySelectorAll('.basket__item');

		if (orderPage && basketContent.length == 0) {
			window.location.replace(window.location.origin);
		} else if (!orderPage && basketContent.length == 0) {
			basketWrapp.querySelector('.basket__empty').style.display = 'block';
			basketWrapp.querySelector(
				'.basket__count-container'
			).style.display = 'none';
			basketWrapp.querySelector('.basket__submit-cont').style.display =
				'none';
		} else if (!orderPage && basketContent.length !== 0) {
			basketWrapp.querySelector('.basket__empty').style.display = 'none';
			basketWrapp.querySelector(
				'.basket__count-container'
			).style.display = 'block';
			basketWrapp.querySelector('.basket__submit-cont').style.display =
				'flex';
		}
	}

	function setToBasketIcon(sum) {
		let basket = document.querySelector('.products-total');
		removeAllChildNodes(basket);

		if (sum > 0) {
			basket.insertAdjacentHTML('beforeend', `(${sum})`);
		}
	}

	function setChecoutData(data) {
		let totalWithOutPromo = document.querySelector('.item-sum');
		document.querySelector('.item-count-number').textContent =
			data.products_total_count;

		if (data.sale_total_price == 0) {
			totalWithOutPromo.textContent = data.product_total_price;
		} else {
			totalWithOutPromo.textContent = data.sale_total_price;
		}
	}

	function showBasketModal() {
		let universal = document.querySelector('#universalModal');
		universal.querySelectorAll('.universalModal').forEach((i) => {
			i.style.display = 'none';
		});
		document.querySelector('.importantSizeModal').style.display = 'block';
		$('#universalModal').modal();
	}

	//add to basket
	// init with main button
	let addBtn = document.querySelector('.buy__container-btn');
	if (addBtn) {
		addBtn.addEventListener('click', (e) => {
			let mainSizes = document.querySelector('.main-sizes');
			let active = mainSizes.querySelector('.active-size');
			if (active) {
				let id = active.parentNode.getAttribute('data-id');
				let size = active.textContent;
				let shop = active.getAttribute('data-shop');

				if (size == 'ONE') {
					addAjax(id, shop);
				} else {
					addAjax(id, shop, size);
				}

				shopAddAjax(shop);
				active.classList.toggle('active-size');
			} else {
				showBasketModal();
			}
		});
	}
	// init with reserve button
	let reserveBtn = document.querySelectorAll('.city__reserve');
	if (reserveBtn.length > 0) {
		reserveBtn.forEach((i) => {
			i.addEventListener('click', (e) => {
				let active = i.parentNode.querySelector('.active-size');
				if (active) {
					let id = i.parentNode.getAttribute('data-id');
					let size = active.textContent;
					let shop = i.parentNode.getAttribute('data-shop');

					if (size == 'ONE') {
						addAjax(id, shop);
					} else {
						addAjax(id, shop, size);
					}

					shopAddAjax(shop);
					active.classList.toggle('active-size');
					$('#availability').modal('toggle');
				} else {
					$('#availability').modal('toggle');
					showBasketModal();
				}
			});
		});
	}
	//products in slider
	let sliderBlock = document.querySelector('.slider-cards__swiper');
	let gridCatalodItem = document.querySelectorAll(
		'.product__card-container-item'
	);
	if (sliderBlock || gridCatalodItem.length > 0) {
		getAllSubProducts();
	}

	function getAllSubProducts() {
		let subProdrodBtn = document.querySelectorAll('[data-prod-id]');

		subProdrodBtn.forEach((i) => {
			i.addEventListener('click', subProdrodListener, false);
		});
	}

	function subProdrodListener(e) {
		i = this;
		let btnProdId = i.getAttribute('data-prod-id');
		let parent = i.parentNode.parentNode.parentNode;
		let card = parent.querySelector('[data-json]');
		let dataId = parent.querySelector('[data-id]');
		let dataJson = card.getAttribute('data-json');
		let dataArr = JSON.parse(dataJson);
		let favorite = card.querySelector('.favorit');
		let crossOutPrice =
			card.parentNode.parentNode.querySelector('.cross-out-price');
		let price = crossOutPrice.nextElementSibling;

		let subProdCont = i.parentNode;
		subProdCont.querySelector('.focus-prod').classList.remove('focus-prod');
		i.classList.add('focus-prod');

		dataArr.forEach((i) => {
			if (i.product_id == btnProdId) {
				let buyCont = parent.querySelector('.product__buy-container');
				buyCont.setAttribute('href', i.href);
				let sizesCont = buyCont.querySelector(
					'.product__sizes-container'
				);
				let cardLink = parent.querySelector(
					'.product__card-sub-wrapper'
				);
				cardLink.setAttribute('href', i.href);
				dataId.setAttribute('data-id', i.product_id);
				let iconBag = parent.querySelector('._icon-bag');

				if (i.special !== false) {
					crossOutPrice.textContent = i.price;
					price.textContent = i.special;
					price.classList.add('old-price');
				} else {
					crossOutPrice.textContent = '';
					price.textContent = i.price;
					price.classList.remove('old-price');
				}

				if (sizesCont) {
					while (sizesCont.firstChild) {
						sizesCont.removeChild(sizesCont.firstChild);
					}

					i.sizes.forEach((i) => {
						if (i.stock_status_id == 2) {
							sizesCont.insertAdjacentHTML(
								'beforeend',
								`
                                <div class="product__sizes-item item-active" data-stock-status="${i.stock_status_id}">${i.size}</div>
                            `
							);
						} else if (i.stock_status_id == 3) {
							sizesCont.insertAdjacentHTML(
								'beforeend',
								`
                                <div class="product__sizes-item inform-card" data-stock-status="${i.stock_status_id}">${i.size}</div>
                            `
							);
						} else if (i.stock_status_id == 1) {
							sizesCont.insertAdjacentHTML(
								'beforeend',
								`
                                <div class="product__sizes-item" data-stock-status="${i.stock_status_id}">${i.size}</div>
                            `
							);
						}
					});
					document
						.querySelectorAll('[data-stock-status]')
						.forEach((i) => {
							i.removeEventListener(
								'click',
								stockStatusListener,
								false
							);
						});
					initStockStatus();
				} else if (iconBag) {
					i.sizes.forEach((i) => {
						iconBag.setAttribute(
							'data-stock-status',
							i.stock_status_id
						);
					});
				}

				let imgCont = parent.querySelector(
					'.product__card-sub-wrapper'
				);
				while (imgCont.firstChild) {
					imgCont.removeChild(imgCont.firstChild);
				}

				i.images.forEach((i) => {
					imgCont.insertAdjacentHTML(
						'afterbegin',
						`
                            <div class="product__card-img-cont swiper-slide">
                                <img class="slide-img" src="${i.href}">
                            </div>
                        `
					);
				});

				if (Array.isArray(productCardSwiper)) {
					productCardSwiper.map((i) => {
						i.update();
					});
				} else {
					productCardSwiper.update();
				}

				if (i.added_to_wishlist) {
					favorite.classList.remove('_icon-favorites');
					favorite.classList.add('_icon-favorites-fill');
				} else {
					favorite.classList.add('_icon-favorites');
					favorite.classList.remove('_icon-favorites-fill');
				}
			}
		});
	}

	let confirm = document.querySelector('.confirm__pre-order');
	if (confirm) {
		confirm.addEventListener('click', (e) => {
			let confirmItem = document.querySelector('[data-confirm]');
			let confirmId = confirmItem.getAttribute('data-confirm');
			let shopId = confirmItem.getAttribute('data-shop');
			let confirmSize = confirmItem.textContent;

			if (confirmSize == 'ONE') {
				addAjax(confirmId, shopId);
			} else {
				addAjax(confirmId, shopId, confirmSize);
			}

			shopAddAjax(shopId);
		});
	}

	//init editing
	function stepEdit() {
		let step = document.querySelectorAll('.step');

		if (step.length > 0) {
			step.forEach((i) => {
				i.addEventListener('click', (e) => {
					let value =
						i.parentNode.querySelector('.details-amount').value;
					let id = i.getAttribute('data-edit-id');

					if (
						i.classList.contains('stepUp') &&
						!i.classList.contains('disabled-item')
					) {
						editAjax(value, id, '+', i);
					}

					if (i.classList.contains('stepDown')) {
						editAjax(value, id, '-', i);
					}
				});
			});
		}
	}
	stepEdit();

	function editAjax(quantity, id, step, i) {
		let spinnerEl = i.parentNode.querySelector('.spinner-basket-container');

		let promo = '';
		let certificate = '';
		let magazineId = '';
		let pay = '';

		if (document.querySelector('.shopping__inform-promo')) {
			promo = document.querySelector('.shopping__inform-promo').value;
		}

		if (document.querySelector('.shopping__inform-certificate')) {
			certificate = document.querySelector(
				'.shopping__inform-certificate'
			).value;
		}

		if (orderPage) {
			magazineId =
				i.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute(
					'data-magazine-id'
				);
			pay = document.querySelector('#pay').value;
		}

		let data = {
			quantity: quantity,
			key: id,
			step: step,
			promo: promo,
			certificate: certificate,
			shop_id: magazineId,
			client_was_going_to_pay: pay,
		};

		$.ajax({
			url: 'index.php?route=checkout/cart/edit',
			type: 'post',
			data: data,
			dataType: 'json',
			beforeSend: function () {
				hiding(spinnerEl, 'flex');
			},
			success: function (data) {
				hiding(spinnerEl, 'none');
				if (data.is_max) {
					i.classList.add('disabled-item');
				} else {
					let stepUpBtn = i.parentNode.querySelector('.stepUp');
					stepUpBtn.classList.remove('disabled-item');

					if (orderPage) {
						setEditdata(data, i);
						setChecoutData(data);
						sendDroppedCartData(droppedCartData());
						initSaleCode(data);

						if (data.shipping_methods !== 'products not found!') {
							changeDeliveryMethods(data);
						}
					} else {
						setEditdata(data, i);
						setToBasketIcon(data.products_total_count);
					}
				}
			},
			error: function (err) {
				hiding(spinnerEl, 'none');
				throw new Error(err);
			},
		});
	}

	function setEditdata(data, i) {
		let basketTotalPrice = document.querySelector('.basket__count-price');

		if (data.value > 0) {
			let input = i.parentNode.querySelector('.details-amount');
			let itemTotalPrice =
				i.parentNode.parentNode.parentNode.querySelector(
					'.basket__info__price-cost'
				);

			input.value = data.value;
			basketTotalPrice.innerHTML = data.product_total_price;
			itemTotalPrice.innerHTML = data.product_total;
		} else {
			i.parentNode.parentNode.parentNode.parentNode.parentNode.remove();
			basketTotalPrice.innerHTML = data.product_total_price;
		}
		isEmpty();
	}

	//init deleting
	function removeInit() {
		let removeItem = document.querySelectorAll('[data-remove-id]');

		if (removeItem.length > 0) {
			removeItem.forEach((i) => {
				i.addEventListener('click', (e) => {
					if (orderPage) {
						confirmRemove(i);
					} else {
						removeAjax(i.getAttribute('data-remove-id'), i);
					}
				});
			});
		}
	}
	removeInit();

	function confirmRemove(i) {
		let confirm =
			i.parentNode.parentNode.parentNode.querySelector(
				'.confirm__basket'
			);
		confirm.style.display = 'flex';

		document.addEventListener('click', function (e) {
			let target = e.target;
			let itsSearch = target == confirm || confirm.contains(target);
			let itsBtn = target == i;
			let isActive = (confirm.style.display = 'flex');
			let no = target.classList.contains('confirm__basket-no');
			let yes = target.classList.contains('confirm__basket-yes');

			if ((!itsSearch && !itsBtn && isActive) || no || yes) {
				confirm.style.display = 'none';
			}
		});
	}

	if (orderPage) {
		document.querySelectorAll('.confirm__basket-yes').forEach((i) => {
			i.addEventListener('click', () => {
				let item =
					i.parentNode.parentNode.parentNode.querySelector(
						'[data-remove-id]'
					);
				let id = item.getAttribute('data-remove-id');
				removeAjax(id, item);
			});
		});
	}

	function removeAjax(id, i) {
		let promo = '';
		let certificate = '';
		let pay = '';

		if (orderPage) {
			pay = document.querySelector('#pay').value;
		}

		if (document.querySelector('.shopping__inform-promo')) {
			promo = document.querySelector('.shopping__inform-promo').value;
		}

		if (document.querySelector('.shopping__inform-certificate')) {
			certificate = document.querySelector(
				'.shopping__inform-certificate'
			).value;
		}

		data = {
			key: id,
			promo: promo,
			certificate: certificate,
			client_was_going_to_pay: pay,
		};

		$.ajax({
			url: 'index.php?route=checkout/cart/remove',
			type: 'post',
			data: data,
			dataType: 'json',
			success: function (data) {
				if (orderPage) {
					sendDroppedCartData(droppedCartData());
					i.parentNode.parentNode.parentNode.remove();
					i.parentNode.parentNode.parentNode.remove();
					let basketTotalPrice = document.querySelector(
						'.basket__count-price'
					);
					basketTotalPrice.innerHTML = data.product_total_price;
					initSaleCode(data);

					if (data.shipping_methods !== 'products not found!') {
						changeDeliveryMethods(data);
					}

					setChecoutData(data);
					isEmpty();
				} else {
					i.parentNode.parentNode.parentNode.remove();
					let basketTotalPrice = document.querySelector(
						'.basket__count-price'
					);
					basketTotalPrice.innerHTML = data.product_total_price;

					isEmpty();
					setToBasketIcon(data.products_total_count);
				}
			},
			error: function (err) {
				throw new Error(err);
			},
		});
	}

	function changeDeliveryMethods(data) {
		let methods = document.getElementById('orderMethod');
		let methodsArr = Object.values(data.shipping_methods);
		let methodsTrue = methodsArr.filter((i) => i.status === true);

		if (methods.options.length - 1 !== methodsTrue.length) {
			removeAllChildNodes(methods);

			methods.insertAdjacentHTML(
				'beforeend',
				`
                <option value=""></option>
            `
			);
			if (data.shipping_methods.flat.status === true) {
				methods.insertAdjacentHTML(
					'beforeend',
					`
                    <option value="flat">${data.shipping_methods.flat.name}</option>
                `
				);
			}
			if (data.shipping_methods.novaposhta.status === true) {
				methods.insertAdjacentHTML(
					'beforeend',
					`
                <option value="novaposhta">${data.shipping_methods.novaposhta.name}</option>
            `
				);
			}
			if (data.shipping_methods.ukposhta.status === true) {
				methods.insertAdjacentHTML(
					'beforeend',
					`
                <option value="ukposhta">${data.shipping_methods.ukposhta.name}</option>
            `
				);
			}
			if (data.shipping_methods.justin.status === true) {
				methods.insertAdjacentHTML(
					'beforeend',
					`
                <option value="justin">${data.shipping_methods.justin.name}</option>
            `
				);
			}
			$('.select__order-deliver').select2('destroy');
			$('.select__order-deliver').select2({
				minimumResultsForSearch: -1,
				width: '100%',
			});

			let shops = document.getElementById('shop');
			shops.querySelector('option:checked').removeAttribute('selected');

			let regions = document.getElementById('regions');
			removeAllChildNodes(regions);
			let cities = document.getElementById('cities');
			removeAllChildNodes(cities);
			let warehouses = document.getElementById('warehouses');
			removeAllChildNodes(warehouses);
			document.querySelector('.shop-method').style.display = 'none';
			document.querySelector('.other-method').style.display = 'none';
		}
	}
	////////? ordering switch
	let personalTitle = document.querySelectorAll('.personal__title');
	if (personalTitle.length > 0) {
		personalTitle.forEach((i) => {
			i.addEventListener('click', (e) => {
				if (!i.classList.contains('active-title')) {
					userOrderSwitch(i);
					i.classList.toggle('active-title');
				}
			});
		});
	}

	function userOrderSwitch(i) {
		let newUser = document.querySelector('.personal-new');
		let logedUser = document.querySelector('.personal-loged');

		let newWrapper = document.querySelector('.order__user-wrapper');
		let logedWrapper = document.querySelector('.login__user-wrapper');
		let deliveryWrapper = document.querySelector('.delivery__methods');

		if (i.classList.contains('personal-new')) {
			newWrapper.style.display = 'block';
			logedWrapper.style.display = 'none';
			deliveryWrapper.style.display = 'block';
			logedUser.classList.remove('active-title');
		} else if (i.classList.contains('personal-loged')) {
			newWrapper.style.display = 'none';
			logedWrapper.style.display = 'flex';
			deliveryWrapper.style.display = 'none';
			newUser.classList.remove('active-title');
		}
	}
	//fun for prevent def for a link size in catalog cards
	function initCatalogSizeContainers() {
		let prodContainers = document.querySelectorAll(
			'.product__buy-container'
		);
		if (
			window.matchMedia('(min-width: 640px)').matches &&
			prodContainers.length > 0
		) {
			prodContainers.forEach((i) => {
				i.addEventListener(
					'click',
					catalogSizeContainersListener,
					false
				);
			});
		}
	}
	initCatalogSizeContainers();

	function catalogSizeContainersListener(e) {
		i = this;
		let longSize = i.classList.contains('long-size');
		if (!longSize) {
			e.preventDefault();
		}
	}

	//! Confirm telephone in other pages
	// (function () {
	// 	let telephone = document.querySelector('.init-tel-js');
	// 	if (telephone) {
	// 		let modalLabel = document.querySelector('.personal__modal-label');
	// 		sessionStorage.setItem('initTelephone', false);
	// 		let confirmContainer = document.querySelector(
	// 			'.confirmation__container'
	// 		);
	// 		let confirmBtn = document.querySelector('.confirm-btn');
	// 		let confirmText = document.querySelector('.confirmed-text');
	// 		let confirmTitle = document.querySelector('.confirm-number-title');
	// 		let personalCodeBtn = document.querySelector(
	// 			'.personal__send-code'
	// 		);
	// 		let personalRefreshCode = document.querySelector(
	// 			'.personal__refresh-code'
	// 		);
	// 		let trueCode;
	// 		let userPhone;
	// 		let timeoutCode;

	// 		if (telephone.value !== '' && !telephone.value.includes('_')) {
	// 			sessionStorage.setItem('initTelephone', telephone.value);
	// 		}

	// 		telephone.addEventListener('keyup', keyupInit, false);

	// 		function keyupInit(e) {
	// 			//valid remove
	// 			if (e.keyCode != 13) {
	// 				telephone.nextElementSibling.classList.remove(
	// 					'error-label'
	// 				);
	// 				telephone.setCustomValidity('');
	// 				telephone.reportValidity();
	// 			}

	// 			let telephoneSubmit = document.querySelector('.init-tel-js');
	// 			let initTelephone = sessionStorage.getItem('initTelephone');

	// 			if (initTelephone == telephoneSubmit.value) {
	// 				confirmText.style.display = 'flex';
	// 				confirmBtn.style.display = 'none';
	// 				confirmContainer.classList.add('hight-container');
	// 			} else {
	// 				confirmText.style.display = 'none';
	// 				confirmBtn.style.display = 'block';
	// 				confirmContainer.classList.add('hight-container');
	// 			}
	// 		}

	// 		confirmBtn.addEventListener('click', sendNumberOtherConfirm, false);

	// 		function sendNumberOtherConfirm() {
	// 			if (telephone.value !== '' && !telephone.value.includes('_')) {
	// 				confirmBtn.disabled = true;
	// 				let number = telephone.value
	// 					.replace('(', '')
	// 					.replace(')', '');
	// 				confirmTitle.textContent = number;

	// 				userPhone = {
	// 					phone: number,
	// 				};

	// 				sendNumberAjax(userPhone);
	// 			} else {
	// 				telephone.focus();
	// 			}
	// 		}

	// 		telephone.addEventListener(
	// 			'focus',
	// 			sendReportValidityTimeout,
	// 			false
	// 		);

	// 		function sendReportValidityTimeout() {
	// 			let validityState = telephone.validity;
	// 			if (validityState.valueMissing) {
	// 				setTimeout(() => {
	// 					telephone.nextElementSibling.classList.add(
	// 						'error-label'
	// 					);
	// 					telephone.setCustomValidity(
	// 						telephone.getAttribute('data-valid-massadge')
	// 					);
	// 					telephone.reportValidity();
	// 				}, 100);
	// 			}
	// 		}

	// 		async function sendNumberAjax(userPhone) {
	// 			$.ajax({
	// 				url: `index.php?route=account/login/turboSmsGetCode`,
	// 				type: 'post',
	// 				data: userPhone,
	// 				dataType: 'json',
	// 				success: function (data) {
	// 					let personalArea = document.querySelector(
	// 						'.user-data-container'
	// 					);

	// 					if (personalArea && data.unique_phone !== true) {
	// 						telephone.setCustomValidity(data.unique_phone);
	// 						telephone.reportValidity();
	// 						confirmBtn.disabled = false;
	// 					} else if (
	// 						(!personalArea && data.send_sms === true) ||
	// 						(personalArea && data.unique_phone)
	// 					) {
	// 						$('#personalConfirm').modal();
	// 						confirmBtn.disabled = false;
	// 						trueCode = data.send_code;
	// 						userPhone = data.phone;

	// 						timeoutCode = setTimeout(
	// 							() =>
	// 								(personalRefreshCode.style.display =
	// 									'block'),
	// 							60000
	// 						);
	// 					}
	// 				},
	// 				error: function (err) {
	// 					confirmBtn.disabled = false;
	// 					throw new Error(err);
	// 				},
	// 			});
	// 		}

	// 		personalCodeBtn.addEventListener('click', (e) => {
	// 			sendCodeOtherConfirm();
	// 		});

	// 		function sendCodeOtherConfirm() {
	// 			let personalCode = document.querySelector(
	// 				'.personal__modal-code'
	// 			);

	// 			if (personalCode.value.length == 6) {
	// 				let data = {
	// 					sms_code: personalCode.value,
	// 					opencart_code: trueCode,
	// 					phone: userPhone,
	// 				};
	// 				sendCodeAjax(data);
	// 				personalCodeBtn.disabled = true;
	// 			}
	// 		}

	// 		async function sendCodeAjax(data) {
	// 			$.ajax({
	// 				url: `index.php?route=account/login/turboSmsCheckCode`,
	// 				type: 'post',
	// 				data: data,
	// 				dataType: 'json',
	// 				success: function (data) {
	// 					personalCodeBtn.disabled = false;

	// 					if (data.code_matching) {
	// 						successConfirm();
	// 					} else if (!data.code_matching && data.try_count <= 5) {
	// 						modalLabel.classList.add('error-label');
	// 						document
	// 							.querySelector('.personal__modal-code')
	// 							.classList.add('error-input');
	// 						setTimeout(() => {
	// 							modalLabel.remove('error-label');
	// 							document
	// 								.querySelector('.personal__modal-code')
	// 								.classList.remove('error-input');
	// 						}, 5000);
	// 						document.querySelector(
	// 							'.personal__error-number'
	// 						).style.display = 'block';
	// 						document.querySelector(
	// 							'.personal__error-number'
	// 						).textContent = data.code_error;
	// 					} else if (!data.code_matching && data.try_count > 5) {
	// 						modalLabel.classList.add('error-label');
	// 						document
	// 							.querySelector('.personal__modal-code')
	// 							.classList.add('error-input');
	// 						setTimeout(() => {
	// 							modalLabel.classList.remove('error-label');
	// 							document
	// 								.querySelector('.personal__modal-code')
	// 								.classList.remove('error-input');
	// 						}, 5000);

	// 						document.querySelector(
	// 							'.personal__error-number'
	// 						).style.display = 'block';

	// 						document.querySelector(
	// 							'.personal__error-number'
	// 						).textContent = data.code_error;

	// 						personalRefreshCode.style.display = 'block';
	// 						clearTimeout(timeoutCode);
	// 					}
	// 				},
	// 				error: function (err) {
	// 					personalCodeBtn.disabled = false;
	// 					modalLabel.classList.add('error-label');
	// 					document
	// 						.querySelector('.personal__modal-code')
	// 						.classList.add('error-input');
	// 					setTimeout(() => {
	// 						modalLabel.classList.remove('error-label');
	// 						document
	// 							.querySelector('.personal__modal-code')
	// 							.classList.remove('error-input');
	// 					}, 5000);
	// 					throw new Error(err);
	// 				},
	// 			});
	// 		}

	// 		function successConfirm() {
	// 			let telephone = document.querySelector('.init-tel-js');
	// 			sessionStorage.setItem('initTelephone', telephone.value);
	// 			clearingStateConfirm();
	// 			confirmBtn.style.display = 'none';
	// 			confirmText.style.display = 'flex';
	// 			$('#personalConfirm').modal('hide');
	// 		}

	// 		$('#personalConfirm').on('hidden.bs.modal', function (e) {
	// 			clearingStateConfirm();
	// 		});

	// 		function clearingStateConfirm() {
	// 			document.querySelector('.personal__modal-code').value = '';
	// 			document.querySelector(
	// 				'.personal__error-number'
	// 			).style.display = 'none';
	// 			confirmTitle.textContent = '';
	// 			clearTimeout(timeoutCode);
	// 			personalRefreshCode.style.display = 'none';
	// 			confirmBtn.disabled = false;
	// 			personalCodeBtn.disabled = false;
	// 		}

	// 		personalRefreshCode.addEventListener('click', (e) => {
	// 			let number = telephone.value.replace('(', '').replace(')', '');
	// 			confirmTitle.textContent = number;

	// 			userPhone = {
	// 				phone: number,
	// 			};

	// 			resetCodeAjax(userPhone);
	// 			setTimeout(() => sendNumberOtherConfirm(), 400);
	// 			clearingStateConfirm();
	// 			timeoutCode = setTimeout(
	// 				() => (personalRefreshCode.style.display = 'block'),
	// 				60000
	// 			);
	// 		});

	// 		async function resetCodeAjax(userPhone) {
	// 			$.ajax({
	// 				url: `index.php?route=account/login/turboSmsClearAttemps`,
	// 				type: 'post',
	// 				data: userPhone,
	// 				dataType: 'json',
	// 				success: function (data) {},
	// 				error: function (err) {
	// 					$('#personalConfirm').modal('hide');
	// 					throw new Error(err);
	// 				},
	// 			});
	// 		}
	// 	} else {
	// 		sessionStorage.removeItem('initTelephone');
	// 	}
	// })();
	//!Header scroll
	(function () {
		let head = document.querySelector('header');
		if (head) {
			window.oldScrollY = window.scrollY;
			document.onscroll = (e) => {
				let res = window.oldScrollY > window.scrollY ? 1 : 2;
				window.oldScrollY = window.scrollY;

				if (res == 2 && window.scrollY > 400) {
					head.style.transform = 'translateY(-100%)';
				} else if (res == 1) {
					head.style.transform = 'translateY(0)';
				}

				if (res == 2 && window.scrollY > 1500) {
					document.getElementById('topBtn').style.display = 'flex';
				} else {
					document.getElementById('topBtn').style.display = 'none';
				}
			};

			document.getElementById('topBtn').onclick = () => {
				window.scrollTo({
					top: 0,
					behavior: 'smooth',
				});
			};
		}
	})();

	//!header search
	(function () {
		let searchIcon = document.querySelector('.header-search');
		let searchWrap = document.querySelector('.header__search-wrapper');
		let searchInput = document.querySelector('.search-input');
		let searchForm = document.getElementById('searchForm');

		if (searchIcon) {
			searchForm.addEventListener('submit', function (e) {
				e.preventDefault();
				let url = 'index.php?route=product/search&search=';
				url += encodeURIComponent(searchInput.value);
				window.location = url;
			});

			async function getSearchRes() {
				let data = {
					filter_name: searchInput.value,
				};

				$.ajax({
					url: `index.php?route=common/search/autocomplete/`,
					type: 'post',
					data: data,
					dataType: 'json',
					success: function (data) {
						let container = document.querySelector(
							'.search__results-container'
						);
						removeAllChildNodes(container);

						data.map((i) => {
							container.insertAdjacentHTML(
								'beforeend',
								`<a href="${i.href}">${i.name}</a>`
							);
						});
					},
					error: function (err) {
						throw new Error(err);
					},
				});
			}

			function toggle() {
				searchIcon.classList.toggle('_icon-search');
				searchIcon.classList.toggle('_icon-cancel');
				searchIcon.classList.toggle('rotate-anim');
				searchWrap.classList.toggle('show-effect');
			}

			searchInput.addEventListener('input', function (e) {
				let searchLength = searchInput.value.length;

				if (searchLength >= 3) {
					getSearchRes();
				} else if (searchLength == 0 || searchInput.value == '') {
					let container = document.querySelector(
						'.search__results-container'
					);
					removeAllChildNodes(container);
				}
			});

			document.addEventListener('click', function (e) {
				let target = e.target;
				let itsSearch =
					target == searchWrap || searchWrap.contains(target);
				let itsBtn = target == searchIcon;
				let isActive = searchWrap.classList.contains('show-effect');

				if (!itsSearch && !itsBtn && isActive) {
					toggle();
				}
			});

			searchIcon.addEventListener('click', (e) => {
				toggle();
				searchInput.focus();
			});
		}
	})();

	//! auth
	(function () {
		let unknownUser = document.querySelector('.unknown-user');
		let authWrapper = document.querySelector('.auth__wrapper');
		let unknownMobile = document.querySelector(
			'.menu__mobile-unregistered'
		);
		let personalWrapper = document.querySelector('.personal__wrapper');
		let menuIcon = document.querySelector('.menu__icon');
		let menuModal = document.querySelector('.menu__mobile-modal');
		let checkoutAuth = document.querySelector('.auth__wrapper-checkout');
		let numberCont = document.querySelector('.number__container');
		let codeCont = document.querySelector('.auth__container');
		let resTel = document.querySelector('.auth__container-text');
		let refreshBtn = document.querySelector('.refresh-form');
		let codeInput;
		let userPhone;
		let trueCode;
		let refreshTimeout;
		//let refreshTimeoutModal;
		let numberInput;
		let location;
		let BGModal = document.querySelector('#custom-modal');
		let body = document.querySelector('body');

		//inform about size in shops
		let infoAvailability = document.querySelector('#infoAvailability');
		if (infoAvailability) {
			// let confirmTelBtn = document.querySelector(
			// 	'.modal__inform-inform-tel'
			// );
			// let sendCode = document.querySelector('.modal__send-code');
			let capcha = document.querySelector('.modal__inform-capcha');
			let modalSubmit = document.querySelector('.modal__inform');

			// document
			// 	.querySelector('.modal__back-number')
			// 	.addEventListener('click', (e) => {
			// 		getStartCondition();
			// 		clearTimeout(refreshTimeoutModal);
			// 		resetCode();
			// 	});

			// async function resetCode() {
			// 	$.ajax({
			// 		url: `index.php?route=account/login/turboSmsClearAttemps`,
			// 		type: 'post',
			// 		data: userPhone,
			// 		dataType: 'json',
			// 		success: function () {
			// 			document.querySelector('.modal__inform-code').value =
			// 				'';
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }

			// document
			// 	.querySelector('.modal__refresh-code')
			// 	.addEventListener('click', (e) => {
			// 		resetCode();
			// 		setTimeout(
			// 			() =>
			// 				sendNumber(
			// 					userPhone,
			// 					document.querySelector(
			// 						'.spinner-inform-continer'
			// 					)
			// 				),
			// 			400
			// 		);
			// 		clearTimeout(refreshTimeoutModal);
			// 		document.querySelector(
			// 			'.modal__refresh-code'
			// 		).style.display = 'none';
			// 		refreshTimeoutModal = setTimeout(
			// 			() =>
			// 				(document.querySelector(
			// 					'.modal__refresh-code'
			// 				).style.display = 'block'),
			// 			60000
			// 		);
			// 	});

			// let confirmTelInput = document.querySelector('#telephoneInform');

			// confirmTelInput.addEventListener('keyup', (e) => {
			// 	confirmTelInput.nextElementSibling.classList.remove(
			// 		'error-label'
			// 	);
			// 	confirmTelInput.setCustomValidity('');
			// 	confirmTelInput.reportValidity();
			// });

			// confirmTelBtn.addEventListener('click', (e) => {
			// 	let spinnerInform = document.querySelector(
			// 		'.spinner-inform-continer'
			// 	);
			// 	let hideEl = document.querySelector('.inform-tel');
			// 	let value = confirmTelInput.value;

			// 	if (
			// 		value !== '' &&
			// 		!value.includes('_') &&
			// 		capcha.value == ''
			// 	) {
			// 		let number = value.replace('(', '').replace(')', '');
			// 		userPhone = {
			// 			phone: number,
			// 		};
			// 		sendNumber(userPhone, spinnerInform);
			// 		confirmTelBtn.disabled = true;
			// 	} else {
			// 		confirmTelInput.nextElementSibling.classList.add(
			// 			'error-label'
			// 		);
			// 		confirmTelInput.setCustomValidity(
			// 			confirmTelInput.getAttribute('data-valid-massadge')
			// 		);
			// 		confirmTelInput.reportValidity();
			// 	}
			// });

			// sendCode.addEventListener('click', (e) => {
			// 	let modalCode = document.querySelector('.modal__inform-code');

			// 	if (modalCode.value.length == 6 && capcha.value == '') {
			// 		sendCode.setAttribute('disabled', true);
			// 		let data = {
			// 			sms_code: modalCode.value,
			// 			opencart_code: trueCode,
			// 			phone: userPhone,
			// 		};
			// 		sendModalCode(data);
			// 	}
			// });

			modalSubmit.addEventListener('submit', (e) => {
				e.preventDefault();

				if (capcha.value == '') {
					let name = document.querySelector(
						'.modal__inform-name'
					).value;
					// let tel = document.querySelector('#telephoneInform').value;
					// let id = document.querySelector(
					// 	'.modal__notification-radio:checked'
					// ).value;

					// let way;
					// if (id == 1) {
					// 	way = 'telephone';
					// } else {
					// 	way = 'sms';
					// }

					let product = document.querySelector(
						'.modal__inform-main-body'
					);
					let product_id = product
						.querySelector('.card__description-size')
						.getAttribute('data-confirm');
					let size = product.querySelector(
						'.card__description-size'
					).textContent;

					let data = {
						user_name: name,
						//user_telephone: tel,
						// method_information: way,
						// method_id: id,
						product_id: product_id,
						size: size,
					};

					sendStockStatusInform(data);
				}
			});

			$('#infoAvailability').on('hidden.bs.modal', function (e) {
				getStartCondition();
			});

			function getStartCondition() {
				document.querySelector(
					'.modal__inform-main-body'
				).style.display = 'block';
				document.querySelector(
					'.modal__inform-success-body'
				).style.display = 'none';

				// document.querySelector('.modal__inform-wrapper').style.display =
				// 	'none';
				// document.querySelector(
				// 	'.modal__notification-container'
				// ).style.display = 'none';
				// document.querySelector(
				// 	'.modal__inform-inform-tel'
				// ).style.display = 'block';
				// document.querySelector('.inform-name').style.display = 'none';
				// document.querySelector('.modal__inform-code').value = '';
				// document
				// 	.querySelector('.modal__send-code')
				// 	.removeAttribute('disabled');
				// document
				// 	.querySelector('.modal__inform-inform-tel')
				// 	.removeAttribute('disabled');
				// document
				// 	.querySelector('#telephoneInform')
				// 	.removeAttribute('readonly');
				// document.querySelector('#telephoneInform').value = '';
				document.querySelector('.modal__inform-name').value = '';
				document.querySelector('.modal__inform-email').value = '';
				// document
				// 	.querySelector('.modal__notification-submit')
				// 	.removeAttribute('disabled');
				// document.querySelector('.modal__error-number').style.display =
				// 	'none';
				// document.querySelector('.modal__refresh-code').style.display =
				// 	'none';
				// document.querySelector(
				// 	'.modal-availability-error'
				// ).style.display = 'none';

				// document.querySelector(
				// 	'.spinner-inform-continer'
				// ).style.display = 'none';
				// clearTimeout(refreshTimeoutModal);
			}

			function sendStockStatusInform(data) {
				$.ajax({
					url: `index.php?route=product/product/stockStatusReport`,
					type: 'post',
					data: data,
					dataType: 'json',
					beforeSend: function () {
						document.querySelector(
							'.spinner-inform-continer'
						).style.display = 'flex';
					},
					success: function (data) {
						document.querySelector(
							'.spinner-inform-continer'
						).style.display = 'none';
						document.querySelector(
							'.modal__inform-main-body'
						).style.display = 'none';
						document.querySelector(
							'.modal__inform-success-body'
						).style.display = 'flex';
					},
					error: function (thrownError) {
						document.querySelector(
							'.spinner-inform-continer'
						).style.display = 'none';
						document.querySelector(
							'.modal__inform-main-body'
						).style.display = 'none';
						document.querySelector(
							'.modal-availability-error'
						).style.display = 'block';
						throw new Error(thrownError);
					},
				});
			}
		}

		// async function sendModalCode(data) {
		// 	$.ajax({
		// 		url: `index.php?route=account/login/turboSmsCheckCode`,
		// 		type: 'post',
		// 		data: data,
		// 		dataType: 'json',
		// 		beforeSend: function () {
		// 			document.querySelector(
		// 				'.spinner-inform-continer'
		// 			).style.display = 'flex';
		// 		},
		// 		success: function (data) {
		// 			document.querySelector(
		// 				'.spinner-inform-continer'
		// 			).style.display = 'none';
		// 			if (data.code_matching) {
		// 				document.querySelector(
		// 					'.modal__inform-inform-tel'
		// 				).style.display = 'none';
		// 				document.querySelector(
		// 					'.modal__inform-wrapper'
		// 				).style.display = 'none';
		// 				document.querySelector(
		// 					'.modal__notification-container'
		// 				).style.display = 'block';
		// 				document.querySelector('.inform-name').style.display =
		// 					'flex';
		// 			} else if (!data.code_matching && data.try_count <= 5) {
		// 				document
		// 					.querySelector('.modal__send-code')
		// 					.removeAttribute('disabled');
		// 				document
		// 					.querySelector('.modal__inform-code')
		// 					.classList.add('error-input');
		// 				document
		// 					.querySelector('.modal__inform-code')
		// 					.nextElementSibling.classList.add('error-label');
		// 				setTimeout(() => {
		// 					document
		// 						.querySelector('.modal__inform-code')
		// 						.classList.remove('error-input'),
		// 						document
		// 							.querySelector('.modal__inform-code')
		// 							.nextElementSibling.classList.remove(
		// 								'error-label'
		// 							);
		// 				}, 5000);
		// 				document.querySelector(
		// 					'.modal__error-number'
		// 				).style.display = 'block';
		// 				document.querySelector(
		// 					'.modal__error-number'
		// 				).textContent = data.code_error;
		// 			} else if (!data.code_matching && data.try_count > 5) {
		// 				document
		// 					.querySelector('.modal__send-code')
		// 					.removeAttribute('disabled');
		// 				document
		// 					.querySelector('.modal__inform-code')
		// 					.classList.add('error-input');
		// 				document
		// 					.querySelector('.modal__inform-code')
		// 					.nextElementSibling.classList.add('error-label');
		// 				setTimeout(() => {
		// 					document
		// 						.querySelector('.modal__inform-code')
		// 						.classList.remove('error-input'),
		// 						document
		// 							.querySelector('.modal__inform-code')
		// 							.nextElementSibling.classList.remove(
		// 								'error-label'
		// 							);
		// 				}, 5000);
		// 				document.querySelector(
		// 					'.modal__error-number'
		// 				).style.display = 'block';
		// 				document.querySelector(
		// 					'.modal__error-number'
		// 				).textContent = data.code_error;

		// 				document.querySelector(
		// 					'.modal__refresh-code'
		// 				).style.display = 'block';
		// 			}
		// 		},
		// 		error: function (thrownError) {
		// 			document.querySelector(
		// 				'.spinner-inform-continer'
		// 			).style.display = 'none';
		// 			document
		// 				.querySelector('.modal__send-code')
		// 				.removeAttribute('disabled');
		// 			document
		// 				.querySelector('.modal__inform-code')
		// 				.classList.add('error-input');
		// 			document
		// 				.querySelector('.modal__inform-code')
		// 				.nextElementSibling.classList.add('error-label');
		// 			setTimeout(() => {
		// 				document
		// 					.querySelector('.modal__inform-code')
		// 					.classList.remove('error-input'),
		// 					document
		// 						.querySelector('.modal__inform-code')
		// 						.nextElementSibling.classList.remove(
		// 							'error-label'
		// 						);
		// 			}, 5000);
		// 			throw new Error(thrownError);
		// 		},
		// 	});
		// }

		if (unknownUser) {
			//!new
			document
				.querySelector('.to-registration')
				.addEventListener('click', (e) => {
					// if (getComputedStyle(authWrapper).display == 'none') {
					// 	personalWrapper.classList.toggle('show-effect');
					// 	BGModal.classList.toggle('show-modal'); //
					// 	body.classList.toggle('body-not-scroll');
					// 	initScrollBar();
					// } else {
					// 	authWrapper.classList.toggle('show-effect');
					// 	BGModal.classList.toggle('show-modal'); //
					// 	body.classList.toggle('body-not-scroll');
					// 	initScrollBar();
					// }
					personalWrapper.classList.add('show-effect');
					authWrapper.classList.remove('show-effect');
				});
			//form show
			unknownMobile.addEventListener('click', (e) => {
				if (getComputedStyle(authWrapper).display == 'none') {
					menuModal.classList.toggle('active-modal');
					//bodyModal.classList.toggle('active-modal');
					personalWrapper.classList.toggle('show-effect');
					BGModal.classList.toggle('show-modal'); //
				} else {
					menuModal.classList.toggle('active-modal');
					//bodyModal.classList.toggle('active-modal');
					authWrapper.classList.toggle('show-effect');
					BGModal.classList.toggle('show-modal'); //
				}
			});

			unknownUser.addEventListener('click', (e) => {
				if (getComputedStyle(authWrapper).display == 'none') {
					personalWrapper.classList.toggle('show-effect');
					BGModal.classList.toggle('show-modal'); //
					body.classList.toggle('body-not-scroll');
					initScrollBar();
				} else {
					authWrapper.classList.toggle('show-effect');
					BGModal.classList.toggle('show-modal'); //
					body.classList.toggle('body-not-scroll');
					initScrollBar();
				}
			});
		}

		if (unknownUser) {
			document.addEventListener('click', function (e) {
				if (getComputedStyle(authWrapper).display == 'none') {
					let target = e.target;
					let itsContainer =
						target == personalWrapper ||
						personalWrapper.contains(target);
					let itsBtn = target == unknownUser;
					let isActive =
						personalWrapper.classList.contains('show-effect');

					if (
						!itsContainer &&
						!itsBtn &&
						isActive &&
						!e.target.classList.contains(
							'menu__mobile-unregistered'
						)
					) {
						personalWrapper.classList.toggle('show-effect');
						BGModal.classList.toggle('show-modal'); //
						body.classList.toggle('body-not-scroll');
						initScrollBar();
					}
				} else {
					let target = e.target;
					let itsContainer =
						target == authWrapper || authWrapper.contains(target);
					let itsBtn = target == unknownUser;
					let isActive =
						authWrapper.classList.contains('show-effect');

					if (
						!itsContainer &&
						!itsBtn &&
						isActive &&
						!e.target.classList.contains(
							'menu__mobile-unregistered'
						)
					) {
						authWrapper.classList.toggle('show-effect');
						BGModal.classList.toggle('show-modal'); //
						body.classList.toggle('body-not-scroll');
						initScrollBar();
					}
				}
			});
		}

		if (unknownUser || checkoutAuth) {
			// //form submit
			// let numberForm = document.getElementById('numberForm');
			// numberInput = numberForm.getElementsByTagName('input');
			// let codeForm = document.getElementById('codeForm');
			// codeInput = codeForm.getElementsByTagName('input');
			// let spinner = document.querySelector('.spinner-number');
			// document
			// 	.querySelector('.back-number')
			// 	.addEventListener('click', (e) => {
			// 		numberCont.style.display = 'block';
			// 		codeCont.style.display = 'none';
			// 		document
			// 			.querySelector('.send-tel')
			// 			.removeAttribute('disabled');
			// 		document
			// 			.querySelector('.send-code-btn')
			// 			.removeAttribute('disabled');
			// 		clearTimeout(refreshTimeout);
			// 		refreshBtn.style.display = 'none';
			// 		document.querySelector('.code-error-block').textContent =
			// 			'';
			// 		if (checkoutAuth) {
			// 			document.querySelector(
			// 				'.auth__container-title-error'
			// 			).style.display = 'none';
			// 			codeInput[0].parentNode.style.display = 'flex';
			// 			codeInput[0].value = '';
			// 			numberInput[0].value = '';
			// 		}
			// 		resetCode();
			// 	});
			// refreshBtn.addEventListener('click', (e) => {
			// 	resetCode();
			// 	setTimeout(
			// 		() => sendNumber(userPhone, spinner, numberInput[0]),
			// 		400
			// 	);
			// 	clearTimeout(refreshTimeout);
			// 	refreshBtn.style.display = 'none';
			// 	refreshTimeout = setTimeout(
			// 		() => (refreshBtn.style.display = 'block'),
			// 		60000
			// 	);
			// });
			// numberInput[0].addEventListener('keyup', (e) => {
			// 	if (e.keyCode != 13) {
			// 		numberInput[0].setCustomValidity('');
			// 		numberInput[0].classList.remove('error-input');
			// 	}
			// });
			// function setCustomValidity() {
			// 	let numberValue = numberInput[0].value;
			// 	if (numberValue == '' || numberValue.includes('_')) {
			// 		numberInput[0].classList.add('error-input');
			// 		numberInput[0].setCustomValidity(
			// 			numberInput[0].getAttribute('data-valid-massadge')
			// 		);
			// 	}
			// }
			// let numberFormBtn = document.querySelector('.send-tel');
			// numberFormBtn.addEventListener('click', setCustomValidity, false);
			// numberForm.addEventListener('submit', function (e) {
			// 	e.preventDefault();
			// 	let numberValue = numberInput[0].value;
			// 	if (
			// 		numberValue !== '' &&
			// 		!numberValue.includes('_') &&
			// 		numberInput[1].value == ''
			// 	) {
			// 		let number = numberValue.replace('(', '').replace(')', '');
			// 		userPhone = {
			// 			phone: number,
			// 		};
			// 		document.querySelector('.send-tel').disabled = true;
			// 		sendNumber(userPhone, spinner, numberInput[0]);
			// 	}
			// });
			// codeForm.addEventListener('submit', function (e) {
			// 	e.preventDefault();
			// 	let codeValue = codeInput[0].value;
			// 	if (codeValue.length == 6 && codeInput[1].value == '') {
			// 		let data = {
			// 			sms_code: codeValue,
			// 			opencart_code: trueCode,
			// 			phone: userPhone,
			// 		};
			// 		sendCode(data);
			// 	}
			// });
		}

		// async function resetCode() {
		// 	$.ajax({
		// 		url: `index.php?route=account/login/turboSmsClearAttemps`,
		// 		type: 'post',
		// 		data: userPhone,
		// 		dataType: 'json',
		// 		success: function () {
		// 			codeInput[0].value = '';
		// 		},
		// 		error: function (err) {
		// 			throw new Error(err);
		// 		},
		// 	});
		// }

		// async function sendNumber(userPhone, spinner, hideEl = null) {
		// 	$.ajax({
		// 		url: `index.php?route=account/login/turboSmsGetCode`,
		// 		type: 'post',
		// 		data: userPhone,
		// 		dataType: 'json',
		// 		beforeSend: function () {
		// 			hiding(spinner, 'inline', hideEl);
		// 		},
		// 		success: function (data) {
		// 			if (data.send_sms === true && hideEl) {
		// 				numberCont.style.display = 'none';
		// 				codeCont.style.display = 'block';
		// 				resTel.textContent = `+${data.phone}`;
		// 				trueCode = data.send_code;
		// 				userPhone = data.phone;
		// 				location = data.location;

		// 				//show refresh btn after 60 sec.
		// 				refreshTimeout = setTimeout(
		// 					() => (refreshBtn.style.display = 'block'),
		// 					60000
		// 				);

		// 				hiding(hideEl, 'block', spinner);
		// 			} else if (data.send_sms === true && !hideEl) {
		// 				hiding(spinner, 'none', null);
		// 				let telephoneInform =
		// 					document.querySelector('#telephoneInform');
		// 				telephoneInform.setAttribute('readonly', true);
		// 				document.querySelector(
		// 					'.modal__inform-wrapper'
		// 				).style.display = 'block';

		// 				trueCode = data.send_code;
		// 				userPhone = data.phone;

		// 				refreshTimeoutModal = setTimeout(
		// 					() =>
		// 						(document.querySelector(
		// 							'.modal__refresh-code'
		// 						).style.display = 'block'),
		// 					60000
		// 				);
		// 			}
		// 		},
		// 		error: function (err) {
		// 			if (hideEl) {
		// 				hideEl.classList.add('error-input');
		// 				setTimeout(
		// 					() => hideEl.classList.remove('error-input'),
		// 					5000
		// 				);
		// 				document
		// 					.querySelector('.send-tel')
		// 					.removeAttribute('disabled');
		// 				hiding(hideEl, 'block', spinner);
		// 			} else if (!hideEl) {
		// 				document
		// 					.querySelector('.modal__inform-inform-tel')
		// 					.removeAttribute('disabled');
		// 				hiding(spinner, 'none', null);
		// 				let telephoneInform =
		// 					document.querySelector('#telephoneInform');
		// 				telephoneInform.classList.add('error-input');
		// 				setTimeout(
		// 					() =>
		// 						telephoneInform.classList.remove('error-input'),
		// 					5000
		// 				);
		// 			}
		// 			throw new Error(err);
		// 		},
		// 	});
		// }

		// async function sendCode(data) {
		// 	$.ajax({
		// 		url: `index.php?route=account/login/turboSmsCheckCode`,
		// 		type: 'post',
		// 		data: data,
		// 		dataType: 'json',
		// 		beforeSend: function () {
		// 			hiding(
		// 				document.querySelector('.spinner-code'),
		// 				'inline',
		// 				codeInput[0].parentNode
		// 			);
		// 			document.querySelector('.send-code-btn').disabled = true;
		// 		},
		// 		success: function (data) {
		// 			if (
		// 				data.code_matching === true &&
		// 				data.is_auth === false &&
		// 				unknownUser
		// 			) {
		// 				authWrapper.style.display = 'none';
		// 				personalWrapper.classList.toggle('show-effect');
		// 				document.getElementById('telephone').value =
		// 					data.telephone;
		// 				document.getElementById('codePerson').value = data.code;
		// 			} else if (
		// 				(data.code_matching === false && data.try_count <= 5) ||
		// 				(data.is_auth === true &&
		// 					data.code_matching === false &&
		// 					data.try_count <= 5)
		// 			) {
		// 				document
		// 					.querySelector('.send-code-btn')
		// 					.removeAttribute('disabled');
		// 				hiding(
		// 					codeInput[0].parentNode,
		// 					'flex',
		// 					document.querySelector('.spinner-code')
		// 				);
		// 				codeInput[0].classList.add('error-input');
		// 				codeInput[0].nextElementSibling.classList.add(
		// 					'error-label'
		// 				);
		// 				setTimeout(() => {
		// 					codeInput[0].classList.remove('error-input'),
		// 						codeInput[0].nextElementSibling.classList.remove(
		// 							'error-label'
		// 						);
		// 				}, 5000);
		// 				document.querySelector(
		// 					'.code-error-block'
		// 				).textContent = data.code_error;
		// 			} else if (
		// 				(data.code_matching === false && data.try_count > 5) ||
		// 				(data.is_auth === true &&
		// 					data.code_matching === false &&
		// 					data.try_count > 5)
		// 			) {
		// 				hiding(
		// 					codeInput[0].parentNode,
		// 					'flex',
		// 					document.querySelector('.spinner-code')
		// 				);
		// 				document
		// 					.querySelector('.send-code-btn')
		// 					.removeAttribute('disabled');
		// 				codeInput[0].classList.add('error-input');
		// 				codeInput[0].nextElementSibling.classList.add(
		// 					'error-label'
		// 				);
		// 				setTimeout(() => {
		// 					codeInput[0].classList.remove('error-input'),
		// 						codeInput[0].nextElementSibling.classList.remove(
		// 							'error-label'
		// 						);
		// 				}, 5000);
		// 				document.querySelector(
		// 					'.code-error-block'
		// 				).textContent = data.try_error;
		// 				refreshBtn.style.display = 'block';
		// 			} else if (
		// 				data.is_auth === true &&
		// 				data.code_matching === true
		// 			) {
		// 				document.querySelector('.location-login').value =
		// 					location;
		// 				document.getElementById('codeForm').submit();
		// 			} else if (data.is_auth === false && !unknownUser) {
		// 				hiding(
		// 					codeInput[0].parentNode,
		// 					'flex',
		// 					document.querySelector('.spinner-code')
		// 				);

		// 				hiding(
		// 					document.querySelector(
		// 						'.auth__container-title-error'
		// 					),
		// 					'block',
		// 					codeInput[0].parentNode
		// 				);
		// 				clearTimeout(refreshTimeout);
		// 				refreshBtn.style.display = 'none';
		// 				document.querySelector(
		// 					'.code-error-block'
		// 				).textContent = '';
		// 			}
		// 		},
		// 		error: function (err) {
		// 			hiding(
		// 				codeInput[0].parentNode,
		// 				'flex',
		// 				document.querySelector('.spinner-code')
		// 			);
		// 			document
		// 				.querySelector('.send-code-btn')
		// 				.removeAttribute('disabled');
		// 			codeInput[0].classList.add('error-input');
		// 			codeInput[0].nextElementSibling.classList.add(
		// 				'error-label'
		// 			);
		// 			setTimeout(() => {
		// 				codeInput[0].classList.remove('error-input'),
		// 					codeInput[0].nextElementSibling.classList.remove(
		// 						'error-label'
		// 					);
		// 			}, 5000);
		// 			throw new Error(err);
		// 		},
		// 	});
		// }

		if (unknownUser) {
			let personalForm = document.querySelector('#personal-data');
			personalForm.addEventListener('submit', function (e) {
				e.preventDefault();
				if (
					personalForm.querySelector('input[name="chekoutPersone"]')
						.value == ''
				) {
					// pixel
					FBCompleteRegistration();
					// pixel
					setTimeout(() => {
						personalForm.submit();
					}, 200);
				}
			});
		}

		//? mob menu
		if (menuIcon) {
			let backpacks = document.querySelector('.backpacks-js');
			let handbags = document.querySelector('.handbags-js');
			let accessories = document.querySelector('.accessories-js');
			let body = document.querySelector('body');
			let modalWr = document.querySelector('.menu__mobile-wrapper');

			menuIcon.addEventListener('click', (e) => {
				menuModal.classList.toggle('active-modal');
				//bodyModal.classList.toggle('active-modal');
				body.classList.toggle('body-not-scroll');
				initScrollBar();
			});

			document.addEventListener('click', function (e) {
				let trg = e.target;

				if (
					trg.classList.contains('active-modal') ||
					trg.classList.contains('menu__mobile-close')
				) {
					menuModal.classList.toggle('active-modal');
					//bodyModal.classList.toggle('active-modal');
					body.classList.toggle('body-not-scroll');
					initScrollBar();
				}

				if (
					trg.classList.contains('backpacks-js') ||
					trg.parentNode.classList.contains('backpacks-js')
				) {
					backpacks
						.querySelector('.menu__mob-sub-wrapper')
						.classList.toggle('show-effect');
				}

				if (
					trg.classList.contains('handbags-js') ||
					trg.parentNode.classList.contains('handbags-js')
				) {
					handbags
						.querySelector('.menu__mob-sub-wrapper')
						.classList.toggle('show-effect');
				}

				if (
					trg.classList.contains('accessories-js') ||
					trg.parentNode.classList.contains('accessories-js')
				) {
					accessories
						.querySelector('.menu__mob-sub-wrapper')
						.classList.toggle('show-effect');
				}

				if (trg.classList.contains('menu__mob-sub-title')) {
					trg.parentNode.classList.toggle('show-effect');
				}

				let showEff = modalWr.querySelector('.show-effect');

				if (showEff) {
					modalWr.classList.add('body-not-scroll');
				} else {
					modalWr.classList.remove('body-not-scroll');
				}
			});
		}
	})();
	//! SWIPERs
	(function () {
		//* nuot page modal slider
		let nuotModals = document.querySelectorAll('.nuot-modal-swiper');
		if (nuotModals.length > 0) {
			let sliders = [];
			nuotModals.forEach((i) => {
				let next = i.parentNode.querySelector(
					'.nuot-modal-swiper-next'
				);
				let prev = i.parentNode.querySelector(
					'.nuot-modal-swiper-prev'
				);
				let scrollbar = i.parentNode.querySelector(
					'.nuot-modal-scrollbar'
				);

				const nuotModalSwiper = new Swiper(i, {
					watchOverflow: true,
					spaceBetween: 20,
					slidesPerView: 2,
					navigation: {
						nextEl: next,
						prevEl: prev,
					},
					scrollbar: {
						el: scrollbar,
						draggable: true,
					},
					breakpoints: {
						1024: {
							watchOverflow: true,
							spaceBetween: 57,
							slidesPerView: 2,
							navigation: {
								nextEl: next,
								prevEl: prev,
							},
							scrollbar: {
								el: scrollbar,
								draggable: true,
							},
						},
						520: {
							watchOverflow: true,
							spaceBetween: 12,
							slidesPerView: 2,
							navigation: {
								nextEl: next,
								prevEl: prev,
							},
							scrollbar: {
								el: scrollbar,
								draggable: true,
							},
						},
					},
				});

				sliders.push(nuotModalSwiper);
			});

			let nuoItems = document.querySelectorAll('.gallery-nuo-item');
			nuoItems.forEach((i) => {
				i.addEventListener('click', (e) => {
					setTimeout(() => {
						if (Array.isArray(sliders)) {
							sliders.map((i) => {
								i.update();
							});
						} else {
							sliders.update();
						}
					}, 400);
				});
			});
		}
		//*new collection
		let newСollection = document.querySelector('.new-collection-slider');
		if (newСollection) {
			if (window.matchMedia('(max-width: 520px)').matches) {
				swiperInit();
			}

			function swiperInit() {
				const newCollectionSwiper = new Swiper(
					'.new-collection-slider',
					{
						pagination: {
							el: '.new-collection-pagination',
						},
						watchOverflow: true,
						breakpoints: {
							521: {
								slidesPerView: 3,
							},
						},
					}
				);
			}
		}
		//*sale
		let sale = document.querySelector('.sale__swiper');
		if (sale) {
			const saleSwiper = new Swiper('.sale__swiper', {
				breakpoints: {
					769: {
						navigation: {
							nextEl: '.sale-swiper-next',
							prevEl: '.sale-swiper-prev',
						},
						scrollbar: {
							el: '.sale-swiper-scrollbar',
							draggable: true,
						},
					},
				},
				watchOverflow: true,
				pagination: {
					el: '.sale-swiper-pagination',
					type: 'fraction',
				},
			});
		}
		//*blog
		let blog = document.querySelector('.blog__swiper');
		if (blog) {
			const blogSwiper = new Swiper('.blog__swiper', {
				breakpoints: {
					769: {
						spaceBetween: 20,
						navigation: {
							nextEl: '.blog-swiper-next',
							prevEl: '.blog-swiper-prev',
						},
						scrollbar: {
							el: '.blog-swiper-scrollbar',
							draggable: true,
						},
						slidesPerView: 2,
					},
					641: {
						slidesPerView: 2,
					},
				},
				watchOverflow: true,
				slidesPerView: 1,
				spaceBetween: 10,
				pagination: {
					el: '.blog-swiper-pagination',
					type: 'fraction',
				},
			});
		}
		//*slider-cards ang similar ???
		let newBlock = document.querySelector('.slider-cards__swiper');
		if (newBlock) {
			const newBlockSwiper = new Swiper('.slider-cards__swiper', {
				breakpoints: {
					1440: {
						slidesPerView: 4,
						navigation: {
							nextEl: '.slider-cards-swiper-next',
							prevEl: '.slider-cards-swiper-prev',
						},
						scrollbar: {
							el: '.slider-cards-swiper-scrollbar',
							draggable: true,
						},
					},
					1170: {
						slidesPerView: 3,
						navigation: {
							nextEl: '.slider-cards-swiper-next',
							prevEl: '.slider-cards-swiper-prev',
						},
						scrollbar: {
							el: '.slider-cards-swiper-scrollbar',
							draggable: true,
						},
					},
					769: {
						spaceBetween: 6,
						slidesPerView: 2,
						navigation: {
							nextEl: '.slider-cards-swiper-next',
							prevEl: '.slider-cards-swiper-prev',
						},
						scrollbar: {
							el: '.slider-cards-swiper-scrollbar',
							draggable: true,
						},
					},
				},
				watchOverflow: true,
				slidesPerView: 2,
				spaceBetween: 0,
				pagination: {
					el: '.slider-cards-swiper-pagination',
					type: 'fraction',
				},
			});
		}
		//*slider also-buy
		let also = document.querySelector('.also-buy__swiper');
		if (also) {
			const alsoBlockSwiper = new Swiper('.also-buy__swiper', {
				breakpoints: {
					1440: {
						slidesPerView: 4,
						navigation: {
							nextEl: '.also-buy-swiper-next',
							prevEl: '.also-buy-swiper-prev',
						},
						scrollbar: {
							el: '.also-buy-swiper-scrollbar',
							draggable: true,
						},
					},
					1170: {
						slidesPerView: 3,
						navigation: {
							nextEl: '.also-buy-swiper-next',
							prevEl: '.also-buy-swiper-prev',
						},
						scrollbar: {
							el: '.also-buy-swiper-scrollbar',
							draggable: true,
						},
					},
					769: {
						spaceBetween: 6,
						slidesPerView: 2,
						navigation: {
							nextEl: '.also-buy-swiper-next',
							prevEl: '.also-buy-swiper-prev',
						},
						scrollbar: {
							el: '.also-buy-swiper-scrollbar',
							draggable: true,
						},
					},
				},
				watchOverflow: true,
				slidesPerView: 2,
				spaceBetween: 0,
				pagination: {
					el: '.also-buy-swiper-pagination',
					type: 'fraction',
				},
			});
		}
		//*slider recently
		let recently = document.querySelector('.recently-watched__swiper');
		if (recently) {
			const recentlyBlockSwiper = new Swiper(
				'.recently-watched__swiper',
				{
					breakpoints: {
						1440: {
							slidesPerView: 4,
							navigation: {
								nextEl: '.recently-swiper-next',
								prevEl: '.recently-swiper-prev',
							},
							pagination: {
								el: '.recently-swiper-pagination',
								type: 'fraction',
							},
							scrollbar: {
								el: '.recently-swiper-scrollbar',
								draggable: true,
							},
						},
						1170: {
							slidesPerView: 3,
							navigation: {
								nextEl: '.recently-swiper-next',
								prevEl: '.recently-swiper-prev',
							},
							pagination: {
								el: '.recently-swiper-pagination',
								type: 'fraction',
							},
							scrollbar: {
								el: '.recently-swiper-scrollbar',
								draggable: true,
							},
						},
						769: {
							spaceBetween: 6,
							slidesPerView: 2,
							navigation: {
								nextEl: '.recently-swiper-next',
								prevEl: '.recently-swiper-prev',
							},
							scrollbar: {
								el: '.recently-swiper-scrollbar',
								draggable: true,
							},
						},
					},
					watchOverflow: true,
					slidesPerView: 2,
					spaceBetween: 0,
					pagination: {
						el: '.recently-swiper-pagination',
						type: 'fraction',
					},
				}
			);
		}
		//*slider product card
		let product = document.querySelector('.product-swiper ');
		if (product && window.matchMedia('(max-width: 1024px)').matches) {
			const productSwiper = new Swiper('.product-swiper', {
				breakpoints: {
					769: {
						watchOverflow: true,
						spaceBetween: 5,
						slidesPerView: 2,
					},
				},
				slidesPerView: 1,
				pagination: {
					el: '.product-slider-pagination',
					type: 'bullets',
				},
			});
		}

		//*contacts
		let contacts = document.querySelector('.contacts-swiper');
		if (contacts) {
			const contactsSwiper = new Swiper('.contacts-swiper', {
				breakpoints: {
					769: {
						slidesPerView: 2,
						spaceBetween: 120,
					},
				},
				watchOverflow: true,
				slidesPerView: 'auto',
				spaceBetween: 20,
				navigation: {
					nextEl: '.contacts-swiper-next',
					prevEl: '.contacts-swiper-prev',
				},
				pagination: {
					el: '.contacts-swiper-pagination',
					type: 'fraction',
				},
				scrollbar: {
					el: '.contacts-swiper-scrollbar',
					draggable: true,
				},
			});
		}
	})();

	//! review
	(function () {
		//open reviewer form
		let reviewListener = document.querySelector('.add-review-listener');
		if (reviewListener) {
			let reviewCont = document.querySelector('.review__continer');

			reviewListener.addEventListener('click', (e) => {
				reviewCont.classList.toggle('show-container');
				reviewListener
					.querySelector('._icon-cancel')
					.classList.toggle('rotate');
			});

			let reviewForm = document.querySelector('.review-form');
			if (reviewForm) {
				reviewForm.addEventListener('submit', (e) => {
					e.preventDefault();
					let textInput = reviewForm.querySelector('#reviewer');
					let nameInput = reviewForm.querySelector('#reviewerName');
					let email = reviewForm.querySelector('input[type="email"]');
					let raitingInput =
						reviewForm.querySelector('input:checked');
					let raitingErr = document.querySelector(
						'.review__errors-raiting'
					);
					let otherErr = document.querySelector(
						'.review__errors-other'
					);
					let success = document.querySelector('.review-success');
					let product = document.querySelector('.buy__container');
					let productId = product.getAttribute('data-id');
					let reviewBtn = document.querySelector('.review-btn');

					if (nameInput.value == '') {
						showError(otherErr);
					} else if (!raitingInput) {
						showError(raitingErr);
					} else {
						reviewBtn.disabled = true;

						let data = {
							name: nameInput.value,
							email: email.value,
							text: textInput.value,
							rating: raitingInput.value,
						};

						$.ajax({
							url: `index.php?route=product/product/write&product_id=${productId}`,
							type: 'post',
							data: data,
							dataType: 'json',
							success: function (data) {
								nameInput.value = '';
								email.value = '';
								textInput.value = '';
								raitingInput.checked = false;
								reviewBtn.disabled = false;
								reviewForm.style.display = 'none';
								success.style.display = 'block';
							},
							error: function (err) {
								nameInput.classList.add('error-input');
								email.classList.add('error-input');
								textInput.classList.add('error-input');
								reviewBtn.disabled = false;

								setTimeout(() => {
									nameInput.classList.remove('error-input');
									email.classList.remove('error-input');
									textInput.classList.remove('error-input');
								}, 5000);
								throw new Error(err);
							},
						});
					}
				});

				function showError(item) {
					item.style.display = 'block';
					setTimeout(() => {
						item.style.display = 'none';
					}, 4000);
				}
			}
		}
		//reviewer show more...
		let reviewerMore = document.querySelectorAll('.reviewer-more');
		if (reviewerMore.length > 0) {
			let ratingLink = document.querySelector(
				'.card__description__rating-link'
			);
			ratingLink.addEventListener('click', (e) => {
				setTimeout(() => {
					reviewerMore.forEach((i) => {
						let previous = i.previousElementSibling;
						if (previous.clientHeight === 64) {
							i.style.display = 'block';
						}

						i.addEventListener('click', (e) => {
							initAction();
						});

						previous.addEventListener('click', (e) => {
							initAction();
						});

						function initAction() {
							if (previous.clientHeight === 64) {
								previous.style.maxHeight = '350px';
								i.style.color = '#EEEAE7';
							} else {
								previous.style.maxHeight = '64px';
								i.style.color = '#555555';
							}
						}
					});
				}, 400);
			});
		}
	})();

	//! other change
	(function () {
		// hide production btn in home page
		let productionText = document.querySelector('.short-description__text');
		if (productionText) {
			let contentLength = productionText.textContent.trim().length;

			if (contentLength == 0) {
				productionText.nextElementSibling.style.display = 'none';
			}
		}
		// hide header/footer on 404 page
		let notFoundPage = document.querySelector('.not-found-wrapper');
		if (notFoundPage) {
			let header = document.querySelector('header');
			if (header) {
				header.style.display = 'none';
			}

			let footer = document.querySelector('footer');
			if (footer) {
				footer.style.display = 'none';
			}
		}
		//init input type date
		let datePickerPage = document.getElementById('user-date_of_birth');
		let datePickerModal = document.getElementById('date_of_birth');

		if (datePickerPage) {
			pick(datePickerPage);
		} else if (datePickerModal) {
			pick(datePickerModal);
		}

		function pick(el) {
			let dateArr = new Date().toISOString().split('T')[0].split('-');
			let year = dateArr[0];
			let validBday = `${parseInt(year) - 16}-${dateArr[1]}-${
				dateArr[2]
			}`;
			let validBdayObj = new Date(
				parseInt(year) - 16,
				dateArr[1],
				dateArr[2]
			);

			if (el.type != 'date') {
				try {
					if (el.value !== '') el.setAttribute('readonly', 'true');
					let startDate =
						el.value === '' ? validBdayObj : new Date(el.value);
					let dateSelected =
						el.value === '' ? false : new Date(el.value);

					datepicker(el, {
						maxDate: validBdayObj,
						startDate: startDate,
						dateSelected: dateSelected,
						showAllDates: true,
						overlayButton: 'Select',
						formatter: (input, date, instance) => {
							const newDate = new Date(date);
							const year = newDate.getFullYear();
							const month =
								parseInt(newDate.getMonth() + 1) >= 10
									? newDate.getMonth() + 1
									: `0${newDate.getMonth() + 1}`;
							const day =
								parseInt(newDate.getDate()) >= 10
									? newDate.getDate()
									: `0${newDate.getDate()}`;
							const value = `${year}-${month}-${day}`;
							input.value = value;
							el.setAttribute('readonly', 'true');
						},
					});
				} catch (err) {
					console.error(err);
				}
			}
			return (el.max = validBday);
		}
		// contacts form
		let mailingForm = document.getElementById('mailingForm');
		if (mailingForm) {
			//только буквы
			let inputWords = document.querySelectorAll('.input-words');
			inputWords.forEach((i) => {
				i.addEventListener('input', (e) => {
					i.value = i.value.replace(/[^a-zа-яёії\s]/gi, '');
				});
			});

			let name = document.getElementById('mailing-firstname');
			let text = document.getElementById('mailing-text');
			let email = document.getElementById('mailing-email');

			let spinnerContainer = document.querySelector(
				'.spinner-contacts-container'
			);
			let spinner = document.querySelector('.spinner-contacts');
			let error = document.querySelector('.error-mail');
			let success = document.querySelector('.success-mail');

			mailingForm.addEventListener('submit', (e) => {
				e.preventDefault();
				let mailingCapcha = document.getElementById('mailingCapcha');

				if (mailingCapcha.value == '') {
					setDataForm(getFormData());
				}
			});

			function getFormData() {
				return {
					name: name.value,
					text: text.value,
					email: email.value,
				};
			}

			function setDataForm(data) {
				spinnerContainer.style.display = 'flex';
				spinner.style.display = 'block';

				$.ajax({
					url: 'index.php?route=information/information/sendEmail',
					type: 'post',
					dataType: 'json',
					data: data,
					success: function (json) {
						setTimeout(() => setDefault(), 3000);
						spinner.style.display = 'none';
						success.style.display = 'block';
					},
					error: function (err) {
						setTimeout(() => setDefault(), 3000);
						spinner.style.display = 'none';
						error.style.display = 'block';
						throw new Error(err);
					},
				});
			}

			function setDefault() {
				name.value = '';
				telephone.value = '';
				text.value = '';
				email.value = '';
				spinnerContainer.style.display = 'none';
				spinner.style.display = 'none';
				error.style.display = 'none';
				success.style.display = 'none';
			}
		}
		//FAQ page
		let questionTitle = document.querySelectorAll(
			'.question-item__title__container'
		);

		if (questionTitle.length > 0) {
			questionTitle.forEach((i) => {
				i.addEventListener('click', () => {
					let content = i.nextElementSibling;
					let icon = i.querySelector('._icon-cancel');

					if (!content.classList.contains('show')) {
						icon.classList.add('scale-icon');
					} else {
						icon.classList.remove('scale-icon');
					}

					$(content).collapse('toggle');
				});
			});
		}

		//instruction
		let instruction = document.querySelectorAll('.instruction-btn');
		if (instruction.length > 0) {
			let modal = document.getElementById('instructionModal');

			$(modal).on('hidden.bs.modal', function (e) {
				modal
					.querySelector('.show-container')
					.classList.toggle('show-container');
			});

			instruction.forEach((i) => {
				i.addEventListener('click', () => {
					$(modal).modal('toggle');
					let dataInfo = i.getAttribute('data-info');
					let isItem = modal.querySelector(
						`[data-info="${dataInfo}"]`
					);

					isItem.classList.toggle('show-container');
				});
			});
		}
		//blog
		let hashtagFilters = document.querySelectorAll('.hashtag-filter');
		if (hashtagFilters) {
			hashtagFilters.forEach((i) => {
				i.addEventListener('click', (e) => {
					let hashtag = i.getAttribute('data-hashtag');
					setHashtag(hashtag);
				});
			});
		}

		function setHashtag(hashtag) {
			let data = {
				hashtag: hashtag,
			};
			$.ajax({
				url: 'index.php?route=blog/blog/addHashtags',
				type: 'post',
				dataType: 'json',
				data: data,
				success: function (json) {
					location.href = 'index.php?route=blog/blog';
				},
				error: function (err) {
					throw new Error(err);
				},
			});
		}
		// filters
		let filters = document.querySelector('.filters');
		if (filters) {
			let filtersContainerBtn = document.querySelector(
				'.init-container-btn'
			);
			let closeFilters = document.querySelector('.close-filters');
			let closeFilterMobile = document.querySelector(
				'.filter-title-close'
			);

			closeFilterMobile.addEventListener('click', () => {
				filters.classList.toggle('show-effect');
				addFilterStyles();
			});

			closeFilters.addEventListener('click', () => {
				filters.classList.toggle('show-effect');
				addFilterStyles();
			});

			function addFilterStyles() {
				let noUiHandle = document.querySelectorAll('.noUi-handle');

				if (
					window.matchMedia('(max-width: 1110px)').matches &&
					filters.classList.contains('show-effect')
				) {
					document.querySelector('body').style.overflow = 'hidden';
				} else {
					document.querySelector('body').style.overflow = 'auto';
				}

				if (filters.classList.contains('show-effect')) {
					setTimeout(() => {
						filters.style.boxShadow =
							'0 1px 4px -1px rgba(0, 0, 0, 0.75)';
						noUiHandle.forEach((i) => {
							i.style.border = '1px solid #30313229';
							i.style.borderRadius = '50%';
						});
					}, 100);
				} else {
					filters.style.boxShadow = 'none';
					noUiHandle.forEach((i) => {
						i.style.border = 'none';
						i.style.borderRadius = '0';
					});
				}
			}

			filtersContainerBtn.addEventListener('click', () => {
				filters.classList.toggle('show-effect');
				addFilterStyles();
			});

			let currentSelect;
			if (window.matchMedia('(min-width: 1110px)').matches) {
				window.addEventListener(
					'resize',
					function (e) {
						initSelect();
					},
					true
				);
			}

			function initSelect() {
				currentSelect = $('.filters-select2').select2({
					closeOnSelect: false,
					dropdownCssClass: 'filters-dropdown',
					language: {
						noResults: function () {
							return '...';
						},
					},
					width: '100%',
					allowHtml: true,
					allowClear: true,
				});

				currentSelect.each(function () {
					loadSelectCount($(this));

					$(this).on('change', function () {
						$(this)
							.next()
							.find('.select2-selection__choice__remove')
							.remove();
						$(this)
							.next()
							.find('.select2-selection__clear')
							.text('')
							.addClass('_icon-cancel');
						let count = $(this)
							.next()
							.find('.select2-selection__choice').length;
						let localText = $(this).attr('data-text');

						if (count > 1) {
							$(this)
								.next()
								.find('.select2-selection__choice')
								.remove();
							$(this)
								.next()
								.find('.select2-selection__rendered')
								.append(
									`<li class="select2-selection__choice">${localText}: ${count}</li>`
								);
						}

						if (count > 0) {
							$(this)
								.next()
								.find('.select2-search--inline')
								.css('display', 'none');
						} else {
							$(this)
								.next()
								.find('.select2-search--inline')
								.css('display', 'inline-block');
						}
					});
				});
			}

			initSelect();

			function loadSelectCount(thiz) {
				thiz.next().find('.select2-selection__choice__remove').remove();
				thiz.next()
					.find('.select2-selection__clear')
					.text('')
					.addClass('_icon-cancel');
				let count = thiz
					.next()
					.find('.select2-selection__choice').length;
				let localText = thiz.attr('data-text');

				if (count > 1) {
					thiz.next().find('.select2-selection__choice').remove();
					thiz.next()
						.find('.select2-selection__rendered')
						.append(
							`<li class="select2-selection__choice">${localText}: ${count}</li>`
						);
				}

				if (count > 0) {
					thiz.next()
						.find('.select2-search--inline')
						.css('display', 'none');
				}
			}

			if (window.matchMedia('(max-width: 1110px)').matches) {
				let filterSizeBtn = document.querySelector('.filter-size-js');
				let filterParamsBtn =
					document.querySelector('.filter-params-js');
				let filterPriceBtn = document.querySelector('.filter-price-js');
				let filterRegulateBtn = document.querySelector(
					'.filter-regulate-js'
				);

				let filterSize = document.getElementById('filterSize');
				let filterPrice = document.getElementById('filterPrice');
				let filterParams = document.getElementById('filterParams');
				let filterRegulate = document.getElementById('filterRegulate');

				if (filterParams) {
					filterParams.classList.add('collapse');

					filterParamsBtn.addEventListener('click', () => {
						$('#filterParams').collapse('toggle');
						let icon = filterParamsBtn.querySelector('.icon');
						icon.classList.toggle('rotate270');
					});
				}

				filterSize.classList.add('collapse');
				filterPrice.classList.add('collapse');
				filterRegulate.classList.add('collapse');

				filterSizeBtn.addEventListener('click', () => {
					$('#filterSize').collapse('toggle');
					let icon = filterSizeBtn.querySelector('.icon');
					icon.classList.toggle('rotate270');
				});

				filterPriceBtn.addEventListener('click', () => {
					$('#filterPrice').collapse('toggle');
					let icon = filterPriceBtn.querySelector('.icon');
					icon.classList.toggle('rotate270');
				});

				filterRegulateBtn.addEventListener('click', () => {
					$('#filterRegulate').collapse('toggle');
					let icon = filterRegulateBtn.querySelector('.icon');
					icon.classList.toggle('rotate270');
				});
			}

			let html5Slider = document.getElementById('noUiSliderRange');
			let inputMin = document.getElementById('inputMin');
			let inputMax = document.getElementById('inputMax');
			let inputMinСhose = inputMin.getAttribute('data-chose');
			let inputMaxСhose = inputMax.getAttribute('data-chose');

			noUiSlider.create(html5Slider, {
				start: [Number(inputMinСhose), Number(inputMaxСhose)],
				step: 100,
				connect: true,
				range: {
					min: Number(inputMin.value),
					max: Number(inputMax.value),
				},
			});

			html5Slider.noUiSlider.on('update', function (values, handle) {
				let value = values[handle];

				if (handle) {
					inputMax.value = Number(value);
				} else {
					inputMin.value = Number(value);
				}
			});

			//!get filters
			function getFilters(filtersForm) {
				let filterParams = document.getElementById('filterParams');
				let filterSize = document.getElementById('filterSize');

				let allParamsArr = [];
				if (filterParams) {
					let allParams = document.getElementById('allFilters');
					allParams.value = allParamsArr;
					let filters =
						filterParams.querySelectorAll('option:checked');

					if (filters.length > 0) {
						filters.forEach((i) => {
							allParamsArr.push(i.value);
						});
						allParams.value = allParamsArr;
					}
				}

				let allSizesArr = [];
				let allSizes = document.getElementById('allSizes');
				allSizes.value = allSizesArr;
				let size = filterSize.querySelectorAll('option:checked');

				if (size.length > 0) {
					size.forEach((i) => {
						allSizesArr.push(i.value);
					});
					allSizes.value = allSizesArr;
				}

				let min = filtersForm.querySelector('#inputMin');
				let max = filtersForm.querySelector('#inputMax');
				let defaultMin = min.getAttribute('data-min');
				let defaultMax = max.getAttribute('data-max');
				let regulate = filtersForm.querySelector(
					'input[name="regulate"]:checked'
				).value;

				if (
					Number(min.value) !== Number(defaultMin) ||
					Number(max.value) !== Number(defaultMax)
				) {
					return {
						path: filtersForm.getAttribute('data-path'),
						route: filtersForm.getAttribute('data-route'),
						all_sizes: allSizesArr,
						all_filters: allParamsArr,
						price_min: min.value,
						price_max: max.value,
						regulate: regulate,
						search: filtersForm.getAttribute('data-search'),
					};
				}

				return {
					path: filtersForm.getAttribute('data-path'),
					route: filtersForm.getAttribute('data-route'),
					all_sizes: allSizesArr,
					all_filters: allParamsArr,
					regulate: regulate,
					search: filtersForm.getAttribute('data-search'),
				};
			}

			let filtersForm = document.getElementById('filtersForm');
			if (filtersForm) {
				filtersForm.addEventListener('submit', (e) => {
					e.preventDefault();
					sendFilters(getFilters(filtersForm));
				});
			}
		}

		function sendFilters(data) {
			$.ajax({
				url: 'index.php?route=seo/set/parameters',
				dataType: 'json',
				type: 'post',
				data: data,
				success: function (data) {
					window.location = data.href;
				},
				error: function (err) {
					throw new Error(err);
				},
			});
		}

		//new pagination
		let paginationBlock = document.querySelector('.catalog-pagination');
		if (paginationBlock) {
			const callbackFunction = (entries) => {
				const [entry] = entries;
				if (entry.isIntersecting) {
					preGetNewCards(entry.target);
				}
			};

			const options = {
				root: null,
				rootMargin: '0px',
				threshold: 0.1,
			};

			const observer = new IntersectionObserver(
				callbackFunction,
				options
			);

			let cards = paginationBlock.querySelectorAll(
				'.product__card-container-item'
			);

			if (cards.length >= 20) {
				let footer = document.querySelector('footer');
				observer.observe(footer);
			}

			let pageNumber = 1;

			function preGetNewCards(targetEl) {
				let page = '&page=';
				if (!window.location.pathname.includes('index')) {
					page = '?page=';
				}
				let loader = document.querySelector('.pagination-loader');

				if (document.querySelector('[data-search]')) {
					return getNewCardsSearchPage(targetEl, loader);
				}
				return getNewCards(targetEl, page, loader);
			}

			function getNewCards(targetEl, page, loader) {
				$.ajax({
					url: `${window.location.href}${page}${
						parseInt(pageNumber) + 1
					}`,
					type: 'get',
					beforeSend: function () {
						loader.style.display = 'flex';
						observer.unobserve(targetEl);
					},
					success: function (data) {
						if (
							parseInt(pageNumber) === parseInt(data.paginate.max)
						) {
							loader.style.display = 'none';
						} else {
							drawNewCards(data, targetEl, loader);
						}
					},
					error: function (err) {
						loader.style.display = 'none';
						throw new Error(err);
					},
				});
			}

			function getNewCardsSearchPage(targetEl, loader) {
				$.ajax({
					url: `${window.location.href}`,
					type: 'post',
					dataType: 'json',
					data: { page: parseInt(pageNumber) + 1 },
					beforeSend: function () {
						loader.style.display = 'flex';
						observer.unobserve(targetEl);
					},
					success: function (data) {
						if (
							parseInt(pageNumber) === parseInt(data.paginate.max)
						) {
							loader.style.display = 'none';
						} else {
							drawNewCards(data, targetEl, loader);
						}
					},
					error: function (err) {
						loader.style.display = 'none';
						throw new Error(err);
					},
				});
			}

			function drawNewCards(data, targetEl, loader) {
				loader.style.display = 'none';
				pageNumber = parseInt(data.paginate.page);
				paginationBlock.insertAdjacentHTML(
					'beforeend',
					data.paginate.products
				);
				initFavorites();
				initStockStatus();
				initCatalogSizeContainers();

				productCardSwiper = new Swiper('.product-card-swiper', {
					watchOverflow: true,
					slidesPerView: 1,
					navigation: {
						nextEl: '.product-card-swiper-next',
						prevEl: '.product-card-swiper-prev',
					},
				});

				getAllSubProducts();

				if (
					parseInt(data.paginate.page) !== parseInt(data.paginate.max)
				) {
					return observer.observe(targetEl);
				}
			}
		}

		// personal page collapse TTH
		let orderCollapse = document.querySelectorAll('.order-collapse');
		if (orderCollapse.length > 0) {
			orderCollapse.forEach((i) => {
				i.addEventListener('click', (e) => {
					let container = i.nextElementSibling;
					$(container).collapse('toggle');
					let icon = i.querySelector('.icon');
					icon.classList.toggle('rotate270');
				});
			});
		}
		//personal
		let userContainer = document.querySelector('.user-data-container');
		if (userContainer) {
			//? validate inputs
			//? Только буквы английского и русского алфавита в поле input
			let inputWords = document.querySelectorAll('.input-words');
			inputWords.forEach((i) => {
				i.addEventListener('input', (e) => {
					i.value = i.value.replace(/[^a-zа-яёії\s]/gi, '');
				});
			});

			//form submit
			document
				.querySelector('#user-data')
				.addEventListener('submit', (e) => {
					e.preventDefault();
					let capcha = document.querySelector('.user-persone-capcha');
					if (capcha.value == '') {
						sendPersonData(getValidData());
					}
				});

			function getValidData() {
				let lastname = document.getElementById('user-lastname');
				let firstname = document.getElementById('user-firstname');
				let email = document.getElementById('user-email');
				let date = document.getElementById('user-date_of_birth');
				let gender = document.getElementById('user-gender');

				return {
					lastname: lastname.value,
					firstname: firstname.value,
					email: email.value,
					date_of_birth: date.value,
					gender: gender.value,
				};
			}

			let email = document.getElementById('user-email');
			email.addEventListener('keyup', keyupEmailInit, false);

			function keyupEmailInit(e) {
				if (e.keyCode != 13) {
					email.nextElementSibling.classList.remove('error-label');
					email.setCustomValidity('');
					email.reportValidity();
				}
			}

			function sendPersonData(data) {
				$.ajax({
					url: 'index.php?route=account/account/edit',
					dataType: 'json',
					type: 'post',
					data: data,
					beforeSend: function () {
						document.querySelector('.personal-btn').disabled = true;
					},
					success: function (data) {
						if (data.unique_email == true) {
							window.location.href =
								'index.php?route=account/account';
						} else {
							email.nextElementSibling.classList.add(
								'error-label'
							);
							email.setCustomValidity(data.unique_email);
							email.reportValidity();
							document.querySelector(
								'.personal-btn'
							).disabled = false;
						}
					},
					error: function (err) {
						document.querySelector(
							'.personal-btn'
						).disabled = false;
						throw new Error(err);
					},
				});
			}
		}

		function initMobileUserDataMenu() {
			let userDataMenu = document.querySelector('.user-menu');
			let body = document.querySelector('body');
			if (userDataMenu) {
				let closeItem = document.querySelector('.close-item');
				let inforWrapper = document.querySelector(
					'.personal__information__wrapper'
				);

				userDataMenu.addEventListener(
					'click',
					listenUserDataMenu,
					true
				);
				closeItem.addEventListener('click', listenCloseItem, true);

				function listenUserDataMenu() {
					inforWrapper.classList.toggle('show-effect');
					body.classList.toggle('body-not-scroll');
					initScrollBar();
				}

				function listenCloseItem() {
					inforWrapper.classList.toggle('show-effect');
					body.classList.toggle('body-not-scroll');
					initScrollBar();
				}
			}
		}

		if (window.matchMedia('(max-width: 650px)').matches) {
			initMobileUserDataMenu();
		}

		//personal end
		//fun for prevent def for a link size
		if (window.matchMedia('(min-width: 640px)').matches) {
			document
				.querySelectorAll('.product__buy-container')
				.forEach((i) => {
					i.addEventListener('click', (e) => {
						e.preventDefault();
					});
				});
		}
		//compare icon
		let compareLink = document.querySelector('.compare__card-link');
		if (compareLink) {
			compareLink.addEventListener('click', (e) => {
				let compareContainer = document.querySelector(
					'.compare__card-container'
				);
				let icon = compareContainer.querySelector('._icon-checked');
				let containsClazz = icon.classList.contains('compare-init');

				if (!containsClazz && getComputedStyle(icon).opacity == '0') {
					e.preventDefault();
					let parent = document.querySelector('.buy__container');
					let product_id = parent.getAttribute('data-id');
					let sizesBlock = document.querySelector(
						'.card__description__sizes-block'
					);
					let activeSize = document.querySelector(
						'.card__description-size.active-compare'
					);

					if (sizesBlock && activeSize) {
						icon.classList.add('opacity-checked');
						activeSize.classList.remove('active-compare');
						return compareAjax(
							product_id,
							icon,
							activeSize.textContent
						);
					} else if (sizesBlock && !activeSize) {
						document.querySelector(
							'.importantSizeModal'
						).style.display = 'block';
						return $('#universalModal').modal();
					}
					icon.classList.add('opacity-checked');
					return compareAjax(product_id, icon);
				} else if (!containsClazz) {
					e.preventDefault();
				}
			});

			function compareAjax(id, item, size = '') {
				let sendData = {
					product_id: id,
					size: size,
				};

				$.ajax({
					url: 'index.php?route=product/compare/add',
					type: 'post',
					data: sendData,
					dataType: 'json',
					success: function (data) {
						if (data.total > 1) {
							item.classList.add('compare-init');
						}
					},
					error: function (err) {
						throw new Error(err);
					},
				});
			}
		}
		//compare page
		let compareWrapper = document.querySelector('.compare__wrapper');
		let checkboxes = document.querySelectorAll('.custom-checkbox');
		let mainCompare = document.getElementById('mainCompare');
		if (compareWrapper) {
			if (checkboxes.length > 0) {
				checkboxes.forEach((i) => {
					i.addEventListener('change', (e) => {
						mainCompare.submit();
					});
				});
			}
		}

		//favorite
		//add to favorite
		let favorites = document.querySelectorAll('.favorit');
		let unknownUser = document.querySelector('.unknown-user');
		favorites.forEach((i) => {
			i.addEventListener('click', (e) => {
				let mainProductId;
				let productId = i.parentNode.querySelector('[data-id]');
				let headerFavorite =
					document.querySelector('.header-favorites');
				let target = e.target;
				let complect = document.querySelector('.complect-container');

				if (unknownUser) {
					let universal = document.querySelector('#universalModal');
					universal
						.querySelectorAll('.universalModal')
						.forEach((i) => {
							i.style.display = 'none';
						});
					document.querySelector('.favoriteModal').style.display =
						'block';
					$('#universalModal').modal();
				} else if (productId && !complect) {
					productId = productId.getAttribute('data-id');
					let parent = i.parentNode;
					let dataProdId = i.parentNode.getAttribute('data-json');
					let dataJson = JSON.parse(dataProdId);
					setToFavorite(productId, target, dataJson, parent);
				} else {
					let card = document.querySelector('.card__container');
					let product = card.querySelector('[data-id]');
					mainProductId = product.getAttribute('data-id');
					setToFavorite(mainProductId, target);
				}

				function setToFavorite(id, target, i = null, parent = null) {
					$.ajax({
						url: 'index.php?route=account/wishlist/add',
						type: 'post',
						data: 'product_id=' + id,
						dataType: 'json',
						success: function (data) {
							if (i) {
								i.forEach((item) => {
									if (item.product_id == id) {
										item.added_to_wishlist =
											data.added_to_wishlist;
									}
								});
								parent.setAttribute(
									'data-json',
									JSON.stringify(i)
								);
							}

							if (data.total > 0) {
								headerFavorite.textContent = `(${data.total})`;
							} else {
								headerFavorite.textContent = '';
							}

							if (target.classList.contains('_icon-favorites')) {
								target.classList.remove('_icon-favorites');
								target.classList.add('_icon-favorites-fill');
								// pixel
								FBAddToWishlist();
							} else if (
								target.classList.contains(
									'_icon-favorites-fill'
								)
							) {
								target.classList.remove('_icon-favorites-fill');
								target.classList.add('_icon-favorites');
							}
						},
						error: function (err) {
							throw new Error(err);
						},
					});
				}
			});
		});
		//favorite page delete
		let favoriteWrapper = document.querySelector('.grid__favorite-wrapper');
		if (favoriteWrapper) {
			let favoritesFill = document.querySelectorAll(
				'._icon-favorites-fill'
			);
			favoritesFill.forEach((i) => {
				i.addEventListener('click', () => {
					setTimeout(() => {
						window.location.reload();
					}, 200);
				});
			});
		}
		//catalog change look-by
		let gridCatalog = document.querySelector('.grid__catalog-container');
		if (gridCatalog) {
			window.onresize = () => {
				if (window.matchMedia('(max-width: 767px)').matches) {
					gridCatalog.classList.remove('grid__catalog-container-2');
					gridCatalog.classList.remove('grid__catalog-container-3');
					gridCatalog.classList.add('grid__catalog-container');
				}
			};

			let paginationItem = document.querySelectorAll(
				'.top__pagination-item'
			);
			paginationItem.forEach((i) => {
				i.addEventListener('click', (e) => {
					i.parentNode
						.querySelectorAll('.look-by-active')
						.forEach((i) => i.classList.toggle('look-by-active'));
					i.classList.toggle('look-by-active');
					let catalogContainer = i.getAttribute('data-look');
					gridCatalog.classList.remove('grid__catalog-container-2');
					gridCatalog.classList.remove('grid__catalog-container-3');
					gridCatalog.classList.remove('grid__catalog-container');
					gridCatalog.classList.add(catalogContainer);

					if (Array.isArray(productCardSwiper)) {
						productCardSwiper.map((i) => {
							i.update();
						});
					} else {
						productCardSwiper.update();
					}
				});
			});
		}
		//submit checkout form checkout page
		let checkoutForm = document.querySelector('#checkoutForm');
		if (checkoutForm) {
			// $('.select__order-deliver').select2({
			// 	minimumResultsForSearch: -1,
			// 	width: '100%',
			// });
			// $('.select__order-pay').select2({
			// 	minimumResultsForSearch: -1,
			// 	width: '100%',
			// });
			// $('.select__order-step').select2({
			// 	language: {
			// 		noResults: function () {
			// 			return '...';
			// 		},
			// 	},
			// 	width: '100%',
			// });
			//search only first character matched results of cities select
			// function matchStart(term, text) {
			// 	if (text.toUpperCase().indexOf(term.toUpperCase()) == 0) {
			// 		return true;
			// 	}
			// 	return false;
			// }
			// $.fn.select2.amd.require(
			// 	['select2/compat/matcher'],
			// 	function (oldMatcher) {
			// 		$('#cities').select2({
			// 			matcher: oldMatcher(matchStart),
			// 			language: {
			// 				noResults: function () {
			// 					return '...';
			// 				},
			// 			},
			// 			width: '100%',
			// 		});
			// 	}
			// );
			// let delivTitle = document.querySelector('.deliv-title');
			// let titleText = document.querySelector('.stepLabel');
			// let novaposhtaContainer = document.querySelector(
			// 	'.novaposhta-container'
			// );
			// let ukposhtaContainer = document.querySelector(
			// 	'.ukposhta-container'
			// );
			// let ukrIndex = document.getElementById('ukrIndex');
			// let searchText = ukrIndex.getAttribute('data-search-text');
			// let ukrRegion = document.getElementById('ukrRegion');
			// let ukrSettlement = document.getElementById('ukrSettlement');
			// let justinContainer = document.querySelector('.justin-container');
			// let justinIndex = document.getElementById('justinIndex');
			// let searchTextJustin = justinIndex.getAttribute('data-search-text');
			// let justinRegion = document.getElementById('justinRegion');
			// let justinSettlement = document.getElementById('justinSettlement');
			// let currentDeliver = null;
			// let regions = document.getElementById('regions');
			// let cities = document.getElementById('cities');
			// let warehouses = document.getElementById('warehouses');
			// let shop = document.getElementById('shop');
			// let checkoutCapcha = document.getElementById('checkoutCapcha');
			// let totalItems = document.querySelector('.item-count-number');
			// let totalSale = document.querySelector('.item-sum');
			// let modalOrderSpinner = document.querySelector(
			// 	'.spinner-order-container'
			// );
			// let modalOrderBody = document.querySelector('.modal-order-body');
			// let modalOrderError = document.querySelector('.modal-order-error');
			// let products = [];
			// let promo = document.querySelector('.shopping__inform-promo');
			// let certificate = document.querySelector(
			// 	'.shopping__inform-certificate'
			// );
			// let pay = document.querySelector('#pay');
			// let checkoutTotalPrice = document.querySelector(
			// 	'.basket__count-price'
			// );
			// let orderPay = document.querySelector('.select__order-pay');
			// function initSelectedDeliver() {
			// 	let deliverSelect = document.querySelector(
			// 		'.select__order-deliver'
			// 	);
			// 	if (deliverSelect.value == 'flat') {
			// 		changeRequired(0);
			// 		document.querySelector('.shop-method').style.display =
			// 			'block';
			// 		document.querySelector('.other-method').style.display =
			// 			'none';
			// 		delivTitle.textContent = titleText.textContent;
			// 		orderPay.options[1].selected = true;
			// 		$('.select__order-pay').select2({
			// 			minimumResultsForSearch: -1,
			// 			width: '100%',
			// 		});
			// 		orderPay.options[2].disabled = true;
			// 	} else if (deliverSelect.value == '') {
			// 		orderPay.options[1].disabled = false;
			// 		orderPay.options[2].disabled = false;
			// 	} else {
			// 		orderPay.options[2].selected = true;
			// 		$('.select__order-pay').select2({
			// 			minimumResultsForSearch: -1,
			// 			width: '100%',
			// 		});
			// 		orderPay.options[1].disabled = true;
			// 		if (deliverSelect.value == 'novaposhta') {
			// 			novaposhtaContainer.style.display = 'block';
			// 			changeRequired(1);
			// 			currentDeliver = 1; // ??????
			// 			document.querySelector('.other-method').style.display =
			// 				'block';
			// 			autoPrefillNovaPoshta();
			// 		}
			// 		if (deliverSelect.value == 'ukposhta') {
			// 			ukposhtaContainer.style.display = 'block';
			// 			changeRequired(2);
			// 			currentDeliver = 2; //?????
			// 			document.querySelector('.other-method').style.display =
			// 				'block';
			// 		}
			// 		if (deliverSelect.value == 'justin') {
			// 			justinContainer.style.display = 'block';
			// 			changeRequired(3);
			// 			currentDeliver = 3; //?????
			// 			document.querySelector('.other-method').style.display =
			// 				'block';
			// 		}
			// 	}
			// }
			// initSelectedDeliver();
			// $('.select__order-deliver').on('select2:select', (e) => {
			// 	shop.querySelector('option:checked').selected = false;
			// 	document.querySelector('#select2-shop-container').textContent =
			// 		shop.getAttribute('data-placeholder');
			// 	if (e.params.data.id === 'flat') {
			// 		currentDeliver = 0;
			// 		changeRequired(0);
			// 		document.querySelector('.shop-method').style.display =
			// 			'block';
			// 		document.querySelector('.other-method').style.display =
			// 			'none';
			// 		delivTitle.textContent = titleText.textContent;
			// 		let parentV = document.querySelector('.shop-method');
			// 		parentV.querySelector('.steps-day-v1').style.display =
			// 			'none';
			// 		parentV.querySelector('.steps-day-v3').style.display =
			// 			'none';
			// 		orderPay.options[2].disabled = true;
			// 		orderPay.options[1].disabled = false;
			// 		orderPay.options[1].selected = true;
			// 		if (orderPay.value == 2) {
			// 			orderPay.querySelector(
			// 				'option:checked'
			// 			).selected = false;
			// 			document.querySelector(
			// 				'#select2-pay-container'
			// 			).textContent =
			// 				orderPay.getAttribute('data-placeholder');
			// 		}
			// 	} else {
			// 		getBasketData('0');
			// 		document.querySelector('.other-method').style.display =
			// 			'block';
			// 		document.querySelector('.shop-method').style.display =
			// 			'none';
			// 		orderPay.options[2].disabled = false;
			// 		orderPay.options[2].selected = true;
			// 		orderPay.options[1].disabled = true;
			// 		if (orderPay.value == 1) {
			// 			orderPay.querySelector(
			// 				'option:checked'
			// 			).selected = false;
			// 			document.querySelector(
			// 				'#select2-pay-container'
			// 			).textContent =
			// 				orderPay.getAttribute('data-placeholder');
			// 		}
			// 		setTimeout(() => {
			// 			sendDroppedCartData(droppedCartData());
			// 		}, 100);
			// 	}
			// 	$('.select__order-pay').select2({
			// 		minimumResultsForSearch: -1,
			// 		width: '100%',
			// 	});
			// 	if (e.params.data.id == 'novaposhta') {
			// 		delivTitle.textContent = e.params.data.text;
			// 		novaposhtaContainer.style.display = 'block';
			// 		justinContainer.style.display = 'none';
			// 		ukposhtaContainer.style.display = 'none';
			// 		getRegions();
			// 		changeRequired(1);
			// 		currentDeliver = 1;
			// 	} else if (e.params.data.id == 'ukposhta') {
			// 		delivTitle.textContent = e.params.data.text;
			// 		novaposhtaContainer.style.display = 'none';
			// 		justinContainer.style.display = 'none';
			// 		ukposhtaContainer.style.display = 'block';
			// 		changeRequired(2);
			// 		currentDeliver = 2;
			// 	} else if (e.params.data.id == 'justin') {
			// 		delivTitle.textContent = e.params.data.text;
			// 		novaposhtaContainer.style.display = 'none';
			// 		ukposhtaContainer.style.display = 'none';
			// 		justinContainer.style.display = 'block';
			// 		changeRequired(3);
			// 		currentDeliver = 3;
			// 	}
			// });
			// async function getSimpleRegions() {
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaRegions`,
			// 		type: 'post',
			// 		data: { shipping_provider: 'novaposhta' },
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			data.regions.forEach((i) => {
			// 				regions.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// async function getSimpleCities(id) {
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaSettlements`,
			// 		type: 'post',
			// 		data: { region_id: id },
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			data.forEach((i) => {
			// 				cities.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// async function getSimpleWarehouses(id) {
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaWarehouses`,
			// 		type: 'post',
			// 		data: { settlement_id: id },
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			data.forEach((i) => {
			// 				warehouses.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// function autoPrefillNovaPoshta() {
			// 	getSimpleRegions()
			// 		.then(() => {
			// 			if (cities.querySelector('option:checked')) {
			// 				NpRegionsID =
			// 					regions.querySelector('option:checked').value;
			// 				getSimpleCities(NpRegionsID);
			// 			}
			// 		})
			// 		.then(() => {
			// 			if (warehouses.querySelector('option:checked')) {
			// 				NpCitiesID =
			// 					cities.querySelector('option:checked').value;
			// 				getSimpleWarehouses(NpCitiesID);
			// 			}
			// 		})
			// 		.catch((err) => {
			// 			throw new Error(err);
			// 		});
			// }
			// // search ukr post deliver
			// $('#ukrIndex').select2({
			// 	language: {
			// 		noResults: function () {
			// 			return '...';
			// 		},
			// 		searching: function () {
			// 			return '...';
			// 		},
			// 		inputTooShort: function () {
			// 			return searchText;
			// 		},
			// 	},
			// 	width: '100%',
			// 	minimumInputLength: 2,
			// 	ajax: {
			// 		url: 'index.php?route=ajax/checkout/UkrposhtaShippingBy',
			// 		type: 'GET',
			// 		data: function (params) {
			// 			let query = {
			// 				search_param: params.term,
			// 			};
			// 			return query;
			// 		},
			// 		processResults: function (data) {
			// 			if (data.data.status === 'failure') {
			// 				return {
			// 					results: {
			// 						text: '',
			// 						id: '',
			// 					},
			// 				};
			// 			} else {
			// 				return {
			// 					results: data.data.map((i) => {
			// 						return {
			// 							text: `№${i.warehouse_index}, ${i.address}`,
			// 							id: i.id,
			// 						};
			// 					}),
			// 				};
			// 			}
			// 		},
			// 	},
			// });
			// $('#ukrIndex').on('select2:select', (e) => {
			// 	getUkrPostAdress(e.params.data.id);
			// });
			// function getUkrPostAdress(id) {
			// 	$.ajax({
			// 		url: `index.php?route=ajax/checkout/UkrposhtaShippingBy&warehouse_id=${id}`,
			// 		type: 'get',
			// 		success: function (data) {
			// 			preFillUkrPostAdress(data.data);
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// function preFillUkrPostAdress(data) {
			// 	ukrRegion.value = data.region;
			// 	ukrRegion.setAttribute('data-delivery-id', data.region_id);
			// 	ukrSettlement.value = data.settlement;
			// 	ukrSettlement.setAttribute(
			// 		'data-delivery-id',
			// 		data.settlement_id
			// 	);
			// 	sendDroppedCartData(droppedCartData());
			// }
			// // search justin post deliver
			// $('#justinIndex').select2({
			// 	language: {
			// 		noResults: function () {
			// 			return '...';
			// 		},
			// 		searching: function () {
			// 			return '...';
			// 		},
			// 		inputTooShort: function () {
			// 			return searchTextJustin;
			// 		},
			// 	},
			// 	width: '100%',
			// 	minimumInputLength: 1,
			// 	ajax: {
			// 		url: 'index.php?route=ajax/checkout/justinsSippingBy',
			// 		type: 'GET',
			// 		data: function (params) {
			// 			let query = {
			// 				search_param: params.term,
			// 			};
			// 			return query;
			// 		},
			// 		processResults: function (data) {
			// 			if (data.data.status === 'failure') {
			// 				return {
			// 					results: {
			// 						text: '',
			// 						id: '',
			// 					},
			// 				};
			// 			} else {
			// 				return {
			// 					results: data.data.map((i) => {
			// 						return {
			// 							text: i.address,
			// 							id: i.id,
			// 						};
			// 					}),
			// 				};
			// 			}
			// 		},
			// 	},
			// });
			// $('#justinIndex').on('select2:select', (e) => {
			// 	getJustinPostAdress(e.params.data.id);
			// });
			// function getJustinPostAdress(id) {
			// 	$.ajax({
			// 		url: `index.php?route=ajax/checkout/justinsSippingBy&warehouse_id=${id}`,
			// 		type: 'get',
			// 		success: function (data) {
			// 			preFillJustinPostAdress(data.data);
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// function preFillJustinPostAdress(data) {
			// 	justinRegion.value = data.region;
			// 	justinSettlement.value = data.settlement;
			// 	justinRegion.setAttribute('data-delivery-id', data.region_id);
			// 	justinSettlement.setAttribute(
			// 		'data-delivery-id',
			// 		data.settlement_id
			// 	);
			// 	sendDroppedCartData(droppedCartData());
			// }
			// function changeRequired(action) {
			// 	if (action == 0) {
			// 		regions.removeAttribute('required');
			// 		cities.removeAttribute('required');
			// 		warehouses.removeAttribute('required');
			// 		shop.setAttribute('required', 'required');
			// 		ukrIndex.removeAttribute('required');
			// 		justinIndex.removeAttribute('required');
			// 	} else if (action == 1) {
			// 		regions.setAttribute('required', 'required');
			// 		cities.setAttribute('required', 'required');
			// 		warehouses.setAttribute('required', 'required');
			// 		shop.removeAttribute('required');
			// 		ukrIndex.removeAttribute('required');
			// 		justinIndex.removeAttribute('required');
			// 	} else if (action == 2) {
			// 		regions.removeAttribute('required');
			// 		cities.removeAttribute('required');
			// 		warehouses.removeAttribute('required');
			// 		shop.removeAttribute('required', 'required');
			// 		justinIndex.removeAttribute('required');
			// 		ukrIndex.setAttribute('required', 'required');
			// 	} else if (action == 3) {
			// 		regions.removeAttribute('required');
			// 		cities.removeAttribute('required');
			// 		warehouses.removeAttribute('required');
			// 		shop.removeAttribute('required', 'required');
			// 		ukrIndex.removeAttribute('required');
			// 		justinIndex.setAttribute('required', 'required');
			// 	}
			// }
			// $('.select__order-step').on('select2:select', (e) => {
			// 	let resultId = e.params.data._resultId;
			// 	if (resultId.includes('regions')) {
			// 		getCities(e.params.data.id);
			// 	} else if (resultId.includes('cities')) {
			// 		getWarehouses(e.params.data.id);
			// 	} else if (resultId.includes('shop')) {
			// 		getBasketData(e.params.data.id);
			// 	}
			// 	setTimeout(() => {
			// 		sendDroppedCartData(droppedCartData());
			// 	}, 300);
			// });
			// function getRegions() {
			// 	let data = {
			// 		shipping_provider: 'novaposhta',
			// 	};
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaRegions`,
			// 		type: 'post',
			// 		data: data,
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			removeAllChildNodes(regions);
			// 			removeAllChildNodes(cities);
			// 			removeAllChildNodes(warehouses);
			// 			data.regions.forEach((i) => {
			// 				regions.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// async function getCities(id) {
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaSettlements`,
			// 		type: 'post',
			// 		data: { region_id: id },
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			removeAllChildNodes(cities);
			// 			removeAllChildNodes(warehouses);
			// 			data.forEach((i) => {
			// 				cities.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// async function getWarehouses(id) {
			// 	$.ajax({
			// 		url: `index.php?route=checkout/checkout/novaposhtaWarehouses`,
			// 		type: 'post',
			// 		data: { settlement_id: id },
			// 		dataType: 'json',
			// 		success: function (data) {
			// 			removeAllChildNodes(warehouses);
			// 			data.forEach((i) => {
			// 				warehouses.insertAdjacentHTML(
			// 					'beforeend',
			// 					`<option value='${i.id}'>${i.name}</option>`
			// 				);
			// 			});
			// 			sendDroppedCartData(droppedCartData());
			// 		},
			// 		error: function (err) {
			// 			throw new Error(err);
			// 		},
			// 	});
			// }
			// let inputTimer;
			// let errorDiscount = document.querySelector('.discount-error');
			// 	$('.select__order-pay').on('select2:select', (e) => {
			// 		sendDroppedCartData(droppedCartData());
			// 		calculateTotalPayChange();
			// 		//pixel
			// 		FBAddPaymentInfo();
			// 	});
			// 	function calculateTotalPayChange() {
			// 		let data = {
			// 			sertificate_number: certificate.value,
			// 			promo: promo.value,
			// 			client_was_going_to_pay: pay.value,
			// 		};
			// 		$.ajax({
			// 			url: `index.php?route=checkout/cart/RewriteTotal`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			success: function (data) {
			// 				totalSale.textContent = data.total;
			// 				initSaleCode(data);
			// 			},
			// 			error: function (err) {
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
			// 	promo.addEventListener('input', promoListen, false);
			// 	certificate.addEventListener('input', promoListen, false);
			// 	function promoListen(e) {
			// 		if (
			// 			e.target.classList.contains('shopping__inform-certificate')
			// 		) {
			// 			certificate.classList.remove('valid-promocode');
			// 			if (certificate.value.length >= 2) {
			// 				let data = {
			// 					sertificate_number: certificate.value,
			// 					client_was_going_to_pay: pay.value,
			// 				};
			// 				clearTimeout(inputTimer);
			// 				inputTimer = setTimeout(() => {
			// 					sendCertificate(data);
			// 				}, 400);
			// 			} else {
			// 				clearTimeout(inputTimer);
			// 				errorDiscount.style.display = 'none';
			// 			}
			// 		} else if (
			// 			e.target.classList.contains('shopping__inform-promo')
			// 		) {
			// 			promo.classList.remove('valid-promocode');
			// 			if (promo.value.length >= 2) {
			// 				let data = {
			// 					promocode_number: promo.value,
			// 					client_was_going_to_pay: pay.value,
			// 				};
			// 				clearTimeout(inputTimer);
			// 				inputTimer = setTimeout(() => {
			// 					sendPromocode(data);
			// 				}, 400);
			// 			} else {
			// 				clearTimeout(inputTimer);
			// 				errorDiscount.style.display = 'none';
			// 			}
			// 		}
			// 		if (promo.value.length !== 0) {
			// 			certificate.value = '';
			// 			certificate.disabled = true;
			// 		} else if (certificate.value.length !== 0) {
			// 			promo.value = '';
			// 			promo.disabled = true;
			// 		} else {
			// 			certificate.disabled = false;
			// 			promo.disabled = false;
			// 		}
			// 	}
			// 	function sendCertificate(data) {
			// 		$.ajax({
			// 			url: `index.php?route=checkout/checkout/calculateSertificate`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			success: function (data) {
			// 				initSaleCode(data);
			// 				totalSale.textContent = data.total;
			// 				sendDroppedCartData(droppedCartData());
			// 			},
			// 			error: function (err) {
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
			// 	function sendPromocode(data) {
			// 		$.ajax({
			// 			url: `index.php?route=checkout/checkout/calculatePromocode`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			success: function (data) {
			// 				initSaleCode(data);
			// 				totalSale.textContent = data.total;
			// 				sendDroppedCartData(droppedCartData());
			// 			},
			// 			error: function (err) {
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
			// 	// function getBasketData(selectId) {
			// 	// 	let data = {
			// 	// 		magazine_id: selectId,
			// 	// 		promocode_number: promo.value,
			// 	// 		sertificate_number: certificate.value,
			// 	// 		client_was_going_to_pay: pay.value,
			// 	// 	};
			// 	// 	$.ajax({
			// 	// 		url: `index.php?route=checkout/checkout/rewriteCartByMagazine`,
			// 	// 		type: 'post',
			// 	// 		data: data,
			// 	// 		dataType: 'json',
			// 	// 		success: function (data) {
			// 	// 			basketActualization(data);
			// 	// 			initSaleCode(data);
			// 	// 		},
			// 	// 		error: function (err) {
			// 	// 			throw new Error(err);
			// 	// 		},
			// 	// 	});
			// 	// }
			// 	// function basketActualization(data) {
			// 	// 	let submitBtn = document.querySelector('.order__submit');
			// 	// 	// if (data.magazine_id) {
			// 	// 	// 	let parentV = document.querySelector('.shop-method');
			// 	// 	// 	let stepDayV1 = parentV.querySelector('.steps-day-v1');
			// 	// 	// 	let stepDayV3 = parentV.querySelector('.steps-day-v3');
			// 	// 	// 	let obj = data.products.find((o) => o.ssid === 2);
			// 	// 	// 	if (obj) {
			// 	// 	// 		stepDayV1.style.display = 'none';
			// 	// 	// 		stepDayV3.style.display = 'block';
			// 	// 	// 		submitBtn.disabled = false;
			// 	// 	// 	} else {
			// 	// 	// 		stepDayV1.style.display = 'block';
			// 	// 	// 		stepDayV3.style.display = 'none';
			// 	// 	// 		submitBtn.disabled = false;
			// 	// 	// 	}
			// 	// 	// 	data.products.forEach((i) => {
			// 	// 	// 		let parent = document.querySelector(
			// 	// 	// 			`[data-find-id="${i.cart_id}"]`
			// 	// 	// 		);
			// 	// 	// 		let amount = parent.querySelector(
			// 	// 	// 			'.basket__info__details-amount'
			// 	// 	// 		);
			// 	// 	// 		let priceCost = parent.querySelector(
			// 	// 	// 			'.basket__info__price-cost'
			// 	// 	// 		);
			// 	// 	// 		let valueAmount =
			// 	// 	// 			parent.querySelector('.details-amount');
			// 	// 	// 		let underOrder = parent.querySelector(
			// 	// 	// 			'.basket__under-order'
			// 	// 	// 		);
			// 	// 	// 		let basketInform =
			// 	// 	// 			parent.querySelector('.basket__inform');
			// 	// 	// 		if (i.ssid == 1) {
			// 	// 	// 			amount.style.display = 'block';
			// 	// 	// 			priceCost.classList.toggle('not-item');
			// 	// 	// 			underOrder.style.display = 'none';
			// 	// 	// 			basketInform.style.display = 'none';
			// 	// 	// 		} else if (i.ssid == 2) {
			// 	// 	// 			amount.style.display = 'block';
			// 	// 	// 			priceCost.classList.toggle('not-item');
			// 	// 	// 			underOrder.style.display = 'block';
			// 	// 	// 			basketInform.style.display = 'none';
			// 	// 	// 		}
			// 	// 	// 		parent.setAttribute(
			// 	// 	// 			'data-magazine-id',
			// 	// 	// 			data.magazine_id
			// 	// 	// 		);
			// 	// 	// 		priceCost.textContent = i.total;
			// 	// 	// 		valueAmount.value = i.quantity;
			// 	// 	// 	});
			// 	// 	// } else {
			// 	// 	// let parentV = document.querySelector('.other-method');
			// 	// 	// let stepDayV2 = parentV.querySelector('.steps-day-v2');
			// 	// 	// let stepDayV3 = parentV.querySelector('.steps-day-v3');
			// 	// 	//let obj2 = data.products.find((o) => o.ssid === 2);
			// 	// 	let obj3Length = data.products.filter(
			// 	// 		(item) => item.ssid === 3
			// 	// 	).length;
			// 	// 	if (obj3Length == data.products.length) {
			// 	// 		stepDayV2.style.display = 'none';
			// 	// 		stepDayV3.style.display = 'none';
			// 	// 		submitBtn.disabled = true;
			// 	// 	}
			// 	// 	// else if (obj2) {
			// 	// 	// 	stepDayV2.style.display = 'none';
			// 	// 	// 	stepDayV3.style.display = 'block';
			// 	// 	// 	submitBtn.disabled = false;
			// 	// 	// }
			// 	// 	else {
			// 	// 		stepDayV2.style.display = 'block';
			// 	// 		stepDayV3.style.display = 'none';
			// 	// 		submitBtn.disabled = false;
			// 	// 	}
			// 	// 	data.products.forEach((i) => {
			// 	// 		let parent = document.querySelector(
			// 	// 			`[data-find-id="${i.cart_id}"]`
			// 	// 		);
			// 	// 		let amount = parent.querySelector(
			// 	// 			'.basket__info__details-amount'
			// 	// 		);
			// 	// 		let priceCost = parent.querySelector(
			// 	// 			'.basket__info__price-cost'
			// 	// 		);
			// 	// 		let valueAmount = parent.querySelector('.details-amount');
			// 	// 		let underOrder = parent.querySelector(
			// 	// 			'.basket__under-order'
			// 	// 		);
			// 	// 		let basketInform = parent.querySelector('.basket__inform');
			// 	// 		if (i.ssid == 1) {
			// 	// 			amount.style.display = 'block';
			// 	// 			priceCost.classList.toggle('not-item');
			// 	// 			underOrder.style.display = 'none';
			// 	// 			basketInform.style.display = 'none';
			// 	// 		}
			// 	// 		// else if (i.ssid == 2) {
			// 	// 		// 	amount.style.display = 'block';
			// 	// 		// 	priceCost.classList.toggle('not-item');
			// 	// 		// 	underOrder.style.display = 'block';
			// 	// 		// 	basketInform.style.display = 'none';
			// 	// 		// }
			// 	// 		else if (i.ssid == 3) {
			// 	// 			amount.style.display = 'none';
			// 	// 			priceCost.classList.toggle('not-item');
			// 	// 			underOrder.style.display = 'none';
			// 	// 			basketInform.style.display = 'block';
			// 	// 		}
			// 	// 		parent.setAttribute('data-magazine-id', '0');
			// 	// 		priceCost.textContent = i.total;
			// 	// 		valueAmount.value = i.quantity;
			// 	// 	});
			// 	// 	//}
			// 	// 	totalItems.textContent = data.checkout_cart_total_products;
			// 	// 	checkoutTotalPrice.textContent = data.checkout_cart_total_price;
			// 	// }
			// 	function initInformModal() {
			// 		let inform = document.querySelectorAll('.basket__inform');
			// 		inform.forEach((i) => {
			// 			i.addEventListener('click', (e) => {
			// 				let id =
			// 					i.parentNode.parentNode.getAttribute('data-id');
			// 				let sizeCont = i.parentNode.parentNode.querySelector(
			// 					'.basket__info__details-size'
			// 				);
			// 				let size = sizeCont.textContent;
			// 				if (size == '') {
			// 					showInformModal(id);
			// 				} else {
			// 					showInformModal(id, size);
			// 				}
			// 			});
			// 		});
			// 	}
			// 	initInformModal();
			// 	function showInformModal(id, size = 'ONE') {
			// 		let infoAvailability =
			// 			document.getElementById('infoAvailability');
			// 		let showSize = infoAvailability.querySelector('.pre-size');
			// 		removeAllChildNodes(showSize);
			// 		showSize.insertAdjacentHTML(
			// 			'afterbegin',
			// 			`<button type="button" class="card__description-size" data-confirm=${id}>${size}</button>`
			// 		);
			// 		$(infoAvailability).modal();
			// 	}
			// 	checkoutForm.addEventListener('submit', (e) => {
			// 		e.preventDefault();
			// 		if (checkoutCapcha.value == '') {
			// 			setProductsData();
			// 			sendData(getData(true));
			// 			//pixel
			// 			FBAddPaymentInfo();
			// 		}
			// 	});
			// 	function setProductsData() {
			// 		let dataIds = document.querySelectorAll('[data-id]');
			// 		dataIds.forEach((i) => {
			// 			const product_id = i.getAttribute('data-id');
			// 			const dataSize = i.querySelector('[data-product-size]');
			// 			const size = dataSize.getAttribute('data-product-size');
			// 			const data = {
			// 				product_id: product_id,
			// 				size: size,
			// 			};
			// 			products.push(data);
			// 		});
			// 	}
			// 	function liqPayAjax(id) {
			// 		let data = {
			// 			order_id: id,
			// 		};
			// 		$.ajax({
			// 			url: `index.php?route=checkout/checkout/paymentWithLiqpay`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			success: function (data) {
			// 				liqPayFormSubmitForm(data);
			// 			},
			// 			error: function (err) {
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
			// 	function liqPayFormSubmitForm(data) {
			// 		let modalOrderBody =
			// 			document.querySelector('.modal-order-body');
			// 		modalOrderBody.insertAdjacentHTML('afterend', `${data}`);
			// 		setTimeout(() => {
			// 			document.querySelector('#liqPayFormSubmitForm').submit();
			// 		}, 500);
			// 	}
			// 	//checkout form data
			// 	function getData(isSubmit = false) {
			// 		let lastname = document.querySelector('#lastname').value;
			// 		let firstname = document.querySelector('#firstname').value;
			// 		// let middlename = document.querySelector('#middlename').value;
			// 		// let custTel = document.querySelector(
			// 		// 	'#customer_telephone'
			// 		// ).value;
			// 		let comment = document.querySelector('#comment').value;
			// 		let orderMethod = document.querySelector('#orderMethod').value;
			// 		let total = Number.parseInt(totalSale.textContent);
			// 		let requestRegions = '';
			// 		let requestCities = '';
			// 		let requestWarehouses = '';
			// 		let NpRegionsID = regions.querySelector('option:checked');
			// 		let NpCitiesID = cities.querySelector('option:checked');
			// 		let NpWarehousesID = warehouses.querySelector('option:checked');
			// 		if (currentDeliver == 0) {
			// 			requestRegions = '';
			// 			requestCities = '';
			// 			requestWarehouses = '';
			// 		} else if (currentDeliver == 1) {
			// 			requestRegions = regions.value;
			// 			requestCities = cities.value;
			// 			requestWarehouses = warehouses.value;
			// 		} else if (currentDeliver == 2) {
			// 			requestRegions = ukrRegion.getAttribute('data-delivery-id');
			// 			requestCities =
			// 				ukrSettlement.getAttribute('data-delivery-id');
			// 			requestWarehouses = ukrIndex.value;
			// 		} else if (currentDeliver == 3) {
			// 			requestRegions =
			// 				justinRegion.getAttribute('data-delivery-id');
			// 			requestCities =
			// 				justinSettlement.getAttribute('data-delivery-id');
			// 			requestWarehouses = justinIndex.value;
			// 		}
			// 		return {
			// 			lastname: lastname,
			// 			firstname: firstname,
			// 			// middlename: middlename,
			// 			// custTel: custTel,
			// 			comment: comment,
			// 			orderMethod: orderMethod,
			// 			regions: requestRegions,
			// 			cities: requestCities,
			// 			warehouses: requestWarehouses,
			// 			client_was_going_to_pay: pay.value,
			// 			shop: shop.value,
			// 			confirm_order: isSubmit,
			// 			promo: promo.value,
			// 			certificate: certificate.value,
			// 			products: products,
			// 			total: total,
			// 			NpRegionsID: NpRegionsID ? NpRegionsID.value : '',
			// 			NpCitiesID: NpCitiesID ? NpCitiesID.value : '',
			// 			NpWarehousesID: NpWarehousesID ? NpWarehousesID.value : '',
			// 		};
			// 	}
			// 	function sendData(data) {
			// 		$.ajax({
			// 			url: `index.php?route=checkout/checkout/addOrder`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			beforeSend: function () {
			// 				$('#orderModal').modal();
			// 			},
			// 			success: function (data) {
			// 				if (pay.value == 1) {
			// 					modalOrderSpinner.style.display = 'none';
			// 					modalOrderBody.style.display = 'block';
			// 					$('#orderModal').on(
			// 						'hidden.bs.modal',
			// 						function (e) {
			// 							window.location.replace(
			// 								window.location.origin
			// 							);
			// 						}
			// 					);
			// 					drawingСheck(data);
			// 				} else {
			// 					liqPayAjax(data.order_id);
			// 					$('#orderModal').on(
			// 						'hidden.bs.modal',
			// 						function (e) {
			// 							window.location.replace(
			// 								window.location.origin
			// 							);
			// 						}
			// 					);
			// 				}
			// 				// pxel
			// 				FBPurchase(data);
			// 				// pxel
			// 			},
			// 			error: function (err) {
			// 				modalOrderSpinner.style.display = 'none';
			// 				modalOrderError.style.display = 'block';
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
			// 	function drawingСheck(data) {
			// 		let checkNumber = document.querySelector(
			// 			'.order__modal-number-span'
			// 		);
			// 		let checkDeliv = document.querySelector('.check-deliv');
			// 		let checkPay = document.querySelector('.check-pay');
			// 		let checktotal = document.querySelector('.sum-total-count');
			// 		let checkItems = document.querySelector(
			// 			'.order__modal__sum-items'
			// 		);
			// 		checkNumber.textContent = data.order_number;
			// 		checkDeliv.textContent = data.delivery_method;
			// 		checkPay.textContent = data.payment_method;
			// 		checktotal.textContent = data.total_sale_pay;
			// 		data.products.forEach((i) => {
			// 			checkItems.insertAdjacentHTML(
			// 				'beforeend',
			// 				`
			// 				<div class="order__modal__sum-item">
			// 					<p class="items-title">${i.title}</p>
			// 					<div class="items-info">
			// 						<span class="info-size">${i.size}</span>
			// 						<div class="info-price">
			// 							<span>${i.amount}</span>
			// 							<span class="_icon-cancel"></span>
			// 							<span>${i.sum_price}</span>
			// 						</div>
			// 					</div>
			// 				</div>
			// 			`
			// 			);
			// 		});
			// 	}
			// 	// init liqpay redirect
			// 	let liqpaySuccess = document.querySelector('.liqpay-success');
			// 	if (liqpaySuccess) {
			// 		$('#orderModal').modal();
			// 		$('#orderModal').on('hidden.bs.modal', function (e) {
			// 			window.location.replace(window.location.origin);
			// 		});
			// 	}
			// 	let liqpayError = document.querySelector('.liqpay-error');
			// 	if (liqpayError) {
			// 		$('#orderModal').modal();
			// 	}
			// 	// abandoned cart
			// 	function initMinimumData() {
			// 		// let telephoneInput =
			// 		// 	document.getElementById('customer_telephone');
			// 		// let initTelephone = sessionStorage.getItem('initTelephone');
			// 		let firstname = document.getElementById('firstname');
			// 		if (firstname.value.length >= 2) {
			// 			return true;
			// 		} else {
			// 			return false;
			// 		}
			// 	}
			// 	function initAbandonedCart() {
			// 		if (initMinimumData()) {
			// 			setProductsData();
			// 			sendAbandonedCart(getData());
			// 			let isRedirect = document.querySelector('.liqpay-success');
			// 			if (isRedirect) {
			// 				setTimeout(() => {
			// 					sendDroppedCartData(droppedCartData());
			// 				}, 200);
			// 			}
			// 		}
			// 	}
			// 	initAbandonedCart();
			// 	$('#personalConfirm').on('hide.bs.modal', function (e) {
			// 		initAbandonedCart();
			// 	});
			// 	document
			// 		.getElementById('firstname')
			// 		.addEventListener('input', initAbandonedCart, true);
			// 	function sendAbandonedCart(data) {
			// 		$.ajax({
			// 			url: `index.php?route=checkout/checkout/addOrder`,
			// 			type: 'post',
			// 			data: data,
			// 			dataType: 'json',
			// 			success: function (data) {},
			// 			error: function (err) {
			// 				throw new Error(err);
			// 			},
			// 		});
			// 	}
		}

		//nuot relocate
		let nuotSection = document.querySelector('.nuot__grid-wrapper');
		if (nuotSection) {
			nuotSection.addEventListener('click', (e) => {
				let target = e.target.parentNode;

				if (!target.classList.contains('button-link')) {
					window.location.href = 'index.php?route=nuot/nuot_page';
				}
			});
		}
		//set to cookie для блока недавно просмотренные
		let product = document.querySelector('.card__container');
		if (product) {
			function getCookie(name) {
				let matches = document.cookie.match(
					new RegExp(
						'(?:^|; )' +
							name.replace(
								/([\.$?*|{}\(\)\[\]\\\/\+^])/g,
								'\\$1'
							) +
							'=([^;]*)'
					)
				);
				return matches ? decodeURIComponent(matches[1]) : undefined;
			}

			let products = [];
			let attr = product.querySelector('[data-id]');
			let mainProductId = attr.getAttribute('data-id');
			let user = product.getAttribute('data-authuser');
			let authuser;
			let cookieJson = getCookie('recently_watched');
			let recentlyWatched;

			if (user == '') {
				authuser = false;
			} else {
				authuser = user;
			}

			if (cookieJson !== undefined) {
				let cookie = JSON.parse(cookieJson);
				cookie.products.push(mainProductId);
				let array = cookie.products;
				products = [...new Set(array)];
			} else {
				products.push(mainProductId);
			}

			recentlyWatched = {
				products: products,
				user_id: authuser,
			};

			document.cookie =
				'recently_watched=' +
				JSON.stringify(recentlyWatched) +
				'; max-age=86400';
		}

		//email reqest
		let newstler = document.querySelector('#newstler');
		let emailContainet = document.querySelector('.footer__sub-action');
		let successContainet = document.querySelector('.footer__sub-success');

		if (newstler) {
			newstler.addEventListener('submit', function (e) {
				e.preventDefault();
				let inputs = newstler.getElementsByTagName('input');
				let data = {
					email: inputs[0].value,
				};

				if (inputs[1].value == '') {
					$.ajax({
						url: `index.php?route=mail/newsletter/setToDatabase`,
						type: 'post',
						data: data,
						dataType: 'json',
						success: function (data) {
							inputs[0].value = '';
							data = {};
							emailContainet.style.display = 'none';
							successContainet.style.display = 'block';
						},
						error: function (err) {
							throw new Error(err);
						},
					});
				}
			});
		}

		//btn-slider-span init on display
		let sliderSpan = document.querySelectorAll('.btn-slider-span');
		if (sliderSpan.length > 0) {
			sliderSpan.forEach((i) => {
				let prevBtn = i.parentNode.querySelector(
					'._icon-arrow-slider-1'
				);
				let saleSlider = i.parentNode.parentNode;
				let otherSliders = i.parentNode.parentNode.parentNode;

				if (prevBtn.classList.contains('swiper-button-lock')) {
					if (saleSlider.classList.contains('swiper-container')) {
						i.parentNode.style.display = 'none';
					} else if (
						otherSliders.classList.contains(
							'slider-controls-container'
						)
					) {
						otherSliders.style.display = 'none';
					}
				} else if (
					i.parentNode.previousElementSibling.classList.contains(
						'swiper-pagination-lock'
					)
				) {
					i.parentNode.previousElementSibling.style.display = 'none';
				}
			});
		}
		//category smooth slider
		let subcategory = document.querySelector('.subcategory__wrapper');
		if (subcategory) {
			if (window.matchMedia('(max-width: 768px)').matches) {
				UIkit.slider('.uk-subcat-slider', {
					draggable: true,
					autoplay: false,
				});
			} else {
				UIkit.slider('.uk-subcat-slider', {
					draggable: false,
					autoplay: true,
				});
			}
		}

		// //counter animation
		// function animateValue(obj, start, end, duration) {
		// 	let startTimestamp = null;
		// 	const step = (timestamp) => {
		// 		if (!startTimestamp) startTimestamp = timestamp;
		// 		const progress = Math.min(
		// 			(timestamp - startTimestamp) / duration,
		// 			1
		// 		);
		// 		obj.innerHTML = `${Math.floor(
		// 			progress * (end - start) + start
		// 		)} грн`;
		// 		if (progress < 1) {
		// 			window.requestAnimationFrame(step);
		// 		}
		// 	};
		// 	window.requestAnimationFrame(step);
		// }

		// let priceEl = document.getElementById('price-value');
		// if (priceEl) {
		// 	let dataCost = document.querySelectorAll('[data-cost]');
		// 	dataCost.forEach((i) => {
		// 		i.addEventListener('click', () => {
		// 			let dataAttr = i.getAttribute('data-cost');
		// 			let dataValue = priceEl.getAttribute('data-value');
		// 			let currentValue = priceEl.textContent;

		// 			if (parseInt(dataAttr) !== parseInt(currentValue)) {
		// 				let end;

		// 				if (dataAttr == '') {
		// 					end = parseInt(dataValue);
		// 				} else {
		// 					end = parseInt(dataAttr);
		// 				}

		// 				let start = end - 20;
		// 				animateValue(priceEl, start, end, 200);
		// 				//console.log(and);
		// 			} else {
		// 				return;
		// 			}
		// 		});
		// 	});
		// }

		//lang form
		let langBtn = document.querySelectorAll('.lang-modal-btn');
		if (langBtn.length > 0) {
			function toogleLangBtn() {
				let arrow = document.querySelectorAll('.lang-arrow');
				[...arrow].forEach((i) => {
					i.classList.toggle('rotate270');
				});
			}

			$('#langModal').on('hide.bs.modal', function (e) {
				toogleLangBtn();
			});

			$('#langModal').on('show.bs.modal', function (e) {
				toogleLangBtn();
			});

			let mobLangBtn = document.querySelector('.lang-mob-btn-js');
			if (mobLangBtn) {
				mobLangBtn.addEventListener('click', () => {
					document
						.querySelector('.menu__mobile-modal')
						.classList.remove('active-modal');
				});
			}

			$('.country-lang-sel').select2({
				language: {
					noResults: function () {
						return '...';
					},
				},
				width: '100%',
				dropdownParent: $('#langModal'),
				//templateResult: formatState,
				templateResult: function (data, container) {
					if (!data.id) {
						return data.text;
					}

					setOptionClass(data, container);
					let baseUrl = '/image/';
					let $state = $(
						`<span class="option-flag-container"><img src="${baseUrl}/${data.element.value.toLowerCase()}.png" class="img-flag" />${
							data.text
						}</span>`
					);
					return $state;
				},
				templateSelection: function (data) {
					let baseUrl = '/image/';
					let $state = $(
						`<span class="select-flag-container"><img src="${baseUrl}${data.id}.png" class="img-flag" />${data.text}</span>`
					);
					return $state;
				},
			});

			function setOptionClass(data, container) {
				$(container).addClass($(data.element).attr('class'));
				return data.text;
			}

			$('.lang-select').select2({
				minimumResultsForSearch: -1,
				width: '100%',
			});
		}

		//360 image view
		let icon360 = document.querySelector('.icon360');
		let firstLoad = true;
		if (icon360) {
			let leftBtn = document.querySelector('.left360');
			let rightBtn = document.querySelector('.right360');
			let playBtn = document.querySelector('.auto-play360');
			let modal360 = document.getElementById('modal360');
			let body360 = document.querySelector('.body360');
			let autoPlay = body360.getAttribute('data-autoplay');
			let wait = body360.querySelector('.wait');
			let target;
			let loader;

			let observer = new MutationObserver(callbackFunctionCanvas);

			function loadingInit() {
				wait.style.display = 'none';
				loader = body360.querySelector('.cloudimage-360-loader');
				observer.disconnect();
				observer.observe(loader, options);
			}

			let options = {
				attributes: true,
			};

			function activationControls(value) {
				let persent = value.split('width: ')[1];
				if (parseInt(persent) === 100) {
					modal360.addEventListener('click', modalListener, false);
					observer.disconnect();
					leftBtn.removeAttribute('disabled');
					rightBtn.removeAttribute('disabled');
					playBtn.removeAttribute('disabled');
				}
			}

			function callbackFunctionCanvas(mutations) {
				mutations.forEach(function (mutationRecord) {
					if (
						!mutationRecord.target.classList.contains(
							'cloudimage-360-loader'
						) &&
						parseInt(
							mutationRecord.target.attributes.height.value
						) > 0
					) {
						loadingInit();
					} else if (
						mutationRecord.target.classList.contains(
							'cloudimage-360-loader'
						)
					) {
						activationControls(
							mutationRecord.target.attributes.style.value
						);
					}
				});
			}

			let isPlay = {};
			let isPlayProxy = new Proxy(isPlay, {
				set: function (target, key, value) {
					if (key === 'play' && value === true) {
						playBtn.classList.remove('_icon-play3');
						playBtn.classList.add('_icon-pause2');
						triggerMouseEvent(rightBtn, 'mousedown');
					} else if (key === 'play' && value === false) {
						playBtn.classList.add('_icon-play3');
						playBtn.classList.remove('_icon-pause2');
						leftBtn.click();
					}

					target[key] = value;
					return true;
				},
			});

			$('#modal360').on('show.bs.modal', function () {
				if (firstLoad) {
					window.CI360.init();
					firstLoad = false;
					if (autoPlay === 'true') {
						isPlayProxy.play = true;
					}

					target = modal360.querySelector('canvas');
					observer.observe(target, options);
					wait.style.display = 'block';
				} else {
					modal360.addEventListener('click', modalListener, false);
				}
			});

			function modalListener(e) {
				if (e.target.classList.contains('_icon-play3')) {
					isPlayProxy.play = true;
				} else if (e.target.classList.contains('_icon-pause2')) {
					isPlayProxy.play = false;
				} else if (
					e.target.classList.contains('show') &&
					playBtn.classList.contains('_icon-pause2')
				) {
					isPlayProxy.play = false;
					triggerMouseEvent(leftBtn, 'mousedown');
					triggerMouseEvent(leftBtn, 'mouseup');
				} else if (isPlayProxy.play === true) {
					isPlayProxy.play = false;
				}
			}

			$('#modal360').on('hidden.bs.modal', function () {
				isPlayProxy.play = false;
				modal360.removeEventListener('click', modalListener, false);
			});
		}

		function triggerMouseEvent(node, eventType) {
			let clickEvent = document.createEvent('MouseEvents');
			clickEvent.initEvent(eventType, true, true);
			node.dispatchEvent(clickEvent);
		}

		// remove on user personal page
		let removeUserPage = document.querySelectorAll('.connect__remove-item');
		if (removeUserPage.length > 0) {
			let removeModal = document.getElementById('removeModal');
			removeUserPage.forEach((i) => {
				i.addEventListener('click', (e) => {
					// let current = e.currentTarget;
					// if (current.classList.contains('remove-account')) {
					// 	removeModal.classList.add('account');
					// } else if (current.classList.contains('remove-card')) {
					// 	removeModal.classList.add('card');
					// }
					$(removeModal).modal();
				});
			});
		}

		//payment card
		let addPayCard = document.querySelector('.add-pay-card');
		if (addPayCard) {
			let payCardNumber = document.querySelector('.pay-card-number');
			payCardNumber.addEventListener('input', (e) => {
				payCardNumber.value = payCardNumber.value.replace(
					/[^0-9]/g,
					''
				);
			});

			let showCard = document.querySelector('.show__card-container');
			let addCard = document.querySelector('.add__card-container');
			addPayCard.addEventListener('click', () => {
				addCard.style.display = 'block';
				showCard.style.display = 'none';
			});

			let closeAddCard = document.querySelectorAll('.close-add-card');
			closeAddCard.forEach((i) => {
				i.addEventListener('click', () => {
					addCard.style.display = 'none';
					showCard.style.display = 'block';
				});
			});
		}

		//hide text in universal modal
		$('#universalModal').on('hidden.bs.modal', function () {
			let sizeText = document.querySelector('.importantSizeModal');
			let favoriteText = document.querySelector('.favoriteModal');

			if (sizeText) {
				sizeText.style.display = 'none';
			}

			if (favoriteText) {
				favoriteText.style.display = 'none';
			}
		});

		//add compare size
		let sizesForCompare = document.querySelectorAll(
			'.card__description-size'
		);
		if (sizesForCompare.length > 0) {
			sizesForCompare.forEach((i) => {
				i.addEventListener('click', sizesCompareListener, false);
			});

			function sizesCompareListener(e) {
				let activeItem = document.querySelector(
					'.card__description-size.active-compare'
				);
				if (activeItem) activeItem.classList.remove('active-compare');
				this.classList.add('active-compare');
			}
		}
	})();
};
