import express from 'express'

import { getOrder, getOrders, deleteOrder, updateOrder, addOrder } from './order.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', requireAuth, getOrders)
router.get('/:id', requireAuth, getOrder)
router.put('/:id', requireAuth, updateOrder)
router.delete('/:id', requireAuth, deleteOrder)
router.post('/', addOrder)
// router.put('/:id', requireAuth, updateOrder)
// router.delete('/:id', requireAuth, requireAdmin, deleteOrder)

export const orderRoutes = router