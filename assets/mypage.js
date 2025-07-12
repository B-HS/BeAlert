document.addEventListener('DOMContentLoaded', () => {
    const area1Select = document.getElementById('area1')
    const area2Select = document.getElementById('area2')
    const area3Select = document.getElementById('area3')
    const addFavoriteBtn = document.getElementById('addFavoriteBtn')
    const favoritesList = document.getElementById('favoritesList')

    if (!area1Select || !area2Select || !area3Select || !addFavoriteBtn || !favoritesList) {
        return
    }

    let locations = []
    let favorites = []

    const loadFavorites = async () => {
        const subscriptionId = window.__p256dh__
        if (!subscriptionId) {
            console.log('구독 정보가 없습니다.')
            favorites = []
            renderFavorites()
            return
        }

        try {
            const res = await fetch(`/api/subscribe/keywords/${subscriptionId}`)
            if (res.ok) {
                const data = await res.json()
                favorites = data.keywords
                renderFavorites()
            } else {
                favorites = []
                renderFavorites()
            }
        } catch (error) {
            console.error('즐겨찾기 로딩 실패:', error)
            favorites = []
            renderFavorites()
        }
    }

    const saveFavorites = async (newFavorite) => {
        const subscriptionId = window.__p256dh__
        if (!subscriptionId) {
            alert('푸시 알림을 먼저 구독해주세요.')
            return
        }

        try {
            await fetch('/api/subscribe/keyword', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId,
                    keyword: newFavorite,
                }),
            })
            await loadFavorites()
        } catch (error) {
            console.error('즐겨찾기 저장 실패:', error)
            alert('즐겨찾기 저장 중 오류가 발생했습니다.')
        }
    }

    const deleteFavorite = async (favId) => {
        const subscriptionId = window.__p256dh__
        if (!subscriptionId) {
            alert('푸시 알림을 먼저 구독해주세요.')
            return
        }

        try {
            await fetch('/api/subscribe/keyword', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscriptionId,
                    id: favId,
                }),
            })
            await loadFavorites()
        } catch (error) {
            console.error('즐겨찾기 삭제 실패:', error)
            alert('즐겨찾기 삭제 중 오류가 발생했습니다.')
        }
    }

    const renderFavorites = () => {
        favoritesList.innerHTML = ''
        if (!favorites || favorites.length === 0) return

        favorites.forEach((fav) => {
            const li = document.createElement('li')
            let locationText = `${fav.area1.name} > ${fav.area2.name}`
            if (fav.area3 && fav.area3.code) {
                locationText += ` > ${fav.area3.name}`
            }

            li.innerHTML = `
                <span>${locationText}</span>
                <button class="btn-remove" data-id="${fav.id}">삭제</button>
            `
            favoritesList.appendChild(li)
        })

        document.querySelectorAll('.btn-remove').forEach((button) => {
            button.addEventListener('click', (e) => {
                const target = e.target
                const idToRemove = target.dataset.id
                if (idToRemove) {
                    deleteFavorite(parseInt(idToRemove, 10))
                }
            })
        })
    }

    fetch('/assets/locations.json')
        .then((res) => res.json())
        .then((data) => {
            locations = data
            populateArea1()
        })

    const populateArea1 = () => {
        locations.forEach((loc) => {
            const option = document.createElement('option')
            option.value = loc.BDONG_CD
            option.textContent = loc.CBS_AREA_NM
            area1Select.appendChild(option)
        })
    }

    const populateArea2 = () => {
        area2Select.innerHTML = '<option value="">선택</option>'
        area3Select.innerHTML = '<option value="">선택</option>'
        area2Select.disabled = true
        area3Select.disabled = true

        const selectedArea1Value = area1Select.value
        if (selectedArea1Value) {
            const selectedArea1Data = locations.find((loc) => loc.BDONG_CD === selectedArea1Value)
            if (selectedArea1Data && selectedArea1Data.cbs_sgg_list) {
                selectedArea1Data.cbs_sgg_list.forEach((sgg) => {
                    const option = document.createElement('option')
                    option.value = sgg.BDONG_CD
                    option.textContent = sgg.CBS_AREA_NM
                    area2Select.appendChild(option)
                })
                area2Select.disabled = false
            }
        }
    }

    const populateArea3 = () => {
        area3Select.innerHTML = '<option value="">선택</option>'
        area3Select.disabled = true

        const selectedArea1Value = area1Select.value
        const selectedArea2Value = area2Select.value

        if (selectedArea1Value && selectedArea2Value) {
            const selectedArea1Data = locations.find((loc) => loc.BDONG_CD === selectedArea1Value)
            const selectedArea2Data = selectedArea1Data?.cbs_sgg_list.find((sgg) => sgg.BDONG_CD === selectedArea2Value)

            if (selectedArea2Data && selectedArea2Data.cbs_emd_list) {
                selectedArea2Data.cbs_emd_list.forEach((emd) => {
                    const option = document.createElement('option')
                    option.value = emd.BDONG_CD
                    option.textContent = emd.CBS_AREA_NM
                    area3Select.appendChild(option)
                })
                area3Select.disabled = false
            }
        }
    }

    const handleAddFavorite = () => {
        const area1Value = area1Select.value
        const area2Value = area2Select.value
        const area3Value = area3Select.value

        if (!area1Value || !area2Value) {
            alert('시/도와 시/군/구는 선택해야 합니다.')
            return
        }

        const selectedArea1Data = locations.find((loc) => loc.BDONG_CD === area1Value)
        const selectedArea2Data = selectedArea1Data?.cbs_sgg_list.find((sgg) => sgg.BDONG_CD === area2Value)

        if (!selectedArea1Data || !selectedArea2Data) return

        const newFavorite = {
            area1: { code: selectedArea1Data.BDONG_CD, name: selectedArea1Data.CBS_AREA_NM },
            area2: { code: selectedArea2Data.BDONG_CD, name: selectedArea2Data.CBS_AREA_NM },
            area3: { code: '', name: '전체' },
        }

        if (area3Value) {
            const selectedArea3Data = selectedArea2Data.cbs_emd_list.find((emd) => emd.BDONG_CD === area3Value)
            if (selectedArea3Data) {
                newFavorite.area3 = { code: selectedArea3Data.BDONG_CD, name: selectedArea3Data.CBS_AREA_NM }
            }
        }

        if (
            !favorites.some(
                (fav) =>
                    fav.area1.code === newFavorite.area1.code &&
                    fav.area2.code === newFavorite.area2.code &&
                    fav.area3.code === newFavorite.area3.code,
            )
        ) {
            saveFavorites(newFavorite)
        } else {
            alert('이미 추가된 지역입니다.')
        }
    }

    area1Select.addEventListener('change', populateArea2)
    area2Select.addEventListener('change', populateArea3)
    addFavoriteBtn.addEventListener('click', handleAddFavorite)

    loadFavorites()
})
