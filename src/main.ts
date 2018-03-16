import * as jsonLoader from 'load-json-file';
import { DataGetter } from './data-getter';
import { InfluxDB } from 'influx/lib/src';

let config: any;
let influx: InfluxDB;
const dataGetters: DataGetter[] = [];

async function start() {
	try {
		console.log(`[INFLUX] Connecting`);
		influx = new InfluxDB({
			host: process.env.INFLUX || 'localhost',
			database: 'sensors',
			port: 8086,
		});

		config = await jsonLoader(process.env.CONFIG_LOCATION || 'sensors.json');

		const dbNames = await influx.getDatabaseNames();

		console.log(`[INFLUX]: Database names ${dbNames}`);

		if (dbNames.indexOf('sensors') === -1) {
			await influx.createDatabase('sensors');
		}
	} catch (err) {
		console.log('Error starting application', err);
		process.exit(1);
	}

	config.sensors.forEach((sensor: any) => {
		sensor.actions.forEach((action: any) => {
			const dg = new DataGetter(
				sensor.name,
				action.name,
				action.dataProp,
				influx,
			);
			dataGetters.push(dg);
			dg.start();
		});
	});
}

start();
