import XLSX from 'xlsx';
import axios from 'axios';
import * as fs from 'fs';

const currentDate = new Date();
currentDate.setDate(currentDate.getDate() - 1);

const year = currentDate.getFullYear();
const month = String(currentDate.getMonth() + 1).padStart(2, '0');
const day = String(currentDate.getDate()).padStart(2, '0');

const dateString = `${year}-${month}-${day}`;

const url = `https://www.euronextfx.com/docs/Fastmatch_Daily_Volume_${dateString}.xlsx`

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

		createDataJson(data)

	})
	.catch(error => {
		console.error(error);
	});

function createDataJson(data, path = "data.json") {
	fs.writeFile(path, JSON.stringify(data), (err) => {
		if (err) throw err;
		console.log("JSON file saved");
	});
}
