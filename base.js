let bossCounter,
	bossCount = 0,
	allBossCounter,
	allBossCount = 0;
bossCounter = document.getElementById("boss_counter");
allBossCounter = document.getElementById("all_boss_counter");

let minibossCounter,
	minibossCount = 0,
	allMiniBossCounter,
	allMiniBossCount = 0;
minibossCounter = document.getElementById("miniboss_counter");
allMiniBossCounter = document.getElementById("all_miniboss_counter");

document.addEventListener("DOMContentLoaded", () => {
	const guide = parseMarkdownToGuide(markdown);

	const listSection = document.getElementById("list_1");

	const savedCheckedStates = JSON.parse(localStorage.getItem("checkedStates")) || {};
	const savedDisplayStates = JSON.parse(localStorage.getItem("displayStates")) || {};

	for (const [title, items] of Object.entries(guide)) {
		const titleId = title.replace(/\s+/g, "_");

		const a = document.createElement("a");
		a.textContent = title;
		a.id = titleId + "-h";
		a.href = "#" + titleId + "-h";
		a.className = "list-header";

		const counterSpan = document.createElement("span");
		counterSpan.className = "item-counter";
		updateCounter(counterSpan, items, savedCheckedStates, titleId);

		listSection.appendChild(a);
		a.appendChild(counterSpan);

		const ul = document.createElement("ul");
		ul.style.display = savedDisplayStates[titleId] ? "block" : "none";
		ul.id = titleId;
		ul.className = "list-unordered";

		if (savedDisplayStates[titleId]) {
			a.className = "list-header-sticky";
		}

		items.forEach((item, index) => {
			const li = document.createElement("li");
			li.className = "list-item";

			const check = document.createElement("input");
			check.type = "checkbox";
			const checkboxId = `${titleId}_${index + 1}`;
			check.id = checkboxId;
			check.checked = savedCheckedStates[checkboxId] || false;
			check.className = "list-checkbox";

			const label = document.createElement("label");
			label.htmlFor = checkboxId;
			label.innerText = item;
			label.className = "list-label";

			if (check.checked) {
				label.className = "list-label-checked";
			}

			const bossCountCheck = fetchBossCount(item);

			check.addEventListener("change", () => {
				savedCheckedStates[checkboxId] = check.checked;
				localStorage.setItem("checkedStates", JSON.stringify(savedCheckedStates));
				label.className = check.checked ? "list-label-checked" : "list-label";

				if (bossCountCheck.BOSS.length) {
					if (check.checked) {
						bossCount += bossCountCheck.BOSS.length;
						bossCounter.innerText = bossCount;
					} else {
						bossCount -= bossCountCheck.BOSS.length;
						bossCounter.innerText = bossCount;
					}
				}

				if (bossCountCheck.MINIBOSS.length) {
					if (check.checked) {
						minibossCount += bossCountCheck.MINIBOSS.length;
						minibossCounter.innerText = minibossCount;
					} else {
						minibossCount -= bossCountCheck.MINIBOSS.length;
						minibossCounter.innerText = minibossCount;
					}
				}

				updateCounter(counterSpan, items, savedCheckedStates, titleId);
			});

			if (bossCountCheck.BOSS.length) {
				if (check.checked) {
					bossCount += bossCountCheck.BOSS.length;
					bossCounter.innerText = bossCount;
				}

				allBossCount += bossCountCheck.BOSS.length;
				allBossCounter.innerText = allBossCount;
			}

			if (bossCountCheck.MINIBOSS.length) {
				if (check.checked) {
					minibossCount += bossCountCheck.MINIBOSS.length;
					minibossCounter.innerText = minibossCount;
				}

				allMiniBossCount += bossCountCheck.MINIBOSS.length;
				allMiniBossCounter.innerText = allMiniBossCount;
			}

			li.appendChild(check);
			li.appendChild(label);
			ul.appendChild(li);
		});

		listSection.appendChild(ul);

		a.addEventListener("click", () => {
			if (ul.style.display === "none") {
				ul.style.display = "block";
				savedDisplayStates[titleId] = true;
				a.className = "list-header-sticky";
			} else {
				ul.style.display = "none";
				savedDisplayStates[titleId] = false;
				a.className = "list-header";
			}
			localStorage.setItem("displayStates", JSON.stringify(savedDisplayStates));
		});
	}
});

function fetchBossCount(text) {
	const bossRegex = /\sBOSS\s(\d+)/g;
	const minibossRegex = /\sMINIBOSS\s(\d+)/g;
	let bossNumbers = [];
	let minibossNumbers = [];
	let match;

	while ((match = bossRegex.exec(text)) !== null) {
		bossNumbers.push(parseInt(match[1]));
	}

	while ((match = minibossRegex.exec(text)) !== null) {
		minibossNumbers.push(parseInt(match[1]));
	}

	return {
		BOSS: bossNumbers,
		MINIBOSS: minibossNumbers,
	};
}

function parseMarkdownToGuide(markdown) {
	const sections = markdown.split(/### /).slice(1);
	const guide = {};

	sections.forEach((section) => {
		const [title, ...steps] = section.split("\n").filter((line) => line.trim() !== "");
		guide[title.trim()] = steps.map((step) => step.replace(/^- /, "").trim());
	});

	return guide;
}

function updateCounter(counterSpan, items, savedCheckedStates, titleId) {
	const completedCount = items.reduce((count, _, index) => {
		const checkboxId = `${titleId}_${index + 1}`;
		return count + (savedCheckedStates[checkboxId] ? 1 : 0);
	}, 0);
	counterSpan.innerText = ` (${completedCount}/${items.length})`;
}
