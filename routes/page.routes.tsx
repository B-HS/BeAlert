import { Home, Mypage } from '@/pages'
import { Layout } from '@/pages/layout'
import { fetchDisasterSmsList } from '@/services/disaster.service'
import { Hono } from 'hono'

export const PageRoute = () => {
    const app = new Hono()

    app.get('/', async (c) => {
        const searchParams = c.req.query()
        const data = await fetchDisasterSmsList(searchParams)

        return c.render(
            <Layout title='Home'>
                <Home data={data} searchParams={searchParams} />
            </Layout>,
        )
    })

    app.get('/mypage', (c) => {
        return c.render(
            <Layout title='My Page'>
                <Mypage />
            </Layout>,
        )
    })

    return app
}
