export const EMPTY_NODE_STRUCT = {
  nodes: {
    main: null,
    subscribers: new Set()
  },
  links: new Set()
}

export default function updateSet (data, node, action) {
  let set = EMPTY_NODE_STRUCT

  if (action === 'add') {
    set.nodes.main.add(node);
  } else if (action === 'delete') {
    set.nodes.main.delete(node);
  }

  if (node.primitives) {
    node.primitives.forEach((primitiveId) => {
      const primitiveNode = data.nodes.find((node) => node.id === primitiveId)
      if (action === 'add') {
        set.nodes.subscribers.add(primitiveNode);
      } else if (action === 'delete') {
        set.nodes.subscribers.delete(primitiveNode);
      }
    })
  }

  if (node.entities) {
    node.entities.forEach((entity) => {
      const entityNode = data.nodes.find((node) => node.id === entity)
      if (action === 'add') {
        set.nodes.subscribers.add(entityNode);
      } else if (action === 'delete') {
        set.nodes.subscribers.delete(entityNode);       
      }
    })
  }

  return set
}