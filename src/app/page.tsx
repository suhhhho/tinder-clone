'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { languages, Translations } from '@/lib/i18n'

const profiles = [
  { name: "Emma",      age: 24, photo: "women/1" },
  { name: "Liam",      age: 26, photo: "men/1" },
  { name: "Olivia",    age: 22, photo: "women/4" },
  { name: "Noah",      age: 28, photo: "men/3" },
  { name: "Ava",       age: 21, photo: "women/8" },
  { name: "Elijah",    age: 25, photo: "men/6" },
  { name: "Sophia",    age: 23, photo: "women/10" },
  { name: "James",     age: 27, photo: "men/9" },
  { name: "Isabella",  age: 22, photo: "women/13" },
  { name: "Lucas",     age: 29, photo: "men/11" },
  { name: "Mia",       age: 20, photo: "women/16" },
  { name: "Ethan",     age: 24, photo: "men/14" },
  { name: "Charlotte", age: 26, photo: "women/18" },
  { name: "Mason",     age: 23, photo: "men/17" },
  { name: "Amelia",    age: 21, photo: "women/21" },
  { name: "Logan",     age: 30, photo: "men/19" },
  { name: "Harper",    age: 22, photo: "women/24" },
  { name: "Jackson",   age: 25, photo: "men/22" },
  { name: "Evelyn",    age: 23, photo: "women/26" },
  { name: "Sebastian", age: 28, photo: "men/25" },
  { name: "Grace",     age: 20, photo: "women/30" },
  { name: "Henry",     age: 27, photo: "men/28" },
  { name: "Lily",      age: 24, photo: "women/33" },
  { name: "Owen",      age: 26, photo: "men/31" },
  { name: "Zoey",      age: 21, photo: "women/36" },
  { name: "Carter",    age: 29, photo: "men/34" },
  { name: "Nora",      age: 22, photo: "women/39" },
  { name: "Wyatt",     age: 24, photo: "men/37" },
  { name: "Riley",     age: 23, photo: "women/42" },
  { name: "Dylan",     age: 25, photo: "men/40" },
  { name: "Stella",    age: 20, photo: "women/45" },
  { name: "Grayson",   age: 28, photo: "men/43" },
]

function PhoneCard({ name, age, photo }: { name: string; age: number; photo: string }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white/10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://randomuser.me/api/portraits/${photo}.jpg`}
        alt={name}
        className="w-full h-64 object-cover"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
        <p className="text-white font-semibold text-sm">{name} {age}</p>
      </div>
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-2 px-2">
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow text-red-500 text-xs font-bold">✕</span>
        <span className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow text-pink-500 text-xs">♥</span>
      </div>
    </div>
  )
}

export default function Home() {
  const [t, setT] = useState<Translations>(languages.en)

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background phone grid */}
      <div
        className="absolute opacity-60"
        style={{
          top: "-20%",
          left: "-10%",
          width: "120%",
          height: "140%",
          transform: "rotate(-8deg)",
          transformOrigin: "center",
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: "12px",
          padding: "12px",
        }}
      >
        {profiles.map((p) => (
          <PhoneCard key={p.photo} {...p} />
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <Navbar onLangChange={setT} />

      {/* Hero */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-white font-black text-6xl md:text-8xl tracking-tight drop-shadow-lg">
          {t.hero.heading}<span className="text-3xl md:text-4xl align-super">™</span>
        </h1>
        <a
          href="/register"
          className="mt-10 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold text-lg px-10 py-4 rounded-full shadow-lg hover:opacity-90 transition-opacity"
        >
          {t.hero.cta}
        </a>
      </main>
    </div>
  )
}
