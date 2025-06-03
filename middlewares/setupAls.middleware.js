import { authService } from '../api/auth/auth.service.js'
import { asyncLocalStorage } from '../services/als.service.js'

export async function setupAsyncLocalStorage(req, res, next) {
	const storage = {}
	asyncLocalStorage.run(storage, () => {
		console.log("setupAsyncLocalStorage start");
		if (!req.cookies?.loginToken) return next()
		const loggedinUser = authService.validateToken(req.cookies.loginToken)

		console.log("setupAsyncLocalStorage loggedinUser=", loggedinUser);
		
		if (loggedinUser) {
			const alsStore = asyncLocalStorage.getStore()
			alsStore.loggedinUser = loggedinUser
			console.log("setupAsyncLocalStorage set alsStore.loggedinUser");
		}
		next()
	})
}
