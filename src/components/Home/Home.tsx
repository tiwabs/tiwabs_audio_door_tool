import { Text, Paper, Center, Space, TextInput, Button, Select, Modal, Group, SimpleGrid, ScrollArea, Card, Title, ActionIcon, Tooltip } from "@mantine/core"
import { Dropzone, DropzoneProps, MIME_TYPES } from '@mantine/dropzone';
import { NotificationsProvider, showNotification } from '@mantine/notifications';
import { useEffect, useState } from "react"
import { AiFillFileAdd } from "react-icons/ai";
import { BiError } from "react-icons/bi";
import { ImBin, ImPencil, ImInfo } from "react-icons/im";

const doorValue: any = []
var soundSet: string
var Params: string
var value: number

  
  function arrayFindExisting(findThisValue: string) {
    var result
    doorValue.find((item: any) => {
      if (item.doorName === findThisValue){
        result = true
      }
    })
    return result
  }

export function Home() {
  // when app has loaded receive config from electron
  const [config, setConfig] = useState<any>([])
  useEffect( () => { window.Main.on('Loaded', (receiveConfig: any) => { setConfig(receiveConfig); sendAvailableDoorSounds(receiveConfig.availableDoorSound) }) }, [])

  useEffect(()=> {
      // console.log(JSON.stringify(doorValue, null, '\t'))
  }, [doorValue])
  
  // Shitty way to force re-render
  var random = Math.random() * 1000
  const [render, setRender] = useState<number>(0)


  const [importOpened, setImportOpened] = useState(false);
  const [newOpened, setNewOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false)

  const [HashToConvert, setHashToConvert] = useState<string>('')
  const [convertedHash, setConvertedHash] = useState<string>('')

  const [fileName, setFileName] = useState<string>('')

  function getHash(key: string) {
    var keyLowered = key.toLowerCase()
    var length = keyLowered.length
    var hash, i

    for (hash = i = 0; i < length; i++){
        hash += keyLowered.charCodeAt(i)
        hash += (hash << 10)
        hash ^= (hash >>> 6)
    }

    hash += (hash << 3)
    hash ^= (hash >>> 11)
    hash += (hash << 15)

    setConvertedHash((hash >>> 0).toString(16))
    return ((hash >>> 0).toString(16))
  }

  function arrayFindValue() {
    config.availableDoorSound.find((item: any) => {
      if (item.name === selectedDoorSound){
        soundSet = item.soundSet
        Params = item.Params
        value = item.value
      }
    })
  }

  const [availableDoorSound, setAvailableDoorSound] = useState([])
  const [selectedDoorSound, setSelectedDoorSound] = useState<string | null>("")

  function sendAvailableDoorSounds(availableDoorSound: any){
    const initAvailableDoorSound: any = []
    availableDoorSound.forEach((item: any) => {
      const data = {"value": item.name, "label": item.name}
      initAvailableDoorSound.push(data)
    })
    setAvailableDoorSound(initAvailableDoorSound)
  }

  const deleteCard = (value: any, index: number) => {
    value.splice(index, 1)
    setRender(random)
  }

  const doorsCard = () => {
    return doorValue.map((door : any, index: any) => (
      <>
        <Modal
        opened={editOpened}
        onClose={() => setEditOpened(false)}
        closeOnClickOutside={false}
        title="Edit Sound of the door"
        >
          <Select
            placeholder="Select the door sound"
            clearable
            value={selectedDoorSound}
            onChange={setSelectedDoorSound}
            data={availableDoorSound}
          />
          <Button variant="outline" color={'red'} onClick={() => {
            arrayFindValue()
            const newData = {"doorName": door.doorName, "doorHash": door.doorHash, "soundSet": soundSet, "Params": Params, "value": value}
            doorValue[index] = newData
          }}>Save Change</Button>
        </Modal>
        <Card key={index + 1}>
          <Group position="apart">
            <Title sx={{ fontSize: 20 }}>#{index + 1} | {door.doorName}</Title>
            <Group>
                <ActionIcon onClick={() => { setEditOpened(true) }}><ImPencil color={"blue"}/></ActionIcon>
                {/* <ActionIcon onClick={() => { editCard(doorValue, index) }}><ImPencil color={"blue"}/></ActionIcon> */}
                <ActionIcon onClick={() => { deleteCard(doorValue, index) }}><ImBin color={"red"}/></ActionIcon>
            </Group>
          </Group>
          {/* <Text>Door name: {door.doorName}</Text> */}
          <Text>Door hash: hash_{door.doorHash}</Text>
          <Text>Door sound hash: {door.soundSet}</Text>
          <Text>Door sound params: {door.Params}</Text>
          <Text>Door sound value: {door.value}</Text>
        </Card>
        <Space h="md"/>
      </>
    ))
  }

  return (
    <>
      <NotificationsProvider>
        {/* MODAL IMPORT FILE */}
        <Modal
          opened={importOpened}
          onClose={()=> {setImportOpened(false)}}
          closeOnClickOutside={false}
          title="Import Door audio files"
        >
          <Dropzone
            onDrop={(files) => {console.log('accepted files', files); console.log("path:" + files[0].path)}}
            onReject={(files) => console.log('rejected files', files)}
            maxSize={3 * 1024 ** 2}
            accept={["text/xml"]}
          >
            <Group position="center" spacing="xl" style={{ minHeight: 220, pointerEvents: 'none' }}>
              <Dropzone.Accept>
                Accepet
              </Dropzone.Accept>
              <Dropzone.Reject>
                Rejected
              </Dropzone.Reject>
              <Dropzone.Idle>
                <AiFillFileAdd/>
              </Dropzone.Idle>

              <div>
                <Text size="md" inline>
                  Drag your audio file here or click to select files
                </Text>
              </div>
            </Group>
          </Dropzone>
        </Modal>

        {/* MODAL NEW DOOR */}
        <Modal
          opened={newOpened}
          onClose={() => setNewOpened(false)}
          closeOnClickOutside={false}
          title="Generate sound for a new door"
        >
          <TextInput placeholder="Enter the door name" value={HashToConvert} onChange={(event) => {
            setHashToConvert(event.currentTarget.value)
            getHash(HashToConvert)}} 
          />
          <Space h="md"/>
          <Select
            placeholder="Select the door sound"
            clearable
            value={selectedDoorSound}
            onChange={setSelectedDoorSound}
            data={availableDoorSound}
          />
          <Space h="md"/>
          <Button
            variant="outline" color={'red'}
            onClick={() => {
              arrayFindValue()
              if (!arrayFindExisting(HashToConvert)) {
                const insertData = {"doorName": HashToConvert, "doorHash": getHash(HashToConvert), "soundSet": soundSet, "Params": Params, "value": value}
                doorValue.push(insertData)
                setRender(random)
              } else {
                showNotification({
                  autoClose: 2500,
                  title: "Error",
                  message: "This door already exist",
                  color: "red",
                  icon: "!",
                })
              }
              
            }}
          >
            Add a door
          </Button>
          <Space h="md"/>
          <Text sx={{ fontSize: "15px", color: "white" }}>
            Converted Hash: {convertedHash? convertedHash : "undefined"} | Door sound: {selectedDoorSound? selectedDoorSound : "undefined"}
          </Text>
        </Modal>
        <Paper
          sx={{
            width: 550,
            height: 820,
            backgroundColor: "rgba(37, 37, 37, 0.5)"
          }}
        >
          <Space h="20"/>
          <SimpleGrid cols={1} verticalSpacing="xs" sx={{padding: "10px"}}>
            <Group grow>
              <Group grow>
                <Button disabled variant="outline" color={'red'} onClick={()=> {setImportOpened(!importOpened)}}>Import file</Button>
                <Button disabled variant="outline" color={'red'} onClick={()=> {}}>Settings</Button>
              </Group>
              <Button variant="outline" color={'red'} onClick={()=> {setNewOpened(!newOpened)}}>Add a new door</Button>
            </Group>
          </SimpleGrid>
          <ScrollArea style={{ height: 680, padding: "10px"}}>
            {doorsCard()}
          </ScrollArea>
          <Group grow sx={{padding: '10px'}}>
            <TextInput placeholder="Enter the file name" value={fileName} onChange={(event) => {setFileName(event.currentTarget.value)}} 
            />
            <Button variant="outline" color={"red"} onClick={() => {
              if (fileName.length < 1) {
                showNotification({
                  autoClose: 2500,
                  title: "Error",
                  message: "You need to set the file name generate a file",
                  color: "red",
                  icon: "!",
                })
              } else if (doorValue.length < 1) {
                showNotification({
                  autoClose: 2500,
                  title: "Error",
                  message: "You need to add door before generate a file",
                  color: "red",
                  icon: "!",
                })
              } else {
                window.Main.sendMessage('generate', doorValue, fileName)
              }
              }}>Generate Audio File</Button>
          </Group>
          {/* <Space h="15px"/> */}
          <Center>
            <Text>Created by [</Text>
            <Text component="a" onClick={()=> {window.Main.sendMessage('discord', 'https://discord.gg/badHRSF')}} sx={{color: "red", "&:hover":{color: "blue"}}}> Tiwabs</Text>
            <Text>]</Text>
          </Center>
        </Paper>
      </NotificationsProvider>
    </>
  )
}