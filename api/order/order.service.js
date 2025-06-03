import { asyncLocalStorage } from '../../services/als.service.js'
import { dbService, mongoId } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'
import { reviewService } from '../review/review.service.js'
import { ObjectId } from 'mongodb'

export const orderService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove order)
    query, // List (of orders)
}

const ORDER_COLLECTION_NAME = 'order'

async function query(filterBy = {}) {

    // console.log("query", filterBy);
    const criteria = _buildCriteria(filterBy)

    try {
        const collection = await dbService.getCollection(ORDER_COLLECTION_NAME)
        var orders = await collection.find(criteria).toArray()
        // console.log("orders count", orders.length);

        orders = orders.map(order => {
            order.createdAt = order._id.getTimestamp()
            return order
        })
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        // console.log("GET BY ID", { orderId });
        var criteria = { _id: mongoId(orderId) }
        const collection = await dbService.getCollection(ORDER_COLLECTION_NAME)
        const order = await collection.findOne(criteria)
        return order
    } catch (err) {
        logger.error(`while finding order by id: ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const criteria = { _id: mongoId(orderId) }
        const collection = await dbService.getCollection(ORDER_COLLECTION_NAME)

        if (!loggedinUser.isAdmin) {
            criteria['guest.guestId'] = mongoId(loggedinUser._id)
        }

        const result = await collection.deleteOne(criteria)
        if (result.deletedCount === 0) throw ('Not your order')
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function update(order) {
    try {
        const allowedFields = ['from', 'to', 'status', 'guests', 'price']

        const orderToSave = allowedFields.reduce((acc, curr) => {
            if (order[curr]) {
                acc[curr] = order[curr]
            }
            return acc
        }, {})
        // console.log({ orderToSave }, { order }, {});

        const collection = await dbService.getCollection(ORDER_COLLECTION_NAME)
        await collection.updateOne({ _id: mongoId(order._id) }, { $set: orderToSave })
        return { _id: order._id, ...orderToSave }
    } catch (err) {
        logger.error(`cannot update order ${order._id}`, err)
        throw err
    }
}

async function add(order) {
    try {
        console.log("adding", { order });

        // peek only updatable fields!
        // const orderToAdd = {
        //     stayId: order.stayId,
        //     user: order.user,
        //     from: order.from,
        //     to: order.to,
        //     price: order.price,
        //     status: order.status,
        //     guests: order.guests
        // }
        const collection = await dbService.getCollection('order')
        await collection.insertOne(order)
        return order
    } catch (err) {
        logger.error('cannot add order', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const { loggedinUser } = asyncLocalStorage.getStore()
    var criteria = {}

    if (filterBy.userType) {

        if (filterBy.userType === 'host') {
            criteria = { "host.hostId": mongoId(loggedinUser._id) }
        } else if (filterBy.userType === 'guest') {
            criteria = { "guest.guestId": mongoId(loggedinUser._id) }
        }
    }

    // console.log("_buildCriteria", { loggedinUser }, "filterBy.userType ", filterBy.userType);
    return criteria
}