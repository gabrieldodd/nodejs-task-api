export function extractQueryParams(query) {
  return query
    .substring(1)
    .split('&')
    .filter(Boolean)
    .reduce((queryParams, param) => {
      const [key, value] = param.split('=')

      queryParams[key] = value ? decodeURIComponent(value) : ''

      return queryParams
    }, {})
}