import * as r from 'request-promise';
import retry = require('promise-retry');
import { setTimeout } from 'timers';

export class DataGetter {
	private sensor: string;
	private action: string;
	private dataProp: string;

	private timeout: any;
	private lastRetrieved: number = 0;

	constructor(sensor: string, action: string, dataProp: string) {
		this.sensor = sensor;
		this.action = action;
		this.dataProp = dataProp;
	}

	public start() {
		this.getData();
	}

	public stop() {
		if (this.timeout !== null && this.timeout !== undefined) {
			clearTimeout(this.timeout);
		}
	}

	private getData() {
		const timeToNext =
			this.lastRetrieved +
			(Number(process.env.MS_BETWEEN_COLLECT) || 10000) -
			new Date().getTime();

		if (timeToNext <= 0) {
			retry(async (retry, number) => {
				if (number > 1) {
					console.log(`[${this.sensor}:${this.action}]: Retry ${number}`);
				}

				return r({
					uri: `${process.env.WIO_SERVER_URL}/${this.sensor}/${
						this.action
					}?access_token=${process.env.WIO_ACCESS_TOKEN}`,
					json: true,
				})
					.then((result) => {
						console.log(
							`[${this.sensor}:${this.action}]: ${result[this.dataProp]}`,
						);
						return result;
					})
					.catch((err) => {
						console.log('Error getting data', err);
						retry(err);
					});
			}).then(() => {
				this.lastRetrieved = new Date().getTime();
				this.getData();
			});
		} else {
			this.timeout = setTimeout(() => this.getData(), timeToNext);
		}
	}
}
