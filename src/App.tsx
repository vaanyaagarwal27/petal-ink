/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  PenLine,
  Sparkles,
  Library,
  BookOpen,
  Search,
  BarChart3,
  Plus,
  Save,
  ChevronRight,
  History,
  Trash2,
  Edit3,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GoogleGenAI } from "@google/genai";

import { Poem, View, ThemeGeneration, LibraryPoem } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Module-level constants ---

const CLASSIC_QUOTE_LINES: { line: string; source: string }[] = [
  { line: "Where the mind is without fear and the head is held high", source: "Rabindranath Tagore" },
  { line: "Into that heaven of freedom, my Father, let my country awake.", source: "Rabindranath Tagore" },
  { line: "I don't know politics but I know the names of those in power", source: "Kamala Das" },
  { line: "Priceless treasures torn from my breast, and yielded the sons of my stricken womb", source: "Sarojini Naidu" },
  { line: "बुरा जो देखन मैं चला, बुरा न मिलिया कोय।", source: "Kabir" },
  { line: "Two roads diverged in a wood, and I— I took the one less traveled by", source: "Robert Frost" },
  { line: "I am nobody! Who are you? Are you nobody too?", source: "Emily Dickinson" },
  { line: "Once upon a midnight dreary, while I pondered, weak and weary", source: "Edgar Allan Poe" },
  { line: "Shall I compare thee to a summer's day? Thou art more lovely and more temperate", source: "Shakespeare" },
  { line: "Do not go gentle into that good night. Rage, rage against the dying of the light.", source: "Dylan Thomas" },
];

const CATEGORY_AUTHORS: Record<string, string[]> = {
  Romantic: [
    'John Keats', 'Percy Bysshe Shelley', 'Lord Byron',
    'Elizabeth Barrett Browning', 'Samuel Taylor Coleridge',
    'Christina Rossetti', 'Dante Gabriel Rossetti'
  ],
  Nature: [
    'William Wordsworth', 'Robert Frost', 'Walt Whitman',
    'Gerard Manley Hopkins', 'Robinson Jeffers'
  ],
  Classic: [
    'Edgar Allan Poe', 'Emily Dickinson', 'William Shakespeare',
    'Alfred Lord Tennyson', 'Thomas Hardy', 'Oliver Wendell Holmes',
    'Sylvia Plath', 'Anne Sexton', 'Allen Ginsberg'
  ],
  Narrative: [
    'Henry Wadsworth Longfellow', 'Robert Browning',
    'Alfred Noyes', 'Oscar Wilde'
  ],
};

const INDIAN_POEMS: LibraryPoem[] = [
  {
    id: 'indian-1',
    title: 'Where The Mind Is Without Fear',
    author: 'Rabindranath Tagore',
    content: `Where the mind is without fear and the head is held high
Where knowledge is free
Where the world has not been broken up into fragments
By narrow domestic walls
Where words come out from the depth of truth
Where tireless striving stretches its arms towards perfection
Where the clear stream of reason has not lost its way
Into the dreary desert sand of dead habit
Where the mind is led forward by thee
Into ever-widening thought and action
Into that heaven of freedom, my Father, let my country awake.`,
    description: 'A prayer for a free, enlightened nation by Nobel laureate Rabindranath Tagore.',
    category: 'Indian',
    themeBreakdown: 'Themes of freedom, reason, and national awakening. Written during British colonial rule of India.'
  },
  {
    id: 'indian-2',
    title: 'The Gift of India',
    author: 'Sarojini Naidu',
    content: `Is there ought you need that my hands withhold,
Rich gifts of raiment or grain or gold?
Lo! I have flung to the East and West
Priceless treasures torn from my breast,
And yielded the sons of my stricken womb
To the drum-beats of duty, the sabres of doom.

Gathered like pearls in their alien graves
Silent they sleep by the Persian waves,
Scattered like shells on Egyptian sands,
They lie with pale brows and cold, still hands,
They mingle the dust of Flanders and France
With the sweet, strong scent of the jungle plants.`,
    description: 'A powerful poem by Sarojini Naidu about India\'s sacrifice during World War I.',
    category: 'Indian',
    themeBreakdown: 'Themes of sacrifice, motherhood, and national pride. India personified as a mother grieving her fallen soldiers.'
  },
  {
    id: 'indian-3',
    title: 'An Introduction',
    author: 'Kamala Das',
    content: `I don't know politics but I know the names
Of those in power, and can repeat them like
Days of week, or names of months, beginning with
Nehru. I am Indian, very brown, born in
Malabar, I speak three languages, write in
Two, dream in one. Don't write in English, they said,
English is not your mother-tongue. Why not leave
Me alone, critics, friends, visiting cousins,
Every one of you? Why not let me speak in
Any language I like?`,
    description: 'Kamala Das\'s fierce declaration of identity, language, and womanhood.',
    category: 'Indian',
    themeBreakdown: 'Themes of identity, feminism, and the politics of language in post-colonial India.'
  },
  {
    id: 'indian-4',
    title: 'Agneepath',
    author: 'Harivansh Rai Bachchan',
    content: `वृक्ष हों भले खड़े,
हों घने, हों बड़े,
एक पत्र छाँह भी,
माँग मत, माँग मत, माँग मत,
अग्निपथ, अग्निपथ, अग्निपथ।

तू न थकेगा कभी,
तू न रुकेगा कभी,
तू न मुड़ेगा कभी,
कर शपथ, कर शपथ, कर शपथ,
अग्निपथ, अग्निपथ, अग्निपथ।`,
    description: 'One of the most iconic Hindi poems, a call to walk the path of fire without fear.',
    category: 'Hindi',
    themeBreakdown: 'Themes of perseverance, courage, and relentless pursuit of one\'s path despite hardship.'
  },
  {
    id: 'indian-5',
    title: 'Madhushala',
    author: 'Harivansh Rai Bachchan',
    content: `मृदु भावों के अंगूरों की आज बना लाया हाला,
प्रियतम, अपने ही हाथों से आज पिलाऊँगा प्याला,
पहले भोग लगा लूँ तेरा फिर प्रसाद जग पाएगा,
सबसे पहले तेरा स्वागत करती मेरी मधुशाला।`,
    description: 'An excerpt from the legendary Madhushala — a metaphorical tavern representing life\'s journey.',
    category: 'Hindi',
    themeBreakdown: 'Uses the metaphor of wine and a tavern to explore love, life, spirituality and the human condition.'
  },
  {
    id: 'indian-6',
    title: 'Rashmirathi',
    author: 'Ramdhari Singh Dinkar',
    content: `जब तक मनुज जाति में तेज रहे,
संसार में कुछ उद्देश्य रहे,
जब तक जगत में सत्य रहे,
कर्ण की गाथा अमर रहे।`,
    description: 'From Rashmirathi, Dinkar\'s epic retelling of Karna\'s story from the Mahabharata.',
    category: 'Hindi',
    themeBreakdown: 'Themes of heroism, injustice, and the tragedy of a noble soul born into the wrong circumstances.'
  },
  {
    id: 'indian-7',
    title: 'Desh Bhakti',
    author: 'Subhadra Kumari Chauhan',
    content: `खूब लड़ी मर्दानी वह तो झाँसी वाली रानी थी।
सिंहासन हिल उठे राजवंशों ने भृकुटी तानी थी,
बूढ़े भारत में आई फिर से नयी जवानी थी,
गुमी हुई आज़ादी की कीमत सबने पहचानी थी,
दूर फिरंगी को करने की सबने मन में ठानी थी।`,
    description: 'The iconic poem about Rani Lakshmibai of Jhansi, a symbol of Indian resistance.',
    category: 'Hindi',
    themeBreakdown: 'Themes of patriotism, bravery, and women\'s power. Celebrates the warrior queen who fought against British rule.'
  },
  {
    id: 'indian-8',
    title: 'Kabir Ke Dohe',
    author: 'Kabir',
    content: `दुख में सुमिरन सब करे, सुख में करे न कोय।
जो सुख में सुमिरन करे, दुख काहे को होय॥

बुरा जो देखन मैं चला, बुरा न मिलिया कोय।
जो दिल खोजा आपना, मुझसे बुरा न कोय॥

माटी कहे कुम्हार से, तू क्या रौंदे मोय।
एक दिन ऐसा आएगा, मैं रौंदूंगी तोय॥`,
    description: 'Timeless dohas by the mystic poet Kabir, full of wisdom about life and the human condition.',
    category: 'Hindi',
    themeBreakdown: 'Themes of self-reflection, humility, and the futility of ego. Kabir uses simple language to deliver profound spiritual truths.'
  },
];

