import { db } from '@src/db'
import { subscriberLocation, subscriptions } from '@src/db/schema'
import { and, eq } from 'drizzle-orm'

export const subscribe = async (subscription: {
    endpoint: string
    keys: {
        p256dh: string
        auth: string
    }
}) => {
    try {
        await db.insert(subscriptions).values({
            endpoint: subscription.endpoint,
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
        })

        return {
            message: 'Subscribed',
            code: 200,
        }
    } catch (err) {
        console.error('DB error:', err)
        return {
            message: 'DB error',
            code: 500,
        }
    }
}

export const unsubscribe = async (p256dh: string) => {
    try {
        await db.delete(subscriptions).where(eq(subscriptions.p256dh, p256dh))
        return {
            message: 'Subscription deleted',
            code: 200,
        }
    } catch (err) {
        console.error('DB error:', err)
        return {
            message: 'DB error',
            code: 500,
        }
    }
}

export const postLocation = async (location: string, p256dh: string) => {
    try {
        const subscriber = await db.select().from(subscriptions).where(eq(subscriptions.p256dh, p256dh))

        if (subscriber.length === 0) {
            return { message: 'Subscriber not found', code: 404 }
        }

        await db.insert(subscriberLocation).values({
            subscriberId: subscriber[0].id,
            location,
        })

        return { message: 'Location updated', code: 200 }
    } catch (err) {
        console.error('DB error:', err)
        return { message: 'DB error', code: 500 }
    }
}

export const deleteLocation = async (p256dh: string, location: string) => {
    try {
        const subscriber = await db.select().from(subscriptions).where(eq(subscriptions.p256dh, p256dh))

        if (subscriber.length === 0) {
            return { message: 'Subscriber not found', code: 404 }
        }

        await db
            .delete(subscriberLocation)
            .where(and(eq(subscriberLocation.subscriberId, subscriber[0].id), eq(subscriberLocation.location, location)))

        return { message: 'Location deleted', code: 200 }
    } catch (err) {
        console.error('DB error:', err)
        return { message: 'DB error', code: 500 }
    }
}

export const getLocations = async (p256dh: string) => {
    try {
        const subscriber = await db.select().from(subscriptions).where(eq(subscriptions.p256dh, p256dh))

        if (subscriber.length === 0) {
            return { message: 'Subscriber not found', code: 404 }
        }

        const locations = await db
            .select()
            .from(subscriberLocation)
            .where(eq(subscriberLocation.subscriberId, subscriber[0].id))

        return { locations: locations.map((location) => location.location), code: 200 }
    } catch (err) {
        console.error('DB error:', err)
        return { message: 'DB error', code: 500 }
    }
}
