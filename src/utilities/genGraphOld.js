export default function genGraph(parent, key, value) {
  if (
    typeof value === 'string' || 
    typeof value === 'number' || 
    typeof value === 'boolean' || 
    value === null
  ) {
    return [[parent, key, value]]
  }
  let branch = []
  if (Array.isArray(value)) {
    for (const [, item] of value.entries()) {
      branch.push(...genGraph(parent, key, item))
    }
    return branch
  }
  for (const [objKey, objValue] of Object.entries(value)) {
    const objParent = (parent && objKey) 
      ? (Array.isArray(parent) ? parent.concat(key) : [parent].concat(key)) 
      : [key];
    branch.push(...genGraph(objParent, objKey, objValue))
  }
  return branch
}