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


export function Home() {
  // when app has loaded receive config from electron
  const [config, setConfig] = useState<any>([])
  useEffect(() => { window.Main.on('Loaded', (receiveConfig: any) => { setConfig(receiveConfig); sendAvailableDoorSounds(receiveConfig.availableDoorSound) }) }, [])

  useEffect(() => {
    window.Main.on('xmlData', (data: any) => { xmlDataToArray(data['Dat151']['Items']) })
  }, [])

  // Shitty way to force re-render
  var random = Math.random() * 1000
  const [render, setRender] = useState<number>(0)

  const [newOpened, setNewOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false)

  const [HashToConvert, setHashToConvert] = useState<string>('')
  const [convertedHash, setConvertedHash] = useState<string>('')
  const [availableDoorSound, setAvailableDoorSound] = useState([])
  const [selectedDoorSound, setSelectedDoorSound] = useState<string | null>("")

  function getHash(key: string) {
    var keyLowered = key.toLowerCase()
    var length = keyLowered.length
    var hash, i

    for (hash = i = 0; i < length; i++) {
      hash += keyLowered.charCodeAt(i)
      hash += (hash << 10)
      hash ^= (hash >>> 6)
    }

    hash += (hash << 3)
    hash ^= (hash >>> 11)
    hash += (hash << 15)

    var hashedStr = ((hash >>> 0).toString(16))

    while (hashedStr.length < 8) {
      hashedStr = "0" + hashedStr
    }

    setConvertedHash(hashedStr)
    return hashedStr
  }

  function arrayFindValue() {
    config.availableDoorSound.find((item: any) => {
      if (item.name === selectedDoorSound) {
        soundSet = item.soundSet
        Params = item.Params
        value = item.value
      }
    })
  }

  function arrayFindExisting(findThisValue: string) {
    var result
    doorValue.find((item: any) => {
      if (item.doorName === findThisValue) {
        result = true
      }
    })
    return result
  }

  function xmlDataToArray(xml: any) {
    xml["0"].Item.forEach((item: any) => {
      console.log("Item $ = ", item.$)
      console.log("Item type = ", item.$.type)
      if (item.$.type == "Door") {
        console.log(JSON.stringify(item, null, '\t'))
        console.log("Item Name = ", item.Name)
        console.log("Item Params = ", item.Params)
        console.log("Item SoundSet = ", item.SoundSet)
        console.log("Item Unk1 = ", item.Unk1[0].$.value)
        const str = String(item.Name)
        const split = str.slice(2, -1)
        const insertData = { "doorName": split, "doorHash": item.Name.includes("hash_") ? item.Name : getHash(`${item.Name}`), "soundSet": item.SoundSet, "Params": item.Params, "value": item.Unk1[0].$.value }
        doorValue.push(insertData)
        setRender(random)
      }
    })
  }
  // TODO: Need to generate metatables when file is generate for retreive the door name? or just call a hash

  function sendAvailableDoorSounds(availableDoorSound: any) {
    const initAvailableDoorSound: any = []
    availableDoorSound.forEach((item: any) => {
      const data = { "value": item.name, "label": item.name }
      initAvailableDoorSound.push(data)
    })
    setAvailableDoorSound(initAvailableDoorSound)
  }

  const deleteCard = (value: any, index: number) => {
    value.splice(index, 1)
    setRender(random)
  }

  const doorsCard = () => {
    return doorValue.map((door: any, index: any) => (
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
            const newData = { "doorName": door.doorName, "doorHash": door.doorHash, "soundSet": soundSet, "Params": Params, "value": value }
            doorValue[index] = newData
          }}>Save Change</Button>
        </Modal>
        <Card key={index + 1}>
          <Group position="apart">
            <Title sx={{ fontSize: 20 }}>#{index + 1} | {door.doorName}</Title>
            <Group>
              <ActionIcon onClick={() => { setEditOpened(true) }}><ImPencil color={"blue"} /></ActionIcon>
              <ActionIcon onClick={() => { deleteCard(doorValue, index) }}><ImBin color={"red"} /></ActionIcon>
            </Group>
          </Group>
          <Text>Door hash: hash_{door.doorHash}</Text>
          <Text>Door sound hash: {door.soundSet}</Text>
          <Text>Door sound params: {door.Params}</Text>
          <Text>Door sound value: {door.value}</Text>
        </Card>
        <Space h="md" />
      </>
    ))
  }

  return (
    <>
      <NotificationsProvider>
        {/* MODAL NEW DOOR */}
        <Modal
          opened={newOpened}
          onClose={() => setNewOpened(false)}
          closeOnClickOutside={false}
          title="Generate sound for a new door"
        >
          <TextInput placeholder="Enter the door name" value={HashToConvert} onChange={(event) => {
            setHashToConvert(event.currentTarget.value)
            getHash(HashToConvert)
          }}
          />
          <Space h="md" />
          <Select
            placeholder="Select the door sound"
            clearable
            value={selectedDoorSound}
            onChange={setSelectedDoorSound}
            data={availableDoorSound}
          />
          <Space h="md" />
          <Button
            variant="outline" color={'red'}
            onClick={() => {
              arrayFindValue()
              if (!arrayFindExisting(HashToConvert)) {
                const insertData = { "doorName": HashToConvert, "doorHash": getHash(HashToConvert), "soundSet": soundSet, "Params": Params, "value": value }
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
          <Space h="md" />
          <Text sx={{ fontSize: "15px", color: "white" }}>
            Converted Hash: {convertedHash ? convertedHash : "undefined"} | Door sound: {selectedDoorSound ? selectedDoorSound : "undefined"}
          </Text>
        </Modal>
        <Paper
          sx={{
            width: 550,
            height: 820,
            backgroundColor: "rgba(37, 37, 37, 0.5)"
          }}
        >
          <Space h="20" />
          <SimpleGrid cols={1} verticalSpacing="xs" sx={{ padding: "10px" }}>
            <Group grow>
              <Group grow>
                <Button variant="outline" color={'red'} onClick={() => { window.Main.sendMessage('openFile') }}>Import file</Button>
                <Button disabled variant="outline" color={'red'} onClick={() => { }}>Settings</Button>
              </Group>
              <Button variant="outline" color={'red'} onClick={() => { setNewOpened(!newOpened) }}>Add a new door</Button>
            </Group>
          </SimpleGrid>
          <ScrollArea style={{ height: 680, padding: "10px" }}>
            {doorsCard()}
          </ScrollArea>
          <Group grow sx={{ padding: '10px' }}>
            <Button variant="outline" color={"red"} onClick={() => {
              if (doorValue.length < 1) {
                showNotification({
                  autoClose: 2500,
                  title: "Error",
                  message: "You need to add door before generate a file",
                  color: "red",
                  icon: "!",
                })
              } else {
                window.Main.sendMessage('generate', doorValue)
              }
            }}>Generate Audio File</Button>
          </Group>
          {/* <Space h="15px"/> */}
          <Center>
            <Text>Created by [</Text>
            <Text component="a" onClick={() => { window.Main.sendMessage('discord', 'https://discord.gg/badHRSF') }} sx={{ color: "red", "&:hover": { color: "blue" } }}> Tiwabs</Text>
            <Text>]</Text>
          </Center>
        </Paper>
      </NotificationsProvider>
    </>
  )
}