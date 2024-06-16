import ListAccordian from '@/components/list/list-accordian'
import LoadListMore from '@/components/list/load-list-more'
import { AlertApi } from '@/lib/alert-api'

const Home = async () => {
    const alertApi = new AlertApi()
    const response = await alertApi.requestNotificationList()
    const list = response && response.messageList

    return (
        <section>
            <ListAccordian list={list} />
            <LoadListMore />
        </section>
    )
}

export default Home
