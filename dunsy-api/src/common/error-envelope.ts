export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'BROWSER_ORIGIN_FORBIDDEN'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'DATABASE_UNAVAILABLE'
  | 'PAYLOAD_TOO_LARGE'

export type ErrorEnvelope = {
  error: {
    code: ErrorCode
    message: string
    requestId: string
  }
}

export const errorEnvelope = (
  code: ErrorCode,
  message: string,
  requestId: string,
): ErrorEnvelope => ({
  error: { code, message, requestId },
})

export const statusForCode = (code: ErrorCode): number => {
  switch (code) {
    case 'UNAUTHORIZED':
      return 401
    case 'BROWSER_ORIGIN_FORBIDDEN':
      return 403
    case 'VALIDATION_ERROR':
      return 400
    case 'NOT_FOUND':
      return 404
    case 'PAYLOAD_TOO_LARGE':
      return 413
    case 'DATABASE_UNAVAILABLE':
      return 503
    default:
      return 500
  }
}
