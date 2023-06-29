import XLSX from 'xlsx';
import axios from 'axios';
import * as fs from 'fs';

const currentDate = new Date()

const range = {
	startYear: 2018,
	startMonth: 7,
	endYear: currentDate.getFullYear(),
	endMonth: currentDate.getMonth() + 1,
}

const datesArray = [];

for (let year = range.startYear; year <= range.endYear; year++) {
	const monthStart = (year === range.startYear) ? range.startMonth : 1;
	const monthEnd = (year === range.endYear) ? range.endMonth : 12;

	for (let month = monthStart; month <= monthEnd; month++) {
		const monthString = String(month).padStart(2, '0');
		const yearString = String(year);

		const dateString = yearString + monthString + '01';
		datesArray.push(dateString);
	}
}

let data = [];

for(const d of datesArray) {
	const url = `https://www.360t.com/downloads/daily-volumes/DailyVolumes_${d}.xls`;

	axios.get(url, { responseType: 'arraybuffer' })
	.then(response => {
		const workbook = XLSX.read(response.data, { type: 'array' });
		const sheetName = workbook.SheetNames[0];
		const worksheet = workbook.Sheets[sheetName];
		const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

		const data = jsonData.slice(3).reduce((obj, [date, value]) => {
			obj[date] = value;
			return obj;
		}, {});

		createDataJson(data,`data/${d}.json`)

	})
	.catch(error => {
		console.error(error);
	});
}


function createDataJson(data, path = "data.json") {
	fs.writeFile(path, JSON.stringify(data), (err) => {
		if (err) throw err;
		console.log("JSON file saved");
	});
}
