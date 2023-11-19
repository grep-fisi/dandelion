export default function linkCurvature ( dataLinks ) {
  let sameNodesLinks = {}
  const curvatureMinMax = 0.25

  dataLinks.forEach((link) => {
    link.nodePairId =
      link.source <= link.target
        ? link.source + '_' + link.target
        : link.target + '_' + link.source
    let map = null
    if (link.source != link.target) {
      map = sameNodesLinks
    }
    if (!map[link.nodePairId]) {
      map[link.nodePairId] = []
    }
    map[link.nodePairId].push(link)
  })

  Object.keys(sameNodesLinks)
  .filter((nodePairId) => sameNodesLinks[nodePairId].length > 1)
  .forEach((nodePairId) => {
    let links = sameNodesLinks[nodePairId]
    let lastIndex = links.length - 1
    let lastLink = links[lastIndex]
    lastLink.curvature = curvatureMinMax
    let delta = (2 * curvatureMinMax) / lastIndex
    for (let i = 0; i < lastIndex; i++) {
      links[i].curvature = -curvatureMinMax + i * delta
      if (lastLink.source !== links[i].source) {
        links[i].curvature *= -1
      }
    }
  })
}