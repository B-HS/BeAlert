export const parseLocations = (rcptnRgnNm: string, isArray?: boolean): string[] => {
    const locationsSet = new Set<string>()
    const locationsList: string[] = []
    const parts = rcptnRgnNm.split(',')
    parts.forEach((part) => {
        const trimmed = part.trim()
        if (trimmed) {
            trimmed.split(/\s+/).forEach((loc) => {
                if (loc) {
                    locationsSet.add(loc)
                    locationsList.push(loc)
                }
            })
        }
    })
    return isArray ? locationsList : Array.from(locationsSet)
}

export const getLocationList = (rcptnRgnNm: string) => {
    return rcptnRgnNm
        .replaceAll(', ', ',')
        .replaceAll(' ,', ',')
        .split(',')
        .map((location) => location.trim())
}