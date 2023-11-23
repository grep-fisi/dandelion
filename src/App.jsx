import { useEffect, useState } from 'react';
import { FileButton, Button, Group, Text } from '@mantine/core';
import Container from './Container';

export default function App() {
  const [file, setFile] = useState(null)
  const [fileContent, setFileContent] = useState(null)
  
  useEffect(() => {
    const reader = new FileReader()
    file && reader.readAsText(file)
    reader.addEventListener(
      "load",
      () => {setFileContent(JSON.parse(reader.result))},
      false,
    );
  }, [file])

  return (
    <>
      {
        fileContent ?
        <Container file={fileContent} />
        : <Group justify="center">
          <FileButton onChange={setFile} accept=".json">
            {(props) => <Button {...props} color="#303030" >
              <Text size='15px' c="#C1C2C5">
                Sube un dataset en formato JSON
              </Text>  
            </Button>}
          </FileButton>
        </Group>
      }
      {/* <Container /> */}
    </>
  )
}