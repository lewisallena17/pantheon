import type { Metadata } from 'next'
import Link from 'next/link'
import DisplayAd from '@/components/DisplayAd'
import AmazonGeoSwap from '@/components/AmazonGeoSwap'

const CANONICAL_PATH = '/de/topics/supabase-pgvector-agent-memory'

export const metadata: Metadata = {
  title:       'pgvector für AI Agent Semantic Memory | Anleitung',
  description: 'Erfahren Sie, wie Sie pgvector in Supabase für persistentes semantisches Gedächtnis in Claude-gestützten AI Agents nutzen. Technische Anleitung mit Next.js-Beis',
  alternates: {
    canonical: 'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
    languages: {
      'en':    'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
      'es':    'https://task-dashboard-sigma-three.vercel.app/es/topics/supabase-pgvector-agent-memory',
      'de':    'https://task-dashboard-sigma-three.vercel.app/de/topics/supabase-pgvector-agent-memory',
      'fr':    'https://task-dashboard-sigma-three.vercel.app/fr/topics/supabase-pgvector-agent-memory',
      'x-default': 'https://task-dashboard-sigma-three.vercel.app/topics/supabase-pgvector-agent-memory',
    },
  },
  openGraph: {
    title:       'pgvector für AI Agent Semantic Memory | Anleitung',
    description: 'Erfahren Sie, wie Sie pgvector in Supabase für persistentes semantisches Gedächtnis in Claude-gestützten AI Agents nutzen. Technische Anleitung mit Next.js-Beis',
    type:        'article',
    locale:      'de_DE',
    url:         'https://task-dashboard-sigma-three.vercel.app' + CANONICAL_PATH,
  },
  twitter: { card: 'summary_large_image', title: 'pgvector für AI Agent Semantic Memory | Anleitung', description: 'Erfahren Sie, wie Sie pgvector in Supabase für persistentes semantisches Gedächtnis in Claude-gestützten AI Agents nutzen. Technische Anleitung mit Next.js-Beis' },
}

export default function Topic() {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <AmazonGeoSwap />
      <article className="max-w-3xl mx-auto">
        <nav className="text-[10px] font-mono text-slate-500 mb-6">
          <Link href="/" className="hover:text-cyan-400">◈ pantheon</Link>
          <span className="mx-2">/</span>
          <Link href="/topics" className="hover:text-cyan-400">topics</Link>
        </nav>

        <h1 className="text-3xl font-bold text-slate-100 mb-4 leading-tight">{"pgvector für AI Agent Semantic Memory | Anleitung"}</h1>

        <p className="text-slate-300 leading-relaxed mb-8 text-lg">{`Speichern und rufen Sie AI Agent-Erinnerungen mit Vektor-Embeddings in Postgres mit pgvector ab, damit Ihre Claude-Agents Kontext über Sessions hinweg beibehalten können, ohne Token zu verschwenden.`}</p>

        {/* Above-fold display ad — renders placeholder until NEXT_PUBLIC_ADSENSE_CLIENT_ID is set */}
        <DisplayAd slot="topic-top" format="auto" className="my-6" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Warum pgvector für Agent Memory"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`AI Agents müssen Gesprächskontexte, Nutzerpräferenzen und gelernte Verhaltensweisen speichern – aber Kontextfenster sind begrenzt und kostspielig. Vektor-Embeddings lösen dieses Problem: Sie wandeln Gespräche und Fakten in semantische Vektoren um, speichern sie in Postgres mit pgvector und rufen nur die relevantesten Erinnerungen für jede Anfrage ab.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`pgvector ist eine Postgres-Erweiterung, die Ähnlichkeitssuche nativ handhabt. Mit Supabase erhalten Sie pgvector von Anfang an aktiviert. Das bedeutet, dass Ihr Agent eine Datenbank von Erinnerungen mit Kosinus-Ähnlichkeit (oder anderen Distanzmetriken) abfragen und die Top-k relevantesten Snippets in Claudes Kontext einspritzen kann, um die Token-Nutzung niedrig zu halten und gleichzeitig langfristiges Gedächtnis zu bewahren.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"pgvector in Supabase einrichten"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Aktivieren Sie die pgvector-Erweiterung in Ihrem Supabase-Projekt über das Dashboard (Reiter Extensions) oder führen Sie aus: \`CREATE EXTENSION IF NOT EXISTS vector;\` in Ihrem SQL-Editor. Erstellen Sie dann eine memories-Tabelle mit einer Spalte für Embeddings vom Typ vector(1536) zur Speicherung von OpenAI-Embeddings.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Ihr Schema sollte folgende Felder enthalten: id, agent_id (um Erinnerungen pro Agent zu organisieren), content (der eigentliche Erinnerungstext), embedding (der Vektor) und created_at (für zeitliche Filterung). Fügen Sie einen Index hinzu: \`CREATE INDEX ON memories USING ivfflat (embedding vector_cosine_ops);\` für schnelle Ähnlichkeitssuchen in großem Maßstab.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`CREATE TABLE memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id text NOT NULL,
  content text NOT NULL,
  embedding vector(1536),
  created_at timestamp DEFAULT now()
);

