import { useEffect, useState } from 'react';
import { FileButton, Button, Text } from '@mantine/core';
import Container from './Container';
import grafosomaIcon from './assets/grafosoma.svg'

import styles from './App.module.css';

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
      : 
      <div className={styles.container}>
        <img src={grafosomaIcon} alt="Grafosoma" className={styles.logo} />
        <FileButton onChange={setFile} accept=".json">
          {(props) => <Button className={styles.crearbutton} {...props} color="#303030" >
            <Text size='15px' c="#C1C2C5">
              Crear proyecto
            </Text>  
          </Button>}
        </FileButton>
      </div>  
    }
    </>
  )
}