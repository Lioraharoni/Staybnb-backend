import { logger } from '../../services/logger.service.js'
import { stayService } from './stay.service.js'

export async function getStays(req, res) {
    try {
        // console.log("getStays");
        const filterBy = {
            category: req.query.category,
            sortField: req.query.sortField || '',
            sortDir: req.query.sortDir || 1,
            pageIdx: req.query.pageIdx,
            wishlist: req.query.wishlist
        }
        const stays = await stayService.query(filterBy)
        res.json(stays)
    } catch (err) {
        logger.error('Failed to get stays', err)
        res.status(400).send({ err: 'Failed to get stays' })
    }
}

export async function getStayById(req, res) {
    try {
        const stayId = req.params.id
        // console.log({ stayId })
        const stay = await stayService.getById(stayId)
        res.json(stay)
    } catch (err) {
        logger.error('Failed to get stay', err)
        res.status(400).send({ err: 'Failed to get stay' })
    }
}

export async function addStay(req, res) {
    const { loggedinUser, body: stay } = req

    try {
        stay.owner = loggedinUser
        const addedStay = await stayService.add(stay)
        res.json(addedStay)
    } catch (err) {
        logger.error('Failed to add stay', err)
        res.status(400).send({ err: 'Failed to add stay' })
    }
}

export async function updateStay(req, res) {
    const { loggedinUser, body: stay } = req
    const { _id: userId, isAdmin } = loggedinUser

    if (!isAdmin && stay.owner._id !== userId) {
        res.status(403).send('Not your stay...')
        return
    }

    try {
        const updatedStay = await stayService.update(stay)
        res.json(updatedStay)
    } catch (err) {
        logger.error('Failed to update stay', err)
        res.status(400).send({ err: 'Failed to update stay' })
    }
}

export async function removeStay(req, res) {
    try {
        const stayId = req.params.id
        const removedId = await stayService.remove(stayId)

        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove stay', err)
        res.status(400).send({ err: 'Failed to remove stay' })
    }
}

export async function addStayMsg(req, res) {
    const { loggedinUser } = req

    try {
        const stayId = req.params.id
        const msg = {
            txt: req.body.txt,
            by: loggedinUser,
        }
        const savedMsg = await stayService.addStayMsg(stayId, msg)
        res.json(savedMsg)
    } catch (err) {
        logger.error('Failed to add stay msg', err)
        res.status(400).send({ err: 'Failed to add stay msg' })
    }
}

export async function removeStayMsg(req, res) {
    try {
        const { id: stayId, msgId } = req.params

        const removedId = await stayService.removeStayMsg(stayId, msgId)
        res.send(removedId)
    } catch (err) {
        logger.error('Failed to remove stay msg', err)
        res.status(400).send({ err: 'Failed to remove stay msg' })
    }
}

export async function getStayReviews(req, res) {
    try {
        // console.log("getStayReviews", req.params);s
        const { id: stayId } = req.params

        const stayReviews = await stayService.getStayReviews(stayId)
        res.json(stayReviews)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(400).send({ err: 'Failed to get reviews' })
    }
}

export async function getStayReview(req, res) {
    try {
        // console.log("getStayReviews", req.params);
        const { id: stayId, reviewId } = req.params

        const stayReview = await stayService.getStayReview(stayId, reviewId)
        res.json(stayReview)
    } catch (err) {
        logger.error('Failed to get reviews', err)
        res.status(400).send({ err: 'Failed to get reviews' })
    }
}

export async function addStayReview(req, res) {
    try {
        const { id: stayId } = req.params
        const { body: review } = req

        const stayReview = await stayService.addStayReview(stayId, review)
        res.json(stayReview)
    } catch (err) {
        logger.error('Failed to add review', err)
        res.status(400).send({ err: 'Failed to add review' })
    }
}


export async function updateStayReview(req, res) {
    try {
        // console.log("updateStayReview", req.params);
        const { id: stayId } = req.params
        const { body: review } = req

        const stayReview = await stayService.updateStayReview(stayId, review)
        res.json(stayReview)
    } catch (err) {
        logger.error('Failed to update review', err)
        res.status(400).send({ err: 'Failed to update review' })
    }
}

export async function deleteStayReview(req, res) {
    try {
        const { id: stayId, reviewId } = req.params
        await stayService.removeStayReview(stayId, reviewId)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(400).send({ err: 'Failed to delete review' })
    }
}