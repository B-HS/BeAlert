import { render } from 'hono/jsx/dom'
import { Layout } from '../page/components/layout'

export const renderClientComponent = ({ children }) => {
    render(<Layout>{children}</Layout>, document.getElementById('root'))
}
