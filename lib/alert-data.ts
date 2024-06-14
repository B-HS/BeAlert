const END_POINT = 'http://apis.data.go.kr/1741000/DisasterMsg3'
const API_KEY = process.env.API_KEY

class AlertData {
    private disasterMessages: DisasterMessage[]

    constructor() {
        this.disasterMessages = []
    }

    public getAlertData(): DisasterMessage[] {
        return this.disasterMessages
    }

    public getAlertDataByLocation(location_ids: string[]): DisasterMessage[] {
        return this.disasterMessages.filter((message) => location_ids.includes(message.location_id))
    }

    public addDisasterMessage(message: DisasterMessage): void {
        this.disasterMessages.push(message)
    }

    public removeDisasterMessage(md101_sn: string): void {
        this.disasterMessages = this.disasterMessages.filter((message) => message.md101_sn !== md101_sn)
    }
}
