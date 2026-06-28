export const isSensitiveColumn = (header, type) => {
  const h = String(header).toLowerCase();
  
  if (/name|họ|tên|ho ten|full.?name/i.test(h)) return 'name';
  if (/email|e-mail|mail/i.test(h)) return 'email';
  if (/phone|điện.?thoại|sdt|số.?dt|tel/i.test(h)) return 'phone';
  if (/cmnd|cccd|id.?number|passport|căn.?cước/i.test(h)) return 'id';
  if (/address|địa.?chỉ|dia.?chi/i.test(h)) return 'address';
  if (/ssn|social.?security/i.test(h)) return 'ssn';
  
  return null;
};

export const maskSensitiveData = (rows, headers, columnMeta) => {
  const sensitiveCols = {};
  
  headers.forEach(h => {
    const meta = columnMeta.find(m => m.name === h);
    const type = isSensitiveColumn(h, meta ? meta.type : 'text');
    if (type) {
      sensitiveCols[h] = type;
    }
  });

  if (Object.keys(sensitiveCols).length === 0) {
    return rows; // No sensitive columns found
  }

  return rows.map(row => {
    const newRow = { ...row };
    
    Object.keys(sensitiveCols).forEach(col => {
      const val = newRow[col];
      if (!val) return;
      
      const strVal = String(val);
      const type = sensitiveCols[col];
      
      switch (type) {
        case 'name':
          if (strVal.length > 1) {
            newRow[col] = strVal.charAt(0) + strVal.substring(1).replace(/[^ ]/g, '*');
          }
          break;
        case 'email':
          const parts = strVal.split('@');
          if (parts.length === 2) {
            const name = parts[0];
            const domain = parts[1];
            newRow[col] = (name.length > 2 ? name.substring(0, 2) + '*'.repeat(name.length - 2) : name) + '@' + domain;
          }
          break;
        case 'phone':
          if (strVal.length >= 4) {
             newRow[col] = '*'.repeat(strVal.length - 3) + strVal.substring(strVal.length - 3);
          }
          break;
        case 'id':
        case 'ssn':
          if (strVal.length >= 5) {
             newRow[col] = '*'.repeat(strVal.length - 4) + strVal.substring(strVal.length - 4);
          }
          break;
        case 'address':
          newRow[col] = '[MASKED ADDRESS]';
          break;
      }
    });
    
    return newRow;
  });
};
