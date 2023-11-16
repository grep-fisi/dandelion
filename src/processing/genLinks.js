const ROOT_KEYS_DISTANCE = 30
const KEYS_MAX_DISTANCE = 10

let links = []

const entityRootLinker = ({ entityNodes, maxNest }) => {
  entityNodes.forEach((entity) => {
    links.push({
      source: 'root',
      target: entity.id,
      distance: KEYS_MAX_DISTANCE / maxNest,
      visible: false,
    })
  })
}

const rootKeysLinker = ({ keyNodes }) => {
  const rootKeys = keyNodes.filter((keyNode) => keyNode.parent === 'root')
  rootKeys.forEach((rootKey) => {
    links.push({
      source: 'root',
      target: rootKey.id,
      distance: ROOT_KEYS_DISTANCE,
      visible: false,
    })
  })
}

const primKeyLinker = ({ primNodes, maxNest }) => {
  primNodes.forEach((prim) => {
    links.push({
      source: prim.parent,
      target: prim.id,
      distance: KEYS_MAX_DISTANCE / maxNest
    })
  })
}

const keyKeyLinker = ({ keyNodes, maxNest }) => {
  let i = maxNest
  while(i > 1) {
    keyNodes.filter((keyNode) => keyNode.keys.length === i).forEach((keyNode) => {
      links.push({
        source: keyNode.parent,
        target: keyNode.id,
        distance: KEYS_MAX_DISTANCE / (i - 1)
      })
    })
    i--
  }
}


export default function genLinks({ entityNodes, primNodes, keyNodes }) {
  const maxNest = primNodes.map((prim) => prim.keys.length).reduce((a, b) => Math.max(a, b))
  links = []

  entityRootLinker({ entityNodes, maxNest })
  rootKeysLinker({keyNodes})
  keyKeyLinker({keyNodes, maxNest})
  primKeyLinker({primNodes, maxNest})
  
  return links
}