/* Invisible links */

const rootEntitiesLinker = ({ entityNodes }) => {
  const entityRootLinks = []
  entityNodes.forEach((entity) => {
    entityRootLinks.push({
      source: 'root',
      target: entity.id,
      visible: false,
    })
  })
  return entityRootLinks
}

const rootKeysLinker = ({ keyNodes }) => {
  const roots = keyNodes.filter((keyNode) => keyNode.parent === 'root')
  const rootKeyLinks = []
  roots.forEach((rootKey) => {
    rootKeyLinks.push({
      source: 'root',
      target: rootKey.id,
      visible: false,
    })
  })
  return rootKeyLinks
}

/* Visible links */

const primKeyLinker = ({ primNodes }) => {
  const primKeyLinks = []
  primNodes.forEach((prim) => {
    primKeyLinks.push({
      source: prim.parent,
      target: prim.id,
    })
  })
  return primKeyLinks
}

const keyKeyLinker = ({ keyNodes }) => {
  const keyKeyLinks = []
  keyNodes.filter((d) => d.keys.length > 1).forEach((keyNode) => {
    keyKeyLinks.push({
      source: keyNode.parent,
      target: keyNode.id,
    })
  })
  return keyKeyLinks
}

export default function genInitLinks({ entityNodes, primNodes, keyNodes }) {
  // const maxNest = primNodes.map((prim) => prim.keys.length).reduce((a, b) => Math.max(a, b))
  return {
    rootEntitiesLinks: rootEntitiesLinker({ entityNodes }),
    rootKeysLinks: rootKeysLinker({ keyNodes }),
    primKeyLinks: primKeyLinker({ primNodes }),
    keyKeyLinks: keyKeyLinker({ keyNodes }),
  }
}