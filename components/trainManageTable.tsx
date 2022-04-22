import { create } from "domain";
import { type } from "os";
import { prependOnceListener } from "process";
import { FC, useState } from "react";
import { Station } from "../types/station";
import { Timetable } from "../types/timetable";
import { Train } from "../types/train";

const getTimeString = (time ?: Date) => {
	if (typeof time == "string")
		time = new Date(time)
	if (time == null) return ""
	const hours = time.getUTCHours().toString().padStart(2, '0')
	const minutes = time.getUTCMinutes().toString().padStart(2, '0')
	return `${hours}:${minutes}`
}

const getDateFromString = (string: string) => {
	const splitString = string.split(":")
	if (splitString.length !== 2) {
		return undefined
	}
	const hours = parseInt(splitString[0])
	const minutes = parseInt(splitString[1])
	return new Date((hours * 60 + minutes) * 60 * 1000)
}

const TrainManageTable: FC<{station: Station, allStations: Station[], setRealDeparture: (time: Date, trainName: string) => void, setDisplayOnBoard: (state: boolean, trainName: string) => void, createTrain: (train: Train) => void, deleteTrain: (train: Train) => void}> = (props) => {

	const setRealDeparture = (time: Date, trainName: string) => {
		props.setRealDeparture(time, trainName)
	}

	const setDisplayOnBoard = (state: boolean, trainName: string) => {
		props.setDisplayOnBoard(state, trainName)
	}

	const createTrain = (train: Train) => {
		props.createTrain(train)
	}

	const deleteTrain = (train: Train) => {
		props.deleteTrain(train)
	}

	const trainRows = props.station.timetables?.sort((a, b) => {
		const firstCompareValue = a.realDeparture || a.departure || a.departure || new Date(0)
		const secondCompareValue = b.realDeparture || b.departure || b.arrival || new Date(0)
		if (firstCompareValue < secondCompareValue) {
			return -1;
		} else if (firstCompareValue > secondCompareValue) {
			return 1;
		} else {
			return 0;
		}
	}).map(timetable => {
		const setThisRealDeparture = (time: Date) => setRealDeparture(time, timetable.trainName)
		const setThisDisplayOnBoard = (state: boolean) => setDisplayOnBoard(state, timetable.trainName)
		return <TrainManageTableRow timetable={timetable} allTimetables={timetable.train?.departures || [timetable]} setRealDeparture={setThisRealDeparture} setDisplayOnBoard={setThisDisplayOnBoard} deleteTrain={() => {if (timetable.train) deleteTrain(timetable.train)}}/>
	})

	return (
		<>
		<table className="mx-auto text-xl">
			<thead>
				<tr>
					<th>Vlak</th>
					<th>Příjezd</th>
					<th>Odjezd</th>
					<th>Zpoždění</th>
					<th>Zobrazit na tabulích</th>
					<th>Smazat</th>
				</tr>
			</thead>
			<tbody>
				{trainRows}
			</tbody>
		</table>
		<TrainManageTableCreate stations={props.allStations} createTrain={createTrain}/>
		</>
	)
}

const TrainManageTableRow: FC<{timetable: Timetable, allTimetables: Timetable[], setRealDeparture: (time: Date) => void, setDisplayOnBoard: (value: boolean) => void, deleteTrain: () => void}> = (props) => {
	const getDiff = () => {
		let bestTimetable: Timetable
		props.allTimetables.forEach(timetable => {
			if (bestTimetable == undefined) {
				if (timetable.realDeparture != null) {
					bestTimetable = timetable
				}
				return;
			}
			if (timetable.realDeparture == undefined) {
				return
			}
			//@ts-ignore
			if (timetable.realDeparture > bestTimetable.realDeparture) {
				bestTimetable = timetable
			}
		});
		//@ts-ignore
		if (!bestTimetable || bestTimetable.realDeparture == undefined) {
			return ""
		}
		let diff = bestTimetable.realDeparture.getTime() - (bestTimetable.departure?.getTime() || 0)
		console.log(bestTimetable.realDeparture)
		diff /= 1000 * 60
		diff = Math.floor(diff)
		return `${Math.sign(diff) == -1 ? "-" : Math.sign(diff) == 0 ? "" : "+"}${diff.toString()}`
	}

	const validateInput = () => {
		const date = getDateFromString(departureString)
		console.log(date)
		if (date) {
			props.setRealDeparture(date)
		}
	}

	const [departureString, setDepartureString] = useState(getTimeString(props.timetable.departure))
	const [displayOnBoard, setDisplayOnBoard] = useState(props.timetable.displayOnBoard)
			/*<td>{props.timetable.departure?.getUTCHours()}:{props.timetable.departure?.getUTCMinutes()}</td>*/
	return (
		<tr>
			<td>{props.timetable.trainName}</td>
			<td>{getTimeString(props.timetable.arrival)}</td>
			<td>
				<input type="time" value={departureString} onChange={event => setDepartureString(event.target.value)} onBlur={validateInput} onKeyDown={(event) => {if (event.key == "Enter") event.currentTarget.blur()}}></input>
			</td>
			<td>{getDiff()}</td>
			<td>
				<input type="checkbox" checked={displayOnBoard} onChange={event => setDisplayOnBoard(event.target.checked)}></input>
			</td>
			<td>
				<button onClick={e => props.deleteTrain()}>Smazat</button>
			</td>
		</tr>
	)
}

