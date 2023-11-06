let entityNodes = []
let primNodes = []
let keyNodes = []

let entityPrimLinks = []
let primKeyLinks = []
let keyKeyLinks = []

function arraysEqual(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b)) {
    return false
  }
  if (!(a.length === b.length)) {
    return false
  }
  return (a.every((element, index) => element === b[index]));
}

function traverseObject(keys, value, entityId) {
  let keyId
  const existingKey = keyNodes.find((node) => arraysEqual(node.keys, keys))
  if (existingKey) {
    keyId = existingKey.id  
  } 
  else if (keys.length > 0) {
    keyId = 'k' + keyNodes.length.toString()
    keyNodes.push({
      id: keyId,
      name: keys[keys.length - 1],
      keys: keys
    })
    // link it to its parent key
    if (keys.length > 1) {
      const parentKey = keyNodes.find((node) => arraysEqual(node.keys, keys.slice(0, -1)))
      if (parentKey) {
        keyKeyLinks.push({
          source: parentKey.id,
          target: keyId
        })
      }
    }
  }
  /* Value type check */
  if (
    typeof value === 'string' || 
    typeof value === 'number' || 
    typeof value === 'boolean' || 
    value === null
    ) {
    /* Primitive */
    let id
    const existing = primNodes.find((node) => node.name === value && arraysEqual(node.keys, keys))
    if (existing) {
      id = existing.id
    } 
    else {
      id = 'p' + primNodes.length.toString()
      primNodes.push({
        id: id,
        name: value,
        keys: keys
      })
      primKeyLinks.push({
        source: keyId,
        target: id
      })
    }
    // link it to its entity
    entityPrimLinks.push({
      source: id,
      target: entityId
    })
    return [[keys, value, entityId]]
  }
  let branch = []
  if (Array.isArray(value)) {
    /* Array */
    for (const [, item] of value.entries()) {
      branch.push(...traverseObject(keys, item, entityId))
    }
    return branch
  }
  /* Object */
  for (const [childKey, childValue] of Object.entries(value)) {
    const childKeys = keys ?
      (Array.isArray(keys) ? keys.concat(childKey) : [keys].concat(childKey)) 
    : [childKey]
    branch.push(...traverseObject(childKeys, childValue, entityId))
  }
  return branch
}

export default function genGraph(dataset, nameAttrib) {
  entityNodes = []
  primNodes = []
  keyNodes = []

  entityPrimLinks = []
  primKeyLinks = []
  keyKeyLinks = []
  
  dataset.forEach((entity) => {
    const entityId = 'e' + entityNodes.length.toString()
    entityNodes.push({
      id: entityId,
      name: entity[nameAttrib] ? entity[nameAttrib] : `Unnamed (ID: ${entityId})`
    })
    traverseObject([], entity, entityId)
  })
  const nodes = entityNodes.concat(primNodes).concat(keyNodes)
  const links = entityPrimLinks.concat(primKeyLinks).concat(keyKeyLinks)
  return {
    nodes: nodes,
    links: links
  }
}