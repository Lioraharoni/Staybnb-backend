import { dbService, mongoId } from '../../services/db.service.js'
import { logger } from '../../services/logger.service.js'

export const userService = {
    add, // Create (Signup)
    getById, // Read (Profile page)
    update, // Update (Edit profile)
    remove, // Delete (remove user)
    query, // List (of users)
    getByUsername, // Used for Login
}

const USER_COLLECTION_NAME = 'user'

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        var users = await collection.find(criteria).toArray()
        users = users.map(user => {
            delete user.password
            user.createdAt = user._id.getTimestamp()
            // Returning fake fresh data
            // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
            return user
        })
        return users
    } catch (err) {
        logger.error('cannot find users', err)
        throw err
    }
}

async function getById(userId) {
    try {
        // console.log({userId});
        var criteria = { _id: mongoId(userId) }

        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        const user = await collection.findOne(criteria)
        delete user.password
        user.createdAt = user._id.getTimestamp()
        // criteria = { byUserId: userId }

        // user.givenReviews = await reviewService.query(criteria)
        // user.givenReviews = user.givenReviews.map(review => {
        //     delete review.byUser
        //     return review
        // })

        return user
    } catch (err) {
        logger.error(`while finding user by id: ${userId}`, err)
        throw err
    }
}

async function getByUsername(username) {
    try {
        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        const user = await collection.findOne({ username })
        // console.log("getByUsername user=",user);
        
        return user
    } catch (err) {
        logger.error(`while finding user by username: ${username}`, err)
        throw err
    }
}

async function remove(userId) {
    try {
        const criteria = { _id: mongoId(userId) }

        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove user ${userId}`, err)
        throw err
    }
}

async function update(user) {
    try {
           const allowedFields = ['fullname', 'score', 'isAdmin', 'imgUrl']
        // peek only updatable properties
        // const { _id, ...user2 } = user
        const userToSave = allowedFields.reduce((acc, curr) => {
            if(user[curr]){
            acc[curr] = user[curr]
            }
            return acc
        }, {})
        console.log({userToSave}, {user}, {});
        
        // const userToSave = {
        //     // _id: ObjectId.createFromHexString(user._id), // needed for the returnd obj
        //     _id: user._id,
        //     fullname: user.fullname,
        //     score: user.score,
        // }
        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        await collection.updateOne({_id: mongoId(user._id) }, { $set: userToSave })
        return { _id: user._id, ...userToSave }
    } catch (err) {
        logger.error(`cannot update user ${user._id}`, err)
        throw err
    }
}

async function add(user) {
    try {
        const userToAdd = {
            username: user.username,
            password: user.password,
            fullname: user.fullname,
            imgUrl: user.imgUrl ?? "https://randomuser.me/api/portraits/men/99.jpg",
            isAdmin: user.isAdmin,
            score: 100,
            wishlist: []
        }

        const collection = await dbService.getCollection(USER_COLLECTION_NAME)
        await collection.insertOne(userToAdd)
        return userToAdd
    } catch (err) {
        logger.error('cannot add user', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    // if (filterBy.txt) {
    //     const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
    //     criteria.$or = [
    //         {
    //             username: txtCriteria,
    //         },
    //         {
    //             fullname: txtCriteria,
    //         },
    //     ]
    // }
    // if (filterBy.minBalance) {
    //     criteria.score = { $gte: filterBy.minBalance }
    // }
    return criteria
}