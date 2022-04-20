import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import StationComponent from '../components/station'
import styles from '../styles/Home.module.css'
import Station from '../types/station'

const originStations: Station[] = [
  {
    id: '1',
    name: 'A',
    occupied: false
  }
]

const Home: NextPage = () => {
  const [stations, setStations] = useState<Station[]>(originStations)

  const stationElements = stations.map(station => <StationComponent {...station} />)
  return (
    <>
      <Head>
        <title>Odjezdové tabule</title>
      </Head>
      <body>
        <div className={styles.main}>
          <h1>Seznam stanic</h1>
          <hr/>
          {stationElements}
        </div>
      </body>
    </>
  )
}

export default Home
