import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import StationComponent from '../components/station'
import { Station } from '../types/station'
import io, { Socket } from 'socket.io-client'
import { WebsocketEvents } from '../types/websocket'
import { getStations } from '../handlers/dbHandler'
import Header from '../components/header'

export const getServerSideProps: GetServerSideProps = async function() {
  let result = JSON.stringify(getStations());
  if (result == '{}') result = '[]'
  return {
    props: {
      stations: result
    }
  }
}

const Home: NextPage<{stations: string}> = (props) => {
  const [stations, setStations] = useState<Station[]>(JSON.parse(props.stations))

  let socket: Socket

  useEffect(() => {
    socketInitializer()

    return () => {socketDestroyer()}
  }, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on(WebsocketEvents.StationsUpdate, (data) => {
      setStations(data)
    })
  }

  const socketDestroyer = () => {
    socket.close()
  }

  const stationElements = stations.map(station => <StationComponent key={station.id} {...station} />)
  return (
    <>
      <Head>
        <title>Odjezdové tabule</title>
      </Head>
      <Header header='Seznam stanic' />
      <main className="text-center">
        {stationElements}
      </main>
    </>
  )
}

export default Home
