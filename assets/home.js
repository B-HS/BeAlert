document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('searchForm')
    if (!searchForm) return

    const area1Select = document.getElementById('area1')
    const area2Select = document.getElementById('area2')
    const area3Select = document.getElementById('area3')

    if (!area1Select || !area2Select || !area3Select) return

    let locations = []

    const params = new URLSearchParams(window.location.search)
    const currentArea1 = params.get('area1')
    const currentArea2 = params.get('area2')
    const currentArea3 = params.get('area3')

    fetch('/locations.json')
        .then((res) => res.json())
        .then((data) => {
            locations = data
            populateArea1()
            if (currentArea1) {
                area1Select.value = currentArea1
                populateArea2()
            }
            if (currentArea2) {
                area2Select.value = currentArea2
                populateArea3()
            }
            if (currentArea3) {
                area3Select.value = currentArea3
            }
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
        area2Select.innerHTML = '<option value="">전체</option>'
        area3Select.innerHTML = '<option value="">전체</option>'
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
        area3Select.innerHTML = '<option value="">전체</option>'
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

    area1Select.addEventListener('change', populateArea2)
    area2Select.addEventListener('change', populateArea3)
})
