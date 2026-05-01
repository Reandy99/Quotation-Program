import { z } from "zod"

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("Invalid Supabase URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "Supabase anon key is required"),
})

function validateEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })

  if (!result.success) {
    console.error("❌ Environment validation failed:")
    result.error.issues.forEach((issue) => {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`)
    })
    throw new Error(
      "Missing or invalid environment variables. Please check your .env.local file."
    )
  }

  return result.data
}

let _env: ReturnType<typeof validateEnv> | null = null

export function getEnv() {
  if (!_env) _env = validateEnv()
  return _env
}

// Lazy proxy so `env.X` works but validation runs only on first access
export const env = new Proxy({} as ReturnType<typeof validateEnv>, {
  get(_, prop: string) {
    return (getEnv() as any)[prop]
  },
})
