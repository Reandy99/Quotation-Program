"use client"

import { useLanguage, type Lang } from "@/hooks/useLanguage"

interface Props {
  className?: string
  lang?: Lang
  onLangChange?: (lang: Lang) => void
}

export function LanguageToggle({ className = "", lang: langProp, onLangChange }: Props) {
  const [langInternal, setLangInternal] = useLanguage()
  const lang = langProp ?? langInternal
  const setLang = onLangChange ?? setLangInternal

  return (
    <div className={`inline-flex items-center rounded-lg border overflow-hidden text-xs font-medium ${className}`} style={{ borderColor: "var(--border-color)" }}>
      {(["id", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className="px-2 py-1 sm:px-2.5 sm:py-1.5 transition-colors"
          style={{
            backgroundColor: lang === l ? "var(--btn-dark)" : "var(--card-bg)",
            color: lang === l ? "#ffffff" : "var(--text-secondary)",
          }}
        >
          <span className="hidden sm:inline">{l === "id" ? "🇮🇩 " : "🇬🇧 "}</span>
          {l === "id" ? "ID" : "EN"}
        </button>
      ))}
    </div>
  )
}
