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
  // } 
  // else if (keys.length === 0) {
  //   /* Root key */
  //   keyNodes.push({ id: 'k0', name: 'Root', keys: [], key: null, children: [] })
  } else if (keys.length > 0) {
    keyId = 'k' + keyNodes.length.toString()
    let keyNode = {
      id: keyId,
      name: keys[keys.length - 1],
      keys: keys,
      parent: null,
      children: [],
      entities: [],
      color: '#353535'
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

export default function genNodes(dataset, nameAttrib, colors) {
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
  }]
  
  dataset.forEach((entity) => {
    const entityId = 'e' + entityNodes.length.toString()
    entityNodes.push({
      id: entityId,
      name: entity[nameAttrib] ? entity[nameAttrib] : `Unnamed (ID: ${entityId})`,
      value: 10,
      primitives: []
    })
    traverseObject([], entity, entityId)
  })


  return {
    entityNodes,
    primNodes,
    keyNodes,
  }
}