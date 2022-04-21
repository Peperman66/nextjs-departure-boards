import { FC, useState } from "react";
import { Station } from "../types/station";
import { Timetable } from "../types/timetable";

const TrainManageTable: FC<{station: Station}> = (props) => {

	const setRealDeparture = (time: Date, trainName: string) => {

	}

	const setDisplayOnBoard = (state: boolean, trainName: string) => {

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
		return <TrainManageTableRow timetable={timetable} allTimetables={timetable.train?.departures || [timetable]} setRealDeparture={setThisRealDeparture} setDisplayOnBoard={setThisDisplayOnBoard}/>
	})

	return (
		<table className="mx-auto text-xl">
			<thead>
				<th>Vlak</th>
				<th>Příjezd</th>
				<th>Odjezd</th>
				<th>Zpoždění</th>
				<th>Zobrazit na tabulích</th>
			</thead>
			<tbody>
				{trainRows}
			</tbody>
		</table>
	)
}

const TrainManageTableRow: FC<{timetable: Timetable, allTimetables: Timetable[], setRealDeparture: (time: Date) => void, setDisplayOnBoard: (value: boolean) => void}> = (props) => {
	const getTimeString = (time ?: Date) => {
		if (time == null) return ""
		const hours = time.getUTCHours().toString().padStart(2, '0')
		const minutes = time.getUTCMinutes().toString().padStart(2, '0')
		return `${hours}:${minutes}`
	}

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
		let diff = bestTimetable.realDeparture.valueOf() - (bestTimetable.departure?.valueOf() || 0)
		diff /= 1000 * 60
		diff = Math.floor(diff)
		return `${Math.sign(diff) == -1 ? "-" : Math.sign(diff) == 0 ? "" : "+"}${diff.toString()}`
	}

	const validateInput = () => {

	}

	const [departureString, setDepartureString] = useState(getTimeString(props.timetable.departure))
	const [displayOnBoard, setDisplayOnBoard] = useState(props.timetable.displayOnBoard)
			/*<td>{props.timetable.departure?.getUTCHours()}:{props.timetable.departure?.getUTCMinutes()}</td>*/
	return (
		<tr>
			<td>{props.timetable.trainName}</td>
			<td>{props.timetable.arrival?.getUTCHours()}:{props.timetable.arrival?.getUTCMinutes()}</td>
			<td>
				<input type="text" value={departureString} onChange={event => setDepartureString(event.target.value)} onBlur={validateInput} onKeyDown={(event) => {if (event.key == "Enter") event.currentTarget.blur()}}></input>
			</td>
			<td>{getDiff()}</td>
			<td>
				<input type="checkbox" checked={displayOnBoard} onChange={event => setDisplayOnBoard(event.target.checked)}></input>
			</td>
		</tr>
	)
}

export default TrainManageTable
