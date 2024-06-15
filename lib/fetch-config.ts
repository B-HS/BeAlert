const BASEURL = process.env.NEXT_PUBLIC_BACKEND_URL

type FetchOptions = {
    method?: string
    headers?: HeadersInit
    body?: BodyInit | null
}

const backend = async (endpoint: string, options: FetchOptions = {}) => {
    const url = `${BASEURL}${endpoint}`
    const defaultOptions: FetchOptions = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    }

    const fetchOptions = { ...defaultOptions, ...options }

    try {
        const response = await fetch(url, fetchOptions)
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText)
        }
        return await response.json()
    } catch (error) {
        console.error('There has been a problem with your fetch operation:', error)
        throw error
    }
}

export default backend
