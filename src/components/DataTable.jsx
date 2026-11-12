import { ChevronLeft, ChevronRight } from 'lucide-react'
import Loading, { EmptyState, ErrorState } from './Loading.jsx'

/**
 * columns: [{ key, header, render?(row), align?, width?, className? }]
 * Pagination (optional): page, pageCount, total, onPage
 */
export default function DataTable({
  columns,
  rows = [],
  loading,
  error,
  onRetry,
  onRowClick,
  empty,
  emptyTitle = 'No records found',
  emptyHint,
  emptyAction,
  page,
  pageCount,
  total,
  onPage,
}) {
  if (error) return <ErrorState message={error} onRetry={onRetry} />

  return (
    <div className="table-card card">
      <div className={`table-wrap${loading && rows.length ? ' is-refreshing' : ''}`}>
        <table className="data">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ width: c.width, textAlign: c.align }}>
                  {c.header || c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={row.id ?? i}
                className={onRowClick ? 'clickable' : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((c) => (
                  <td key={c.key} style={{ textAlign: c.align }} className={c.className}>
                    {c.render ? c.render(row) : (row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {loading && !rows.length && <Loading />}
        {!loading && !rows.length && (
          <EmptyState title={empty || emptyTitle} hint={emptyHint} action={emptyAction} />
        )}
      </div>
      {pageCount > 1 && (
        <div className="pagination">
          <span className="muted">
            Page {page} of {pageCount}
            {total != null && ` · ${total} records`}
          </span>
          <div className="pagination-btns">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={page >= pageCount}
              onClick={() => onPage(page + 1)}
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
