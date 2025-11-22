(_ => {
	if (
		!/https?:\/\/manmanlai-online\.ru\/user\/control\/user\/update\/id\/\d+/
			.test(window?.location?.href ?? ``)
	) {
		return
	}

	makeButton()

	function handleErr(err) {
		alert(`Ошибка в виджете Talk-Me:\n${err}`)
		throw (err)
	}

	function getUrl(clientQuery) {
		return fetch(
			`http://127.0.0.1:8080/?url=${
				encodeURIComponent(
					`https://lcab.talk-me.ru/json/v1.0/chat/client/search`
				)
			}`,
			{
				method: 'POST',
				headers: {
					'X-Token': `o6i6bj2tr9l6fbbb2njppu2mhnbsjwiun4vizlbk5pt17hod5dopdbdfv6malioc`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(clientQuery)
			}
		)
			.then(response => {
				console.log(response)
				return response.json()
			})
			.then(
				data => {
					console.log(data)
					return data
						?.result
						?.clients
						?.find(
							client =>
								client
									?.[`applicationLink`] != null
						)
						?.[`applicationLink`]
				}
			)
			.catch(handleErr)
	}

	function makeQuery() {
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

		throw ("Can't find phone or email")
	}

	function makeButton() {
		let block = document.querySelector(".user-info")
		if (block == null) {
			console.warn("Block not found")
			return
		}

		let talkMeButton = document.createElement('div')
		talkMeButton.style.backgroundColor = `lightseagreen`
		talkMeButton.style.borderRadius = `24px`
		talkMeButton.style.width = `100%`
		talkMeButton.style.height = `60px`
		talkMeButton.style.display = `flex`
		talkMeButton.style.gap = `16px`
		talkMeButton.style.justifyContent = `center`
		talkMeButton.style.justifyItems = `center`
		talkMeButton.style.alignItems = `center`
		talkMeButton.style.cursor = 'pointer'

		talkMeButton.addEventListener(
			`click`,
			_ =>
				getUrl(
					makeQuery()
				)
					.then(
						url => window.open(url)
					)
					.catch(handleErr)
		)
		talkMeButton.addEventListener(
			`mouseenter`,
			_ =>
				talkMeButton
					.style
					.backgroundColor = `black`
		)

		talkMeButton.addEventListener(
			`mouseleave`,
			_ =>
				talkMeButton
					.style
					.backgroundColor = `lightseagreen`
		)

		let label = document.createElement('p')
		label.style.color = `black`
		label.style.padding = `4px`
		talkMeButton.style.borderRadius = `8px`
		label.style.backgroundColor = `gold`
		label.textContent = "Открыть в Talk-Me"

		let logo = document.createElement('img')
		logo.src = `https://fs.getcourse.ru/fileservice/file/download/a/555832/sc/314/h/ae9e28977fba3a2e8944e952b68acf4e.png`
		logo.style[`width`] = `40px`
		logo.style[`height`] = `40px`

		talkMeButton.append(logo)
		talkMeButton.append(label)


		block.append(talkMeButton)
	}

})()