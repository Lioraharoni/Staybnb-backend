import express from 'express'
// import { log } from '../../middlewares/logger.middleware.js'

import { getStays, getStayById, addStay, updateStay, removeStay, addStayMsg, removeStayMsg, getStayReviews, getStayReview, addStayReview, updateStayReview, deleteStayReview } from './stay.controller.js'
import { requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(log)

router.get('/', getStays)
router.get('/:id', getStayById)

router.get('/:id/review', getStayReviews)
router.get('/:id/review/:reviewId', getStayReview)
router.post('/:id/review', requireAuth, addStayReview)
router.put('/:id/review/:reviewId', requireAuth, updateStayReview)
router.delete('/:id/review/:reviewId', requireAuth, deleteStayReview)


// router.post('/:id/msg', addStayMsg)
// router.delete('/:id/msg/:msgId', removeStayMsg)

// router.get('/', log, getStays)
// router.get('/:id', log, getStayById)
// router.post('/', log, requireAuth, addStay)
// router.put('/:id', requireAuth, updateStay)
// router.delete('/:id', requireAuth, removeStay)
// router.delete('/:id', requireAuth, requireAdmin, removeStay)

// router.post('/:id/msg', requireAuth, addStayMsg)
// router.delete('/:id/msg/:msgId', requireAuth, removeStayMsg)

export const stayRoutes = router