import * as jsonLoader from 'load-json-file';
import { DataGetter } from './data-getter';

let config;
const dataGetters: DataGetter[] = [];

async function start() {
	config = await jsonLoader(process.env.CONFIG_LOCATION || 'sensors.json');

	config.sensors.forEach((sensor: any) => {
		sensor.actions.forEach((action: any) => {
      const dg = new DataGetter(sensor.name, action.name, action.dataProp);
      dataGetters.push(dg);
      dg.start();
		});
	});
}

start();
