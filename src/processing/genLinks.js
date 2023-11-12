export default function genLinks({ entityNodes, primNodes, keyNodes }) {
  let entityPrimLinks = []
  let primKeyLinks = []
  let keyKeyLinks = []

  entityNodes.forEach((entity) => {
    entity.primitives.forEach((primId) => {
      entityPrimLinks.push({
        source: 
          primId,
        target: 
          entity.id,
      })
    })
  })

  primNodes.forEach((prim) => {
    primKeyLinks.push({
      source: 
        prim.key,
      target: 
        prim.id,
    })
  })

  keyNodes.forEach((key) => {
    if (key.parent) {
      keyKeyLinks.push({
        source: 
          key.key,
        target: 
          key.id,
      })
    }
  })

  return {
    entityPrimLinks,
    primKeyLinks,
    // keyKeyLinks
  }
}