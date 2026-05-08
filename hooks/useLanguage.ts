"use client"

import { useState, useEffect } from "react"

export type Lang = "id" | "en"

const STORAGE_KEY = "frameflow_lang"
const LANGUAGE_UPDATED_EVENT = "frameflow:language-updated"

export function useLanguage(): [Lang, (lang: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en")

  useEffect(() => {
    function sync(next?: string | null) {
      if (next === "id" || next === "en") setLangState(next)
    }

    sync(localStorage.getItem(STORAGE_KEY))

    function handleStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY) sync(event.newValue)
    }

    function handleLanguageUpdated(event: Event) {
      const next = (event as CustomEvent<Lang>).detail
      sync(next)
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener(LANGUAGE_UPDATED_EVENT, handleLanguageUpdated as EventListener)

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener(LANGUAGE_UPDATED_EVENT, handleLanguageUpdated as EventListener)
    }
  }, [])

  function setLang(next: Lang) {
    localStorage.setItem(STORAGE_KEY, next)
    setLangState(next)
    window.dispatchEvent(new CustomEvent<Lang>(LANGUAGE_UPDATED_EVENT, { detail: next }))
  }

  return [lang, setLang]
}
