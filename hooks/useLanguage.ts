"use client"

import { useState, useEffect } from "react"

export type Lang = "id" | "en"

const STORAGE_KEY = "frameflow_lang"

export function useLanguage(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === "id" || stored === "en") setLangState(stored)
  }, [])

  function setLang(next: Lang) {
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
  }

  return [lang, setLang]
}
