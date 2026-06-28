import * as XLSX from 'xlsx';

/**
 * Parses an Excel file and returns its data structured by sheet
 * @param {File} file 
 * @returns {Promise<{workbook: XLSX.WorkBook, sheetNames: string[], parsedData: Object}>}
 */
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetNames = workbook.SheetNames;
        const parsedData = {};

        sheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          // Get raw rows
          const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });
          
          if (rawRows.length === 0) {
            parsedData[sheetName] = { headers: [], rows: [], columnMeta: [] };
            return;
          }

          // Assuming first row is headers
          let headers = rawRows[0].map(h => String(h).trim() || 'Untitled Column');
          
          // Handle duplicate headers
          const headerCounts = {};
          headers = headers.map(h => {
            if (headerCounts[h]) {
              headerCounts[h]++;
              return `${h} (${headerCounts[h]})`;
            }
            headerCounts[h] = 1;
            return h;
          });

          // Build object rows
          const rows = [];
          for (let i = 1; i < rawRows.length; i++) {
            const rowArr = rawRows[i];
            const rowObj = {};
            let hasData = false;
            
            headers.forEach((header, index) => {
              const val = rowArr[index];
              rowObj[header] = val;
              if (val !== '' && val !== null && val !== undefined) {
                hasData = true;
              }
            });
            
            if (hasData) {
              rows.push(rowObj);
            }
          }

          // Build column meta
          const columnMeta = headers.map(header => {
            const values = rows.map(r => r[header]).filter(v => v !== '' && v !== null && v !== undefined);
            const type = detectColumnType(values);
            const uniqueValues = [...new Set(values)];
            
            return {
              name: header,
              type,
              sampleValues: uniqueValues.slice(0, 5),
              uniqueCount: uniqueValues.length
            };
          });

          parsedData[sheetName] = { headers, rows, columnMeta };
        });

        resolve({ workbook, sheetNames, parsedData });
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Detects the data type of a column based on its values
 * @param {any[]} values 
 * @returns {'boolean'|'date'|'currency'|'percentage'|'number'|'text'}
 */
export const detectColumnType = (values) => {
  if (!values || values.length === 0) return 'text';

  let boolCount = 0;
  let dateCount = 0;
  let currencyCount = 0;
  let percentageCount = 0;
  let numberCount = 0;

  const total = values.length;

  values.forEach(v => {
    const strVal = String(v).trim().toLowerCase();
    
    // Check boolean
    if (['true', 'false', 'yes', 'no', '1', '0', 'có', 'không'].includes(strVal)) {
      boolCount++;
      return;
    }

    // Check percentage
    if (strVal.endsWith('%') && !isNaN(parseFloat(strVal))) {
      percentageCount++;
      return;
    }

    // Check currency
    if (/^[$€¥£₫]|vnd|usd|eur/i.test(strVal) || /[$€¥£₫]$/.test(strVal)) {
      const numStr = strVal.replace(/[^\d.-]/g, '');
      if (!isNaN(parseFloat(numStr))) {
        currencyCount++;
        return;
      }
    }

    // Check date (simple heuristic)
    if (/^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}/.test(strVal) || !isNaN(Date.parse(strVal))) {
      // Avoid interpreting pure numbers as dates unless they look like dates
      if (isNaN(Number(strVal))) {
         dateCount++;
         return;
      }
    }

    // Check number (can contain commas for thousands)
    const numClean = strVal.replace(/,/g, '');
    if (!isNaN(Number(numClean)) && numClean !== '') {
      numberCount++;
      return;
    }
  });

  const threshold = 0.7; // 70% threshold
  
  if (boolCount / total >= threshold) return 'boolean';
  if (dateCount / total >= threshold) return 'date';
  if (percentageCount / total >= threshold) return 'percentage';
  if (currencyCount / total >= threshold) return 'currency';
  if (numberCount / total >= threshold) return 'number';
  
  return 'text';
};

/**
 * Formats a cell value based on its detected type
 */
export const formatCellValue = (value, type) => {
  if (value === '' || value === null || value === undefined) return '-';
  
  switch (type) {
    case 'number':
      const num = Number(String(value).replace(/,/g, ''));
      return isNaN(num) ? value : new Intl.NumberFormat('vi-VN').format(num);
    case 'currency':
      const cNum = Number(String(value).replace(/[^\d.-]/g, ''));
      return isNaN(cNum) ? value : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cNum);
    case 'percentage':
      if (String(value).endsWith('%')) return value;
      const pNum = Number(String(value).replace(/,/g, ''));
      return isNaN(pNum) ? value : `${(pNum * (pNum <= 1 ? 100 : 1)).toFixed(2)}%`;
    case 'boolean':
      const low = String(value).toLowerCase();
      return ['true', 'yes', '1', 'có'].includes(low) ? 'Có' : 'Không';
    default:
      return String(value);
  }
};
