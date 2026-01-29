'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface LowDataContextType {
  isLowData: boolean
  toggleLowData: () => void
}

const LowDataContext = createContext<LowDataContextType | undefined>(undefined)

export function LowDataProvider({ children }: { children: ReactNode }) {
  const [isLowData, setIsLowData] = useState(false)

  // Load preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('lowDataMode')
    if (saved === 'true') {
      setIsLowData(true)
    }
  }, [])

  // Save preference to localStorage
  useEffect(() => {
    localStorage.setItem('lowDataMode', isLowData.toString())
  }, [isLowData])

  const toggleLowData = () => {
    setIsLowData(prev => !prev)
  }

  return (
    <LowDataContext.Provider value={{ isLowData, toggleLowData }}>
      {children}
    </LowDataContext.Provider>
  )
}

export function useLowData() {
  const context = useContext(LowDataContext)
  if (context === undefined) {
    throw new Error('useLowData must be used within LowDataProvider')
  }
  return context
}
