const mobDetector = new MobileDetect(window.navigator.userAgent);
function isIpad() {
	const ua = window.navigator.userAgent;
	if (ua.indexOf("iPad") > -1) {
		return true;
	}

	if (ua.indexOf("Macintosh") > -1) {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {}
	}

	return false;
}
function Game(opt) {
	this.hero = opt.hero;
	this.inventory = opt.inventory;
	this.activeItem = null;
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.faceImg = document.querySelector(".face img");
	this.name = opt.name;

	if (!this.name) {
		this.name = "My friend";
	}
	this.logMessages = {
		msg0: "Hola," + " I'm Catalonian Christmas log...",
		msg1: "I'm part of some unique Christmas traditions",
		msg2: "What you have there...",
		msg3: "A hat, some candy, blanket...nice!",
		capOn: "Tnx for the cap... What you have there, some candy",
		candy: "that was nice... I'm tired now. Can I have a blanky",
		stick: "Oh no... what you have there... a stick... put it back please",
		sleepy: "ZZZZ",
		finishTxt: "Ups... I made a mess under my blanket.",
	};
	this.gameStates = {
		placeHat: false,
		putBlanket: false,
		feedCandy: false,
		beatTheLog: false,
		present: false,
	};
	this.inventoryState = {
		hat: false,
		blanket: false,
		stick: false,
		lolly: false,
		bonBon: false,
		cane: false,
	};

	this.candyFed = 0;
	this.beatingLog = 0;
	// HTML ELEMENTS
	this.sidebar = document.querySelector(".sidebar");
	this.dropPos = document.querySelectorAll(".item_pos");
	this.container = document.querySelector(".container");
	this.cursorElement = document.querySelector(".cursor");
	this.gamePanel = document.querySelector(".game-panel");
	this.mainImage = document.querySelector(".main-img");
	this.textBubble = document.querySelector(".text-bubble");
	this.textBubbleCloseBtn = document.querySelector(".text-bubble .close");
	this.blanketCont = document.querySelector(".blanket");
	this.main = document.querySelector("main");
	this.mainPanel = document.querySelector(".main-panel");
	this.body = document.querySelector("body");
	this.fullScreenBtn = document.querySelectorAll(".fullScreenBtn");
	this.fullScreenReq = document.querySelector(".fullscreenReq");
	this.outroPage = document.querySelector(".outroPage");
	this.logClicks = 0;
	this.allClicks = 0;
	this.containerWidth = this.container.offsetWidth;
	// DIMENSION RESET
	this.leftReset = this.container.offsetLeft;
	this.topReset = this.container.offsetTop;

	this.activeDrop;
	// DEVICE

	// AUDIO SETUP

	this.generalClicks = new Audio("./assets/clickSound.wav");
	// this.generalClicks.volume = 0.7;
	this.placeItem = new Audio("./assets/useItem.wav");
	this.eatCandy = new Audio("./assets/eat.wav");
	// this.eatCandy.volume = 0.5;
	this.burp = new Audio("./assets/burp.wav");
	// this.burp.volume = 0.2;
	this.hitting = new Audio("./assets/hitting.wav");
	this.fart = new Audio("./assets/fart_2.wav");
	this.successSound = new Audio("./assets/success.wav");
	this.pickUp = new Audio("./assets/pickuUpSound.wav");

	this.detectDevice = function () {
		return mobDetector.phone() || mobDetector.mobile() || mobDetector.tablet();
	};
	this.device = this.detectDevice();

	// START GAME
	this.startGame = function () {
		let text = "";
		text += '<div class="thumb inventory" ><p>Inventory</p></div>';

		this.sidebar.innerHTML = text;
		this.hiddenItems();
	};

	// HIDE ITEMS
	this.hiddenItems = function () {
		let inventory = this.inventory;
		for (let prop in inventory) {
			this[prop] = inventory[prop];
			let hiddenProp = document.createElement("img");
			hiddenProp.setAttribute("draggable", false);
			hiddenProp.setAttribute("data-altImg", this[prop].altImg);
			hiddenProp.setAttribute("data-destination", this[prop].destination);
			hiddenProp.setAttribute("data-item", prop);
			hiddenProp.src = `${this[prop].hiddenImg}`;
			hiddenProp.className = `hidden-prop img-${prop}`;
			this.mainPanel.appendChild(hiddenProp);
		}
	};
	// ADD TO INVENTORY
	this.addToInventory = function (item) {
		if (this.successSound.paused) {
			item.classList.add("prop-animate");
			// console.log(this.sidebar.offsetTop, " ", this.sidebar.offsetLeft);

			setTimeout(() => {
				item.classList.remove("hidden-prop");
				let thumb = document.createElement("div");
				thumb.className = "thumb";
				thumb.append(item);
				this.sidebar.appendChild(thumb);
				this.items = document.querySelectorAll(".thumb img");
				this.inventoryStateControl(item);
			}, 600);
			// APPLY EVENT TO DESKTOP
			if (!this.device) {
				this.dragStartHandler = this.dragStart.bind(this);
				this.dragEndHandler = this.dragEnd.bind(this);
				item.addEventListener("mousedown", this.dragStartHandler, false);
				item.addEventListener("mouseup", this.dragEndHandler, false);
			}
			if (this.device || isIpad()) {
				// console.log("Mobile Inventory");
				this.touchStartHandler = this.touchStart.bind(this);
				this.touchEndHandler = this.touchEnd.bind(this);
				item.addEventListener("touchstart", this.touchStartHandler, false);
				item.addEventListener("touchend", this.touchEndHandler, false);
			}
		} else {
			this.successSound.pause();
			this.successSound.currentTIme = 0;
		}

		this.successSound.play();
	};

	this.inventoryStateControl = function (item) {
		let itemName = item.getAttribute("data-item");
		this.inventoryState[itemName] = true;
		// console.log(this.inventoryState);
	};

	// DRAGGING EVENTS
	this.dragStart = function (ev) {
		// console.log(ev.target, " DRAG START");
		if (!this.device) {
			this.moveHandler = this.moveItem.bind(this);
			this.releaseHandler = this.dropItem.bind(this);
		}
		ev.target.classList.add("dragging");
		this.activeItem = {
			img: ev.target.src,
			dest: ev.target.getAttribute("data-destination"),
			name: ev.target.getAttribute("data-item"),
			altImg: ev.target.getAttribute("data-altImg"),
		};
		this.createCursor(ev);

		this.body.addEventListener("mousemove", this.moveHandler);
		this.body.addEventListener("mouseup", this.releaseHandler);
	};

	this.dragEnd = function (ev) {};

	// MOBILE GAME

	this.touchStart = function (ev) {
		ev.preventDefault();

		// console.log("start");
		this.touchMoveHandler = this.touchMove.bind(this);
		this.container.addEventListener("touchmove", this.touchMoveHandler);
		ev.target.classList.add("dragging");
		this.activeItem = {
			img: ev.target.src,
			dest: ev.target.getAttribute("data-destination"),
			name: ev.target.getAttribute("data-item"),
			altImg: ev.target.getAttribute("data-altImg"),
		};
		// console.log(this.activeItem);
		this.createCursor(ev.touches[0]);
		this.pickUp.play();
	};
	this.touchEnd = function (ev) {
		ev.preventDefault();

		this.container.removeEventListener("touchmove", this.touchMoveHandler);
		let touch = ev.changedTouches[0];
		ev.target.classList.remove("dragging");
		final = document.elementFromPoint(touch.pageX, touch.pageY);
		if (this.checkItem(ev, final)) {
			this.dropMobileItem(ev, final);
			return;
		}
		this.dropItem(ev);
	};

	this.touchMove = function (ev) {
		ev.preventDefault();
		this.moveItem(ev.touches[0]);
	};

	// DROP ITEM
	this.dropItem = function (ev) {
		console.log(ev, "DROP ITEM");
		this.cursorElement.classList.remove("active");
		this.cursorElement.innerHTML = "";
		let currentItm = document.querySelector(
			`[data-item="${this.activeItem.name}"]`
		);
		currentItm.classList.remove("dragging");
		this.body.removeEventListener("mousemove", this.moveHandler);
		this.body.removeEventListener("mouseup", this.releaseHandler);
		if (this.checkItem(ev)) {
			currentItm.parentElement.classList.add("hide");
			setTimeout(() => {
				currentItm.parentElement.remove();
			}, 450);
		}
	};

	this.dropMobileItem = function (ev, target) {
		this.cursorElement.classList.remove("active");
		this.cursorElement.innerHTML = "";
		let currentItm = document.querySelector(
			`[data-item="${this.activeItem.name}"]`
		);
		currentItm.classList.remove("dragging");

		this.removeFromMobileInventory();
	};
	this.removeFromMobileInventory = function () {
		console.log("ACTIVE ITEM", this.activeItem);
		let currentItem = document.querySelector(
			`[data-item="${this.activeItem.name}"]`
		);
		currentItem.parentElement.classList.add("hide");
		setTimeout(() => {
			currentItem.parentElement.remove();
		}, 450);
		console.log("Current Item", currentItem);
	};

	// CURSOR ELEMENT
	this.createCursor = function (ev) {
		this.newDims = this.resizing();
		// console.log(this.newDims);
		let img = document.createElement("img");
		img.src = this.activeItem.img;
		img.alt = " ";
		this.cursorElement.appendChild(img);
		this.cursorElement.classList.add("active");

		this.cursorElement.style.left = ev.clientX - this.newDims.left + "px";
		this.cursorElement.style.top = ev.clientY - this.newDims.top + "px";

		// this.cursorElement.style.left = ev.clientX - this.leftReset + "px";
		// this.cursorElement.style.top = ev.clientY - this.topReset + "px";
		// console.log(this.leftReset, "  ", this.newDims.left);
	};
	this.moveItem = function (ev) {
		console.log("MOVING", this.newDims.top);
		this.cursorElement.style.left = ev.clientX - this.newDims.left + "px";
		this.cursorElement.style.top = ev.clientY - this.newDims.top + "px";
	};

	this.resizing = function () {
		return {
			width: this.container.offsetWidth,
			top: this.container.offsetTop,
			left: this.container.offsetLeft,
		};
	};

	// CHECK ITEM
	this.checkItem = function (ev, final) {
		let img;
		if (this.activeItem.altImg === "false") {
			img = this.activeItem.img;
		} else {
			img = this.activeItem.altImg;
		}
		if (final) {
			return this.gameControl(ev, img, final);
		}
		return this.gameControl(ev, img);
	};
	// GAME CONTROL DESKTOP
	this.gameControl = function (ev, img, final) {
		let target;
		if (!final) {
			target = ev.target;
		} else {
			target = final;
		}
		console.log(this.gameStates);

		if (
			!this.gameStates.placeHat &&
			target.tagName !== "IMG" &&
			this.activeItem.name === "hat" &&
			target.getAttribute("data-item") === "hat"
		) {
			let elemImg = document.createElement("img");
			elemImg.src = img;
			elemImg.alt = " ";
			target.appendChild(elemImg);
			this.gameStates.placeHat = true;
			this.placeItem.play();
			// this.logSpeak(this.logMessages.capOn);
			this.inventoryState.hat = false;
			return true;
		}

		if (
			this.gameStates.placeHat &&
			!this.gameStates.feedCandy &&
			target.getAttribute("data-item") === "mouth" &&
			this.activeItem.dest === "mouth" &&
			this.candyFed !== 5
		) {
			this.candyFed++;

			this.checkCandy(ev.target);
			this.placeItem.play();
			this.inventoryState[this.activeItem.name] = false;
			return true;
		}
		if (
			this.gameStates.feedCandy &&
			target.tagName !== "IMG" &&
			this.activeItem.name === target.getAttribute("data-item")
		) {
			let elemImg = document.createElement("img");
			elemImg.src = img;
			elemImg.alt = " ";
			elemImg.className = "active-blanket";
			target.appendChild(elemImg);
			console.log(target.tagName);
			console.log("OBUCI CEBE");
			this.gameStates.putBlanket = true;
			this.placeItem.play();
			this.faceImg.src = "./assets/sleepyFace.png";
			// this.logSpeak(this.logMessages.sleepy);
			this.inventoryState[this.activeItem.name] = false;
			return true;
		}
		if (
			this.gameStates.putBlanket &&
			this.activeItem.name === "stick" &&
			target.className === "active-blanket"
		) {
			// console.log("TUCEM GA");
			// this.logSpeak(this.logMessages.stick);
			// return true;

			this.createBeatingUI();
		}
	};

	// CHECK CaNDY
	this.checkCandy = function (target) {
		console.log("HRANIM");
		if (this.candyFed === 3) {
			// console.log("NAHRANIO SAM DRVO");
			this.gameStates.feedCandy = true;
			target.style.pointerEvents = "none";
			this.eatCandy.play();
			this.sidebar.classList.remove("show");
			setTimeout(() => {
				this.burp.play();
				// this.logSpeak(this.logMessages.candy);
			}, 900);

			return;
		}

		this.eatCandy.play();
	};

	// CREATE BEATING UI FOR STICK
	this.createBeatingUI = function (mob) {
		// console.log(mob, "UI");
		this.beatingUI = document.createElement("div");
		this.beatingUI.className = "beatingUi";

		this.beatingUI.innerHTML = `
		<div div class="close_stick">X</div><div class="stick-wrapper"> <img alt="" src="${this.activeItem.img}"/></div> <div class="btns"> 
		
		<button id="stickBtn">Hit the log</button></div> </div>`;
		this.gamePanel.appendChild(this.beatingUI);
		this.stickBtn = document.querySelector("#stickBtn");
		this.stickImg = document.querySelector(".stick-wrapper img");
		this.closeStick = document.querySelector(".close_stick");
		this.stickBtn.addEventListener("click", () => {
			this.swingStick(mob);
		});
		this.closeStick.addEventListener("click", this.dropStick.bind(this));
		// console.log(this.activeItem.name);
	};

	// STICK FUNCTIONS
	this.dropStick = function () {
		this.beatingUI.remove();
	};

	this.removeItem = function () {
		let currentItm = document.querySelector(
			`[data-item="${this.activeItem.name}"]`
		);
		currentItm.classList.remove("dragging");
		setTimeout(() => {
			currentItm.parentElement.remove();
		}, 450);
		this.activeItem = null;
	};

	this.clearAnimation = function () {
		this.stickImg.style.animation = "";
	};
	this.swingStick = function (mob) {
		if (!mob) {
			mob = null;
		}
		this.beatingLog++;
		this.stickImg.style.animation = " stickBeat 0.5s ease-in-out  1 both";
		this.stickImg.addEventListener(
			"animationend",
			this.clearAnimation.bind(this)
		);
		this.hitting.play();

		if (this.beatingLog >= 2) {
			this.faceImg.src = "./assets/besna faca 1.png";
		}
		if (this.beatingLog >= 3) {
			this.faceImg.src = "./assets/besna faca 2.png";
		}
		if (this.beatingLog >= 4) {
			this.faceImg.src = "./assets/besna faca 3.png";
		}
		if (this.beatingLog > 5) {
			let fartAnim = document.createElement("div");
			fartAnim.className = "fart";

			this.blanketCont.appendChild(fartAnim);
			// this.fart.volume = 0.6;
			this.hitting.play();
			this.inventoryState[this.activeItem.name] = false;
			setTimeout(() => {
				fartAnim.classList.add("farting");
				this.fart.play();
				this.faceImg.src = "./assets/face_1.png";
			}, 600);
			fartAnim.classList.remove("farting");

			setTimeout(() => {
				this.dropPos[1].style.pointerEvents = "all";
			}, 1800);
			if (!mob) {
				this.beatingUI.remove();
				this.removeItem();
				this.gameStates.beatTheLog = true;
				return;
			}
			this.inventoryState[this.activeItem.name] = false;
			this.beatingUI.remove();
			// this.removeMobileInventory();
			this.dropMovedItem();
			this.gameStates.beatTheLog = true;
			return;
		}
	};

	// MANAGE CLICKS

	this.manageClicks = function (e) {
		console.log(this.activeItem);
		if (
			e.target.id !== "stickBtn" &&
			!e.target.classList.contains("hidden-prop")
		)
			this.generalClicks.play();
		if (e.target.classList.contains("hidden-prop")) {
			// DODAVANJE ITEMA U INVENTAR
			this.addToInventory(e.target);
		}
		if (
			e.target.parentElement.classList.contains("blanket") &&
			this.gameStates.beatTheLog &&
			!this.gameStates.present
		) {
			this.blanketCont.innerHTML =
				'<img alt="" src="./assets/present.png" class="present"/>';
			this.gameStates.present = true;
			return;
		}
		if (this.gameStates.present && e.target.classList.contains("present")) {
			this.successSound.play();

			if (this.container.classList.contains("fullscreen")) {
				document.exitFullscreen();
				screen.orientation.unlock();
			}
			e.target.src = "./assets/present_opened.png";
			e.target.setAttribute("data-opened", "opened");

			// setTimeout(() => {
			// 	this.outroPage.classList.remove("hide");
			// }, 1200);
			console.log("GOTOVO", window.location);
		}
	};

	this.detectOrientationChange = function () {
		console.log(screen.orientation.type);
	};

	this.clickManager = this.manageClicks.bind(this);
	this.events = function () {
		console.log("DESKTOP");

		window.addEventListener("resize", this.resizing.bind(this));
		this.container.removeEventListener("touchstart", this.clickManager);
		this.container.addEventListener("mousedown", this.clickManager);
	};
	this.touchEvent = function () {
		console.log("TOUCH");
		let body = document.querySelector("body");

		body.addEventListener(
			"touchmove",
			(ev) => {
				ev.preventDefault();
				ev.stopImmediatePropagation();
			},
			{ passive: false }
		);

		console.log("TOUCHES");

		this.container.removeEventListener("mousedown", this.clickManager);
		this.container.addEventListener("click", this.clickManager);
	};
	// #END REGION
}
