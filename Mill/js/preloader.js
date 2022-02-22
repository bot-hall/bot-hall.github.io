let timer;

document.addEventListener('readystatechange', () => {
	if (document.readyState == 'interactive') {
		document.querySelector('body').style.overflow = 'hidden';
		timer = setTimeout(() => {
			let mainPreloader = document.getElementById('mainPreloader');
			mainPreloader.classList.add('loading-animation');
		}, 3600);
	}
});

window.addEventListener('load', preloaderHide);

function preloaderHide() {
	clearTimeout(timer);
	setTimeout(() => {
		setTimeout(
			() => (document.querySelector('body').style.overflow = 'auto'),
			800
		);
		let mainPreloader = document.getElementById('mainPreloader');
		mainPreloader.classList.add('done');
		document.cookie = 'firstLoad=true';
		sessionStorage.setItem('firstLoad', true);
	}, 3300);
}
