import express from 'express'

import { getUser, getUsers, deleteUser, updateUser, addUser } from './user.controller.js'
import { requireAdmin, requireAuth } from '../../middlewares/requireAuth.middleware.js'

const router = express.Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.put('/:id', requireAuth, updateUser)
router.delete('/:id', requireAuth, requireAdmin, deleteUser)

//todo toRemove!!
router.post('/', requireAuth, requireAdmin, addUser)


export const userRoutes = router