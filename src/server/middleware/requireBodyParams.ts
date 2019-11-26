import { NextApiRequest, NextApiResponse } from 'next'

export type FieldValidator<T> = (value: T) => boolean

export type Validator<T> = {
  [k in keyof T]: FieldValidator<T[k]>
}

export type RequestWithBody<Body> = Omit<NextApiRequest, 'body'> & {
  body: Body
}

export const requiredString: FieldValidator<string> = str =>
  !!str && str !== '' && typeof str === 'string'

// --

const requireBodyParams = <Body>(validator: Validator<Body>) => (
  req: NextApiRequest,
  res: NextApiResponse,
  next: any
) => {
  const errors = Object.keys(validator)
    .map(key => {
      if (!validator[key](req.body[key])) {
        if (req.body[key] === undefined) {
          return {
            field: key,
            error: `Required field '${key}' is missing`
          }
        }
        if (req.body[key] === '') {
          return {
            field: key,
            error: `Required field '${key}' has an invalid value: '' (empty string)`
          }
        }

        return {
          field: key,
          error: `Required field '${key}' has an invalid value: ${JSON.stringify(
            req.body[key]
          )}`
        }
      }
      return null
    })
    .filter(error => error !== null)

  if (errors.length > 0) {
    return res.status(400).json({
      error: 'Invalid body parameters',
      details: errors
    })
  }
  return next()
}

export default requireBodyParams
