let entityNodes = []
let primNodes = []
let keyNodes = []

let entityPrimLinks = []
let primKeyLinks = []
let keyKeyLinks = []

// function arraysEqual(a, b) {
//   // if (!Array.isArray(a) || !Array.isArray(b)) {
//   //   return false
//   // }
//   return (a.length === b.length && a.every((element, index) => element === b[index]));
// }

function getObjBranches(keysId, value, entityId) {
  const keyId = keysId[keysId.length - 1]
  if (
    typeof value === 'string' || 
    typeof value === 'number' || 
    typeof value === 'boolean' || 
    value === null
    ) {
    /* Primitive */
    let primId
    const primParentId = keyNodes.find((node) => node.id === keyId).id
    const existingPrimNodeId = primNodes.find((node) => node.name === value && node.parent === primParentId).id
    if (existingPrimNodeId) {
      primId = existingPrimNodeId
    } else {
      primId = 'p' + primNodes.length.toString() 
      primNodes.push({
        id: primId,
        name: value,
        parent: primParentId
      })
      // create node for its parent
      // keyNodes.push({
      //   id: 'k' + keyNodes.length.toString(),
      //   name: keyId,
      //   parent: primParentId
      // })
      // link it to its parent
      if (primParentId) {
        primKeyLinks.push({
          source: primParentId,
          target: primId
        })
      }
    }
    // link it to its entity
    entityPrimLinks.push({
      source: primId,
      target: entityId
    })
    return [[keysId, value, entityId]]
  }
  let branch = []
  if (Array.isArray(value)) {
    /* Array */
    for (const [, item] of value.entries()) {
      branch.push(...getObjBranches(keys, item, entityId))
    }
    return branch
  }
  /* Object */
  
  const objParentId = keys.length > 1 ? keyNodes.find((node) => node.id === ('k' + keys[keys.length - 2])).id : null
  if (!keyNodes.find((node) => node.name === key && node.parent === objParentId)) {
    const objId = 'k' + keyNodes.length.toString()
    keyNodes.push({
      id: objId,
      name: key,
      parent: objParentId
    })
    // link it to its parent
    if (objParentId) {
      keyKeyLinks.push({
        source: objParentId,
        target: objId
      })
    }
  }
  for (const [childKey, childValue] of Object.entries(value)) {
    const childKeys = keys ?
      (Array.isArray(keys) ? keys.concat(childKey) : [keys].concat(childKey)) 
    : [childKey]
    branch.push(...getObjBranches(childKeys, childValue, entityId))
  }
  return branch
}

export default function genGraph(dataset, nameAttrib) {
  dataset.forEach((entity) => {
    const entityId = 'e' + entityNodes.length.toString()
    entityNodes.push({
      id: entityId,
      name: entity[nameAttrib] ? entity[nameAttrib] : `Unnamed (ID: ${entityId})`
    })
    getObjBranches([], entity, entityId)
  })
  return {
    // nodes: entityNodes.concat(primNodes).concat(keyNodes),
    nodes: keyNodes.concat(primNodes),
    links: primKeyLinks
  }
}