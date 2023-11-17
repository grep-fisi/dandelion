import arraysEqual from '../utils/arraysEqual'

let entityNodes = []
let primNodes = []
let keyNodes = []

function calcName(keys, value) {
  return keys.map((key) => key).join(' · ') + ` : ${value}`
}

function traverseObject(keys, value, entityId) {
  let keyId
  const existingKey = keyNodes.find((node) => arraysEqual(node.keys, keys))
  if (existingKey) {
    keyId = existingKey.id  
  } else if (keys.length > 0) {
    keyId = 'k' + keyNodes.length.toString()
    let keyNode = {
      id: keyId,
      name: keys[keys.length - 1],
      keys: keys,
      parent: null,
      children: [],
      entities: [],
    }
    // link it to its parent key
    if (keys.length > 0) {
      const parentKey = keyNodes.find((node) => arraysEqual(node.keys, keys.slice(0, -1)))
      if (parentKey) {
        // add reference to parent in child
        keyNode.parent = parentKey.id
        // add reference to child in parent
        parentKey.children = parentKey.children ? parentKey.children.concat(keyId) : [keyId]
      }
    }
    keyNodes.push(keyNode)
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

    const existing = primNodes.find((node) => node.name === calcName(keys, value) && arraysEqual(node.keys, keys))
    if (existing) {
      id = existing.id
      // add reference to entity in primitive
      existing.entities = existing.entities.concat(entityId)
    } 
    else {
      id = 'p' + primNodes.length.toString()
      let primNode = {
        id: id,
        name: calcName(keys, value),
        keys: keys,
        parent: keyId,
        entities: [],
      }
      // add reference to primitive children in parent
      const key = keyNodes.find((node) => node.id === keyId)
      key.children = key.children ? key.children.concat(id) : [id]
      // add reference to entity in primitive
      primNode.entities = [entityId]
      primNodes.push(primNode)
    }
    // add reference to primitive in entity
    entityNodes.find((node) => node.id === entityId).primitives.push(id)
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

export default function genNodes(dataset, nameAttrib) {
  entityNodes = []
  primNodes = []
  keyNodes = [{
    id: 'root',
    name: 'Root',
    keys: [],
    parent: null,
    children: [],
    entities: [],
    visible: false,
    value: 0.01,
  }]
  
  dataset.forEach((entity) => {
    const entityId = 'e' + entityNodes.length.toString()
    entityNodes.push({
      id: entityId,
      name: entity[nameAttrib] ? entity[nameAttrib] : `Unnamed (ID: ${entityId})`,
      value: 5,
      color: 'hsl(0, 0%, 25%)',
      primitives: []
    })
    traverseObject([], entity, entityId)
  })

  const maxNest = primNodes.map((prim) => prim.keys.length).reduce((a, b) => Math.max(a, b))
  let i = 1
  while (i < maxNest + 1) {
    const keyNest = keyNodes.filter((keyNode) => keyNode.keys.length === i)
    if (i === 1) {
      keyNest.forEach((mainKey, index) =>
        {
          mainKey.color = `hsl(${360 / keyNest.length * index}, 20%, 25%)`
        }
      )
    }
    else {
      keyNest.forEach((keyNode) => {
        const parentKey = keyNodes.find((node) => node.id === keyNode.parent)
        keyNode.color = parentKey.color
      })
    }
    i++
  }

  primNodes.forEach((primNode) => {
    const parentKey = keyNodes.find((node) => node.id === primNode.parent)
    const hue = parentKey.color.match(/\d+/)[0]
    primNode.color = `hsl(${hue}, 50%, 50%)`
  })

  return {
    entityNodes,
    primNodes,
    keyNodes,
  }
}