export const analyzeData = (headers, rows, columnMeta) => {
  const totalRows = rows.length;
  const totalColumns = headers.length;

  const numericStats = {};
  const categoricalAnalysis = {};
  const timeAnalysis = {};

  columnMeta.forEach(col => {
    const { name, type, uniqueCount } = col;
    const values = rows.map(r => r[name]).filter(v => v !== '' && v !== null && v !== undefined);
    
    if (type === 'number' || type === 'currency' || type === 'percentage') {
      const numValues = values.map(v => {
        let clean = String(v).replace(/,/g, '');
        if (type === 'currency') clean = clean.replace(/[^\d.-]/g, '');
        if (type === 'percentage') clean = clean.replace(/%/g, '');
        return Number(clean);
      }).filter(v => !isNaN(v));

      if (numValues.length > 0) {
        const sum = numValues.reduce((a, b) => a + b, 0);
        const average = sum / numValues.length;
        const max = Math.max(...numValues);
        const min = Math.min(...numValues);
        
        numericStats[name] = {
          count: numValues.length,
          nonEmpty: numValues.length,
          sum,
          average,
          median: calculateMedian(numValues),
          max,
          min,
          stddev: calculateStdDev(numValues)
        };
      }
    }

    if (type === 'text' || type === 'boolean' || (type === 'number' && uniqueCount < 15)) {
       const freq = {};
       values.forEach(v => {
         const strV = String(v);
         freq[strV] = (freq[strV] || 0) + 1;
       });
       
       const top10 = Object.entries(freq)
         .sort((a, b) => b[1] - a[1])
         .slice(0, 10)
         .map(([value, count]) => ({ value, count }));
         
       categoricalAnalysis[name] = {
         frequency: freq,
         top10,
         totalUnique: uniqueCount
       };
    }

    if (type === 'date') {
      // Basic time analysis
      const monthlyDataMap = {};
      values.forEach(v => {
         const d = new Date(v);
         if (!isNaN(d.getTime())) {
           const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
           monthlyDataMap[period] = (monthlyDataMap[period] || 0) + 1;
         }
      });
      const monthlyData = Object.entries(monthlyDataMap)
        .sort((a,b) => a[0].localeCompare(b[0]))
        .map(([period, count]) => ({ period, count }));
        
      timeAnalysis[name] = {
        monthlyData,
        trend: monthlyData.length > 1 && monthlyData[monthlyData.length-1].count > monthlyData[0].count ? 'up' : 'down'
      };
    }
  });

  const kpiCards = generateKPICards(headers, rows, columnMeta, numericStats);
  const chartSuggestions = suggestCharts(headers, rows, columnMeta, categoricalAnalysis, timeAnalysis);

  return {
    totalRows,
    totalColumns,
    numericStats,
    kpiCards,
    chartSuggestions,
    categoricalAnalysis,
    timeAnalysis
  };
};

export const calculateMedian = (arr) => {
  if (arr.length === 0) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

export const calculateStdDev = (arr) => {
  if (arr.length <= 1) return 0;
  const mean = arr.reduce((a, b) => a + b) / arr.length;
  const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (arr.length - 1);
  return Math.sqrt(variance);
};

const generateKPICards = (headers, rows, columnMeta, numericStats) => {
  const cards = [];
  const colors = ['primary', 'accent', 'emerald', 'amber', 'rose', 'blue', 'purple', 'pink'];
  let colorIdx = 0;

  // Prioritize currency and percentage
  columnMeta.filter(c => c.type === 'currency' || c.type === 'percentage').forEach(col => {
    if (cards.length >= 8) return;
    const stats = numericStats[col.name];
    if (stats) {
       const isCurrency = col.type === 'currency';
       cards.push({
         id: `kpi-${col.name}`,
         title: `Tổng ${col.name}`,
         value: stats.sum,
         formattedValue: isCurrency 
            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.sum)
            : `${stats.average.toFixed(2)}% (TB)`,
         type: col.type,
         icon: isCurrency ? 'DollarSign' : 'Percent',
         color: colors[colorIdx++ % colors.length],
         subtitle: `Dựa trên ${stats.nonEmpty} bản ghi`
       });
    }
  });

  // Then numbers
  columnMeta.filter(c => c.type === 'number').forEach(col => {
    if (cards.length >= 8) return;
    const stats = numericStats[col.name];
    if (stats) {
       cards.push({
         id: `kpi-${col.name}`,
         title: `Tổng ${col.name}`,
         value: stats.sum,
         formattedValue: new Intl.NumberFormat('vi-VN').format(stats.sum),
         type: 'number',
         icon: 'Hash',
         color: colors[colorIdx++ % colors.length],
         subtitle: `Trung bình: ${new Intl.NumberFormat('vi-VN').format(stats.average)}`
       });
    }
  });

  return cards;
};