CREATE INDEX memories_embedding_idx 
  ON memories USING ivfflat (embedding vector_cosine_ops);`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Gespräche mit Next.js einbetten"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Wenn Claude antwortet, extrahieren Sie Schlüsselfakten oder Zusammenfassungen und betten sie mit der OpenAI Embeddings API ein. Senden Sie in Ihrer Next.js API Route den Erinnerungstext an OpenAI, erhalten Sie den Vektor zurück und speichern Sie ihn in Supabase zusammen mit der Agent-ID und dem ursprünglichen Inhalt.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Dies geschieht asynchron nach der Antwort des Agents an den Benutzer – keine zusätzliche Latenz für die Chat-Interaktion. Sie bauen eine durchsuchbare Wissensdatenbank auf, die wächst, während Ihr Agent lernt.`}</p>
          <pre className="bg-slate-950 border border-slate-800/60 rounded p-3 text-[11px] text-slate-300 overflow-x-auto my-4"><code>{`// pages/api/agent/store-memory.ts
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const openai = new OpenAI();

export default async function handler(req, res) {
  const { agentId, content } = req.body;
  const embedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });
  
  await supabase.from('memories').insert({
    agent_id: agentId,
    content,
    embedding: embedding.data[0].embedding,
  });
  
  res.status(200).json({ ok: true });
}`}</code></pre>
        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Abrufen relevanter Erinnerungen für den Kontext"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Vor dem Senden einer Benutzernachricht an Claude betten Sie die eingehende Abfrage ein und führen eine Ähnlichkeitssuche durch: \`SELECT content FROM memories WHERE agent_id = \$1 ORDER BY embedding <-> \$2 LIMIT 5;\`. Der \`<->\` Operator ist pgvectors Kosinus-Distanzmetrik.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Spritzen Sie die Top-5-Ergebnisse in Claudes System-Prompt oder als Retrieval-Augmented-Kontext ein. Dies gibt Ihrem Agent sofortigen Zugriff auf relevante vergangene Gespräche, ohne das Token-Budget zu belasten.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Bereinigung und zeitlicher Verfall"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Memory-Tabellen wachsen unbegrenzt. Implementieren Sie einen Cleanup-Job (über eine Cron-Funktion in Supabase oder einen geplanten Next.js-Endpunkt), um Erinnerungen älter als 90 Tage zu löschen oder ähnliche Erinnerungen regelmäßig neu einzubetten und zu Zusammenfassungen zu konsolidieren.`}</p>
          <p className="text-slate-300 leading-relaxed mb-3">{`Sie können auch neuere Erinnerungen höher gewichten, indem Sie Ihre Abruf-Abfrage anpassen: \`ORDER BY embedding <-> \$2 + (EXTRACT(EPOCH FROM (now() - created_at)) / 86400 * 0.01)\` um eine kleine Strafe für das Alter hinzuzufügen.`}</p>

        </section>
        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">{"Open-Source-Implementierung"}</h2>
          <p className="text-slate-300 leading-relaxed mb-3">{`Das Pantheon-Repository (github.com/lewisallena17/pantheon) bietet eine produktionsreife Referenzimplementierung von Multi-Agent-Systemen mit semantischem Gedächtnis. Es demonstriert Agent-zu-Agent-Kommunikation, pgvector-Integration und Memory-Konsolidierungsmuster – ideal zum Verständnis, wie man agentengestützte Systeme architekturiert, die über Single-Turn-Interaktionen hinausgehen.`}</p>

        </section>

        {/* Mid-article display ad */}
        <DisplayAd slot="topic-mid" format="auto" className="my-8" />

        <section className="mb-6">
          <h2 className="text-xl font-bold text-slate-100 mt-8 mb-3">Open-source implementation</h2>
          <p className="text-slate-300 leading-relaxed mb-3">
            Everything in this article runs in{' '}
            <a href="https://github.com/lewisallena17/pantheon.git" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">pantheon</a> — a production-ready Next.js + Supabase + Claude starter. Clone it, deploy to Vercel, run PM2. The dashboard auto-commits every agent edit and reverts itself if TypeScript breaks.
          </p>
        </section>

        <section className="mt-10 rounded border border-cyan-900/40 bg-cyan-950/20 p-6 text-center">
          <h3 className="text-lg font-bold text-cyan-300 mb-2">Get the full starter kit</h3>
          <p className="text-slate-300 mb-4 text-sm">{`Beginnen Sie mit einer einfachen memories-Tabelle, betten Sie die wichtigsten Interaktionen Ihres Agents ein und rufen Sie vor jedem API-Aufruf relevanten Kontext ab – erhalten Sie ein funktionierendes Starter Kit zur Implementierung noch heute.`}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="https://ltagb.gumroad.com/l/gferg" target="_blank" rel="noopener noreferrer"
               className="inline-block text-sm font-mono px-4 py-2 rounded border border-amber-700 bg-amber-950/40 text-amber-300 hover:bg-amber-950/60">
              🛒 Buy on Gumroad — $39
            </a>
            <Link href="/subscribe"
                  className="inline-block text-sm font-mono px-4 py-2 rounded border border-cyan-700 bg-cyan-950/40 text-cyan-300 hover:bg-cyan-950/60">
              📧 Subscribe for updates
            </Link>
            <Link href="/"
                  className="inline-block text-sm font-mono px-4 py-2 rounded border border-slate-700 text-slate-400 hover:bg-slate-800/40">
              🏠 Live dashboard
            </Link>
          </div>
        </section>

        <footer className="mt-10 pt-6 border-t border-slate-800/60 text-[11px] font-mono text-slate-500 space-y-2">
          <p>Part of{' '}<Link href="/topics" className="text-cyan-500 hover:underline">the pantheon knowledge base</Link>. Articles are generated + updated by the god agent itself.</p>
          <div className="flex gap-4 flex-wrap pt-2">
            <Link href="/" className="hover:text-cyan-400">home</Link>
            <Link href="/topics" className="hover:text-cyan-400">articles</Link>
            <Link href="/about" className="hover:text-cyan-400">about</Link>
            <Link href="/privacy" className="hover:text-cyan-400">privacy</Link>
            <Link href="/contact" className="hover:text-cyan-400">contact</Link>
          </div>
        </footer>
      </article>
    </main>
  )
}
