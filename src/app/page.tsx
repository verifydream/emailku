'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  getEmails, 
  saveEmails, 
  addEmails, 
  updateEmail, 
  deleteEmail as deleteEmailStorage, 
  deleteEmailsByBase,
  deleteAllEmails,
  Email 
} from '@/lib/storage'
import { generateDotVariations, isValidGmail } from '@/lib/generator'

type ToastType = 'success' | 'error' | 'info'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100] as const

const Icons = {
  sun: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  moon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  copy: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  check: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
  mail: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  note: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  trash: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  random: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  download: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  checkAll: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  search: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  sparkle: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  undo: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  chevronLeft: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>,
  chevronRight: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>,
  keyboard: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3C6.48 3 2 6.48 2 11c0 2.66 1.46 5.03 3.77 6.44l-.27 2.56 2.89-1.93C9.46 18.68 10.7 19 12 19c5.52 0 10-3.48 10-8s-4.48-8-10-8z" /></svg>,
}

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [inputEmail, setInputEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingNote, setEditingNote] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [activeBaseEmail, setActiveBaseEmail] = useState<string | 'all'>('all')
  const [jumpingEllipsis, setJumpingEllipsis] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; type: 'all' | 'group' }>({ show: false, type: 'all' })

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const loadEmails = () => {
    const data = getEmails()
    setEmails(data)
    setInitialLoading(false)
  }

  useEffect(() => {
    loadEmails()
    const savedItemsPerPage = localStorage.getItem('itemsPerPage')
    if (savedItemsPerPage) setItemsPerPage(parseInt(savedItemsPerPage))
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('darkMode', String(darkMode))
  }, [darkMode])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'r' && emails.length > 0) {
          e.preventDefault()
          pickRandom()
        }
        if (e.key === 'e' && emails.length > 0) {
          e.preventDefault()
          exportCSV()
        }
        if (e.key === 'k') {
          e.preventDefault()
          document.getElementById('search-input')?.focus()
        }
      }
      if (e.key === 'Escape') {
        setSelectMode(false)
        setSelectedEmails(new Set())
        setEditingNote(null)
      }
      if (e.key === '?') {
        setShowShortcuts(s => !s)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [emails])

  const handleGenerate = () => {
    if (!inputEmail) return
    
    if (!isValidGmail(inputEmail)) {
      showToast('Invalid Gmail address', 'error')
      return
    }

    setLoading(true)
    
    try {
      const variations = generateDotVariations(inputEmail)
      const baseEmail = inputEmail.toLowerCase().replace(/\./g, '').replace('@gmailcom', '@gmail.com')
      const now = new Date().toISOString()
      
      const newEmails = variations.map(generatedEmail => ({
        baseEmail,
        generatedEmail,
        isUsed: false,
        usedAt: null,
        createdAt: now,
        note: null,
      }))

      const result = addEmails(newEmails)
      loadEmails()
      
      // Switch to the new email group
      setActiveBaseEmail(baseEmail)
      
      showToast(`Generated ${result.inserted} email variations!`, 'success')
      setInputEmail('')
      setCurrentPage(1)
    } catch (error) {
      showToast('Failed to generate emails', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleUsed = (id: number, currentStatus: boolean) => {
    updateEmail(id, { 
      isUsed: !currentStatus, 
      usedAt: !currentStatus ? new Date().toISOString() : null 
    })
    loadEmails()
  }

  const handleDeleteEmail = (id: number) => {
    deleteEmailStorage(id)
    loadEmails()
    showToast('Email deleted', 'info')
  }

  const clearAll = () => {
    setDeleteModal({
      show: true,
      type: activeBaseEmail !== 'all' ? 'group' : 'all'
    })
  }

  const confirmDelete = () => {
    if (deleteModal.type === 'group' && activeBaseEmail !== 'all') {
      deleteEmailsByBase(activeBaseEmail)
      setActiveBaseEmail('all')
      showToast(`Deleted all emails for ${activeBaseEmail}`, 'info')
    } else {
      deleteAllEmails()
      showToast('All emails deleted', 'info')
    }
    loadEmails()
    setDeleteModal({ show: false, type: 'all' })
  }

  const copyToClipboard = async (email: string, id: number) => {
    await navigator.clipboard.writeText(email)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  const openGmail = (email: string) => {
    window.open(`https://mail.google.com/mail/u/${email}`, '_blank')
  }

  const handleSaveNote = (id: number) => {
    updateEmail(id, { note: noteText || null })
    loadEmails()
    setEditingNote(null)
    setNoteText('')
    showToast('Note saved', 'success')
  }

  const pickRandom = () => {
    // Filter by active tab + availability
    const available = emails.filter(e => 
      !e.isUsed && 
      (activeBaseEmail === 'all' || e.baseEmail === activeBaseEmail)
    )

    if (available.length === 0) {
      showToast('No available emails!', 'error')
      return
    }
    const random = available[Math.floor(Math.random() * available.length)]
    
    // Mark as used immediately
    updateEmail(random.id, { isUsed: true, usedAt: new Date().toISOString() })
    loadEmails()
    
    copyToClipboard(random.generatedEmail, random.id)
    showToast(`Copied & marked used: ${random.generatedEmail}`, 'success')
  }

  const exportCSV = () => {
    const headers = ['#', 'Email', 'Status', 'Used At', 'Note']
    const rows = filteredEmails.map((e, i) => [
      i + 1,
      e.generatedEmail,
      e.isUsed ? 'Used' : 'Available',
      e.usedAt ? new Date(e.usedAt).toLocaleDateString() : '',
      (e.note || '').replace(/,/g, ';')
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `gmail-dots-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exported!', 'success')
  }

  const markAllUsed = () => {
    const targets = selectMode && selectedEmails.size > 0 
      ? filteredEmails.filter(e => selectedEmails.has(e.id) && !e.isUsed)
      : filteredEmails.filter(e => !e.isUsed)
    
    if (targets.length === 0) {
      showToast('No available emails to mark', 'info')
      return
    }

    for (const email of targets) {
      updateEmail(email.id, { isUsed: true, usedAt: new Date().toISOString() })
    }
    loadEmails()
    setSelectedEmails(new Set())
    setSelectMode(false)
    showToast(`Marked ${targets.length} emails as used`, 'success')
  }

  const deleteSelected = () => {
    if (selectedEmails.size === 0) return
    if (!confirm(`Delete ${selectedEmails.size} selected emails?`)) return
    
    const idsToDelete = Array.from(selectedEmails)
    for (const id of idsToDelete) {
      deleteEmailStorage(id)
    }
    loadEmails()
    setSelectedEmails(new Set())
    setSelectMode(false)
    showToast(`Deleted ${idsToDelete.length} emails`, 'info')
  }

  const toggleSelect = (id: number) => {
    setSelectedEmails(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedEmails.size === paginatedEmails.length) {
      setSelectedEmails(new Set())
    } else {
      setSelectedEmails(new Set(paginatedEmails.map(e => e.id)))
    }
  }

  const filteredEmails = useMemo(() => emails.filter(email => {
    const matchesBase = activeBaseEmail === 'all' || email.baseEmail === activeBaseEmail
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'available' && !email.isUsed) ||
      (filter === 'used' && email.isUsed)
    const searchLower = search.toLowerCase()
    const matchesSearch = email.generatedEmail.toLowerCase().includes(searchLower) ||
      (email.note && email.note.toLowerCase().includes(searchLower))
    return matchesBase && matchesFilter && matchesSearch
  }), [emails, filter, search, activeBaseEmail])

  // Get unique base emails for tabs
  const baseEmails = useMemo(() => {
    const bases = new Set(emails.map(e => e.baseEmail))
    return Array.from(bases).sort()
  }, [emails])

  const totalPages = Math.ceil(filteredEmails.length / itemsPerPage)
  const paginatedEmails = filteredEmails.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleItemsPerPageChange = (newSize: number) => {
    setItemsPerPage(newSize)
    localStorage.setItem('itemsPerPage', String(newSize))
    setCurrentPage(1)
  }

  const startIndex = (currentPage - 1) * itemsPerPage + 1
  const endIndex = Math.min(currentPage * itemsPerPage, filteredEmails.length)

  const stats = useMemo(() => {
    // Calculate stats based on ALL emails if 'all' is selected, or filtered by baseEmail otherwise
    // But usually global stats are useful, or stats per group?
    // Let's make stats reflect the CURRENT VIEW
    const currentViewEmails = activeBaseEmail === 'all' 
      ? emails 
      : emails.filter(e => e.baseEmail === activeBaseEmail)

    return {
      total: currentViewEmails.length,
      available: currentViewEmails.filter(e => !e.isUsed).length,
      used: currentViewEmails.filter(e => e.isUsed).length,
    }
  }, [emails, activeBaseEmail])

  const progressPercent = stats.total > 0 ? (stats.used / stats.total) * 100 : 0

  const handleJumpToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const page = parseInt((e.target as HTMLInputElement).value)
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        setCurrentPage(page)
        setJumpingEllipsis(null)
      } else {
        showToast('Invalid page number', 'error')
      }
    } else if (e.key === 'Escape') {
      setJumpingEllipsis(null)
    }
  }

  const highlightDots = (email: string) => {
    const [local, domain] = email.split('@')
    const highlighted = local.split('').map((char, i) => 
      char === '.' ? <span key={i} className="text-blue-500 font-bold">.</span> : char
    )
    return <>{highlighted}<span className="text-slate-400">@{domain}</span></>
  }

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-slate-800 dark:bg-slate-100 text-white dark:text-slate-800'
          }`}>
            {toast.type === 'success' && Icons.check}
            {toast.type === 'error' && <span>!</span>}
            <span className="font-medium">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowShortcuts(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full animate-fade-in shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Keyboard Shortcuts</h3>
            <div className="space-y-3">
              {[
                ['Ctrl + R', 'Pick random email'],
                ['Ctrl + E', 'Export to CSV'],
                ['Ctrl + K', 'Focus search'],
                ['Escape', 'Cancel / Exit select mode'],
                ['?', 'Toggle this menu'],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center">
                  <kbd className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-sm font-mono">{key}</kbd>
                  <span className="text-slate-600 dark:text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-6 w-full py-2 bg-slate-100 dark:bg-slate-700 rounded-xl font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteModal({ ...deleteModal, show: false })}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full animate-fade-in shadow-2xl border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 text-red-500 dark:text-red-400">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                {deleteModal.type === 'group' ? 'Delete Group?' : 'Delete Everything?'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400">
                {deleteModal.type === 'group' 
                  ? `This will permanently delete all emails for "${activeBaseEmail}".`
                  : 'This will permanently delete ALL emails from ALL groups.'}
                <br/>This action cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteModal({ ...deleteModal, show: false })}
                className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-red-500/30"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-start mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text mb-1">
              emailku
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm flex items-center gap-2">
              Generate unlimited email variations (stored locally)
              <button 
                onClick={() => setShowShortcuts(true)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                title="Keyboard shortcuts"
              >
                {Icons.keyboard}
              </button>
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-xl glass hover:scale-105 active:scale-95 transition-all duration-200 text-slate-600 dark:text-slate-300"
            aria-label="Toggle dark mode"
          >
            {darkMode ? Icons.sun : Icons.moon}
          </button>
        </header>

        {/* Input Section */}
        <section className="glass rounded-2xl p-6 mb-6 animate-fade-in-up shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                placeholder="Enter Gmail address (e.g., yourname@gmail.com)"
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors text-lg"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              {inputEmail && (
                <button 
                  onClick={() => setInputEmail('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading || !inputEmail}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-slate-400 disabled:to-slate-400 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 btn-hover disabled:cursor-not-allowed shadow-lg hover:shadow-xl active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  {Icons.sparkle}
                  <span>Generate</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Stats */}
        {emails.length > 0 && (
          <section className="grid grid-cols-3 gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {[
              { label: 'Total', value: stats.total, color: 'text-slate-800 dark:text-white', bg: 'from-slate-500/10 to-slate-500/5' },
              { label: 'Available', value: stats.available, color: 'text-emerald-600 dark:text-emerald-400', bg: 'from-emerald-500/10 to-emerald-500/5' },
              { label: 'Used', value: stats.used, color: 'text-rose-600 dark:text-rose-400', bg: 'from-rose-500/10 to-rose-500/5' },
            ].map((stat) => (
              <div key={stat.label} className={`glass rounded-xl p-4 text-center card-hover bg-gradient-to-br ${stat.bg}`}>
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Progress Bar */}
        {emails.length > 0 && (
          <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-2">
              <span>Usage Progress {activeBaseEmail !== 'all' ? `(${activeBaseEmail})` : ''}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Base Email Tabs */}
        {baseEmails.length > 0 && (
          <section className="mb-6 animate-fade-in-up overflow-x-auto pb-2" style={{ animationDelay: '0.18s' }}>
             <div className="flex gap-2">
                <button
                  onClick={() => setActiveBaseEmail('all')}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all duration-200 border-2 ${
                    activeBaseEmail === 'all'
                      ? 'bg-slate-800 dark:bg-white text-white dark:text-slate-800 border-slate-800 dark:border-white'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'
                  }`}
                >
                  All Emails
                </button>
                {baseEmails.map(base => (
                  <button
                    key={base}
                    onClick={() => setActiveBaseEmail(base)}
                    className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all duration-200 border-2 ${
                      activeBaseEmail === base
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/25'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700'
                    }`}
                  >
                    {base}
                  </button>
                ))}
             </div>
          </section>
        )}

        {/* Action Bar */}
        {emails.length > 0 && (
          <section className="glass rounded-2xl p-4 mb-6 animate-fade-in-up shadow-lg" style={{ animationDelay: '0.2s' }}>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={pickRandom}
                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg active:scale-[0.98]"
              >
                {Icons.random}
                <span className="hidden sm:inline">Random Pick</span>
              </button>
              <button
                onClick={exportCSV}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg active:scale-[0.98]"
              >
                {Icons.download}
                <span className="hidden sm:inline">Export CSV</span>
              </button>
              <button
                onClick={() => setSelectMode(!selectMode)}
                className={`px-4 py-2.5 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg active:scale-[0.98] ${
                  selectMode 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
              >
                {Icons.checkAll}
                <span className="hidden sm:inline">{selectMode ? 'Exit Select' : 'Select Mode'}</span>
              </button>
              {selectMode && selectedEmails.size > 0 && (
                <>
                  <button
                    onClick={markAllUsed}
                    className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg active:scale-[0.98]"
                  >
                    {Icons.check}
                    <span>Mark Used ({selectedEmails.size})</span>
                  </button>
                  <button
                    onClick={deleteSelected}
                    className="px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center gap-2 shadow hover:shadow-lg active:scale-[0.98]"
                  >
                    {Icons.trash}
                    <span>Delete ({selectedEmails.size})</span>
                  </button>
                </>
              )}
              <button
                onClick={clearAll}
                className="px-4 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 font-medium rounded-xl transition-all duration-200 flex items-center gap-2 ml-auto"
              >
                {Icons.trash}
                <span className="hidden sm:inline">
                  {activeBaseEmail !== 'all' ? 'Delete Group' : 'Clear All'}
                </span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                {(['all', 'available', 'used'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => { setFilter(f); setCurrentPage(1) }}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      filter === f
                        ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                    <span className="ml-1.5 text-xs opacity-60">
                      {f === 'all' ? stats.total : f === 'available' ? stats.available : stats.used}
                    </span>
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-80">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {Icons.search}
                </span>
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Search emails or notes... (Ctrl+K)"
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 transition-colors"
                />
              </div>
            </div>
          </section>
        )}

        {/* Select All */}
        {selectMode && paginatedEmails.length > 0 && (
          <div className="flex items-center gap-3 mb-3 animate-fade-in">
            <button onClick={selectAll} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              {selectedEmails.size === paginatedEmails.length ? 'Deselect All' : 'Select All on Page'}
            </button>
            <span className="text-sm text-slate-400">{selectedEmails.size} selected</span>
          </div>
        )}

        {/* Email List */}
        <div className="space-y-2">
          {initialLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass rounded-xl p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-20 h-6 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
              </div>
            ))
          ) : (
            paginatedEmails.map((email, index) => {
              const globalIndex = (currentPage - 1) * itemsPerPage + index + 1
              const isSelected = selectedEmails.has(email.id)
              
              return (
                <div
                  key={email.id}
                  className={`stagger-item glass rounded-xl p-4 card-hover border-l-4 transition-all ${
                    email.isUsed ? 'border-rose-500' : 'border-emerald-500'
                  } ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
                  onClick={() => selectMode && toggleSelect(email.id)}
                  style={{ cursor: selectMode ? 'pointer' : 'default' }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {selectMode && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(email.id)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                          onClick={e => e.stopPropagation()}
                        />
                      )}
                      <span className="text-sm font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-2.5 py-1 rounded-lg shrink-0">
                        #{globalIndex}
                      </span>
                      <span className="font-mono text-base lg:text-lg text-slate-800 dark:text-white truncate">
                        {highlightDots(email.generatedEmail)}
                      </span>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${
                        email.isUsed 
                          ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                          : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {email.isUsed ? 'Used' : 'Available'}
                      </span>
                    </div>
                    
                    {!selectMode && (
                      <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => copyToClipboard(email.generatedEmail, email.id)}
                          className={`p-2.5 rounded-lg transition-all duration-200 tooltip ${
                            copied === email.id 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                          data-tooltip="Copy email"
                        >
                          {copied === email.id ? Icons.check : Icons.copy}
                        </button>
                        <button
                          onClick={() => openGmail(email.generatedEmail)}
                          className="p-2.5 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all duration-200 tooltip"
                          data-tooltip="Open Gmail"
                        >
                          {Icons.mail}
                        </button>
                        <button
                          onClick={() => { setEditingNote(email.id); setNoteText(email.note || '') }}
                          className={`p-2.5 rounded-lg transition-all duration-200 tooltip ${
                            email.note 
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' 
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                          data-tooltip={email.note ? 'Edit note' : 'Add note'}
                        >
                          {Icons.note}
                        </button>
                        <button
                          onClick={() => toggleUsed(email.id, email.isUsed)}
                          className={`p-2.5 rounded-lg transition-all duration-200 tooltip ${
                            email.isUsed
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50'
                          }`}
                          data-tooltip={email.isUsed ? 'Mark available' : 'Mark used'}
                        >
                          {email.isUsed ? Icons.undo : Icons.check}
                        </button>
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 tooltip"
                          data-tooltip="Delete"
                        >
                          {Icons.trash}
                        </button>
                      </div>
                    )}
                  </div>

                  {editingNote === email.id ? (
                    <div className="flex gap-2 mt-3 ml-0 lg:ml-12 animate-fade-in" onClick={e => e.stopPropagation()}>
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        placeholder="Add a note..."
                        className="flex-1 px-4 py-2 text-sm rounded-lg border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNote(email.id)
                          if (e.key === 'Escape') setEditingNote(null)
                        }}
                        autoFocus
                      />
                      <button onClick={() => handleSaveNote(email.id)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors">
                        Save
                      </button>
                      <button onClick={() => setEditingNote(null)} className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
                        Cancel
                      </button>
                    </div>
                  ) : email.note && (
                    <div 
                      className="text-sm text-slate-500 dark:text-slate-400 mt-2 ml-0 lg:ml-12 flex items-center gap-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      onClick={(e) => { e.stopPropagation(); setEditingNote(email.id); setNoteText(email.note || '') }}
                    >
                      {Icons.note}
                      <span>{email.note}</span>
                    </div>
                  )}
                  
                  {email.usedAt && (
                    <div className="text-xs text-slate-400 dark:text-slate-500 mt-2 ml-0 lg:ml-12">
                      Used on {new Date(email.usedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', month: 'short', day: 'numeric' 
                      })}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filteredEmails.length > 0 && (
          <nav className="glass rounded-2xl p-4 mt-6 animate-fade-in shadow-lg">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500 dark:text-slate-400">Show</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white border-none focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer transition-all hover:bg-slate-200 dark:hover:bg-slate-600"
                >
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
                <span className="text-sm text-slate-500 dark:text-slate-400">per page</span>
              </div>

              <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Showing <span className="text-slate-800 dark:text-white">{startIndex}</span> - <span className="text-slate-800 dark:text-white">{endIndex}</span> of <span className="text-slate-800 dark:text-white">{filteredEmails.length}</span> emails
              </div>

              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 active:scale-95"
                    >
                      {Icons.chevronLeft}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
                      // Logic: Always show 1 2 3 ... current ... last-2 last-1 last
                      // Actually user asked for 1 2 3 ... 7 8 9 style specifically
                      // Let's adapt standard logic but enable the ellipsis jump
                      
                      const siblings = 1 // number of pages around current
                      const boundary = 3 // number of pages at start/end
                      
                      const startPages = []
                      for(let i=1; i<=Math.min(boundary, totalPages); i++) startPages.push(i)
                        
                      const endPages = []
                      for(let i=Math.max(totalPages-boundary+1, boundary+1); i<=totalPages; i++) endPages.push(i)
                      
                      // Check if we need complex logic
                      if (totalPages <= (boundary * 2) + 1) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i)
                      } else {
                        // We have gaps
                        pages.push(...startPages)
                        
                        // Middle section around current page
                        // If current page is far from start
                        if (currentPage > boundary + 1) {
                           pages.push('ellipsis-start')
                        }
                        
                        // Add current page if it's not in start or end lists
                        if (currentPage > boundary && currentPage <= totalPages - boundary) {
                           pages.push(currentPage)
                        }

                        // If current page is far from end
                        if (currentPage < totalPages - boundary) {
                           pages.push('ellipsis-end')
                        }
                        
                        pages.push(...endPages)
                      }

                      // Deduplicate just in case
                      const uniquePages = Array.from(new Set(pages))

                      return uniquePages.map((page, idx) => {
                        if (typeof page === 'string') {
                          const isJumping = jumpingEllipsis === page
                          return isJumping ? (
                             <input
                               key={`jump-${page}`}
                               type="number"
                               autoFocus
                               onBlur={() => setJumpingEllipsis(null)}
                               onKeyDown={handleJumpToPage}
                               className="w-16 h-10 px-2 text-center text-sm rounded-lg border-2 border-blue-500 outline-none bg-white dark:bg-slate-800"
                               placeholder="#"
                             />
                          ) : (
                            <button
                              key={`ellipsis-${idx}`} 
                              className="min-w-[40px] h-10 px-2 text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              onClick={() => setJumpingEllipsis(page)}
                              title="Jump to page"
                            >
                              ...
                            </button>
                          )
                        } else {
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        }
                      })
                    })()}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 active:scale-95"
                    >
                      {Icons.chevronRight}
                    </button>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-all duration-200 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Empty States */}
        {!initialLoading && emails.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-7xl mb-6 animate-bounce-subtle">📧</div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">
              No emails generated yet
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter your Gmail address above to generate unlimited dot variations. 
              All data is stored locally on your device!
            </p>
          </div>
        )}

        {!initialLoading && filteredEmails.length === 0 && emails.length > 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="text-7xl mb-6">🔍</div>
            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-3">
              No matching emails
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter
            </p>
            <button 
              onClick={() => { setSearch(''); setFilter('all') }}
              className="mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-slate-400 dark:text-slate-600 mt-12 pb-6">
          <p>Gmail Dot Generator - Data stored locally on your device</p>
          <p className="text-xs mt-1 opacity-60">Press ? for keyboard shortcuts</p>
        </footer>
      </div>
    </main>
  )
}
