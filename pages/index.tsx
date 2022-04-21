import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react'
import StationComponent from '../components/station'
import { Station } from '../types/station'
import io, { Socket } from 'socket.io-client'
import { WebsocketEvents } from '../types/websocket'
import { getStations } from '../handlers/dbHandler'
import Header from '../components/header'
import CreateStation from '../components/createStation'

export const getServerSideProps: GetServerSideProps = async function() {
  let result = JSON.stringify(await getStations());
  if (result == '{}') result = '[]'
  return {
    props: {
      stations: result
    }
  }
}

const Home: NextPage<{stations: string}> = (props) => {
  const [stations, setStations] = useState<Station[]>(JSON.parse(props.stations))
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    socketInitializer()

    return socketDestroyer
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    let thisSocket = io()
    console.log("Socket initialised")
    thisSocket.on('connect', () => console.log("Connected"))
    console.log(thisSocket)
    thisSocket.on(WebsocketEvents.StationsUpdate, (data) => {
      console.log("Incomming data")
      setStations(data)
    });
    setSocket(thisSocket)
  }

  const socketDestroyer = () => {
    socket?.close()
  }

  const createStation = (name: string) => {
    const id = encodeURIComponent(name);
    const station: Station = {
      name: name,
      id: id
    }
    socket?.emit(WebsocketEvents.StationCreate, station)
  }
 
  const deleteStation = (id: string) => {
    socket?.emit(WebsocketEvents.StationDelete, id)
  }
  const stationElements = stations.map(station => <StationComponent key={station.id} station={station} delete={deleteStation}/>)
  return (
    <>
      <Head>
        <title>Odjezdové tabule</title>
      </Head>
      <Header header='Seznam stanic' />
      <main className="text-center">
        {stationElements}
        <CreateStation createStation={createStation}/>
      </main>
    </>
  )
}

export default Home
