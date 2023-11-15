import genNodes from './genNodes.js'
import genLinks from './genLinks.js'

export default function genGraph(dataset, nameAttrib) {
  const nodes = genNodes(dataset, nameAttrib)
  const links = genLinks(nodes)
  return {
    nodes: [
      ...nodes.entityNodes,
      ...nodes.primNodes,
      ...nodes.keyNodes,
    ],
    links: [
      // ...links.entityPrimLinks,
      ...links.primKeyLinks, 
      // ...links.keyKeyLinks,
    ]
  }
}