let inventory_drop = document.querySelector(".drop_menu");
let inventory = document.querySelector(".sidebar");
let gamePanel = document.querySelector(".game-panel");
let container = document.querySelector(".container");
let main = document.querySelector("main");
let body = document.querySelector("body");
let startBtn = document.querySelector("#startBtn");
let introBg = document.querySelector(".introPage");

inventory_drop.addEventListener("click", () => {
	inventory.classList.toggle("show");
});

let fullScreenPage = document.querySelector(".fullscreenReq");
let fullScreenBtn = document.querySelectorAll(".fullScreenBtn");

const urlParams = new URLSearchParams(window.location.search);
const myParam = urlParams.get("myParam");
function getParameterByName(name, url = window.location.href) {
	name = name.replace(/[\[\]]/g, "\\$&");
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return "";
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}
let opt = {
	hero: "./assets/log.png",
	inventory: {
		hat: {
			img: "./assets/hat.png",
			destination: "hat",
			altImg: false,
			hiddenImg: "./assets/hat.png",
		},
		stick: {
			img: "./assets/stick.png",
			destination: "log",
			altImg: "",
			hiddenImg: "./assets/stick.png",
		},
		blanket: {
			img: "./assets/blanket_thumb.png",
			destination: "blanket",
			altImg: "./assets/blanket2.png",
			hiddenImg: "./assets/blanket_thumb.png",
		},
		lolly: {
			img: "./assets/lolly.png",
			destination: "mouth",
			altImg: "",
			hiddenImg: "./assets/lolly.png",
		},

		bonBon: {
			img: "./assets/bonbon.png",
			destination: "mouth",
			altImg: "",
			hiddenImg: "./assets/bonbon.png",
		},
		cane: {
			img: "./assets/cane.png",
			destination: "mouth",
			altImg: "",
			hiddenImg: "./assets/cane.png",
		},
	},
	name: getParameterByName("name"),
};

let game = new Game(opt);

window.addEventListener("resize", resizeWin, true);
let winWidth = window.innerWidth;
let winHeight = window.innerHeight;
function deviceDetect() {
	return mobDetector.phone() || mobDetector.mobile() || mobDetector.tablet();
}

function resizeWin() {
	winWidth = window.innerWidth;
	winHeight = window.innerHeight;
}

let detectDevice = deviceDetect();

function setWindowSize() {
	winHeight = window.innerHeight;
	winWidth = window.innerWidth;

	if (!detectDevice && !isIpad()) {
		if (!mobDetector.tablet()) {
			fullScreenBtn.forEach((btn) => {
				btn.remove();
			});
		}

		game.startGame();
		setTimeout(() => {
			game.events();
		}, 500);
	} else if (detectDevice === "iPhone" || isIpad()) {
		if (isIpad()) {
			container.classList.add("iPad");
			gamePanel.classList.add("iPad");
			main.classList.add("iPad");
			game.startGame();
			setTimeout(() => {
				game.touchEvent();
			}, 500);
			return;
		}
		if (detectDevice === "iPhone") {
			container.classList.add("iPhone");
			gamePanel.classList.add("iPhone");
			main.classList.add("iPhone");
			if (window.innerHeight > window.innerWidth) {
				console.log("Portarit");
				container.classList.add("portrait");
				gamePanel.classList.add("portrait");
				main.classList.add("portrait");
			} else {
				container.classList.add("landscape");
				gamePanel.classList.add("landscape");
				main.classList.add("landscape");
				console.log("landscape");
			}
			container.classList.add(`iPhone`);
		}
		game.startGame();
		setTimeout(() => {
			game.touchEvent();
		}, 500);
		return;
	} else if (
		(detectDevice !== "iPhone" && !isIpad()) ||
		detectDevice.tablet()
	) {
		console.log(detectDevice);

		startBtn.classList.add("hide");
		fullScreenBtn.forEach((btn) => {
			if (btn.classList.contains("hide")) {
				btn.classList.remove("hide");
			}
		});
		fullScreenRequest();
		game.startGame();
		setTimeout(() => {
			game.touchEvent();
		}, 500);
		return;
	}
}

function fullScreenRequest() {
	console.log("HELLO");
	container.classList.add("fullscreen");
	gamePanel.classList.add("fullscreen");
	console.log("REQUEST FULL SCREEN");
	console.log(fullScreenBtn);
	fullScreenBtn.forEach((btn) => {
		btn.addEventListener("click", toggleFullScreen);
	});
}

function toggleFullScreen() {
	if (!getFullScreenElement()) {
		container.requestFullscreen().catch((err) => {
			console.log(err);
		});
		screen.orientation.lock("landscape");
		introStart();
		console.log("USAO SAM U FS");
	} else {
		document.exitFullscreen();
		screen.orientation.unlock();
		console.log("IZASAO SAM IZ FS");
		introStart();
	}
}

function getFullScreenElement() {
	return (
		document.fullscreenElement ||
		document.webkitFullscreenElement ||
		document.mozFullscreenElement ||
		document.msFullscreenElement
	);
}

setWindowSize();

let portrait = window.matchMedia("(orientation: portrait)");

// portrait.addEventListener("change", function (e) {
// 	if (detectDevice && detectDevice === "iPhone") {
// 		if (e.matches) {
// 			console.log("PORTRAIT");
// 			container.style.border = "2px solid red";
// 			container.classList.add("portrait");
// 			gamePanel.classList.add("portrait");
// 			main.classList.add("portrait");
// 			container.classList.remove("landscape");
// 			gamePanel.classList.remove("landscape");
// 			main.classList.remove("landscape");
// 		} else {
// 			// Landscape

// 			container.style.border = "2px solid green";
// 			console.log("LANDSCAPE");
// 			container.classList.remove("portrait");
// 			gamePanel.classList.remove("portrait");
// 			main.classList.remove("portrait");
// 			container.classList.add("landscape");
// 			gamePanel.classList.add("landscape");
// 			main.classList.add("landscape");
// 		}
// 	}
// });

// INTRO

startBtn.addEventListener("click", introStart);
function introStart() {
	startBtn.style.display = "none";
	introBg.classList.toggle("hide");

	fullScreenBtn.forEach((btn) => {
		if (btn.classList.contains("hide")) {
			btn.classList.toggle("hide");
		}
	});
	// this.removeEventListener("click", introStart);
	if (introBg.classList.contains("hide")) {
		setTimeout(() => {
			introBg.classList.add("remove");
		}, 1200);
	} else {
		introBg.classList.remove("remove");
	}
}
