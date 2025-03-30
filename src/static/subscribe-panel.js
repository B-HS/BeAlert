document.addEventListener('DOMContentLoaded', async () => {
    const keywordInput = document.getElementById('keyword-input')
    const locationContainers = document.querySelectorAll('[data-type]')
    const buttons = []
    let locations = []

    setTimeout(async () => {
        const p256dh = window.__p256dh__

        if (!p256dh) {
            console.error('P256DH key not found.')
            return
        }

        try {
            const res = await fetch(`/locations/${p256dh}`)
            const { locations: fetchedLocations } = await res.json()
            locations = fetchedLocations
        } catch (e) {
            console.error('Failed to load locations', e)
        }

        locationContainers.forEach((container) => {
            container.querySelectorAll('button').forEach((btn) => {
                const name = btn.dataset.name
                if (locations.includes(name)) {
                    btn.classList.add('font-extrabold')
                }

                btn.addEventListener('click', async () => {
                    const isSubscribed = locations.includes(name)
                    const method = isSubscribed ? 'DELETE' : 'POST'
                    const url = isSubscribed ? `/location/${p256dh}/${name}` : `/location`
                    const options = {
                        method,
                        headers: { 'Content-Type': 'application/json' },
                    }
                    if (!isSubscribed) {
                        options.body = JSON.stringify({ p256dh, location: name })
                    }

                    try {
                        const res = await fetch(url, options)
                        const { code, message } = await res.json()

                        if (code !== 200) {
                            throw new Error(message)
                        }

                        if (isSubscribed) {
                            locations = locations.filter((loc) => loc !== name)
                            btn.classList.remove('font-extrabold')
                        } else {
                            locations.push(name)
                            btn.classList.add('font-extrabold')
                        }
                    } catch (e) {
                        console.error('Failed to update location', e)
                    }
                })

                buttons.push(btn)
            })
        })

        keywordInput.addEventListener('input', (e) => {
            const keyword = e.target.value.trim().toLowerCase()

            buttons.forEach((btn) => {
                const btnName = btn.dataset.name.toLowerCase()
                const matches = btnName.includes(keyword)
                btn.style.display = keyword ? (matches ? 'inline-block' : 'none') : 'inline-block'
            })
        })
    }, 300)
})
