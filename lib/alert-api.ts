import backend from './fetch-config'

export class AlertApi {
    async requestAddToken(token: string) {
        return await backend('/addtoken/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        })
    }

    async requestDeleteToken(token: string) {
        return await backend(`/deletetoken/${token}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async requestNotificationList(page: number = 1, limit: number = 10) {
        return (await backend(`/disaster_messages/?skip=${page * 10}&limit=${limit}`)) as ResponseDisasterMessage
    }

    async requestSubscribeLocation(location: string, token: string) {
        return await backend('/addlocation/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location, token_value: token }),
        })
    }

    async requestSubscribedListByToken(token: string) {
        return await backend(`/locations/by_token/${token}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
    }

    async requestUnsubscribeLocation(location: string, token: string) {
        return await backend(`/deletelocation/${token}/${location}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ location, token_value: token }),
        })
    }
}