const suggestCharts = (headers, rows, columnMeta, categoricalAnalysis, timeAnalysis) => {
  const suggestions = [];
  
  const dateCols = columnMeta.filter(c => c.type === 'date');
  const numCols = columnMeta.filter(c => c.type === 'number' || c.type === 'currency');
  const catCols = columnMeta.filter(c => (c.type === 'text' || c.type === 'boolean' || c.type === 'number') && c.uniqueCount > 1 && c.uniqueCount < 20);

  // 1. Line/Area Chart (Time Series)
  if (dateCols.length > 0 && numCols.length > 0) {
    const dCol = dateCols[0];
    const nCol = numCols[0];
    
    // Group data by period
    const aggregated = {};
    rows.forEach(r => {
      const dRaw = r[dCol.name];
      const nRaw = r[nCol.name];
      if (dRaw && nRaw) {
        const d = new Date(dRaw);
        if (!isNaN(d.getTime())) {
          const period = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          let nVal = String(nRaw).replace(/,/g, '');
          if (nCol.type === 'currency') nVal = nVal.replace(/[^\d.-]/g, '');
          const val = Number(nVal);
          if (!isNaN(val)) {
             aggregated[period] = (aggregated[period] || 0) + val;
          }
        }
      }
    });

    const data = Object.entries(aggregated)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([period, value]) => ({ [dCol.name]: period, [nCol.name]: value }));

    if (data.length > 1) {
      suggestions.push({
        id: `chart-line-${dCol.name}-${nCol.name}`,
        type: 'area',
        title: `Biến động ${nCol.name} theo thời gian`,
        description: `Thể hiện xu hướng của ${nCol.name} theo ${dCol.name}`,
        config: { xKey: dCol.name, yKey: nCol.name, data, colors: ['#8b5cf6'] }
      });
    }
  }

  // 2. Bar/Pie Chart (Categorical)
  catCols.slice(0, 3).forEach(cCol => {
    if (suggestions.length >= 6) return;
    
    const catAnalysis = categoricalAnalysis[cCol.name];
    if (catAnalysis && catAnalysis.top10.length > 0) {
      if (numCols.length > 0) {
        // Bar chart: Sum numeric by category
        const nCol = numCols[0];
        const aggregated = {};
        rows.forEach(r => {
          const cVal = String(r[cCol.name] || 'N/A');
          const nRaw = r[nCol.name];
          if (nRaw) {
            let nVal = String(nRaw).replace(/,/g, '');
            if (nCol.type === 'currency') nVal = nVal.replace(/[^\d.-]/g, '');
            const val = Number(nVal);
            if (!isNaN(val)) {
               aggregated[cVal] = (aggregated[cVal] || 0) + val;
            }
          }
        });
        
        const data = Object.entries(aggregated)
          .sort((a,b) => b[1] - a[1])
          .slice(0, 10)
          .map(([name, value]) => ({ name, value }));
          
        if (data.length > 1) {
          suggestions.push({
            id: `chart-bar-${cCol.name}-${nCol.name}`,
            type: 'bar',
            title: `Top ${cCol.name} theo ${nCol.name}`,
            description: `Phân bổ ${nCol.name} trên các nhóm ${cCol.name}`,
            config: { xKey: 'name', yKey: 'value', data, colors: ['#06b6d4'] }
          });
        }
      } else if (cCol.uniqueCount <= 10) {
        // Pie chart: Frequency
        const data = catAnalysis.top10.map(item => ({ name: item.value || 'N/A', value: item.count }));
        suggestions.push({
            id: `chart-pie-${cCol.name}`,
            type: 'pie',
            title: `Tỷ trọng ${cCol.name}`,
            description: `Phân bổ số lượng bản ghi theo ${cCol.name}`,
            config: { xKey: 'name', yKey: 'value', data, colors: [] } // Pie will use array of colors
        });
      }
    }
  });

  return suggestions;
};
