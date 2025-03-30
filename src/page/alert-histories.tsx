import { FC } from 'hono/jsx'
import { Layout } from './components/layout'

const AlertHistories: FC<{}> = ({}) => {
    return (
        <Layout>
            <button id='subscribeBtn' class='bg-blue-600 text-white p-2 rounded cursor-pointer'>
                알림 구독하기
            </button>
        </Layout>
    )
}

export default AlertHistories
