import { db } from '@src/db'
import { alertMessages } from '@src/db/schema'
import { desc } from 'drizzle-orm'
import { FC } from 'hono/jsx'
import { Accordion } from './components/accordion'
import { Layout } from './components/layout'

const AlertHistories: FC<{}> = async ({}) => {
    const data = await db.select().from(alertMessages).orderBy(desc(alertMessages.sn)).limit(100)
    return (
        <Layout>
            <Accordion data={data} />
        </Layout>
    )
}

export default AlertHistories
