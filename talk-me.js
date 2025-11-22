(async _ => {
	if (
		!/https?:\/\/manmanlai-online\.ru\/user\/control\/user\/update\/id\/\d+/
			.test(window?.location?.href ?? ``)
	) {
		return
	}

	function waitForElement(selector) {
		return new Promise(resolve => {
			if (document.querySelector(selector)) {
				return resolve(document.querySelector(selector));
			}

			const observer = new MutationObserver(mutations => {
				if (document.querySelector(selector)) {
					observer.disconnect();
					resolve(document.querySelector(selector));
				}
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true
			});
		});
	}

	waitForElement('.user-info')
		.then(
			_ => {
				getTalkMeUrl(
					makeUserQuery()
				).then(addButton)
			}
		)

	async function getTalkMeUrl(userQuery) {
		if (userQuery == null) {
			return null
		}

		try {
			let res
			res = await fetch(
				`https://193.124.114.5:8080/?mars=${atob(`d2VhcmVnb2luZ3RvbWFycw==`)}&url=${
					encodeURIComponent(
						`https://lcab.talk-me.ru/json/v1.0/chat/client/search`
					)
				}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(userQuery)
				}
			)
			res = await res.json()
			return res
				?.[`result`]
				?.clients
				?.find(
					client =>
						client
							?.[`applicationLink`] != null
				)
				?.[`applicationLink`]
		} catch (err) {
			console.error("Ошибка при получении запроса от Talk-Me:")
			console.error(err)
			return null
		}
	}

	function addButton(url) {
		let block = document.querySelector(".user-info")
		if (block == null) {
			console.error("Не удалось найти блок с информацией о пользователе.")
			return
		}

		let button = document.createElement(`button`)
		button.classList.add(`talk-me-button`)

		let logo = document.createElement(`img`)
		logo.src = `https://fs.getcourse.ru/fileservice/file/download/a/555832/sc/314/h/ae9e28977fba3a2e8944e952b68acf4e.png`
		logo.classList.add(`talk-me-logo`)


		let label = document.createElement(`span`)
		label.textContent = `Открыть чат в Talk-Me`
		label.classList.add(`talk-me-label`)

		button.appendChild(logo)
		button.appendChild(label)

		if (url == null) {
			[button, logo, label].forEach(el => el.classList.add(`talk-me-disabled`))
			return
		}

		let loadingSpinner = document.createElement(`div`)
		loadingSpinner.classList.add(`talk-me-loading-spinner`)

		button.addEventListener(
			`click`,
			_ => {
				button.removeChild(logo)
				button.removeChild(label)
				button.appendChild(loadingSpinner)
				window.open(url)

				setTimeout(
					_ => {
						button.appendChild(logo)
						button.appendChild(label)
						button.removeChild(loadingSpinner)
					},
					10000
				)
			}
		)
	}

	function makeUserQuery() {
		let phone = document
			.querySelector('[name="User[phone]"]')
			?.value

		let email = Array.from(
			document
				.querySelector(`.user-email`)
				?.children ?? []
		)
			.find(
				child => /@/.test(child.textContent)
			)
			?.textContent
			?.trim()

		if (phone != null) {
			return {phone}
		}

		if (email != null) {
			return {email}
		}

		console.error("Не удалось найти почту или номер телефона.")
	}
})()

