// app/test-supabase/page.tsx
import { createServerClientSSR } from '@/lib/supabase'

export default async function TestSupabase() {
  const supabase = await createServerClientSSR()

  const { data: { session } } = await supabase.auth.getSession()

  const { data: readmes } = await supabase
    .from('readmes')
    .select('*')
    .limit(5)

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-6">Supabase Test – ReadmeForge</h1>
      <pre className="bg-zinc-900 p-6 rounded-xl text-sm overflow-auto">
        {JSON.stringify(
          {
            angemeldet: !!session,
            user: session?.user?.email,
            readmes: readmes || 'Tabelle noch leer',
          },
          null,
          2
        )}
      </pre>
    </div>
  )
}
