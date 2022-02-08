let interval;

document.addEventListener('readystatechange', () => {
	if (document.readyState == 'interactive') {
		interval = setTimeout(() => {
			let loader = document.querySelector('.loader');
			loader.classList.add('show-loader');
		}, 3500);
	}
});

window.addEventListener('load', preloaderHide);

function preloaderHide() {
	clearInterval(interval);

	setTimeout(() => {
		let nuotSvg = document.querySelector('.nuot-loader-svg');
		nuotSvg.classList.add('loader-hide');

		let loader = document.querySelector('.loader');
		loader.classList.add('loader-hide');

		let mainPreloader = document.getElementById('mainPreloader');
		mainPreloader.classList.add('done');

		document.cookie = 'firstLoad=true';
		sessionStorage.setItem('firstLoad', true);
	}, 3300);
}
