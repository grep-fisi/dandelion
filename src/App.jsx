// import { useState } from 'react';
// import { FileButton, Button, Group, Text } from '@mantine/core';
import Container from './Container';

export default function App() {
  // const [file, setFile] = useState(null)

  return (
    <>
      {/* {
        file ?
        <Container file={JSON.parse(file)} />
        : <Group justify="center">
          <FileButton onChange={setFile} accept=".json">
            {(props) => <Button {...props} color="#303030" >
              <Text size='15px' c="#C1C2C5">
                Sube un dataset en formato JSON
              </Text>  
            </Button>}
          </FileButton>
        </Group>
      } */}
      <Container />
    </>
  )
}