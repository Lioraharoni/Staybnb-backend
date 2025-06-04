import { authService } from './auth.service.js'
import { logger } from '../../services/logger.service.js'

export async function login(req, res) {
    const { username, password } = req.body
    try {
        // const loginToken2 = req.cookies['loginToken'];
        // console.log("---login", "loginToken2", loginToken2);
        const user = await authService.login(username, password)
        const loginToken = authService.getLoginToken(user)

        logger.info('User login: ', user)
        // logger.info('User loginToken: ', loginToken)

        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
        // res.json({user, loginToken})
    } catch (err) {
        logger.error('Failed to Login ' + err)
        res.status(401).send({ err: 'Failed to Login' })
    }
}

export async function signup(req, res) {
    try {
        const credentials = req.body

        // Never log passwords
        // logger.debug(credentials)

        const account = await authService.signup(credentials)
        logger.debug(`auth.route - new account created: ` + JSON.stringify(account))

        const user = await authService.login(credentials.username, credentials.password)
        logger.info('User signup:', user)

        const loginToken = authService.getLoginToken(user)
        res.cookie('loginToken', loginToken, { sameSite: 'None', secure: true })
        res.json(user)
        // res.json({user, loginToken})
    } catch (err) {
        logger.error('Failed to signup ' + err)
        res.status(400).send({ err: 'Failed to signup' })
    }
}

export async function logout(req, res) {
    try {
        // console.log("logout");    
        res.clearCookie('loginToken')
        // console.log("cookie cleared");
        // const loginToken = req.cookies['loginToken'];
        // console.log("logout", "loginToken", loginToken);
        
        res.send({ msg: 'Logged out successfully' })
    } catch (err) {
        res.status(400).send({ err: 'Failed to logout' })
    }
}