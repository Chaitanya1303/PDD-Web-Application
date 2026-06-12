const XLSX = require('xlsx');
const path = require('path');

const workbook = XLSX.readFile(path.join(process.cwd(), 'E2E_Test_Report_PancreaScan_2026-06-09T16-22-48.xlsx'));
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log('Sheet Names:', workbook.SheetNames);
console.log('Columns:', Object.keys(data[0] || {}));
console.log('First 5 rows:');
console.log(data.slice(0, 5));
