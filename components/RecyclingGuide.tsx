'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { RECYCLING_ITEMS, getRecycleSteps, type RecycleItem } from '@/lib/recyclingGuide';

export function RecyclingGuide() {
  const [selectedItem, setSelectedItem] = useState<RecycleItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = RECYCLING_ITEMS.filter(
    (item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Recycling Guide</h1>
        <p className="text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
          Clear, shame-free guidance on what goes where. Recycling rules vary by region—we show the most common standards.
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <input type="text" placeholder="Search items (e.g., plastic bottles, aluminum cans, cardboard)..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-5 py-3 bg-[#F5F5F7] dark:bg-[#1C1C1E] border-0 rounded-xl text-[#1D1D1F] dark:text-[#F5F5F7] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#0071E3]/40" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {filteredItems.map((item, idx) => (<ItemCard key={item.id} item={item} onSelect={() => setSelectedItem(item)} delay={idx * 0.05} />))}
      </div>

      {filteredItems.length === 0 && (<div className="text-center py-12"><p className="text-[#86868B]">No items found. Try a different search term!</p></div>)}

      <AnimatePresence>{selectedItem && (<ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />)}</AnimatePresence>

      <Card>
        <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">💡 Golden Rules</h3>
        <ul className="space-y-2 text-sm text-[#86868B]">
          <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Empty first:</strong> Leftover food or liquid ruins entire batches.</li>
          <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">No bags:</strong> Plastic bags tangle machinery—throw items loose in the bin.</li>
          <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Don&apos;t wish-cycle:</strong> If unsure, leave it out. Contamination costs facilities.</li>
          <li>• <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Check locally:</strong> Rules vary. Your city&apos;s recycling program has a website—use it!</li>
        </ul>
      </Card>
    </div>
  );
}

function ItemCard({ item, onSelect, delay }: { item: RecycleItem; onSelect: () => void; delay: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} onClick={onSelect}>
      <Card className={`cursor-pointer hover:shadow-apple-md transition-all group ${!item.canRecycle ? 'ring-1 ring-[#FF3B30]/20' : ''}`}>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] transition-colors flex-1">{item.name}</h3>
          </div>
          <p className="text-xs text-[#86868B]">{item.category}</p>
          <p className="text-sm leading-relaxed text-[#86868B]">{item.shortDescription}</p>
          <Button variant="ghost" className="w-full text-xs mt-2">Learn More →</Button>
        </div>
      </Card>
    </motion.div>
  );
}

function ItemDetailModal({ item, onClose }: { item: RecycleItem; onClose: () => void }) {
  const steps = getRecycleSteps(item);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#1C1C1E] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-apple-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-2xl z-10 transition-colors">✕</button>
        <div className="p-8 space-y-6">
          <div className="flex items-start gap-4">
            <span className="text-6xl">{item.canRecycle ? '♻️' : '🚫'}</span>
            <div>
              <h2 className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.name}</h2>
              <p className="text-[#0071E3] mt-1">{item.category}</p>
            </div>
          </div>

          <Card className={item.canRecycle ? 'bg-[#30D158]/10' : 'bg-[#FF3B30]/10'}>
            <p className="text-lg font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{item.canRecycle ? '✅ Can be recycled' : '❌ Cannot be recycled'}</p>
            <p className="text-sm text-[#86868B] mt-2">{item.reason}</p>
          </Card>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-2">📋 What You Need to Know</h3>
              <p className="text-sm text-[#86868B] leading-relaxed">{item.detailedDescription}</p>
            </div>

            {item.canRecycle && (
              <div>
                <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] mb-3">📝 How to Recycle</h3>
                <div className="space-y-3">
                  {steps.map((step, idx) => (
                    <motion.div key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#0071E3]/10 rounded-full flex items-center justify-center text-[#0071E3] font-bold text-sm">{idx + 1}</div>
                      <p className="text-sm text-[#86868B] leading-relaxed pt-1">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {item.commonMistakes && item.commonMistakes.length > 0 && (
              <Card className="bg-[#FF9500]/10">
                <h3 className="font-semibold text-[#FF9500] mb-2">⚠️ Common Mistakes</h3>
                <ul className="space-y-1">{item.commonMistakes.map((m, i) => (<li key={i} className="text-sm text-[#86868B]">• {m}</li>))}</ul>
              </Card>
            )}

            {item.localVariations && item.localVariations.length > 0 && (
              <Card className="bg-[#0071E3]/5">
                <h3 className="font-semibold text-[#0071E3] mb-2">🌍 Regional Variations</h3>
                <ul className="space-y-1">{item.localVariations.map((v, i) => (<li key={i} className="text-sm text-[#86868B]">• {v}</li>))}</ul>
              </Card>
            )}
          </div>

          <Button onClick={onClose} className="w-full">Got it!</Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
