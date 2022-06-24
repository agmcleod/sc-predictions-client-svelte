export type ResponseError =
  | {
      errors: string[]
    }
  | Error

export const getErrorsFromResponse = (err: ResponseError): string[] => {
  if (err instanceof Error) {
    return [err.message]
  }

  return err.errors
}
