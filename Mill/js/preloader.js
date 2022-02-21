let timer;

document.addEventListener('readystatechange', () => {
	if (document.readyState == 'interactive') {
		timer = setTimeout(() => {
			let mainPreloader = document.getElementById('mainPreloader');
			mainPreloader.classList.add('loading-animation');
		}, 3600);
	}
});

window.addEventListener('load', preloaderHide);

function preloaderHide() {
	clearInterval(timer);
	setTimeout(() => {
		let mainPreloader = document.getElementById('mainPreloader');
		mainPreloader.classList.add('done');
		// // document.cookie = 'firstLoad=true';
		// // sessionStorage.setItem('firstLoad', true);
	}, 3300);
}