// --- Components ---

const Logo = () => (
  <div className="flex items-center gap-2 mb-8 px-4">
    <div className="relative w-10 h-10 flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="w-full h-full" style={{ fill: '#c9957a' }}>
        <path d="M40,20 C30,20 20,30 20,45 C20,60 30,70 40,70 L40,85 L45,85 L45,70 C55,70 65,60 65,45 C65,30 55,20 40,20 Z M40,60 C35,60 30,55 30,45 C30,35 35,30 40,30 C45,30 50,35 50,45 C50,55 45,60 40,60 Z" />
        <path d="M70,20 L70,80 L75,80 L75,20 Z" />
        <path d="M60,15 L85,15 L85,20 L60,20 Z" />
        <path d="M60,80 L85,80 L85,85 L60,85 Z" />
        {/* Quill tip */}
        <path d="M42,85 L42,95 L43,98 L44,95 L44,85 Z" />
      </svg>
    </div>
    <span className="text-xl font-serif font-bold text-white">Petal&amp;Ink</span>
  </div>
);

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [savedPoems, setSavedPoems] = useState<Poem[]>(() => {
    const saved = localStorage.getItem('petal-ink-poems');
    return saved ? JSON.parse(saved) : [];
  });
  const [editingPoem, setEditingPoem] = useState<Poem | null>(null);
  const [generatedTheme, setGeneratedTheme] = useState<ThemeGeneration | null>(null);

  useEffect(() => {
    localStorage.setItem('petal-ink-poems', JSON.stringify(savedPoems));
  }, [savedPoems]);

  const savePoem = (title: string, content: string, theme: string) => {
    if (editingPoem) {
      setSavedPoems(prev => prev.map(p => p.id === editingPoem.id ? {
        ...p,
        title,
        content,
        theme,
        updatedAt: Date.now()
      } : p));
      setEditingPoem(null);
    } else {
      const newPoem: Poem = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        content,
        theme,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setSavedPoems(prev => [newPoem, ...prev]);
    }
    setCurrentView('saved-poems');
  };

  const deletePoem = (id: string) => {
    setSavedPoems(prev => prev.filter(p => p.id !== id));
  };

  const editPoem = (poem: Poem) => {
    setEditingPoem(poem);
    setCurrentView('new-poem');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen overflow-hidden" style={{ background: '#f7f3ec' }}>
      {/* Sidebar */}
      <aside
        className="w-full md:w-64 flex-shrink-0 flex flex-col py-4 shadow-sm"
        style={{ background: '#2d4a35', borderRight: '1px solid #1f3527' }}
      >
        <Logo />
        <nav className="flex-1 px-3 space-y-1">
          <SidebarItem
            icon={<Home size={20} />}
            label="Home"
            active={currentView === 'dashboard'}
            onClick={() => setCurrentView('dashboard')}
          />
          <SidebarItem
            icon={<Plus size={20} />}
            label="New Poem"
            active={currentView === 'new-poem'}
            onClick={() => {
              setEditingPoem(null);
              setCurrentView('new-poem');
            }}
          />
          <SidebarItem
            icon={<Sparkles size={20} />}
            label="AI Theme Generator"
            active={currentView === 'theme-generator'}
            onClick={() => setCurrentView('theme-generator')}
          />
          <SidebarItem
            icon={<History size={20} />}
            label="Saved Poems"
            active={currentView === 'saved-poems'}
            onClick={() => setCurrentView('saved-poems')}
          />
          <SidebarItem
            icon={<Search size={20} />}
            label="Rhyming Dictionary"
            active={currentView === 'rhyming-dictionary'}
            onClick={() => setCurrentView('rhyming-dictionary')}
          />
          <SidebarItem
            icon={<BarChart3 size={20} />}
            label="Writing Insights"
            active={currentView === 'writing-insights'}
            onClick={() => setCurrentView('writing-insights')}
          />
          <SidebarItem
            icon={<Library size={20} />}
            label="Poetry Library"
            active={currentView === 'poetry-library'}
            onClick={() => setCurrentView('poetry-library')}
          />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentView === 'dashboard' && (
              <DashboardView
                savedPoems={savedPoems}
                onBeginWriting={() => { setEditingPoem(null); setCurrentView('new-poem'); }}
                onExploreLibrary={() => setCurrentView('poetry-library')}
              />
            )}
            {currentView === 'new-poem' && (
              <NewPoemView
                poem={editingPoem}
                onSave={savePoem}
                initialTheme={generatedTheme?.theme || ''}
              />
            )}
            {currentView === 'theme-generator' && (
              <ThemeGeneratorView onThemeGenerated={(theme) => {
                setGeneratedTheme(theme);
              }} />
            )}
            {currentView === 'saved-poems' && (
              <SavedPoemsView
                poems={savedPoems}
                onDelete={deletePoem}
                onEdit={editPoem}
              />
            )}
            {currentView === 'rhyming-dictionary' && <RhymingDictionaryView />}
            {currentView === 'writing-insights' && <WritingInsightsView poems={savedPoems} />}
            {currentView === 'poetry-library' && <PoetryLibraryView />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

// --- Sub-views ---

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn("sidebar-item w-full", active && "active")}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DashboardView({ savedPoems, onBeginWriting, onExploreLibrary }: {
  savedPoems: Poem[];
  onBeginWriting: () => void;
  onExploreLibrary: () => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const today = new Date();
  const weekday = today.toLocaleDateString('en-US', { weekday: 'long' });
  const day = today.getDate();
  const month = today.toLocaleDateString('en-US', { month: 'long' });
  const dateStr = `${weekday}, ${day} ${month}`;

  const [quoteData] = useState<{ line: string; source: string }>(() => {
    if (savedPoems.length > 0) {
      const poem = savedPoems[Math.floor(Math.random() * savedPoems.length)];
      const lines = poem.content.split('\n').filter(l => l.trim().length > 15);
      const line = lines.length > 0
        ? lines[Math.floor(Math.random() * lines.length)]
        : poem.content.slice(0, 80);
      return { line: line.trim(), source: poem.title || 'Your poem' };
    }
    return CLASSIC_QUOTE_LINES[Math.floor(Math.random() * CLASSIC_QUOTE_LINES.length)];
  });

  const recentPoems = savedPoems.slice(0, 3);

  return (
    <div className="min-h-full p-8 md:p-12 max-w-4xl mx-auto" style={{ color: '#2e3d30' }}>
      {/* Greeting + date */}
      <div className="mb-10">
        <h1
          className="text-4xl md:text-5xl font-bold leading-tight"
          style={{ fontFamily: 'Georgia, serif', color: '#2e3d30' }}
        >
          {greeting}.
        </h1>
        <p
          className="mt-3 text-lg italic"
          style={{ fontFamily: 'Georgia, serif', color: '#9c9080' }}
        >
          {dateStr}
        </p>
      </div>

      {/* Pull quote */}
      <div
        className="my-10 pl-6 py-2"
        style={{ borderLeft: '4px solid #b87355' }}
      >
        <p
          className="text-2xl md:text-3xl italic leading-relaxed"
          style={{ fontFamily: 'Georgia, serif', color: '#2e3d30' }}
        >
          &ldquo;{quoteData.line}&rdquo;
        </p>
        <p
          className="mt-3 text-sm uppercase tracking-widest"
          style={{ color: '#9c9080' }}
        >
          &mdash; {quoteData.source}
        </p>
      </div>

      {/* Recent poems */}
      {recentPoems.length > 0 && (
        <div className="mb-10">
          <h2
            className="text-xs uppercase tracking-widest font-bold mb-4"
            style={{ color: '#9c9080' }}
          >
            Recent Poems
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentPoems.map(poem => (
              <div
                key={poem.id}
                className="flex-shrink-0 w-56 p-4"
                style={{
                  background: '#fdfaf6',
                  border: '1px solid #ede7d9',
                  borderRadius: '14px',
                }}
              >
                <p
                  className="text-xs uppercase tracking-widest mb-1 truncate"
                  style={{ color: '#9c9080' }}
                >
                  #{poem.theme || 'unthemed'}
                </p>
                <h3
                  className="font-bold mb-2 truncate"
                  style={{ fontFamily: 'Georgia, serif', color: '#2e3d30' }}
                >
                  {poem.title || 'Untitled'}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{
                    fontFamily: 'Georgia, serif',
                    color: '#9c9080',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {poem.content.split('\n')[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 mt-14">
        <button
          onClick={onBeginWriting}
          className="px-10 py-4 rounded-full text-white text-lg shadow-md transition-opacity hover:opacity-90"
          style={{ background: '#b87355', fontFamily: 'Georgia, serif' }}
        >
          Begin writing →
        </button>
        <button
          onClick={onExploreLibrary}
          className="text-sm transition-colors hover:underline"
          style={{ color: '#9c9080' }}
        >
          or explore the library →
        </button>
      </div>
    </div>
  );
}

function NewPoemView({ poem, onSave, initialTheme }: { poem: Poem | null, onSave: (title: string, content: string, theme: string) => void, initialTheme: string }) {
  const [title, setTitle] = useState(poem?.title || '');
  const [content, setContent] = useState(poem?.content || '');
  const [theme, setTheme] = useState(poem?.theme || initialTheme || '');

  return (
    <div className="h-full flex flex-col p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-lilac-800">{poem ? 'Edit Poem' : 'New Poem'}</h2>
        <button
          onClick={() => onSave(title, content, theme)}
          className="flex items-center gap-2 bg-lilac-600 text-white px-6 py-2 rounded-full hover:bg-lilac-700 transition-colors shadow-md"
        >
          <Save size={18} />
          <span>Save Poem</span>
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Poem Title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-transparent border-b border-lilac-200 py-2 text-xl font-serif focus:outline-none focus:border-lilac-400 text-slate-700"
        />
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Theme (e.g., Nature, Solitude)..."
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="w-full bg-transparent border-b border-lilac-200 py-1 text-sm italic focus:outline-none focus:border-lilac-400 text-slate-500"
        />
      </div>

      <div className="flex-1 parchment-bg rounded-lg p-12 overflow-hidden flex flex-col">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Begin your verses here..."
          className="w-full h-full bg-transparent resize-none focus:outline-none font-serif text-lg leading-relaxed text-stone-800 placeholder-stone-400"
          style={{ fontFamily: "'Playfair Display', serif" }}
        />
      </div>
    </div>
  );
}

const MOOD_PILLS = ['Melancholic', 'Hopeful', 'Tender', 'Fierce', 'Dreamy', 'Unresolved'] as const;
const STYLE_PILLS = ['Lyrical', 'Narrative', 'Abstract', 'Spoken word'] as const;

function ThemeGeneratorView({ onThemeGenerated }: { onThemeGenerated: (theme: ThemeGeneration) => void }) {
  const [input, setInput] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThemeGeneration | null>(null);

  const generateTheme = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a poetry muse for an app called Petal&Ink. The user has given you a starting point for a poem.

User's starting point: "${input}"${selectedMood ? `\nMood preference: ${selectedMood}` : ''}${selectedStyle ? `\nStyle preference: ${selectedStyle}` : ''}

Generate a creative spark to help them begin writing. Be specific to what they've given you — not generic. Respond in JSON with exactly these keys:
- mood (string): one evocative word capturing the emotional register
- prompt (string): 2-3 sentences — a concrete, sensory writing prompt built directly around their starting point
- firstLine (string): one suggested opening line for the poem, poetic and specific to their input
- avoidWords (array of exactly 3 strings): clichéd words or phrases to avoid for this particular theme
- theme (string): a short evocative theme title
- imagery (array of strings): 4-6 specific images or scenes to draw from
- metaphors (array of strings): 3-4 metaphor ideas
- atmosphere (string): one sentence describing the tone and atmosphere
- personification (array of strings): 2-3 short example lines
- simile (array of strings): 2-3 short example lines
- hyperbole (array of strings): 2-3 short example lines`,
        config: { responseMimeType: "application/json" }
      });

      const data = JSON.parse(response.text || '{}');
      setResult(data);
      onThemeGenerated(data);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="rounded-2xl shadow-sm border border-lilac-200 overflow-hidden" style={{ background: '#fdfaf6' }}>

          {/* ── Section 1: Your Spark ── */}
          <div className="p-8 space-y-6">
            <p className="text-xs uppercase tracking-widest font-bold text-lilac-400">Your Spark</p>

            <p
              className="text-3xl italic leading-snug"
              style={{ fontFamily: 'Georgia, serif', color: '#b87355' }}
            >
              {result.mood}
            </p>

            <p className="text-slate-700 leading-relaxed">{result.prompt}</p>

            <div className="pl-5 py-3" style={{ borderLeft: '3px solid #b87355' }}>
              <p
                className="text-xl italic leading-relaxed"
                style={{ fontFamily: 'Georgia, serif', color: '#2e3d30' }}
              >
                &ldquo;{result.firstLine}&rdquo;
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-lilac-400 mb-3">Words to avoid</p>
              <div className="flex gap-2 flex-wrap">
                {result.avoidWords?.map(word => (
                  <span
                    key={word}
                    className="px-3 py-1 rounded-full text-sm border"
                    style={{ borderColor: '#ede7d9', color: '#9c9080', textDecoration: 'line-through' }}
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Divider ── */}
          <div className="border-t border-lilac-200" />

          {/* ── Section 2: Go Deeper ── */}
          <div className="p-8 space-y-8">
            <p className="text-xs uppercase tracking-widest font-bold text-lilac-400">Go Deeper</p>

            <div>
              <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-2">Theme</h3>
              <p className="text-2xl font-serif text-slate-800">{result.theme}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">Imagery</h3>
                <ul className="space-y-2">
                  {result.imagery.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="text-lilac-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">Metaphors</h3>
                <ul className="space-y-2">
                  {result.metaphors.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-slate-600">
                      <span className="text-lilac-600 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-lilac-100">
              <div>
                <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">Personification</h3>
                <ul className="space-y-2 italic text-sm text-slate-500">
                  {result.personification?.map((item, i) => (
                    <li key={i}>"{item}"</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">Simile</h3>
                <ul className="space-y-2 italic text-sm text-slate-500">
                  {result.simile?.map((item, i) => (
                    <li key={i}>"{item}"</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">Hyperbole</h3>
                <ul className="space-y-2 italic text-sm text-slate-500">
                  {result.hyperbole?.map((item, i) => (
                    <li key={i}>"{item}"</li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-2">Atmosphere &amp; Tone</h3>
              <p className="text-slate-600 italic">"{result.atmosphere}"</p>
            </div>

            <div className="pt-6 border-t border-lilac-100">
              <button
                onClick={() => setResult(null)}
                className="px-6 py-2 rounded-full border border-lilac-200 text-lilac-600 hover:bg-lilac-50 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-2xl mx-auto">
      <h2
        className="text-3xl md:text-4xl mb-10 leading-snug"
        style={{ fontFamily: 'Georgia, serif', color: '#2e3d30' }}
      >
        what's sitting with you right now?
      </h2>

      <div className="space-y-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !loading && generateTheme()}
          placeholder="a word, a feeling, a moment... (e.g. '3am', 'almost', 'my mother's hands')"
          className="w-full bg-transparent border-b-2 border-lilac-200 py-3 text-lg focus:outline-none focus:border-lilac-600 text-slate-800 placeholder-slate-400"
          style={{ fontFamily: 'Georgia, serif' }}
        />

        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-lilac-400 mb-3">Mood</p>
          <div className="flex flex-wrap gap-2">
            {MOOD_PILLS.map(mood => (
              <button
                key={mood}
                onClick={() => setSelectedMood(selectedMood === mood ? '' : mood)}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={selectedMood === mood
                  ? { background: '#b87355', color: 'white', borderColor: '#b87355' }
                  : { background: 'white', color: '#2e3d30', borderColor: '#ede7d9' }
                }
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest font-bold text-lilac-400 mb-3">Style</p>
          <div className="flex flex-wrap gap-2">
            {STYLE_PILLS.map(style => (
              <button
                key={style}
                onClick={() => setSelectedStyle(selectedStyle === style ? '' : style)}
                className="px-4 py-1.5 rounded-full text-sm border transition-all"
                style={selectedStyle === style
                  ? { background: '#b87355', color: 'white', borderColor: '#b87355' }
                  : { background: 'white', color: '#2e3d30', borderColor: '#ede7d9' }
                }
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={generateTheme}
            disabled={!input.trim() || loading}
            className="px-10 py-3 rounded-full text-white text-base shadow-md transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: '#b87355', fontFamily: 'Georgia, serif' }}
          >
            {loading ? 'Conjuring...' : 'Generate →'}
          </button>
          {loading && (
            <p className="text-lilac-400 font-serif italic text-sm">Consulting the muses...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function SavedPoemsView({ poems, onDelete, onEdit }: { poems: Poem[], onDelete: (id: string) => void, onEdit: (poem: Poem) => void }) {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">Your Poetry Collection</h2>

      {poems.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-lilac-200">
          <BookOpen size={48} className="mx-auto text-lilac-200 mb-4" />
          <p className="text-slate-400 font-serif italic">No verses saved yet. The parchment awaits.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poems.map(poem => (
            <motion.div
              key={poem.id}
              layout
              className="bg-white rounded-2xl p-6 shadow-sm border border-lilac-200 hover:shadow-md transition-shadow flex flex-col h-64"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-serif text-slate-800 truncate pr-4">{poem.title || 'Untitled'}</h3>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(poem)} className="p-2 text-slate-400 hover:text-lilac-600 transition-colors">
                    <Edit3 size={16} />
                  </button>
                  <button onClick={() => onDelete(poem.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-xs text-lilac-400 italic mb-4">#{poem.theme || 'No Theme'}</p>
              <p className="text-slate-600 text-sm line-clamp-4 flex-1 font-serif leading-relaxed">
                {poem.content}
              </p>
              <div className="mt-4 pt-4 border-t border-lilac-100 text-[10px] text-slate-400 uppercase tracking-widest">
                {new Date(poem.createdAt).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function RhymingDictionaryView() {
  const [word, setWord] = useState('');
  const [results, setResults] = useState<{perfect: string[], near: string[], slant: string[]} | null>(null);
  const [loading, setLoading] = useState(false);

  const searchRhymes = async () => {
    if (!word) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a rhyming dictionary. For the word "${word}", provide perfect rhymes, near rhymes, and slant rhymes.
        Return in JSON format:
        {
          "perfect": ["word1", "word2"...],
          "near": ["word1", "word2"...],
          "slant": ["word1", "word2"...]
        }`,
        config: { responseMimeType: "application/json" }
      });
      setResults(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">Rhyming Dictionary</h2>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-lilac-200">
        <div className="flex gap-2 mb-8">
          <input
            type="text"
            placeholder="Type a word..."
            value={word}
            onChange={(e) => setWord(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchRhymes()}
            className="flex-1 p-4 rounded-xl border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-200"
          />
          <button
            onClick={searchRhymes}
            className="bg-lilac-600 text-white px-8 rounded-xl hover:bg-lilac-700 transition-colors"
          >
            Search
          </button>
        </div>

        {loading && <div className="text-center py-10 text-lilac-400 italic">Searching for echoes...</div>}

        {results && (
          <div className="space-y-8">
            <RhymeSection title="Perfect Rhymes" words={results.perfect} />
            <RhymeSection title="Near Rhymes" words={results.near} />
            <RhymeSection title="Slant Rhymes" words={results.slant} />
          </div>
        )}
      </div>
    </div>
  );
}

function RhymeSection({ title, words }: { title: string, words: string[] }) {
  return (
    <div>
      <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {words.length > 0 ? words.map(w => (
          <span key={w} className="px-3 py-1 bg-lilac-50 text-lilac-800 rounded-lg text-sm">{w}</span>
        )) : <span className="text-slate-400 italic text-sm">None found</span>}
      </div>
    </div>
  );
}

// --- Writing Insights helpers ---

interface AnnotationResult {
  editorLetter: string;
  circledPhrases: string[];
  annotations: Array<{ line: string; note: string; type: 'praise' | 'improve' }>;
  vocabSuggestions: Array<{ original: string; suggestions: string[]; line: string }>;
}

// Renders a line with optional circled phrases. Circles only show when the line
// has an annotation note (showCircles=true); otherwise the phrase is plain text.
function renderAnnotatedLine(
  lineText: string,
  circledPhrases: string[],
  showCircles: boolean
): React.ReactNode {
  if (!showCircles || circledPhrases.length === 0) return lineText;

  const lowerLine = lineText.toLowerCase();
  const marks: Array<{ start: number; end: number }> = [];

  for (const phrase of circledPhrases) {
    const idx = lowerLine.indexOf(phrase.toLowerCase());
    if (idx !== -1) marks.push({ start: idx, end: idx + phrase.length });
  }

  if (marks.length === 0) return lineText;
  marks.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let pos = 0;
  for (const mark of marks) {
    if (mark.start > pos) nodes.push(lineText.slice(pos, mark.start));
    nodes.push(
      <span key={mark.start} style={{
        border: '2px solid #b87355',
        borderRadius: '50% 45% 55% 48%',
        padding: '2px 8px',
        display: 'inline',
      }}>
        {lineText.slice(mark.start, mark.end)}
      </span>
    );
    pos = mark.end;
  }
  if (pos < lineText.length) nodes.push(lineText.slice(pos));
  return <>{nodes}</>;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: '#fdfaf6', border: '1px solid #ede7d9', borderRadius: '12px', padding: '1rem 1.5rem' }}>
      <p style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9c9080', marginBottom: '6px' }}>
        {label}
      </p>
      <p className="text-3xl font-serif" style={{ color: '#2e3d30' }}>{value}</p>
    </div>
  );
}

function WritingInsightsView({ poems }: { poems: Poem[] }) {
  const themes = poems.reduce((acc: Record<string, number>, p) => {
    const t = p.theme || 'Unthemed';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sortedThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);

  const allText = poems.map(p => p.content).join(' ').toLowerCase();
  const words: string[] = allText.match(/\b\w+\b/g) || [];
  const commonWords = ['the','a','an','and','or','but','in','on','at','to','is','of','for','with','my','i','you','it','me','he','she','we','they','them','their','this','that','these','those','was','are','be','been','being','have','has','had','do','did','does','from','by','as','so','if','not','no','up','out','its','our','your','his','her','all','just','like','when','what','who','how','then','than','into','over','also','back','only','about','will','would','could','should','there','here','now','get','got','go','gone','said','say','know','think','see','come','came','take','make','made'];
  const wordFreq = words.reduce((acc: Record<string, number>, w) => {
    if (w.length > 3 && !commonWords.includes(w)) {
      acc[w] = (acc[w] || 0) + 1;
    }
    return acc;
  }, {});

  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  const [readMode, setReadMode] = useState<'hidden' | 'select' | 'result'>('hidden');
  const [selectedPoemId, setSelectedPoemId] = useState(poems[0]?.id || '');
  const [analysisResult, setAnalysisResult] = useState<AnnotationResult | null>(null);
  const [analysing, setAnalysing] = useState(false);

  const totalPoems = poems.length;
  const uniqueThemes = Object.keys(themes).length;
  const mostUsedWord = topWords[0]?.[0] || '—';

  const analysePoem = async () => {
    const poem = poems.find(p => p.id === selectedPoemId);
    if (!poem) return;
    setAnalysing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a senior editor at a prestigious literary publishing house with deep knowledge of poetry craft — metaphor, imagery, sonic texture, emotional arc, line breaks, diction, and form. You will be given a poem. Analyse it with genuine literary rigour.

Return ONLY valid JSON with this structure:
{
  "editorLetter": "2-3 sentence overall assessment, honest and specific, like a real editor's letter",
  "circledPhrases": ["phrase1", "phrase2", "phrase3"],
  "annotations": [
    { "line": "exact line from poem", "note": "specific suggestion or observation", "type": "improve" },
    { "line": "exact line from poem", "note": "what makes this work literarily", "type": "praise" }
  ],
  "vocabSuggestions": [
    { "original": "weak word", "suggestions": ["stronger1", "stronger2", "stronger3"], "line": "exact line containing it" }
  ]
}

circledPhrases: 2-4 phrases you genuinely think are the strongest in the poem — specific, not generic praise.
annotations: 4-6 total. Mix of praise and specific improvement suggestions. Be honest. Reference craft terms.
vocabSuggestions: 2-3 words that could be stronger. Only suggest if genuinely warranted.

Poem title: ${poem.title || 'Untitled'}

${poem.content}`,
        config: { responseMimeType: "application/json" }
      });
      const data = JSON.parse(response.text || '{}');
      setAnalysisResult(data);
      setReadMode('result');
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setAnalysing(false);
    }
  };

  // Annotation result view
  if (readMode === 'result' && analysisResult) {
    const poem = poems.find(p => p.id === selectedPoemId)!;
    // Track which annotation lines have already been shown (deduplication for repeated lines)
    const usedAnnotationLines = new Set<string>();
    // Track which vocab suggestion lines have already been shown
    const usedVocabLines = new Set<string>();

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => setReadMode('hidden')}
          className="mb-8 transition-colors hover:underline"
          style={{ color: '#9c9080', fontSize: '14px' }}
        >
          ← Back to Insights
        </button>

        <h2 className="text-2xl font-serif mb-1" style={{ color: '#2e3d30' }}>
          {poem.title || 'Untitled'}
        </h2>
        {poem.theme && (
          <p className="text-sm italic mb-8" style={{ color: '#9c9080' }}>#{poem.theme}</p>
        )}

        {/* Annotated poem body */}
        <div
          className="rounded-2xl p-8 md:p-12 mb-8"
          style={{ background: '#fdfaf6', border: '1px solid #ede7d9' }}
        >
          {poem.content.split('\n').map((line, lineIdx) => {
            if (!line.trim()) return <div key={lineIdx} className="h-3" />;
            const trimmedLine = line.trim();

            // Find annotation — only first occurrence of each annotated line
            const annotation = analysisResult.annotations.find(a => {
              const key = a.line.trim();
              if (usedAnnotationLines.has(key)) return false;
              return key === trimmedLine || trimmedLine.toLowerCase().includes(key.toLowerCase());
            });
            if (annotation) usedAnnotationLines.add(annotation.line.trim());

            // Find vocab suggestion — only first occurrence
            const vocab = analysisResult.vocabSuggestions.find(v => {
              const key = v.line.trim();
              if (usedVocabLines.has(key)) return false;
              return key === trimmedLine || trimmedLine.toLowerCase().includes(v.original.toLowerCase());
            });
            if (vocab) usedVocabLines.add(vocab.line.trim());

            const hasNote = !!annotation;

            const textDecoStyle: React.CSSProperties = annotation?.type === 'praise'
              ? { textDecoration: 'underline', textDecorationColor: '#7a9e7a', textDecorationStyle: 'solid' as const, textUnderlineOffset: '3px' }
              : annotation?.type === 'improve'
              ? { textDecoration: 'underline', textDecorationColor: '#b87355', textDecorationStyle: 'dashed' as const, textUnderlineOffset: '3px' }
              : {};

            return (
              <div key={lineIdx} className="mb-1.5">
                <span
                  className="font-serif text-base leading-relaxed"
                  style={{ color: '#2e3d30', ...textDecoStyle }}
                >
                  {renderAnnotatedLine(line, analysisResult.circledPhrases, hasNote)}
                </span>
                {annotation && (
                  <p style={{ fontStyle: 'italic', color: '#6b7f6e', fontSize: '13px', marginLeft: '1rem', marginTop: '4px' }}>
                    {annotation.note}
                  </p>
                )}
                {vocab && (
                  <p style={{ fontStyle: 'italic', color: '#6b7f6e', fontSize: '13px', marginLeft: '1rem', marginTop: '4px' }}>
                    &lsquo;{vocab.original}&rsquo; → try: {vocab.suggestions.join(', ')}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor's letter */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#fdf8f0', borderLeft: '4px solid #b87355' }}
        >
          <p className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: '#9c9080' }}>
            Editor's Note
          </p>
          <p
            className="italic leading-relaxed"
            style={{ fontFamily: 'Georgia, serif', color: '#2e3d30', fontSize: '15px' }}
          >
            {analysisResult.editorLetter}
          </p>
        </div>
      </div>
    );
  }

  const sectionLabel: React.CSSProperties = {
    fontFamily: 'system-ui',
    fontSize: '11px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: '#9c9080',
    marginBottom: '20px',
    display: 'block',
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">Writing Insights</h2>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-12">
        <StatCard label="Total poems" value={String(totalPoems)} />
        <StatCard label="Unique themes" value={String(uniqueThemes)} />
        <StatCard label="Most used word" value={mostUsedWord} />
      </div>

      {/* your themes */}
      <section className="mb-12">
        <span style={sectionLabel}>your themes</span>
        {sortedThemes.length > 0 ? (
          <div className="space-y-5">
            {sortedThemes.map(([theme, count]) => (
              <div key={theme}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-serif text-base" style={{ color: '#2e3d30' }}>{theme}</span>
                  <span className="text-sm" style={{ color: '#9c9080' }}>{count}</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: '#ede7d9' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ background: '#b87355', width: `${(count / poems.length) * 100}%` }}
                  />
                </div>
                <p style={{ fontStyle: 'italic', fontSize: '12px', color: '#9c9080', marginTop: '4px' }}>
                  {count === 1 ? 'written once' : count === 2 ? 'returning to this' : 'this keeps finding you'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic text-sm">Write more to see theme patterns.</p>
        )}
      </section>

      {/* words you can't escape */}
      <section className="mb-12">
        <span style={sectionLabel}>words you can&rsquo;t escape</span>
        {topWords.length > 0 ? (
          <div className="flex flex-wrap" style={{ gap: '12px' }}>
            {topWords.map(([word], i) => (
              <span
                key={word}
                className={cn('font-serif', i < 3 ? 'text-2xl' : i < 7 ? 'text-lg' : 'text-base')}
                style={{ color: i < 3 ? '#2e3d30' : i < 7 ? '#6b7f6e' : '#9c9080' }}
              >
                {word}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 italic text-sm">Vocabulary patterns will appear here.</p>
        )}
      </section>

      {/* Read my writing */}
      {readMode === 'hidden' && poems.length > 0 && (
        <button
          onClick={() => setReadMode('select')}
          className="px-6 py-2.5 rounded-full text-sm font-medium transition-all"
          style={{ color: '#b87355', border: '1px solid #b87355' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#b87355'; (e.currentTarget as HTMLButtonElement).style.color = 'white'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = '#b87355'; }}
        >
          Read my writing →
        </button>
      )}

      {readMode === 'select' && (
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 rounded-2xl"
          style={{ background: '#fdfaf6', border: '1px solid #ede7d9' }}
        >
          <select
            value={selectedPoemId}
            onChange={e => setSelectedPoemId(e.target.value)}
            className="flex-1 p-3 rounded-xl border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-200 bg-white text-slate-700"
          >
            {poems.map(p => (
              <option key={p.id} value={p.id}>{p.title || 'Untitled'}</option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              onClick={analysePoem}
              disabled={analysing || !selectedPoemId}
              className="px-6 py-2.5 rounded-full text-white text-sm font-medium shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
              style={{ background: '#b87355' }}
            >
              {analysing ? 'Reading...' : 'Analyse →'}
            </button>
            <button
              onClick={() => setReadMode('hidden')}
              className="px-4 py-2.5 rounded-full text-sm border border-lilac-200 text-lilac-400 hover:bg-lilac-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-8 border"
      style={{ background: '#fdfaf6', borderColor: '#ede7d9' }}
    >
      <div className="skeleton-shimmer h-3 w-16 mb-4" />
      <div className="skeleton-shimmer h-7 w-3/4 mb-3" />
      <div className="skeleton-shimmer h-4 w-1/2 mb-6" />
      <div className="space-y-2 mb-6">
        <div className="skeleton-shimmer h-3 w-full" />
        <div className="skeleton-shimmer h-3 w-5/6" />
        <div className="skeleton-shimmer h-3 w-4/6" />
      </div>
      <div className="skeleton-shimmer h-4 w-28" />
    </div>
  );
}

function PoetryLibraryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('All');
  const [selectedPoem, setSelectedPoem] = useState<LibraryPoem | null>(null);
  const [poems, setPoems] = useState<LibraryPoem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPoems() {
      setLoading(true);
      setPoems(INDIAN_POEMS);

      const allPoems: LibraryPoem[] = [];

      const fetchAuthor = async (category: string, author: string) => {
        try {
          const res = await fetch(
            `https://poetrydb.org/author/${encodeURIComponent(author)}/title,author,lines`
          );
          const data = await res.json();
          if (Array.isArray(data)) {
            const newPoems = data.slice(0, 10).map((p: any, i: number) => ({
              id: `${category}-${author}-${i}`,
              title: p.title,
              author: p.author,
              content: p.lines.join('\n'),
              description: `A poem by ${p.author}.`,
              category: category as LibraryPoem['category'],
              themeBreakdown: '',
            }));
            allPoems.push(...newPoems);
          }
        } catch {
          // skip
        }
      };

      const promises = Object.entries(CATEGORY_AUTHORS).flatMap(([category, authors]) =>
        authors.map(author => fetchAuthor(category, author))
      );
      await Promise.all(promises);
      setPoems([...INDIAN_POEMS, ...allPoems]);
      setLoading(false);
    }
    fetchPoems();
  }, []);

  const filteredPoems = poems.filter(p => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'All' || p.category === filter;
    return matchesSearch && matchesFilter;
  });

  if (selectedPoem) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <button
          onClick={() => setSelectedPoem(null)}
          className="flex items-center gap-2 text-lilac-600 hover:text-lilac-800 mb-8 transition-colors"
        >
          <ChevronRight size={20} className="rotate-180" />
          <span>Back to Library</span>
        </button>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-lilac-200">
          <div className="p-12 parchment-bg">
            <h2 className="text-4xl font-serif text-stone-800 mb-2">{selectedPoem.title}</h2>
            <p className="text-xl font-serif text-stone-600 italic mb-12">by {selectedPoem.author}</p>
            <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-stone-800 max-w-2xl">
              {selectedPoem.content}
            </div>
          </div>
          <div className="p-12 bg-white border-t border-lilac-100 space-y-8">
            <div>
              <h3 className="text-sm uppercase tracking-widest text-lilac-400 font-bold mb-3">About the Poem</h3>
              <p className="text-slate-600 leading-relaxed">{selectedPoem.description}</p>
            </div>
            <div className="bg-lilac-50 rounded-xl p-6">
              <h3 className="text-sm uppercase tracking-widest text-lilac-600 font-bold mb-3">Theme Breakdown</h3>
              <p className="text-lilac-800 leading-relaxed italic">{selectedPoem.themeBreakdown}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">Poetry Library</h2>
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lilac-400" size={20} />
          <input
            type="text"
            placeholder="Search by poet or title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-200 bg-white"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Romantic', 'Nature', 'Classic', 'Narrative', 'Indian', 'Hindi'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-3 rounded-xl border transition-all whitespace-nowrap",
                filter === cat
                  ? "bg-lilac-600 text-white border-lilac-600"
                  : "bg-white border-lilac-200 text-slate-600 hover:bg-lilac-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredPoems.length === 0 ? (
        <div className="text-center py-20 text-slate-400 font-serif text-lg italic">
          No poems found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPoems.map(poem => (
            <div
              key={poem.id}
              onClick={() => setSelectedPoem(poem)}
              className="bg-white rounded-2xl p-8 border border-lilac-200 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <span className="text-[10px] uppercase tracking-widest text-lilac-400 font-bold">{poem.category}</span>
              <h3 className="text-2xl font-serif text-slate-800 mb-2 group-hover:text-lilac-600 transition-colors">{poem.title}</h3>
              <p className="text-slate-500 font-serif italic mb-6">by {poem.author}</p>
              <p className="text-slate-400 text-sm line-clamp-3 mb-6">{poem.content}</p>
              <div className="flex items-center gap-2 text-lilac-600 font-medium text-sm">
                <span>Read Full Poem</span>
                <ChevronRight size={16} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
