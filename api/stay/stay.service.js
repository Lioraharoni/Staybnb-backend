import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService, mongoId } from '../../services/db.service.js'
import { userService } from '../user/user.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 3
const STAY_COLLECTION_NAME = 'stay'

export const stayService = {
    // remove,
    query,
    getById,
    getStayReviews,
    getStayReview,
    addStayReview,
    updateStayReview,
    removeStayReview
    // add,
    // update,
    // addStayMsg,
    // removeStayMsg,
}

async function query(filterBy = {}) {
    try {
        console.log("query", filterBy);
        const { loggedinUser } = asyncLocalStorage.getStore()
        const fullLoggedinUser = await userService.getById(loggedinUser._id)

        const criteria = _buildCriteria(filterBy, fullLoggedinUser)
        const sort = _buildSort(filterBy)

        // console.log("query criteria", criteria);

        const projection = {

        };

        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        // console.log("I use mongo", collection);
        // var stayCursor = await collection.find(criteria, { sort })
        // const cursor = coll.find(filter, { projection });
        var stayCursor = await collection
            .find(criteria, {
                sort: sort,
                projection: { 'reviews': 0, 'amenities': 0, 'likedByUsers': 0 }
            })

        if (filterBy.pageIdx !== undefined) {
            stayCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
        }

        const stays = await stayCursor.toArray()
        // console.log("stay count", stays.length);

        return stays
    } catch (err) {
        logger.error('cannot find stays', err)
        throw err
    }
}

async function getById(stayId, projection = {}) {
    try {
        const criteria = { _id: mongoId(stayId) }
        // console.log({ criteria }, { projection : { reviews: 1 }});

        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        const stay = await collection.findOne(criteria, { projection })

        // console.log("getById", { stay });
        stay.createdAt = stay._id.getTimestamp()
        return stay
    } catch (err) {
        logger.error(`while finding stay ${stayId}`, err)
        throw err
    }
}

async function getStayReviews(stayId) {
    //TAL projection didn't work
    try {
        const projection = { reviews: 1 }
        const stay = await getById(stayId, projection)

        console.log({ stay });
        return stay.reviews
    } catch (err) {
        logger.error(`cannot get stay reviews ${stayId}`, err)
        throw err
    }
}

async function getStayReview(stayId, reviewId) {
    try {
        const criteria = { _id: mongoId(stayId), 'reviews.reviewId': reviewId }
        const projection = { 'reviews.$': 1 } // only return the matching review

        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        const result = await collection.findOne(criteria, { projection: projection })

        // console.log('Specific Review:', result?.reviews?.[0] || 'Not found');
        return result?.reviews?.[0] || null;
    } catch (err) {
        logger.error(`cannot get stay review ${stayId} ${reviewId}`, err)
        throw err
    }
}

async function addStayReview(stayId, review) {
    try {
        const criteria = { _id: mongoId(stayId) }

        const reviewToAdd = {
            reviewId: makeId(),
            at: new Date(),
            txt: review.txt,
            by: review.by
        }

        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        const result = await collection.updateOne(criteria, { $push: { reviews: reviewToAdd } })
        // console.log('Review added:', result.modifiedCount === 1);
    } catch (err) {
        logger.error(`cannot add stay review ${stayId} ${review}`, err)
        throw err
    }
}

async function updateStayReview(stayId, review) {
    try {
        const criteria = { _id: mongoId(stayId), "reviews.reviewId": review.reviewId }
        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        const result = await collection.updateOne(criteria,
            {
                $set: {
                    "reviews.$.txt": review.txt,
                    "reviews.$.at": new Date()
                }
            })

    } catch (err) {
        logger.error(`cannot update stay review ${stayId} ${review}`, err)
        throw err
    }
}

export async function removeStayReview(stayId, reviewId) {
    try {
        const { loggedinUser } = asyncLocalStorage.getStore()
        const criteria = { _id: mongoId(stayId) }

        if (!loggedinUser.isAdmin) {
            criteria['reviews.reviewId'] = reviewId,
            criteria['reviews.by.userId'] = mongoId(loggedinUser._id)
        }
        // console.log({criteria});
        
        const collection = await dbService.getCollection(STAY_COLLECTION_NAME)
        const result = await collection.updateOne(criteria, { $pull: { reviews: { reviewId, 
            'by.userId': mongoId(loggedinUser._id)
         } } })
        // console.log("removeStayReview", stayId, reviewId, "result=",result);
        if (result.modifiedCount === 0) throw ('Not your review')
    } catch (err) {
        logger.error(`cannot remove stay review ${stayId} ${reviewId}`, err)
        throw err
    }
}

function _buildCriteria(filterBy, fullLoggedinUser) {
    const criteria = {}

    if (filterBy.category) {
        criteria.categories = filterBy.category;
    }

    if (filterBy.wishlist) {

        const wishlistIds = fullLoggedinUser.wishlist.map(id => mongoId(id));
        // console.log({ wishlistIds });
        criteria._id = { $in: wishlistIds }
    }

    console.log("_buildCriteria", criteria);
    return criteria
}

function _buildSort(filterBy) {

    if (filterBy.sortField) {
        return { rating: -1 }
    }
    // if (!filterBy.sortField) return {}
    // return { [filterBy.sortField]: filterBy.sortDir }
}

// async function remove(stayId) {
//     const { loggedinUser } = asyncLocalStorage.getStore()
//     const { _id: ownerId, isAdmin } = loggedinUser

//     try {
//         const criteria = {
//             _id: ObjectId.createFromHexString(stayId),
//         }

//         if (!isAdmin) criteria['owner._id'] = ownerId

//         const collection = await dbService.getCollection('stay')
//         const res = await collection.deleteOne(criteria)

//         if (res.deletedCount === 0) throw ('Not your stay')
//         return stayId
//     } catch (err) {
//         logger.error(`cannot remove stay ${stayId}`, err)
//         throw err
//     }
// }

// async function add(stay) {
//     try {
//         const collection = await dbService.getCollection('stay')
//         await collection.insertOne(stay)

//         return stay
//     } catch (err) {
//         logger.error('cannot insert stay', err)
//         throw err
//     }
// }

// async function update(stay) {
//     const stayToSave = { vendor: stay.vendor, speed: stay.speed }

//     try {
//         const criteria = { _id: ObjectId.createFromHexString(stay._id) }
//         const collection = await dbService.getCollection('stay')
//         await collection.updateOne(criteria, { $set: stayToSave })

//         return stay
//     } catch (err) {
//         logger.error(`cannot update stay ${stay._id}`, err)
//         throw err
//     }
// }

// async function addStayMsg(stayId, msg) {
//     try {
//         const criteria = { _id: ObjectId.createFromHexString(stayId) }
//         msg.id = makeId()

//         const collection = await dbService.getCollection('stay')
//         await collection.updateOne(criteria, { $push: { msgs: msg } })

//         return msg
//     } catch (err) {
//         logger.error(`cannot add stay msg ${stayId}`, err)
//         throw err
//     }
// }

// async function removeStayMsg(stayId, msgId) {
//     try {
//         const criteria = { _id: ObjectId.createFromHexString(stayId) }

//         const collection = await dbService.getCollection('stay')
//         await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

//         return msgId
//     } catch (err) {
//         logger.error(`cannot remove stay msg ${stayId}`, err)
//         throw err
//     }
// }
