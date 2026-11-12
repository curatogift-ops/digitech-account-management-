import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import api, { errorMessage, normalizeList } from '../api/client.js'
import { clearLookups } from '../hooks/useLookups.js'
import useDebounce from '../hooks/useDebounce.js'
import { useToast } from './Toast.jsx'
import DataTable from './DataTable.jsx'
import Modal from './Modal.jsx'
import EntityForm from './EntityForm.jsx'

const PAGE_SIZE = 20

/**
 * Generic "list + filters + search + add/edit modal" page used by most modules.
 *
 * Props:
 *  title, subtitle, endpoint ('/leads/'), columns, filters [{key,label,options}]
 *  fields (EntityForm config) OR renderForm({ item, onSaved, onCancel })
 *  canAdd / canEdit(row) / canDelete(row), addLabel, rowActions(row, helpers) -> node
 *  rowLink(row) -> path, params (fixed query params), initialValues (create defaults),
 *  embedded (hide page header, ignore URL params), transform, headerExtra
 */
export default function ResourcePage({
  title,
  subtitle,
  endpoint,
  columns,
  filters = [],
  fields,
  renderForm,
  canAdd = true,
  canEdit = true,
  canDelete = false,
  addLabel,
  rowActions,
  rowLink,
  params,
  initialValues,
  embedded = false,
  transform,
  headerExtra,
  searchable = true,
  searchPlaceholder = 'Search…',
  modalTitle,
  modalSize = 'md',
  emptyTitle,
  emptyHint,
  entityName = 'record',
  onChanged,
  handleNewParam = false,
}) {
  const navigate = useNavigate()
  const toast = useToast()
  const [urlParams, setUrlParams] = useSearchParams()

  const [search, setSearch] = useState(() => (embedded ? '' : urlParams.get('q') || ''))
  const debounced = useDebounce(search)
  const [filterValues, setFilterValues] = useState({})
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ results: [], count: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tick, setTick] = useState(0)
  const [modal, setModal] = useState(null) // { item } ; item null = create

  const paramsKey = JSON.stringify(params || {})
  const filtersKey = JSON.stringify(filterValues)

  // Open the "create" modal when linked with ?new=1
  useEffect(() => {
    if ((!embedded || handleNewParam) && canAdd && urlParams.get('new') === '1') {
      setModal({ item: null })
      const next = new URLSearchParams(urlParams)
      next.delete('new')
      setUrlParams(next, { replace: true })
    }
  }, [embedded, handleNewParam, canAdd, urlParams, setUrlParams])

  useEffect(() => {
    setPage(1)
  }, [debounced, filtersKey, paramsKey, endpoint])

  useEffect(() => {
    let alive = true
    setLoading(true)
    const query = { ...(params || {}), page }
    if (debounced) query.search = debounced
    Object.entries(filterValues).forEach(([k, v]) => {
      if (v !== '' && v !== undefined) query[k] = v
    })
    api
      .get(endpoint, { params: query })
      .then(({ data: d }) => {
        if (!alive) return
        setData(normalizeList(d))
        setError('')
      })
      .catch((e) => {
        if (!alive) return
        // A page past the end (after deleting) -> go back one page
        if (e.response?.status === 404 && page > 1) setPage(page - 1)
        else setError(errorMessage(e))
      })
      .finally(() => alive && setLoading(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, page, debounced, filtersKey, paramsKey, tick])

  const reload = useCallback(() => {
    clearLookups()
    setTick((t) => t + 1)
    onChanged?.()
  }, [onChanged])

  const closeModal = () => setModal(null)
  const handleSaved = () => {
    closeModal()
    toast.success(modal?.item ? 'Changes saved' : `${entityName[0].toUpperCase()}${entityName.slice(1)} created`)
    reload()
  }

  const remove = async (row) => {
    if (!window.confirm(`Delete this ${entityName}? This cannot be undone.`)) return
    try {
      await api.delete(`${endpoint}${row.id}/`)
      toast.success('Deleted')
      reload()
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  const cols = useMemo(() => {
    const hasActions = rowActions || canEdit || canDelete
    if (!hasActions) return columns
    return [
      ...columns,
      {
        key: '__actions',
        header: '',
        align: 'right',
        className: 'actions-cell',
        render: (row) => (
          <div className="row-actions" onClick={(e) => e.stopPropagation()}>
            {rowActions?.(row, { reload, toast })}
            {(typeof canEdit === 'function' ? canEdit(row) : canEdit) && (
              <button
                type="button"
                className="icon-btn"
                title="Edit"
                onClick={() => setModal({ item: row })}
              >
                <Pencil size={15} />
              </button>
            )}
            {(typeof canDelete === 'function' ? canDelete(row) : canDelete) && (
              <button
                type="button"
                className="icon-btn icon-danger"
                title="Delete"
                onClick={() => remove(row)}
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ),
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, rowActions, canEdit, canDelete, reload])

  const pageCount = Math.max(1, Math.ceil(data.count / PAGE_SIZE))
  const addButton = canAdd && (fields || renderForm) && (
    <button type="button" className="btn btn-primary" onClick={() => setModal({ item: null })}>
      <Plus size={16} /> {addLabel || `Add ${entityName}`}
    </button>
  )

  return (
    <div className={embedded ? 'embedded' : 'page'}>
      {!embedded && (
        <div className="page-header">
          <div>
            <h1>{title}</h1>
            {subtitle && <p className="muted">{subtitle}</p>}
          </div>
          <div className="page-actions">
            {headerExtra}
            {addButton}
          </div>
        </div>
      )}

      <div className="toolbar">
        {searchable && (
          <div className="search-input">
            <Search size={16} />
            <input
              type="search"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        {filters.map((f) => (
          <select
            key={f.key}
            className="input input-sm"
            value={filterValues[f.key] ?? ''}
            onChange={(e) => setFilterValues((prev) => ({ ...prev, [f.key]: e.target.value }))}
            aria-label={f.label}
          >
            <option value="">{f.label}: All</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ))}
        <span className="toolbar-count muted">{loading ? '' : `${data.count} ${data.count === 1 ? 'record' : 'records'}`}</span>
        {embedded && <div className="toolbar-spacer">{addButton}</div>}
      </div>

      <DataTable
        columns={cols}
        rows={data.results}
        loading={loading}
        error={error}
        onRetry={reload}
        onRowClick={rowLink ? (row) => navigate(rowLink(row)) : undefined}
        emptyTitle={emptyTitle || `No ${entityName}s found`}
        emptyHint={emptyHint || (search || filtersKey !== '{}' ? 'Try adjusting your search or filters.' : undefined)}
        page={page}
        pageCount={pageCount}
        total={data.count}
        onPage={setPage}
      />

      {modal && (
        <Modal
          title={modalTitle ? modalTitle(modal.item) : modal.item ? `Edit ${entityName}` : `New ${entityName}`}
          onClose={closeModal}
          size={modalSize}
        >
          {renderForm ? (
            renderForm({ item: modal.item, onSaved: handleSaved, onCancel: closeModal, initialValues })
          ) : (
            <EntityForm
              fields={fields}
              endpoint={endpoint}
              id={modal.item?.id}
              initial={modal.item || initialValues}
              onSaved={handleSaved}
              onCancel={closeModal}
              transform={transform}
            />
          )}
        </Modal>
      )}
    </div>
  )
}
