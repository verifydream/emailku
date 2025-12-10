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
  getMasterTags,
  addMasterTag,
  removeMasterTag,
  saveMasterTags,
  Email 
} from '@/lib/storage'
import { generateVariations, isValidGmail, GenerationMode } from '@/lib/generator'

type ToastType = 'success' | 'error' | 'info'

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50, 100] as const

const Icons = {
  settings: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  sun: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  moon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>,
  copy: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>,
  check: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>,
  mail: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
  note: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
  trash: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
  random: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  download: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  checkAll: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  search: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
  sparkle: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  undo: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>,
  chevronLeft: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>,
  chevronRight: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>,
  keyboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 3C6.48 3 2 6.48 2 11c0 2.66 1.46 5.03 3.77 6.44l-.27 2.56 2.89-1.93C9.46 18.68 10.7 19 12 19c5.52 0 10-3.48 10-8s-4.48-8-10-8z" /></svg>,
  tag: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>,
  plus: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>,
  menu: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>,
}

const CustomNeoSelect = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select" 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[]; 
  placeholder?: string 
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-10 pr-10 py-3 md:py-4 text-base md:text-xl text-left bg-white dark:bg-slate-800 text-black dark:text-white border-2 border-black font-bold outline-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all"
      >
        <span className={value ? "" : "text-slate-400"}>{value || placeholder}</span>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className={`w-5 h-5 text-black dark:text-white transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0" style={{ zIndex: 9998 }} onClick={() => setIsOpen(false)} />
          <div 
            className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto border-3 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            style={{ zIndex: 9999 }}
          >
            {options.map((option) => (
              <button
                key={option}
                onClick={() => {
                  onChange(option)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-4 md:px-6 py-3 md:py-4 font-bold transition-colors text-sm md:text-base border-b-2 border-black dark:border-white last:border-b-0 ${
                  value === option 
                    ? 'bg-black dark:bg-white text-white dark:text-black' 
                    : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-[#3b82f6] hover:text-white'
                }`}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [inputEmail, setInputEmail] = useState('')
  const [inputTag, setInputTag] = useState('')
  const [genMode, setGenMode] = useState<GenerationMode>('dot')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'available' | 'used'>('all')
  const [search, setSearch] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [copied, setCopied] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [editingEmailId, setEditingEmailId] = useState<number | null>(null)
  const [noteText, setNoteText] = useState('')
  const [tagText, setTagText] = useState('')
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [selectedEmails, setSelectedEmails] = useState<Set<number>>(new Set())
  const [selectMode, setSelectMode] = useState(false)
  const [itemsPerPage, setItemsPerPage] = useState(15)
  const [activeBaseEmail, setActiveBaseEmail] = useState<string | 'all'>('all')
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all')
  const [jumpingEllipsis, setJumpingEllipsis] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; type: 'all' | 'group' }>({ show: false, type: 'all' })
  const [showSettings, setShowSettings] = useState(false)
  const [masterTags, setMasterTags] = useState<string[]>([])
  const [newMasterTag, setNewMasterTag] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 2500)
  }

  const loadEmails = () => {
    const data = getEmails()
    setEmails(data)
    setInitialLoading(false)
  }

  const loadMasterTags = () => {
    setMasterTags(getMasterTags())
  }

  useEffect(() => {
    loadEmails()
    loadMasterTags()
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
        setEditingEmailId(null)
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

    if ((genMode === 'plus' || genMode === 'mixed') && !inputTag.trim()) {
      showToast('Please enter a tag (e.g., "work")', 'error')
      return
    }

    setLoading(true)
    
    try {
      const variations = generateVariations(inputEmail, genMode, inputTag.trim())
      const baseEmail = inputEmail.toLowerCase().replace(/\./g, '').replace('@gmailcom', '@gmail.com')
      const now = new Date().toISOString()
      
      const newEmails = variations.map(generatedEmail => ({
        baseEmail,
        generatedEmail,
        isUsed: false,
        usedAt: null,
        createdAt: now,
        note: null,
        tags: []
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
    setEditingEmailId(null)
    setNoteText('')
    showToast('Note saved', 'success')
  }

  const handleAddTag = (id: number) => {
    if (!tagText.trim()) return
    const email = emails.find(e => e.id === id)
    if (email) {
      const currentTags = email.tags || []
      if (!currentTags.includes(tagText.trim())) {
        updateEmail(id, { tags: [...currentTags, tagText.trim()] })
        loadEmails()
      }
    }
    setTagText('')
  }

  const handleRemoveTag = (id: number, tagToRemove: string) => {
    const email = emails.find(e => e.id === id)
    if (email) {
       const currentTags = email.tags || []
       updateEmail(id, { tags: currentTags.filter(t => t !== tagToRemove) })
       loadEmails()
    }
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
    const matchesTag = selectedTag === 'all' || (email.tags && email.tags.includes(selectedTag))
    const searchLower = search.toLowerCase()
    const matchesSearch = email.generatedEmail.toLowerCase().includes(searchLower) ||
      (email.note && email.note.toLowerCase().includes(searchLower)) ||
      (email.tags && email.tags.some(t => t.toLowerCase().includes(searchLower)))
    return matchesBase && matchesFilter && matchesTag && matchesSearch
  }), [emails, filter, search, activeBaseEmail, selectedTag])

  // Get unique base emails for tabs
  const baseEmails = useMemo(() => {
    const bases = new Set(emails.map(e => e.baseEmail))
    return Array.from(bases).sort()
  }, [emails])

  // Get unique tags for filter
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>()
    emails.forEach(e => e.tags?.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
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
      char === '.' ? <span key={i} className="text-[#3b82f6] font-black">.</span> : char
    )
    return <>{highlighted}<span className="text-slate-400">@{domain}</span></>
  }

  const handleAddMasterTag = () => {
    if (!newMasterTag.trim()) return
    addMasterTag(newMasterTag.trim())
    setNewMasterTag('')
    loadMasterTags()
    showToast('Tag added to master list', 'success')
  }

  const handleRemoveMasterTag = (tag: string) => {
    removeMasterTag(tag)
    loadMasterTags()
  }

  const handleResetMasterTags = () => {
    if (confirm('Reset tags to default (Google, Netflix, etc)?')) {
      const defaults = ['google', 'netflix', 'facebook', 'twitter', 'amazon']
      saveMasterTags(defaults)
      loadMasterTags()
      showToast('Tags reset to defaults', 'success')
    }
  }

  const getTabColor = (base: string, isActive: boolean) => {
    // Generate a consistent color based on string hash or just cycle through predefined colors
    // Let's use simple cycling for simplicity and consistency with design system
    const colors = [
      { bg: 'bg-[#a855f7]', border: 'border-black' }, // Purple
      { bg: 'bg-[#22c55e]', border: 'border-black' }, // Green
      { bg: 'bg-[#f59e0b]', border: 'border-black' }, // Yellow
      { bg: 'bg-[#ef4444]', border: 'border-black' }, // Red
      { bg: 'bg-[#3b82f6]', border: 'border-black' }, // Blue
    ]
    
    // Simple hash to pick color index
    let hash = 0;
    for (let i = 0; i < base.length; i++) hash = base.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % colors.length;
    
    if (isActive) {
      return `${colors[index].bg} text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]`
    }
    return `bg-white text-black hover:bg-slate-50`
  }

  return (
    <main className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-down">
          <div className={`px-6 py-4 rounded-none border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
            toast.type === 'success' ? 'bg-[#22c55e] text-white' :
            toast.type === 'error' ? 'bg-[#ef4444] text-white' :
            'bg-white text-black'
          }`}>
            {toast.type === 'success' && Icons.check}
            {toast.type === 'error' && <span className="font-black text-xl">!</span>}
            <span className="font-bold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowShortcuts(false)}>
          <div className="neo-card p-5 sm:p-8 max-w-md w-full animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 uppercase tracking-wider text-black dark:text-white">Shortcuts</h3>
            <div className="space-y-3 sm:space-y-4">
              {[
                ['Ctrl + R', 'Pick random'],
                ['Ctrl + E', 'Export CSV'],
                ['Ctrl + K', 'Focus search'],
                ['Escape', 'Cancel / Exit'],
                ['?', 'Toggle menu'],
              ].map(([key, desc]) => (
                <div key={key} className="flex justify-between items-center gap-3">
                  <kbd className="px-2 sm:px-3 py-1 sm:py-1.5 bg-white dark:bg-slate-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs sm:text-sm font-mono font-bold text-black dark:text-white shrink-0">{key}</kbd>
                  <span className="font-medium text-slate-700 dark:text-slate-300 text-sm sm:text-base text-right">{desc}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowShortcuts(false)} className="mt-6 sm:mt-8 w-full py-2.5 sm:py-3 neo-btn bg-slate-200 hover:bg-slate-300 text-black text-sm sm:text-base">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setShowSettings(false)}>
          <div className="neo-card p-5 sm:p-8 max-w-md w-full animate-fade-in border-3 border-black" onClick={e => e.stopPropagation()}>
             <h3 className="text-xl sm:text-2xl font-black mb-4 sm:mb-6 uppercase tracking-wider text-black dark:text-white flex items-center gap-2 sm:gap-3">
               <span className="w-5 h-5 sm:w-6 sm:h-6">{Icons.settings}</span> Master Tags
             </h3>
             
             <div className="flex gap-2 mb-4 sm:mb-6">
                <input
                   type="text"
                   value={newMasterTag}
                   onChange={(e) => setNewMasterTag(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleAddMasterTag()}
                   placeholder="Add new tag..."
                   className="flex-1 px-3 sm:px-4 py-2 border-2 border-black outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-none transition-all text-black text-sm sm:text-base"
                   autoFocus
                />
                <button 
                  onClick={handleAddMasterTag}
                  className="px-3 sm:px-4 py-2 bg-[#22c55e] text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all text-sm sm:text-base"
                >
                  ADD
                </button>
             </div>

             <div className="max-h-48 sm:max-h-60 overflow-y-auto mb-4 sm:mb-6 pr-1 sm:pr-2 space-y-1.5 sm:space-y-2">
                {masterTags.length === 0 ? (
                  <p className="text-slate-500 italic text-center text-sm">No tags found.</p>
                ) : (
                  masterTags.map(tag => (
                    <div key={tag} className="flex justify-between items-center bg-white dark:bg-slate-700 p-1.5 sm:p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                       <span className="font-bold text-black dark:text-white uppercase px-1.5 sm:px-2 text-sm sm:text-base">{tag}</span>
                       <button 
                         onClick={() => handleRemoveMasterTag(tag)}
                         className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-[#ef4444] text-white font-black border-2 border-black hover:bg-red-600 transition-colors text-sm"
                       >
                         ×
                       </button>
                    </div>
                  ))
                )}
             </div>

             <div className="flex gap-2 sm:gap-4">
                <button 
                  onClick={handleResetMasterTags}
                  className="flex-1 py-2 px-3 sm:px-4 border-2 border-black bg-white hover:bg-slate-100 text-black font-bold text-xs sm:text-sm"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 neo-btn bg-black text-white text-sm sm:text-base"
                >
                  Done
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onClick={() => setDeleteModal({ ...deleteModal, show: false })}>
          <div className="neo-card p-5 sm:p-8 max-w-md w-full animate-fade-in border-3 border-black" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#ef4444] rounded-full border-3 border-black flex items-center justify-center mb-4 sm:mb-6 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <svg className="w-8 h-8 sm:w-10 sm:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-black dark:text-white mb-2 sm:mb-3 uppercase">
                {deleteModal.type === 'group' ? 'Delete Group?' : 'Delete All?'}
              </h3>
              <p className="font-medium text-slate-600 dark:text-slate-300 text-sm sm:text-base">
                {deleteModal.type === 'group' 
                  ? `Delete all emails for "${activeBaseEmail.split('@')[0]}@..."?`
                  : 'Delete ALL emails from ALL groups?'}
                <br/>This cannot be undone.
              </p>
            </div>
            <div className="flex gap-2 sm:gap-4">
              <button 
                onClick={() => setDeleteModal({ ...deleteModal, show: false })}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 neo-btn bg-white hover:bg-slate-100 text-black text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-2.5 sm:py-3 px-3 sm:px-4 neo-btn neo-btn-danger text-sm sm:text-base"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto pt-4 md:pt-8">
        {/* Header */}
        <header className="mb-8 md:mb-12 animate-fade-in">
          <div className="flex justify-between items-center md:items-start gap-4">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter text-black dark:text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)] dark:drop-shadow-[4px_4px_0px_rgba(255,255,255,0.2)] break-words">
              emailku<span className="text-[#3b82f6]">.</span>
            </h1>

            {/* Desktop Controls */}
            <div className="hidden md:flex flex-col md:flex-row items-start gap-6">
              <div className="inline-flex flex-wrap items-center gap-3 px-5 py-3 bg-white dark:bg-slate-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black text-black dark:text-white uppercase tracking-wide text-sm md:text-base">
                  Generate unlimited email variations
                </span>
                <div className="h-6 w-0.5 bg-black/20 dark:bg-white/20 mx-1"></div>
                <button 
                  onClick={() => setShowShortcuts(true)}
                  className="w-8 h-8 flex shrink-0 items-center justify-center bg-[#f59e0b] text-black font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  title="Keyboard shortcuts"
                >
                  ?
                </button>
                <button 
                  onClick={() => setShowSettings(true)}
                  className="w-8 h-8 flex shrink-0 items-center justify-center bg-[#a855f7] text-white font-black text-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  title="Master Tag Settings"
                >
                  {Icons.settings}
                </button>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 neo-btn bg-white dark:bg-slate-800 text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                aria-label="Toggle dark mode"
              >
                {darkMode ? Icons.sun : Icons.moon}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 neo-btn bg-white dark:bg-slate-800 text-black dark:text-white"
            >
              {Icons.menu}
            </button>
          </div>

          {/* Mobile Menu Content */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-6 flex flex-col gap-4 animate-fade-in-up">
              <div className="flex flex-col gap-3 p-4 bg-white dark:bg-slate-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-black text-black dark:text-white uppercase tracking-wide text-sm text-center mb-2">
                  Generate unlimited email variations
                </span>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={() => setShowShortcuts(true)}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-[#f59e0b] text-black font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    <span>SHORTCUTS</span>
                    <span className="bg-black text-white px-1.5 rounded-sm">?</span>
                  </button>
                  <button 
                    onClick={() => setShowSettings(true)}
                    className="w-full py-3 flex items-center justify-center gap-2 bg-[#a855f7] text-white font-black text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    <span>TAGS</span>
                    {Icons.settings}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full py-3 neo-btn bg-white dark:bg-slate-800 text-black dark:text-white flex items-center justify-center gap-2"
              >
                {darkMode ? Icons.sun : Icons.moon}
                <span className="font-black uppercase">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          )}
        </header>

        {/* Input Section */}
        <section className="neo-card p-4 sm:p-6 md:p-8 mb-6 md:mb-8 animate-fade-in-up relative" style={{ zIndex: 50 }}>
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Email Input Row */}
            <div className="flex flex-col md:flex-row gap-3 md:gap-4">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={inputEmail}
                  onChange={(e) => setInputEmail(e.target.value)}
                  placeholder="Enter Gmail address..."
                  className="neo-input w-full px-4 sm:px-6 py-3 md:py-4 text-base sm:text-lg md:text-xl"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                {inputEmail && (
                  <button 
                    onClick={() => setInputEmail('')}
                    className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-lg"
                  >
                    ×
                  </button>
                )}
              </div>

              {(genMode === 'plus' || genMode === 'mixed') && (
                 <div className="w-full md:w-48 lg:w-56 relative animate-fade-in" style={{ zIndex: 60 }}>
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg md:text-xl pointer-events-none" style={{ zIndex: 1 }}>
                     +
                   </div>
                   <CustomNeoSelect
                     value={inputTag}
                     onChange={setInputTag}
                     options={masterTags}
                     placeholder="Select Tag"
                   />
                 </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={loading || !inputEmail}
                className="neo-btn neo-btn-primary w-full md:w-auto px-6 md:px-8 py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3 text-base md:text-lg shrink-0"
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
                    <span>GENERATE</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
               <button 
                  onClick={() => setGenMode('dot')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-none font-bold border-2 border-black transition-all text-xs sm:text-sm md:text-base ${
                    genMode === 'dot' 
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                    : 'bg-white text-black hover:bg-slate-50'
                  }`}
               >
                 Dot Only
               </button>
               <button 
                  onClick={() => setGenMode('plus')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-none font-bold border-2 border-black transition-all text-xs sm:text-sm md:text-base ${
                    genMode === 'plus' 
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                    : 'bg-white text-black hover:bg-slate-50'
                  }`}
               >
                 Plus Only
               </button>
               <button 
                  onClick={() => setGenMode('mixed')}
                  className={`px-2 sm:px-4 md:px-6 py-2.5 sm:py-3 rounded-none font-bold border-2 border-black transition-all text-xs sm:text-sm md:text-base ${
                    genMode === 'mixed' 
                    ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]' 
                    : 'bg-white text-black hover:bg-slate-50'
                  }`}
               >
                 Mixed
               </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        {emails.length > 0 && (
          <section className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-6 md:mb-8 animate-fade-in-up relative" style={{ animationDelay: '0.1s', zIndex: 1 }}>
            {[
              { label: 'TOTAL', value: stats.total, color: 'bg-white dark:bg-slate-800', labelColor: 'text-black dark:text-white', valueColor: 'text-black dark:text-white' },
              { label: 'AVAILABLE', value: stats.available, color: 'bg-white dark:bg-slate-800', labelColor: 'text-[#22c55e]', valueColor: 'text-[#22c55e]' },
              { label: 'USED', value: stats.used, color: 'bg-white dark:bg-slate-800', labelColor: 'text-[#ef4444]', valueColor: 'text-[#ef4444]' },
            ].map((stat) => (
              <div key={stat.label} className={`neo-card p-3 sm:p-4 md:p-6 text-center ${stat.color}`}>
                <div className={`text-2xl sm:text-3xl md:text-4xl font-black mb-0.5 md:mb-1 ${stat.valueColor}`}>{stat.value}</div>
                <div className={`text-[10px] sm:text-xs md:text-sm font-bold opacity-80 tracking-wider md:tracking-widest ${stat.labelColor}`}>{stat.label}</div>
              </div>
            ))}
          </section>
        )}

        {/* Progress Bar */}
        {emails.length > 0 && (
          <div className="mb-6 md:mb-8 animate-fade-in-up relative" style={{ animationDelay: '0.15s', zIndex: 1 }}>
            <div className="flex justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wide">
              <span className="truncate max-w-[60%]">Progress {activeBaseEmail !== 'all' ? `(${activeBaseEmail.split('@')[0]})` : ''}</span>
              <span>{progressPercent.toFixed(0)}%</span>
            </div>
            <div className="neo-progress-container">
              <div className="neo-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Base Email Tabs */}
        {baseEmails.length > 0 && (
          <section className="mb-6 md:mb-8 animate-fade-in-up overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ animationDelay: '0.18s' }}>
             <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveBaseEmail('all')}
                  className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-none font-bold border-2 border-black whitespace-nowrap transition-all text-xs sm:text-sm md:text-base ${
                    activeBaseEmail === 'all'
                      ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]'
                      : 'bg-white text-black hover:bg-slate-50'
                  }`}
                >
                  ALL
                </button>
                {baseEmails.map(base => (
                  <button
                    key={base}
                    onClick={() => setActiveBaseEmail(base)}
                    className={`px-3 sm:px-6 py-1.5 sm:py-2 rounded-none font-bold border-2 border-black whitespace-nowrap transition-all text-xs sm:text-sm md:text-base ${getTabColor(base, activeBaseEmail === base)}`}
                  >
                    <span className="sm:hidden">{base.split('@')[0]}</span>
                    <span className="hidden sm:inline">{base}</span>
                  </button>
                ))}
             </div>
          </section>
        )}

        {/* Action Bar */}
        {emails.length > 0 && (
          <section className="neo-card p-4 sm:p-6 mb-6 md:mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
              <button
                onClick={pickRandom}
                className="neo-btn bg-[#a855f7] text-white px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                {Icons.random}
                <span className="hidden sm:inline">RANDOM</span>
              </button>
              <button
                onClick={exportCSV}
                className="neo-btn bg-[#22c55e] text-white px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
              >
                {Icons.download}
                <span className="hidden sm:inline">EXPORT</span>
              </button>
              <button
                onClick={() => setSelectMode(!selectMode)}
                className={`neo-btn px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm ${
                  selectMode 
                    ? 'bg-[#3b82f6] text-white' 
                    : 'bg-white text-black hover:bg-slate-50'
                }`}
              >
                {Icons.checkAll}
                <span className="hidden sm:inline">{selectMode ? 'EXIT' : 'SELECT'}</span>
              </button>
              <button
                onClick={clearAll}
                className="neo-btn bg-white text-black hover:bg-red-50 hover:text-red-500 px-3 sm:px-5 py-2.5 sm:py-3 flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm sm:ml-auto"
              >
                {Icons.trash}
                <span className="hidden sm:inline">
                  {activeBaseEmail !== 'all' ? 'DELETE' : 'CLEAR'}
                </span>
              </button>
            </div>
            
            {selectMode && selectedEmails.size > 0 && (
              <div className="flex gap-2 sm:gap-3 mb-4 animate-fade-in">
                <button
                  onClick={markAllUsed}
                  className="neo-btn bg-[#f59e0b] text-black px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                >
                  {Icons.check}
                  <span>MARK ({selectedEmails.size})</span>
                </button>
                <button
                  onClick={deleteSelected}
                  className="neo-btn neo-btn-danger px-3 sm:px-5 py-2 sm:py-3 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm flex-1 sm:flex-none justify-center"
                >
                  {Icons.trash}
                  <span>DELETE ({selectedEmails.size})</span>
                </button>
              </div>
            )}

            {/* Filter & Search */}
            <div className="flex flex-col gap-3 sm:gap-4">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                <div className="flex gap-0 border-2 border-black bg-white rounded-none overflow-hidden w-full sm:w-auto">
                  {(['all', 'available', 'used'] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => { setFilter(f); setCurrentPage(1) }}
                      className={`flex-1 sm:flex-none px-2 sm:px-4 py-2 font-bold transition-all border-r-2 border-black last:border-r-0 text-xs sm:text-sm ${
                        filter === f
                          ? (f === 'available' ? 'bg-[#22c55e] text-white' : f === 'used' ? 'bg-[#ef4444] text-white' : 'bg-black text-white')
                          : 'bg-white text-black hover:bg-slate-50'
                      }`}
                    >
                      <span className="sm:hidden">{f === 'available' ? 'AVAIL' : f.toUpperCase()}</span>
                      <span className="hidden sm:inline">{f.toUpperCase()}</span>
                      <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs opacity-80">
                        {f === 'all' ? stats.total : f === 'available' ? stats.available : stats.used}
                      </span>
                    </button>
                  ))}
                </div>

                {uniqueTags.length > 0 && (
                  <select
                    value={selectedTag}
                    onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1) }}
                    className="px-3 sm:px-4 py-2 rounded-none border-2 border-black bg-white text-black font-bold focus:outline-none cursor-pointer text-xs sm:text-sm w-full sm:w-auto"
                  >
                    <option value="all">ALL TAGS</option>
                    {uniqueTags.map(tag => (
                      <option key={tag} value={tag}>{tag.toUpperCase()}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="relative w-full">
                <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {Icons.search}
                </span>
                <input
                  id="search-input"
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1) }}
                  placeholder="Search emails..."
                  className="neo-input w-full pl-10 sm:pl-12 pr-4 py-2.5 sm:py-3 rounded-none text-sm sm:text-base"
                />
              </div>
            </div>
          </section>
        )}

        {/* Select All */}
        {selectMode && paginatedEmails.length > 0 && (
          <div className="flex items-center gap-2 sm:gap-3 mb-3 animate-fade-in">
            <button onClick={selectAll} className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:underline font-bold">
              {selectedEmails.size === paginatedEmails.length ? 'Deselect All' : 'Select All'}
            </button>
            <span className="text-xs sm:text-sm text-slate-400">{selectedEmails.size} selected</span>
          </div>
        )}

        {/* Email List */}
        <div className="space-y-2">
          {initialLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="neo-card p-3 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="flex-1 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
                  <div className="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded" />
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
                  className={`stagger-item neo-list-item p-2 sm:p-3 border-l-4 transition-all ${
                    email.isUsed ? 'border-l-[#ef4444]' : 'border-l-[#22c55e]'
                  } ${isSelected ? 'ring-2 ring-[#3b82f6] ring-offset-1' : ''}`}
                  onClick={() => selectMode && toggleSelect(email.id)}
                  style={{ cursor: selectMode ? 'pointer' : 'default' }}
                >
                  {/* Row 1: Index + Email + Status (always visible) */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    {/* Checkbox for select mode */}
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(email.id)}
                        className="w-4 h-4 sm:w-5 sm:h-5 rounded-none border-2 border-black cursor-pointer shrink-0"
                        onClick={e => e.stopPropagation()}
                      />
                    )}
                    
                    {/* Index Number */}
                    <span className="text-[10px] sm:text-xs font-black text-black bg-[#f59e0b] px-1.5 sm:px-2 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0">
                      #{globalIndex}
                    </span>
                    
                    {/* Email Address */}
                    <span className="font-mono text-xs sm:text-sm md:text-base font-bold text-slate-800 dark:text-white min-w-0 truncate">
                      {highlightDots(email.generatedEmail)}
                    </span>
                    
                    {/* Status Badge - Right after email */}
                    <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-bold border-2 border-black shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                      email.isUsed 
                        ? 'bg-[#ef4444] text-white'
                        : 'bg-[#22c55e] text-white'
                    }`}>
                      {email.isUsed ? 'USED' : 'AVAIL'}
                    </span>
                    
                    {/* Note indicator - Desktop only */}
                    {email.note && (
                      <span className="hidden md:inline text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px] lg:max-w-[150px]" title={email.note}>
                        📝 {email.note}
                      </span>
                    )}
                    
                    {/* Tags - Desktop only */}
                    {email.tags && email.tags.length > 0 && (
                      <div className="hidden md:flex items-center gap-1 shrink-0">
                        {email.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                            {tag.toUpperCase()}
                          </span>
                        ))}
                        {email.tags.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{email.tags.length - 2}</span>
                        )}
                      </div>
                    )}
                    
                    {/* Spacer to push action buttons to right - Desktop only */}
                    <div className="hidden sm:block flex-1" />
                    
                    {/* Action Buttons - Desktop (inline) */}
                    {!selectMode && (
                      <div className="hidden sm:flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => copyToClipboard(email.generatedEmail, email.id)}
                          className={`p-2 border-2 border-black transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${
                            copied === email.id 
                              ? 'bg-[#22c55e] text-white' 
                              : 'bg-white text-black hover:bg-slate-50'
                          }`}
                          title="Copy"
                        >
                          <span className="w-4 h-4 md:w-5 md:h-5 block">{copied === email.id ? Icons.check : Icons.copy}</span>
                        </button>
                        <button
                          onClick={() => openGmail(email.generatedEmail)}
                          className="p-2 bg-[#3b82f6] text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100"
                          title="Open Gmail"
                        >
                          <span className="w-4 h-4 md:w-5 md:h-5 block">{Icons.mail}</span>
                        </button>
                        <button
                          onClick={() => { setEditingEmailId(email.id); setNoteText(email.note || '') }}
                          className={`p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100 ${
                            (email.note || (email.tags && email.tags.length > 0))
                              ? 'bg-[#f59e0b] text-black' 
                              : 'bg-white text-black hover:bg-slate-50'
                          }`}
                          title="Edit note & tags"
                        >
                          <span className="w-4 h-4 md:w-5 md:h-5 block">{Icons.note}</span>
                        </button>
                        <button
                          onClick={() => toggleUsed(email.id, email.isUsed)}
                          className={`p-2 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100 ${
                            email.isUsed
                              ? 'bg-[#22c55e] text-white'
                              : 'bg-white text-black hover:bg-slate-50'
                          }`}
                          title={email.isUsed ? 'Mark available' : 'Mark used'}
                        >
                          <span className="w-4 h-4 md:w-5 md:h-5 block">{email.isUsed ? Icons.undo : Icons.check}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteEmail(email.id)}
                          className="p-2 bg-white text-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ef4444] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100"
                          title="Delete"
                        >
                          <span className="w-4 h-4 md:w-5 md:h-5 block">{Icons.trash}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Row 2: Action Buttons - Mobile only */}
                  {!selectMode && (
                    <div className="flex sm:hidden items-center gap-1.5 mt-2" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => copyToClipboard(email.generatedEmail, email.id)}
                        className={`p-2 border-2 border-black transition-all duration-100 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                          copied === email.id 
                            ? 'bg-[#22c55e] text-white' 
                            : 'bg-white text-black'
                        }`}
                      >
                        <span className="w-4 h-4 block">{copied === email.id ? Icons.check : Icons.copy}</span>
                      </button>
                      <button
                        onClick={() => openGmail(email.generatedEmail)}
                        className="p-2 bg-[#3b82f6] text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100"
                      >
                        <span className="w-4 h-4 block">{Icons.mail}</span>
                      </button>
                      <button
                        onClick={() => { setEditingEmailId(email.id); setNoteText(email.note || '') }}
                        className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100 ${
                          (email.note || (email.tags && email.tags.length > 0))
                            ? 'bg-[#f59e0b] text-black' 
                            : 'bg-white text-black'
                        }`}
                      >
                        <span className="w-4 h-4 block">{Icons.note}</span>
                      </button>
                      <button
                        onClick={() => toggleUsed(email.id, email.isUsed)}
                        className={`p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100 ${
                          email.isUsed
                            ? 'bg-[#22c55e] text-white'
                            : 'bg-white text-black'
                        }`}
                      >
                        <span className="w-4 h-4 block">{email.isUsed ? Icons.undo : Icons.check}</span>
                      </button>
                      <button
                        onClick={() => handleDeleteEmail(email.id)}
                        className="p-2 bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#ef4444] hover:text-white active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-100"
                      >
                        <span className="w-4 h-4 block">{Icons.trash}</span>
                      </button>
                      
                      {/* Note & Tags indicator - Mobile */}
                      {(email.note || (email.tags && email.tags.length > 0)) && (
                        <div className="flex items-center gap-1 ml-auto text-[10px] text-slate-500">
                          {email.note && <span>📝</span>}
                          {email.tags && email.tags.length > 0 && <span>🏷️{email.tags.length}</span>}
                        </div>
                      )}
                    </div>
                  )}

                  {editingEmailId === email.id ? (
                    <div className="mt-2 sm:mt-3 animate-fade-in p-3 sm:p-4 bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                      <div className="mb-3">
                        <label className="text-[10px] sm:text-xs font-black text-black uppercase mb-1 block">Note</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-black outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveNote(email.id)
                              if (e.key === 'Escape') setEditingEmailId(null)
                            }}
                            autoFocus
                          />
                          <button onClick={() => handleSaveNote(email.id)} className="px-3 sm:px-4 py-2 bg-[#3b82f6] text-white text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                            SAVE
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] sm:text-xs font-black text-black uppercase mb-1 block">Tags</label>
                        <div className="flex gap-2 mb-2">
                          <input
                             type="text"
                             value={tagText}
                             onChange={(e) => setTagText(e.target.value)}
                             placeholder="Add tag..."
                             className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm border-2 border-black outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                             onKeyDown={(e) => {
                               if (e.key === 'Enter') handleAddTag(email.id)
                             }}
                          />
                          <button onClick={() => handleAddTag(email.id)} className="px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all">
                            ADD
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 sm:gap-2">
                           {email.tags && email.tags.map(tag => (
                             <span key={tag} className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold bg-white border border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                               {tag.toUpperCase()}
                               <button onClick={() => handleRemoveTag(email.id, tag)} className="hover:text-red-500 font-black">×</button>
                             </span>
                           ))}
                        </div>
                      </div>

                      <div className="mt-3 sm:mt-4 flex justify-end">
                         <button onClick={() => setEditingEmailId(null)} className="text-[10px] sm:text-xs font-bold text-slate-500 hover:text-black uppercase">
                            Close
                         </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {filteredEmails.length > 0 && (
          <nav className="neo-card p-3 sm:p-4 mt-4 sm:mt-6 animate-fade-in">
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Top row: Items per page + Count info */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-black dark:text-white">Show</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold rounded-none bg-white dark:bg-slate-800 text-black dark:text-white border-2 border-black focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none cursor-pointer transition-all"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="text-xs sm:text-sm font-bold text-black dark:text-white">
                  <span className="font-black">{startIndex}</span>-<span className="font-black">{endIndex}</span> of <span className="font-black">{filteredEmails.length}</span>
                </div>
              </div>

              {/* Bottom row: Page navigation */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-none border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 sm:p-2 rounded-none border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    <span className="w-4 h-4 sm:w-6 sm:h-6 block">{Icons.chevronLeft}</span>
                  </button>
                  
                  <div className="flex items-center gap-1 sm:gap-2">
                    {(() => {
                      const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []
                      const boundary = 2
                      
                      const startPages = []
                      for(let i=1; i<=Math.min(boundary, totalPages); i++) startPages.push(i)
                        
                      const endPages = []
                      for(let i=Math.max(totalPages-boundary+1, boundary+1); i<=totalPages; i++) endPages.push(i)
                      
                      if (totalPages <= (boundary * 2) + 1) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i)
                      } else {
                        pages.push(...startPages)
                        if (currentPage > boundary + 1) pages.push('ellipsis-start')
                        if (currentPage > boundary && currentPage <= totalPages - boundary) pages.push(currentPage)
                        if (currentPage < totalPages - boundary) pages.push('ellipsis-end')
                        pages.push(...endPages)
                      }

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
                               className="w-10 sm:w-12 h-8 sm:h-10 px-1 text-center font-bold text-xs sm:text-sm rounded-none border-2 border-black outline-none bg-white dark:bg-slate-800 text-black dark:text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                               placeholder="#"
                             />
                          ) : (
                            <button
                              key={`ellipsis-${idx}`} 
                              className="min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 px-1.5 sm:px-2 font-black text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-none transition-colors text-sm"
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
                              className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 px-2 sm:px-3 rounded-none font-bold text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all ${
                                currentPage === page
                                  ? 'bg-black text-white'
                                  : 'bg-white dark:bg-slate-800 text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {page}
                            </button>
                          )
                        }
                      })
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-none border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    <span className="w-4 h-4 sm:w-6 sm:h-6 block">{Icons.chevronRight}</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="p-1.5 sm:p-2 rounded-none border-2 border-black bg-white dark:bg-slate-800 text-black dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all"
                  >
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </nav>
        )}

        {/* Empty States */}
        {!initialLoading && emails.length === 0 && (
          <div className="text-center py-12 sm:py-20 animate-fade-in-up px-4">
            <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">📧</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
              No emails generated yet
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Enter your Gmail address above to generate unlimited dot variations. 
              All data is stored locally!
            </p>
          </div>
        )}

        {!initialLoading && filteredEmails.length === 0 && emails.length > 0 && (
          <div className="text-center py-12 sm:py-20 animate-fade-in-up px-4">
            <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">🔍</div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2 sm:mb-3">
              No matching emails
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Try adjusting your search or filter
            </p>
            <button 
              onClick={() => { setSearch(''); setFilter('all') }}
              className="mt-4 px-4 py-2 bg-[#3b82f6] text-white font-bold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all text-sm sm:text-base"
            >
              Clear filters
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs sm:text-sm text-slate-400 dark:text-slate-600 mt-8 sm:mt-12 pb-4 sm:pb-6 font-bold">
          <p>© TheVeriVibe 2025</p>
        </footer>
      </div>
    </main>
  )
}
