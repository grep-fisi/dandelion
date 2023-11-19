import files from './datasets/files.json'
import GraphView from './components/GraphView/GraphView'
import { useEffect, useState, useMemo } from 'react'
import { useDisclosure } from '@mantine/hooks'
import { Dialog, TextInput } from '@mantine/core'
import genInitNodes from './processing/genInitNodes'
import genInitLinks from './processing/genInitLinks'

export default function App() {
  const initNodes = useMemo(() => genInitNodes(files, 'name'), [])
  const initLinks = genInitLinks(initNodes)
  const [data, setData] = useState({ ...initNodes, ...initLinks })
  // const [filterOpened, { filterToggle, filterClose }] = useDisclosure(false)
  // const [filterPlaceholder, setFilterPlaceholder] = useState('')
  // const [filterInput, setFilterInput] = useState('')
  // const [filterInputInvalid, setFilterInputInvalid] = useState(false)
  
  // useEffect(() => {
  //   setRawData(genGraph(files, 'name'))
  // }, [])

  // useEffect(() => {
  //   function handleKeyDown(event) {
  //     if (event.ctrlKey && event.altKey && event.key === 'f') {
  //       toggle()
  //     } else if (event.key === 'Escape' && opened) {
  //       close()
  //     } else if (event.key === 'Enter' && opened) {
  //       handleEnter()
  //     } else if (event.key == 'Tab' && opened && input === '') {
  //       event.preventDefault()
  //       setInput(placeholder)
  //     }
  //   }
  //   document.addEventListener('keydown', handleKeyDown)
  //   return () => {
  //     document.removeEventListener('keydown', handleKeyDown)
  //   }
  // }, [toggle, close, opened, input, placeholder])

  // useEffect(() => {
  //   if (opened) {
  //     const randomFile = rawData[Math.floor(Math.random() * rawData.length)]
  //     const randomTagIndex = Math.floor(Math.random() * (randomFile.tags.length - 2)) + 2
  //     setPlaceholder(randomFile.tags[randomTagIndex])
  //   }
  // }, [rawData, opened])

  // useEffect(() => {
  //   setInvalid(false)
  // }, [opened, input])

  // const handleEnter = () => {
  //   if (input === '') {
  //     setRawData(rawData)
  //     return
  //   }
  // }

  return (
    <>
      {/* <Dialog
        styles={{
          root: { backgroundColor: '#fff0' }
        }}
        position={{ top: 20, left: 20 }}
        opened={opened}
        onClose={close}
        size="lg"
        radius="md"
      >
        <TextInput
          placeholder={placeholder}
          style={{ flex: 1 }}
          value={input}
          onChange={(event) => {
            setInput(event.currentTarget.value)
          }}
          error={invalid}
        />
      </Dialog> */}
      <GraphView rawInitData={data} />
    </>
  )
}
