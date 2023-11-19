import ForceGraph2D from 'react-force-graph-2d'
import { forceCollide, forceManyBody, forceX, forceY } from 'd3-force'
import { useEffect, useRef, useState } from 'react'
import { useViewportSize } from '@mantine/hooks'

import linkCurvature from './linkCurvature'

const NO_INTERACTION = {
  hovered: null,
  clicked: null
}

const NODE_REL_SIZE = 7

export default function GraphView({ initData }) {
  let data = useRef({
    nodes: [
      ...initData.entityNodes,
      ...initData.primNodes,
      ...initData.keyNodes,
    ],
    links: [
      ...initData.rootEntitiesLinks,
      ...initData.rootKeysLinks,
      ...initData.primKeyLinks,
      ...initData.keyKeyLinks,
    ]
  }).current
  const [state, setState] = useState(NO_INTERACTION)
  const forceGraph = useRef(null)
  const focusMode = state.clicked !== null
  const { height, width } = useViewportSize()

  /* Custom forces */

  useEffect(() => {
    forceGraph.current.d3Force('centerX', forceX(0))
    forceGraph.current.d3Force('centerY', forceY(0))
    forceGraph.current.d3Force('charge', forceManyBody()
      .strength(
        (d) => -d.primitives ? d.primitives.length * 100 : -200
      ))
    forceGraph.current.d3Force('collide', forceCollide(
      (d) => d.entities ? Math.sqrt((24 * NODE_REL_SIZE * d.entities.length) / Math.PI) : NODE_REL_SIZE
    ))
  }, [])

  /* Event handlers */

  function handleNodeHover(node) {
    console.log(node)
    setState({
      hovered: node || null,
      clicked: state.clicked
    })
  }

  function handleNodeClick(clickedNode) {
    if (state.clicked === clickedNode.id) {
      data = initData
      setState(NO_INTERACTION)
      return
    }

    if (clickedNode.relationships) {
      clickedNode.relationships.forEach((r) => {
        r.sharedAttributes.forEach((a) => {
          data.links.push({
            source: clickedNode.id,
            target: r.id,
            color: a.color
          })
        })
      })
    }
    
    setState({
      hovered: state.hovered,
      clicked: clickedNode.id
    })
  }

  function handleNodeDragEnd() {
    setState({
      hovered: NO_INTERACTION.hovered,
      clicked: state.clicked
    })
  }

  function handleBackgroundClick () {
    data = initData
    setState(NO_INTERACTION) 
  }

  /* Styling */

  // useEffect(() => {
  //   linkCurvature(data.links)
  // }, [state])

  const setNodeColor = (node) => {
    const hoveredNode = data.nodes.find((n) => n.id === state.hovered)
    if (
      hoveredNode && (
        state.hovered === node.id ||
        hoveredNode.entities?.includes(node.id) ||
        hoveredNode.primitives?.includes(node.id)
      )
    ) {
      return node.color.replace(/(\d+)%\)/, '75%)')
    }
    
    const clickedNode = data.nodes.find((n) => n.id === state.clicked)
    if (
      (!focusMode && node.entities) || 
      (focusMode && (
        state.clicked === node.id ||
        clickedNode.entities?.includes(node.id) ||
        clickedNode.primitives?.includes(node.id) ||
        clickedNode.relationships?.id === node.id
      ))
    ) {
      return node.color?.replace(/(\d+)%\)/, '50%)')
    }

    return node.color?.replace(/(\d+)%\)/, '25%)')
  }

  const setNodeVal = (node) => {
    if (node.id[0] === 'k') {
      return 0.1
    }
    if (node.entities) {
      return node.entities.length + 1
    }
    if (node.relationships) {
      return node.relationships.length
      // return node.relationships.reduce((acc, r) => {
      //   return acc + r.sharedAttributes.length + 1
      // })
    }
    if (state.clicked[0] === 'e') {
      const clickedEntity = data.nodes.find((e) => e.id === state.clicked)
      if (clickedEntity.relationships.includes((r) => r.id === node.id)) {
        return node.sharedAttributes.length + 1
      }
    }
    return node.value
  }

  const setLinkColor = (link) => {
    return link.color || '#353535'
  }

  useEffect(() => {
    setTimeout(() => {
      forceGraph.current.zoomToFit(0, height / 10)
    }, 1)
  }, [height, width])

  

  return (
    <>
      <ForceGraph2D
        ref={forceGraph}
        width={width}
        height={height}
        graphData={data} 
        autoPauseRedraw={true}
        linkCurvature={'curvature'}
        onNodeHover={handleNodeHover}
        onNodeDrag={handleNodeHover}
        onNodeDragEnd={handleNodeDragEnd}
        onNodeClick={handleNodeClick}
        onBackgroundClick={handleBackgroundClick}
        onLinkClick={handleBackgroundClick}
        backgroundColor={'#ffffff0'}
        nodeRelSize={NODE_REL_SIZE}
        nodeColor={setNodeColor} 
        linkColor={setLinkColor}
        nodeVal={setNodeVal}
        nodeVisibility={(node) => node.visible !== false}
        linkVisibility={(link) => link.visible !== false}
        d3AlphaDecay={0.01}
        d3VelocityDecay={0.1}
      />
    </>
  )
}