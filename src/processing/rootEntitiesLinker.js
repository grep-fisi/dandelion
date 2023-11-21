export default function rootEntitiesLinker ( entityNodes ) {
  const entityRootLinks = []
  entityNodes.forEach((entity) => {
    entityRootLinks.push({
      source: 'root',
      target: entity.id,
      visible: false,
    })
  })
  return (entityRootLinks)
}