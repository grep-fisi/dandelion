import ForceGraph2D from 'react-force-graph-2d'
import { forceManyBody, forceX, forceY } from 'd3-force'
import { useEffect, useRef, useState } from 'react'
import { useViewportSize } from '@mantine/hooks'

const NO_INTERACTION = {
  hovered: null,
  clicked: null
}

const NODE_REL_SIZE = 7
const REPULSION = -250
const COOLDOWN_TIME = 7000

const entityValue = (entity) => {
  let value = 1
  entity.relationships.forEach((r) => {
    value += r.sharedAttributes.length
  })
  return value
}

export default function GraphView({ data }) {
  const forceGraph = useRef(null)
  const [state, setState] = useState(NO_INTERACTION)
  const { height, width } = useViewportSize()
  const findNode = (nodeId) => data.nodes.find((n) => n.id === nodeId)
  const [decay, setDecay] = useState([0.01, 0.1])

  /* Custom forces */

  useEffect(() => {
    forceGraph.current.d3Force('centerX', forceX(0))
    forceGraph.current.d3Force('centerY', forceY(0))
  })

  useEffect(() => {
    forceGraph.current.d3Force('charge', forceManyBody()
      .strength(
        (node) => {
          if (node.children) {
            return REPULSION * node.children.length
          }
          const nodeEntities = node.entities
          if (nodeEntities) {
            return REPULSION * node.entities.length / 2
          }
          const clickedRels = findNode(state.clicked)?.relationships
          if (clickedRels) {
            if (state.clicked === node.id) {
              return REPULSION * entityValue(node)
            }
            if (node.relationships) {
              return REPULSION * clickedRels.find((r) => r.id === node.id).sharedAttributes.length
            }
          }
          if (node.relationships) {
            return REPULSION * entityValue(node) * 0.15
          }
          return REPULSION
        }
      ))
  }, [state.clicked])

  /* Event handlers */

  function handleNodeHover(node) {
    setState({
      hovered: node?.id,
      clicked: state.clicked
    })
  }

  function handleNodeClick(clickedNode) {
    if (clickedNode.relationships) {
      if (decay[0] === 0.01 && decay[1] === 0.1) {
        setDecay([0.05, 0.5])
      }
      forceGraph.current.d3ReheatSimulation()
      if (state.clicked === clickedNode.id) {
        setState(NO_INTERACTION)
        return
      }
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
    if (state.clicked) {
      forceGraph.current.d3ReheatSimulation()
      setState(NO_INTERACTION)
    }
  }

  /* Styling */

  const setNodeColor = (node) => {
    const clickedNode = findNode(state.clicked)
    const hoveredNode = findNode(state.hovered)

    if (state.clicked !== null) {
      if (state.clicked === node.id) {
        return node.color?.replace(/(\d+)%\)/, '75%)')
      }
      if (clickedNode.relationships) {
        if (clickedNode.relationships.map((r) => r.id).includes(state.hovered)) {
          if (clickedNode.primitives.includes(node.id) && hoveredNode.primitives.includes(node.id)) {
            return node.color?.replace(/(\d+)%\)/, '75%)')
          }
        }
        else if (clickedNode.primitives.includes(node.id)) {
          return node.color?.replace(/(\d+)%\)/, '75%)') 
        }
      }
      if (clickedNode.entities) {
        if (hoveredNode?.entities && state.hovered !== state.clicked) {
          if (clickedNode.entities.includes(node.id) && hoveredNode.entities.includes(node.id)) {
            return node.color?.replace(/(\d+)%\)/, '75%)')
          }
        }
        else if (clickedNode.entities.includes(node.id)) {
          return node.color?.replace(/(\d+)%\)/, '75%)') 
        }
      }
      return node.color?.replace(/(\d+)%\)/, '25%)')
    } else {
      if (state.hovered === node.id) {
        return node.color?.replace(/(\d+)%\)/, '75%)')
      }
      if (hoveredNode?.entities?.includes(node.id)) {
        return node.color?.replace(/(\d+)%\)/, '75%)')
      }
      if (hoveredNode?.primitives?.includes(node.id)) {
        return node.color?.replace(/(\d+)%\)/, '75%)')
      }
    }
    return node.color
  }

  const setNodeVal = (node) => {
    if (node.id[0] === 'k') {
      return 0.25
    }
    if (node.entities) {
      return node.entities.length + 1
    }
    const clickedRels = findNode(state.clicked)?.relationships
    if (clickedRels) {
      if (state.clicked === node.id) {
        return NODE_REL_SIZE * entityValue(node) * 0.5
      }
      if (node.relationships) {
        return NODE_REL_SIZE * clickedRels.find((r) => r.id === node.id).sharedAttributes.length * 0.5
      }
    }
    if (node.relationships) {
      return NODE_REL_SIZE * entityValue(node) * 0.05
    }
    return 10
  }

  const setLinkColor = (link) => {
    return link.color || '#353535'
  }

  useEffect(() => {
    setTimeout(() => {
      forceGraph.current.zoomToFit(0, height / 20)
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
        d3AlphaDecay={decay[0]}
        d3VelocityDecay={decay[1]}
      />
    </>
  )
}