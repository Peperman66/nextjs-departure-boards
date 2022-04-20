import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import StationComponent from '../components/station'
import styles from '../styles/Home.module.css'
import Station from '../types/station'
import io, { Socket } from 'socket.io-client'

const originStations: Station[] = [
  {
    id: '1',
    name: 'A',
    occupied: false
  }
]

const Home: NextPage = () => {
  const [stations, setStations] = useState<Station[]>(originStations)

  let socket: Socket

  useEffect(() => {socketInitializer()}, [])

  const socketInitializer = async () => {
    await fetch('/api/socket')
    socket = io()

    socket.on('connect', () => {

    })
  }

  const stationElements = stations.map(station => <StationComponent key={station.id} {...station} />)
  return (
    <>
      <Head>
        <title>Odjezdové tabule</title>
      </Head>
      <main className={styles.main}>
        <h1>Seznam stanic</h1>
        <hr/>
        {stationElements}
      </main>
    </>
  )
}

export default Home
