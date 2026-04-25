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

function ThemeGeneratorView({ onThemeGenerated }: { onThemeGenerated: (theme: ThemeGeneration) => void }) {
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    style: '',
    mood: '',
    platform: '',
    keywords: '',
    wantsRhyme: false,
    rhymeScheme: ''
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ThemeGeneration | null>(null);

  const generateTheme = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a poetry and songwriting assistant for an app called Petal&Ink.
        Based on the following preferences, generate a creative theme, imagery ideas, metaphor suggestions, and atmosphere/tone suggestions.
        Also provide specific examples of personification, simile, and hyperbole that fit this theme.
        DO NOT write a full poem or song. Provide only inspiration and direction.

        Style/Type: ${answers.style}
        Mood: ${answers.mood}
        Platform: ${answers.platform}
        Keywords: ${answers.keywords}
        Rhyme Scheme: ${answers.wantsRhyme ? (answers.rhymeScheme || 'Any') : 'None'}

        Return the response in JSON format with the following keys:
        - theme (string)
        - imagery (array of strings)
        - metaphors (array of strings)
        - atmosphere (string)
        - personification (array of strings, each being a short line/phrase)
        - simile (array of strings, each being a short line/phrase)
        - hyperbole (array of strings, each being a short line/phrase)`,
        config: {
          responseMimeType: "application/json"
        }
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
        <h2 className="text-3xl font-serif text-lilac-800 mb-8">Your Creative Spark</h2>
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-lilac-200 space-y-8">
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

          <div className="pt-6 border-t border-lilac-100 flex gap-4">
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2 rounded-full border border-lilac-200 text-lilac-600 hover:bg-lilac-50 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">AI Theme Generator</h2>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-lilac-200">
        <div className="mb-8 flex gap-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-lilac-600" : "bg-lilac-100")} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {step === 1 && (
              <Question
                label="What style of poetry or writing are you doing?"
                options={['Lyrical', 'Storytelling', 'Abstract', 'Romantic', 'Reflective', 'Songwriting']}
                value={answers.style}
                onChange={(v) => setAnswers({...answers, style: v})}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <div className="space-y-4">
                <label className="block text-lg font-serif text-slate-700">What mood should it have?</label>
                <div className="grid grid-cols-2 gap-2">
                  {['Nostalgic', 'Hopeful', 'Melancholic', 'Dreamy', 'Intense'].map(opt => (
                    <button
                      key={opt}
                      onClick={() => {
                        setAnswers({...answers, mood: opt});
                        setStep(3);
                      }}
                      className={cn(
                        "text-left p-4 rounded-xl border transition-all",
                        answers.mood === opt ? "bg-lilac-100 border-lilac-400 text-lilac-800" : "border-lilac-200 hover:bg-lilac-50 text-slate-600"
                      )}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <div className="pt-4 border-t border-lilac-100">
                  <label className="block text-sm text-slate-500 mb-2">Or enter a custom mood:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Ethereal, Gritty, Playful..."
                      value={['Nostalgic', 'Hopeful', 'Melancholic', 'Dreamy', 'Intense'].includes(answers.mood) ? '' : answers.mood}
                      onChange={(e) => setAnswers({...answers, mood: e.target.value})}
                      className="flex-1 p-3 rounded-xl border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-200"
                    />
                    <button
                      onClick={() => answers.mood && setStep(3)}
                      className="px-6 bg-lilac-600 text-white rounded-xl hover:bg-lilac-700 disabled:opacity-50"
                      disabled={!answers.mood}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
            {step === 3 && (
              <Question
                label="Where will the poem be used or posted?"
                options={['Instagram', 'Poetry Book', 'Spoken Word', 'Personal Journal']}
                value={answers.platform}
                onChange={(v) => setAnswers({...answers, platform: v})}
                onNext={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <div className="space-y-4">
                <label className="block text-lg font-serif text-slate-700">Do you have any keywords you want included? (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., willow, storm, echo..."
                  value={answers.keywords}
                  onChange={(e) => setAnswers({...answers, keywords: e.target.value})}
                  className="w-full p-4 rounded-xl border border-lilac-200 focus:outline-none focus:ring-2 focus:ring-lilac-200"
                />
                <button
                  onClick={() => setStep(5)}
                  className="w-full py-3 bg-lilac-600 text-white rounded-xl hover:bg-lilac-700 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
            {step === 5 && (
              <div className="space-y-6">
                <label className="block text-lg font-serif text-slate-700">Do you want a rhyming scheme?</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setAnswers({...answers, wantsRhyme: true})}
                    className={cn("flex-1 py-4 rounded-xl border transition-all", answers.wantsRhyme ? "bg-lilac-100 border-lilac-400 text-lilac-800" : "border-lilac-200 hover:bg-lilac-50")}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => {
                      setAnswers({...answers, wantsRhyme: false});
                      generateTheme();
                    }}
                    className={cn("flex-1 py-4 rounded-xl border transition-all", !answers.wantsRhyme ? "bg-lilac-100 border-lilac-400 text-lilac-800" : "border-lilac-200 hover:bg-lilac-50")}
                  >
                    No
                  </button>
                </div>

                {answers.wantsRhyme && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    <label className="block text-sm text-slate-500">Specific scheme (optional)</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['ABAB', 'AABB', 'Free Rhyme', 'Skip'].map(s => (
                        <button
                          key={s}
                          onClick={() => {
                            setAnswers({...answers, rhymeScheme: s === 'Skip' ? '' : s});
                            generateTheme();
                          }}
                          className="py-2 rounded-lg border border-lilac-200 hover:bg-lilac-50 text-sm"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {loading && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-lilac-200 border-t-lilac-600 rounded-full animate-spin" />
            <p className="text-lilac-600 font-serif italic">Consulting the muses...</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Question({ label, options, value, onChange, onNext }: { label: string, options: string[], value: string, onChange: (v: string) => void, onNext: () => void }) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-serif text-slate-700">{label}</label>
      <div className="grid grid-cols-1 gap-2">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => {
              onChange(opt);
              onNext();
            }}
            className={cn(
              "text-left p-4 rounded-xl border transition-all",
              value === opt ? "bg-lilac-100 border-lilac-400 text-lilac-800" : "border-lilac-200 hover:bg-lilac-50 text-slate-600"
            )}
          >
            {opt}
          </button>
        ))}
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

function WritingInsightsView({ poems }: { poems: Poem[] }) {
  const themes = poems.reduce((acc: Record<string, number>, p) => {
    const t = p.theme || 'Unthemed';
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const sortedThemes = Object.entries(themes).sort((a, b) => b[1] - a[1]);

  const allText = poems.map(p => p.content).join(' ').toLowerCase();
  const words: string[] = allText.match(/\b\w+\b/g) || [];
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'is', 'of', 'for', 'with', 'my', 'i', 'you', 'it'];
  const wordFreq = words.reduce((acc: Record<string, number>, w) => {
    if (w.length > 3 && !commonWords.includes(w)) {
      acc[w] = (acc[w] || 0) + 1;
    }
    return acc;
  }, {});

  const topWords = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-3xl font-serif text-lilac-800 mb-8">Writing Insights</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-lilac-200">
          <h3 className="text-xl font-serif text-slate-800 mb-6">Common Themes</h3>
          <div className="space-y-4">
            {sortedThemes.length > 0 ? sortedThemes.map(([theme, count]) => (
              <div key={theme}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-600">{theme}</span>
                  <span className="text-lilac-600 font-bold">{count}</span>
                </div>
                <div className="h-2 bg-lilac-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-lilac-600"
                    style={{ width: `${(count / poems.length) * 100}%` }}
                  />
                </div>
              </div>
            )) : <p className="text-slate-400 italic">Write more to see theme trends.</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-lilac-200">
          <h3 className="text-xl font-serif text-slate-800 mb-6">Vocabulary Echoes</h3>
          <div className="flex flex-wrap gap-3">
            {topWords.length > 0 ? topWords.map(([word, count]) => (
              <div key={word} className="flex items-center gap-2 px-4 py-2 bg-lilac-50 rounded-full border border-lilac-200">
                <span className="text-lilac-800 font-medium">{word}</span>
                <span className="text-xs text-lilac-400">{count}</span>
              </div>
            )) : <p className="text-slate-400 italic">Vocabulary analysis will appear here.</p>}
          </div>
        </div>
      </div>
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
