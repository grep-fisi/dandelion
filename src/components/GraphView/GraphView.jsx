import ForceGraph2D from 'react-force-graph-2d'
import { forceManyBody, forceX, forceY } from 'd3-force'
import { useEffect, useRef, useState } from 'react'
import { useViewportSize, useDisclosure } from '@mantine/hooks'
import PropTypes from 'prop-types'
import { Dialog, Code, Tabs, Button, Text } from '@mantine/core'
import { Scrollbars } from 'react-custom-scrollbars-2'
import { saveAs } from 'file-saver'

const NO_INTERACTION = {
  hovered: null,
  clicked: null
}

const NODE_REL_SIZE = 7
const REPULSION = -250

const entityValue = (entity) => {
  let value = 1
  entity.relationships.forEach((r) => {
    value += r.sharedAttributes.length
  })
  return value
}

export default function GraphView({ data, file }) {
  const forceGraph = useRef(null)
  const [state, setState] = useState(NO_INTERACTION)
  const findNode = (nodeId) => data.nodes.find((n) => n.id === nodeId)
  const clickedNode = findNode(state.clicked)
  const hoveredNode = findNode(state.hovered)
  const { height, width } = useViewportSize()
  const [decay, setDecay] = useState([0.01, 0.1])
  const [opened, { toggle, close }] = useDisclosure(false);

  const clickedEntityObj = file.find((f) => f.name === clickedNode?.name)

  /* Custom forces */

  useEffect(() => {
    forceGraph.current.d3Force('centerX', forceX(0))
    forceGraph.current.d3Force('centerY', forceY(0))
  }, [])

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
              return REPULSION * clickedRels.find((r) => r.id === node.id)?.sharedAttributes.length
            }
          }
          if (node.relationships) {
            return REPULSION * entityValue(node) * 0.15
          }
          return REPULSION
        }
      ))
    if (clickedNode) {
      forceGraph.current.d3ReheatSimulation()
      !opened && toggle()
    }
    if (!clickedNode && opened) {
      close()
      forceGraph.current.d3ReheatSimulation()
    }
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
      if (clickedNode?.relationships) {
        if (clickedNode.relationships.map((r) => r.id).includes(state.hovered)) {
          if (clickedNode.primitives.includes(node.id) && hoveredNode.primitives.includes(node.id)) {
            return node.color?.replace(/(\d+)%\)/, '75%)')
          }
        }
        else if (clickedNode.primitives.includes(node.id)) {
          return node.color?.replace(/(\d+)%\)/, '60%)') 
        }
      }
      if (clickedNode?.entities) {
        if (hoveredNode?.entities && state.hovered !== state.clicked) {
          if (clickedNode.entities.includes(node.id) && hoveredNode.entities.includes(node.id)) {
            return node.color?.replace(/(\d+)%\)/, '75%)')
          }
        }
        else if (clickedNode.entities.includes(node.id)) {
          return node.color?.replace(/(\d+)%\)/, '75%)')
        }
      }
      if (node.entities) {
        return node.color?.replace(/(\d+)%\)/, '25%)').replace(/(\d+)%/, '35%')
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
        return NODE_REL_SIZE * clickedRels.find((r) => r.id === node.id)?.sharedAttributes.length * 0.5
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
      forceGraph.current.zoomToFit(0, height / 10)
    }, 1)
  }, [height, width])

  
  return (
    <>
      <Dialog
        styles={{ root: { 
          border: clickedNode ? '1px solid #303030' : 'none',
          backgroundColor: '#272727',
          maxHeight: '75vh',
        }}}
        opened={opened} 
        onClose={close} 
        size="auto"
        position={{ top: 40, left: 30 }}
      >
      {
        clickedNode?.entities &&
        <Scrollbars autoHide autoHeight autoHeightMax={'50vh'} renderThumbVertical={() => <div style={{ backgroundColor: '#303030', borderRadius: '20px' }} className="thumb-vertical"/>}>
          <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}></div>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <div>
            <Code color='#272727' c={clickedNode.color.replace(/(\d+)%\)/, '60%)')}>
              {findNode(state.clicked).keys.join(' · ') + ":"}
            </Code>
            <Code color='#272727' c={clickedNode.color.replace(/(\d+)%\)/, '75%)')}>
              {findNode(state.clicked).actualName}
            </Code>
          </div>
          <div>
          {
            clickedNode.entities.map((e, index) => 
              <div key={index}>
                <Code color='#272727' c={
                  hoveredNode?.entities?.includes(e) ? 
                    hoveredNode.color.replace(/(\d+)%\)/, '65%)') 
                    : '#C1C2C5' 
                } >
                  {findNode(e).name}
                </Code>
              </div>
            )
          }
          </div>
          <Button onClick={() => {
            const blob = new Blob([JSON.stringify(clickedNode.entities.map((e) => findNode(e).name), null, 3)], { type: "text/plain;charset=utf-8" });
            saveAs(blob, clickedNode.keys.join('.') + "=" + clickedNode.actualName + ".json");
          }} color="#303030" >
            <Text size='15px' c="#C1C2C5">
              Exportar
            </Text>
          </Button>
        </div>
        </Scrollbars>
      }
      {
        clickedNode?.primitives &&
        <Scrollbars autoHide autoHeight autoHeightMax={500} renderThumbVertical={() => <div style={{ backgroundColor: '#303030', borderRadius: '20px' }} className="thumb-vertical"/>}>
          <Tabs color="#606060" defaultValue="entity">
            <Tabs.List >
              <Tabs.Tab value='entity'>Entidad</Tabs.Tab>
              <Tabs.Tab value='connections'>Conexiones</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value='entity'>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '10px',
                paddingTop: '12px',
              }}>
              {
                Object.keys(clickedEntityObj)?.map((k, index) =>
                  <pre key={index}>
                    <Code block="true" color='#272727' c={
                      data.nodes.find((n) => n.name === k)?.color.replace(/(\d+)%\)/, '65%)').replace(/(\d+)%/, '50%')
                    }>
                    {k + ": " + JSON.stringify(clickedEntityObj[k], null, 3)}
                    </Code>
                  </pre>
                )
              }
              <Button onClick={() => {
                const blob = new Blob([JSON.stringify(clickedEntityObj, null, 3)], { type: "text/plain;charset=utf-8" });
                saveAs(blob, clickedNode.name + ".json");
              }} color="#303030" >
                <Text size='15px' c="#C1C2C5">
                  Exportar
                </Text>
              </Button>
              </div>
            </Tabs.Panel>
            <Tabs.Panel value='connections'>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                paddingRight: '10px',
                gap: '10px',
                paddingTop: '20px'
              }}>
              { 
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {clickedNode.relationships.sort((a, b) => b.sharedAttributes.length - a.sharedAttributes.length).map((r, index) => {
                    return (
                      <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <Code color='#272727'>
                          {"name: " + r.name}
                        </Code>
                        <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
                          {r.sharedAttributes.map((s, ind) =>
                          <Code color='#272727' c={s.color.replace(/(\d+)%\)/, '65%)')} key={ind}>
                            {s.name}
                          </Code>)}
                        </div>
                        
                      </div>
                    )
                  })}
                </div>
              }
              <Button onClick={() => {
                const blob = new Blob([
                  JSON.stringify(
                    clickedNode.relationships.map((r) => {
                      return {
                        name: r.name,
                        sharedAttributes: r.sharedAttributes.map((s) => s.name)
                      }
                    }), null, 3
                  )
                ], { type: "text/plain;charset=utf-8" });
                saveAs(blob, clickedNode.name + ".json");
              }} color="#303030" >
                <Text size='15px' c="#C1C2C5">
                  Exportar
                </Text>
              </Button>
              </div>
            </Tabs.Panel>
          </Tabs>
        </Scrollbars>
      }
      </Dialog>
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

GraphView.propTypes = {
  data: PropTypes.shape({
    nodes: PropTypes.array.isRequired,
    links: PropTypes.array.isRequired
  }).isRequired,
  file: PropTypes.array.isRequired
}