const TrainManageTableCreate: FC<{stations: Station[], createTrain: (train: Train) => void}> = (props) => {

	const [timetables, setTimetables] = useState<Timetable[]>([]);
	const [trainName, setTrainName] = useState("")

	const addTimetable = (timetable: Timetable) => {
		timetables.push(timetable)
		setTimetables([...timetables])
	}

	const createTrain = () => {
		const train: Train = {
			name: trainName,
			departures: timetables.map(timetable => {
				timetable.train = train;
				timetable.trainName = trainName;
				timetable.station = props.stations.find(x => x.id === timetable.stationId)
				return timetable;
			})
		}
		props.createTrain(train)
	}

	const stationElements = []

	for (let i = 0; i < timetables.length; i++) {
		stationElements.push(
			<TrainManageTableTimetableEditRow timetable={timetables[i]} delete={() => {timetables.splice(i); setTimetables([...timetables]);}} />
		)
	}

	stationElements.push(<TrainManageTableTimetableCreateRow stations={props.stations} addTimetable={addTimetable}/>)

	return (
		<div>
			<input type="text" placeholder="Vlak" value={trainName} onChange={e => setTrainName(e.target.value)} />
			<table>
				<thead>
					<tr>
						<th>Stanice</th>
						<th>Příjezd</th>
						<th>Odjezd</th>
						<th>Zobrazit na odjezdových tabulích</th>
						<th>Potvrdit</th>
					</tr>
				</thead>
				<tbody>
					{stationElements}
				</tbody>
			</table>
			<button onClick={e => createTrain()}>Vytvořit vlak</button>
		</div>
	)
}

const TrainManageTableTimetableEditRow: FC<{timetable: Timetable, delete: () => void}> = (props) => {
	return (
		<tr>
			<td>{props.timetable.stationId}</td>
			<td>{getTimeString(props.timetable.arrival)}</td>
			<td>{getTimeString(props.timetable.departure)}</td>
			<td><input type="checkbox" disabled={true} checked={props.timetable.displayOnBoard}></input></td>
			<td><button onClick={props.delete}>Odstranit stanici</button></td>
		</tr>
	)
}

const TrainManageTableTimetableCreateRow: FC<{stations: Station[], addTimetable: (timetable: Timetable) => void}> = (props) => {
	const [station, setStation] = useState(props.stations[0].id)
	const [arrivalStringTime, setArrivalStringTime] = useState("")
	const [departureStringTime, setDepartureStringTime] = useState("")
	const [showOnBoards, setShowOnBoards] = useState(true)
	const options = props.stations.map(station => {
		return <option value={station.id}>{station.name}</option>
	})
	const submit = () => {
		const timetable: Timetable = {
			stationId: station,
			trainName: "", //I know, it's very ugly. Train name gets added in parent component
			arrival: getDateFromString(arrivalStringTime),
			departure: getDateFromString(departureStringTime),
			displayOnBoard: showOnBoards
		}
		props.addTimetable(timetable)
	}
	return (
		<tr>
			<td>
				<select value={station} onChange={e => setStation(e.target.value)}>
					{options}
				</select>
			</td>
			<td><input type="time" value={arrivalStringTime} onChange={e => setArrivalStringTime(e.target.value)}></input></td>
			<td><input type="time" value={departureStringTime} onChange={e => setDepartureStringTime(e.target.value)}></input></td>
			<td><input type="checkbox" checked={showOnBoards} onChange={e => setShowOnBoards(e.target.checked)}></input></td>			
			<td><button onClick={e => submit()}>Uložit stanici</button></td>
		</tr>
	)
}

export default TrainManageTable
