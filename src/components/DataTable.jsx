import React, { useState, useMemo } from 'react';
import { 
  useReactTable, getCoreRowModel, getFilteredRowModel, 
  getSortedRowModel, getPaginationRowModel, flexRender 
} from '@tanstack/react-table';
import { 
  Search, ChevronUp, ChevronDown, ChevronsLeft, 
  ChevronsRight, ChevronLeft, ChevronRight, ArrowUpDown
} from 'lucide-react';
import clsx from 'clsx';
import { formatCellValue } from '../utils/excelParser';

const DataTable = ({ headers, rows, columnMeta }) => {
  const [globalFilter, setGlobalFilter] = useState('');

  // Setup columns
  const columns = useMemo(() => {
    return headers.map(header => {
      const meta = columnMeta.find(m => m.name === header) || { type: 'text' };
      
      return {
        accessorKey: header,
        header: header,
        cell: info => {
           const val = info.getValue();
           return (
             <span className="truncate max-w-[200px] inline-block" title={String(val)}>
               {formatCellValue(val, meta.type)}
             </span>
           );
        },
        meta: { type: meta.type }
      };
    });
  }, [headers, columnMeta]);

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'number': return '#';
      case 'currency': return '$';
      case 'percentage': return '%';
      case 'date': return '📅';
      case 'boolean': return '✓';
      default: return 'A';
    }
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 flex flex-col h-full bg-white dark:bg-slate-900">
      
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/50 dark:bg-white/5">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter ?? ''}
            onChange={e => setGlobalFilter(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
            placeholder="Tìm kiếm trong bảng..."
          />
        </div>
        <div className="text-sm text-slate-500 font-medium">
          Hiển thị {table.getState().pagination.pageSize} dòng / trang
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto w-full relative">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-6 py-4 font-semibold whitespace-nowrap cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-white dark:bg-slate-900 flex items-center justify-center text-[10px] text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
                          {getTypeIcon(header.column.columnDef.meta.type)}
                        </span>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </div>
                      
                      {/* Sort Icon */}
                      <div className="text-slate-400">
                        {{
                          asc: <ChevronUp size={14} className="text-primary-500" />,
                          desc: <ChevronDown size={14} className="text-primary-500" />,
                        }[header.column.getIsSorted()] ?? <ArrowUpDown size={14} className="opacity-50" />}
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr 
                  key={row.id} 
                  className="border-b border-slate-200/50 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                >
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-3 text-slate-700 dark:text-slate-300">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-slate-500">
                  Không tìm thấy kết quả nào phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50 dark:bg-white/5 mt-auto">
        <span className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
          <div>Trang <strong className="text-slate-900 dark:text-white">{table.getState().pagination.pageIndex + 1}</strong> trên <strong className="text-slate-900 dark:text-white">{table.getPageCount() || 1}</strong></div>
          <span className="mx-2">•</span>
          <div>Tổng: <strong className="text-slate-900 dark:text-white">{table.getPrePaginationRowModel().rows.length}</strong> bản ghi</div>
        </span>
        
        <div className="flex items-center gap-2">
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="input-field py-1.5 px-3 text-sm w-auto mr-2"
          >
            {[10, 25, 50, 100].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} dòng
              </option>
            ))}
          </select>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
