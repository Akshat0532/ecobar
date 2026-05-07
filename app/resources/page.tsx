import Link from 'next/link';
import { BookOpen, FlaskConical, Lightbulb, Layers, Utensils, Shirt, Gamepad2, Brain, Recycle, Flame, ArrowRight, Clock } from 'lucide-react';

const articles = [
  {
    title: 'What is a Carbon Footprint?',
    href: '/resources/what-is-carbon-footprint',
    description: 'A clear overview of the emissions captured by a personal carbon footprint.',
    category: 'Basics',
    readTime: '4 min',
    icon: <Lightbulb size={22} strokeWidth={1.5} />,
  },
  {
    title: 'How We Calculate Your Numbers',
    href: '/resources/methodology',
    description: 'An honest look at the data and assumptions behind EcoTrace estimates.',
    category: 'Methodology',
    readTime: '5 min',
    icon: <FlaskConical size={22} strokeWidth={1.5} />,
  },
  {
    title: '10 Easy Ways to Reduce Home Energy Use',
    href: '/resources/reduce-home-energy',
    description: 'Practical lifestyle suggestions to lower your household emissions.',
    category: 'Tips',
    readTime: '6 min',
    icon: <Lightbulb size={22} strokeWidth={1.5} />,
  },
  {
    title: 'Understanding Scope 1, 2, 3 Emissions',
    href: '/resources/scope-emissions',
    description: 'Learn the difference between direct, indirect, and value-chain emissions and why it matters.',
    category: 'Deep Dive',
    readTime: '7 min',
    icon: <Layers size={22} strokeWidth={1.5} />,
  },
  {
    title: 'Sustainable Food Choices That Actually Matter',
    href: '/resources/sustainable-food',
    description: 'Compare the carbon cost of common foods and find swaps that make a real difference.',
    category: 'Food',
    readTime: '6 min',
    icon: <Utensils size={22} strokeWidth={1.5} />,
  },
  {
    title: 'The Real Impact of Fast Fashion',
    href: '/resources/fast-fashion',
    description: 'How your wardrobe contributes to emissions and what you can do about it.',
    category: 'Lifestyle',
    readTime: '5 min',
    icon: <Shirt size={22} strokeWidth={1.5} />,
  },
];

const games = [
  {
    title: 'Carbon Footprint Quiz',
    href: '/resources/games/quiz',
    description: 'Test your climate knowledge with 10 questions. How much do you really know?',
    difficulty: 'Easy',
    time: '3 min',
    icon: <Brain size={28} strokeWidth={1.5} className="text-[#2C5F2D] dark:text-[#4A8F4B]" />,
    color: 'from-[#2C5F2D]/10 to-[#6B8E23]/10',
  },
  {
    title: 'Eco Sort Challenge',
    href: '/resources/games/eco-sort',
    description: 'Sort waste items into the right bins before time runs out. Beat the clock!',
    difficulty: 'Medium',
    time: '5 min',
    icon: <Recycle size={28} strokeWidth={1.5} className="text-[#30D158]" />,
    color: 'from-[#30D158]/10 to-[#00C7FF]/10',
  },
  {
    title: 'Daily Eco Streak',
    href: '/resources/games/daily-streak',
    description: 'Track your daily eco-friendly habits and build an unbreakable streak.',
    difficulty: 'Daily',
    time: '1 min',
    icon: <Flame size={28} strokeWidth={1.5} className="text-[#FF9500]" />,
    color: 'from-[#FF9500]/10 to-[#FF3B30]/10',
  },
];

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-16 space-y-4">
        <p className="text-sm font-medium uppercase tracking-widest text-[#2C5F2D] dark:text-[#4A8F4B]">Resources</p>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#1A3B1A] dark:text-[#E8F0E8]">
          Learn, play, and <span className="text-[#2C5F2D] dark:text-[#4A8F4B]">take action.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8] dark:text-[#98989D]">
          Explore articles, play interactive games, and build habits that reduce your carbon footprint.
        </p>
      </div>

      {/* Interactive Games Section */}
      <section className="mb-20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#2C5F2D]/10 dark:bg-[#4A8F4B]/10 flex items-center justify-center">
            <Gamepad2 size={22} strokeWidth={1.5} className="text-[#2C5F2D] dark:text-[#4A8F4B]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Interactive Games</h2>
            <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">Learn while having fun — no sign-up required</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {games.map((game) => (
            <Link key={game.href} href={game.href}
              className={`group relative rounded-3xl bg-gradient-to-br ${game.color} dark:from-[#1E331E] dark:to-[#162716] p-8 shadow-sm shadow-black/5 hover:shadow-apple-lg hover:-translate-y-1 transition-all duration-300 block overflow-hidden`}>
              {/* Decorative circle */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br from-current opacity-[0.03] group-hover:opacity-[0.06] transition-opacity" />

              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-[#2A3D2A] shadow-sm group-hover:scale-110 transition-transform duration-300">
                {game.icon}
              </div>

              <h3 className="text-xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] group-hover:text-[#2C5F2D] dark:text-[#4A8F4B] transition-colors">{game.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8]">{game.description}</p>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white dark:bg-[#2A3D2A] text-[#6B8E23] dark:text-[#A8BEA8]">{game.difficulty}</span>
                  <span className="flex items-center gap-1 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">
                    <Clock size={12} strokeWidth={1.5} /> {game.time}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm font-semibold text-[#2C5F2D] dark:text-[#4A8F4B] opacity-0 group-hover:opacity-100 transition-opacity">
                  Play <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Articles Section */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-[#2C5F2D]/10 dark:bg-[#4A8F4B]/10 flex items-center justify-center">
            <BookOpen size={22} strokeWidth={1.5} className="text-[#2C5F2D] dark:text-[#4A8F4B]" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-[#1A3B1A] dark:text-[#E8F0E8]">Articles & Guides</h2>
            <p className="text-sm text-[#6B8E23] dark:text-[#A8BEA8]">In-depth reading on climate, methodology, and practical tips</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.href} href={article.href}
              className="group rounded-2xl bg-[#F5F5F7] dark:bg-[#1E331E] p-6 shadow-sm shadow-black/5 hover:shadow-apple-md hover:-translate-y-0.5 transition-all duration-300 block">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2C5F2D]/10 dark:bg-[#4A8F4B]/10 text-[#2C5F2D] dark:text-[#4A8F4B]">{article.category}</span>
                <span className="flex items-center gap-1 text-xs text-[#6B8E23] dark:text-[#A8BEA8]">
                  <Clock size={12} strokeWidth={1.5} /> {article.readTime}
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 text-[#2C5F2D] dark:text-[#4A8F4B]">{article.icon}</div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-[#1A3B1A] dark:text-[#E8F0E8] group-hover:text-[#2C5F2D] dark:text-[#4A8F4B] transition-colors leading-snug">{article.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B8E23] dark:text-[#A8BEA8]">{article.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#2C5F2D] dark:text-[#4A8F4B] opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                Read Article <ArrowRight size={14} strokeWidth={2} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
