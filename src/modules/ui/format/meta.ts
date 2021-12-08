export function formatSEOKeyValues(dict: Record<string, string>) {
  return Object.keys(dict).flatMap((key, index) => [
    { name: `twitter:label${index + 1}`, content: key },
    { name: `twitter:data${index + 1}`, content: dict[key] }
  ])
}
