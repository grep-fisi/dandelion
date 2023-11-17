let links = []

const entityRootLinker = ({ entityNodes }) => {
  entityNodes.forEach((entity) => {
    links.push({
      source: 'root',
      target: entity.id,
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
      visible: false,
    })
  })
}

const primKeyLinker = ({ primNodes }) => {
  primNodes.forEach((prim) => {
    links.push({
      source: prim.parent,
      target: prim.id,
    })
  })
}

const keyKeyLinker = ({ keyNodes }) => {
  keyNodes.filter((d) => d.keys.length > 1).forEach((keyNode) => {
    links.push({
      source: keyNode.parent,
      target: keyNode.id,
    })
  })
}


export default function genLinks({ entityNodes, primNodes, keyNodes }) {
  // const maxNest = primNodes.map((prim) => prim.keys.length).reduce((a, b) => Math.max(a, b))
  links = []

  entityRootLinker({ entityNodes })
  rootKeysLinker({ keyNodes })
  keyKeyLinker({ keyNodes })
  primKeyLinker({ primNodes })
  
  return links
}