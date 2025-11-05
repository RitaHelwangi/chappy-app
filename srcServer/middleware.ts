import type { RequestHandler } from "express";

const logger: RequestHandler = (req, res, next) => {
	console.log(`${req.method}  ${req.url}`)
	next()
}

export { logger }
