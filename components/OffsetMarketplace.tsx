'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { OFFSET_PROJECTS, groupProjectsByCategory, formatCategoryName, calculateEstimatedOffset, type OffsetProject } from '@/lib/offsetProjects';

export function OffsetMarketplace() {
  const [selectedProject, setSelectedProject] = useState<OffsetProject | null>(null);
  const featured = OFFSET_PROJECTS.filter((p) => p.isFeatured);
  const grouped = groupProjectsByCategory(OFFSET_PROJECTS);

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">Offset Marketplace</h1>
        <p className="text-lg text-[#86868B] max-w-2xl mx-auto leading-relaxed">
          Support verified carbon removal & renewable energy projects. We handle no money—just direct you to trusted nonprofit donation pages.
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Featured Projects</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featured.map((project, idx) => (<ProjectCard key={project.id} project={project} onSelect={() => setSelectedProject(project)} delay={idx * 0.1} />))}
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, projects]) => (
          <div key={category} className="space-y-4">
            <h3 className="text-xl font-semibold text-[#0071E3]">{formatCategoryName(category)}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {projects.map((project) => (<ProjectCard key={project.id} project={project} onSelect={() => setSelectedProject(project)} size="compact" />))}
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <ProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)}
          onSupport={() => { setTimeout(() => { window.open(selectedProject.donationUrl, '_blank'); setSelectedProject(null); }, 1500); }} />
      )}

      <Card>
        <div className="space-y-3 text-sm text-[#86868B] leading-relaxed">
          <p>✅ <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">Verified Projects:</strong> All projects are certified by Gold Standard, Verra, or Plan Vivo.</p>
          <p>✅ <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">No Double-Counting:</strong> Offsets in EcoTrace are psychological motivators, not scientific carbon accounting.</p>
          <p>✅ <strong className="text-[#1D1D1F] dark:text-[#F5F5F7]">We Don&apos;t Handle Money:</strong> We redirect to each nonprofit&apos;s official donation page.</p>
        </div>
      </Card>
    </div>
  );
}

function ProjectCard({ project, onSelect, size = 'default', delay = 0 }: { project: OffsetProject; onSelect: () => void; size?: 'default' | 'compact'; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="overflow-hidden hover:shadow-apple-md transition-all cursor-pointer group p-0" onClick={onSelect}>
        <div className="relative overflow-hidden bg-[#F5F5F7] dark:bg-[#2C2C2E] h-40">
          <img src={project.imageUrl} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded-lg text-xs text-[#0071E3] font-semibold">{project.verificationStandard}</div>
        </div>
        <div className="p-5 space-y-2">
          <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7] group-hover:text-[#0071E3] transition-colors">{project.name}</h3>
          <p className="text-xs text-[#86868B]">{project.organizationName}</p>
          <p className="text-sm text-[#86868B] line-clamp-2">{project.description}</p>
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#0071E3] font-semibold">{project.co2ReductionPotential} kg CO₂e / $1</span>
            <span className="text-xs text-[#86868B]">{project.location}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

function ProjectDetailModal({ project, onClose, onSupport }: { project: OffsetProject; onClose: () => void; onSupport: (amount: number) => void }) {
  const [donationAmount, setDonationAmount] = useState(25);
  const estimatedOffset = calculateEstimatedOffset(project, donationAmount);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 bg-black/30 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#1C1C1E] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative shadow-apple-lg">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#86868B] hover:text-[#1D1D1F] dark:hover:text-[#F5F5F7] text-2xl z-10 transition-colors">✕</button>
        <div className="p-8 space-y-6">
          <img src={project.imageUrl} alt={project.name} className="w-full h-64 object-cover rounded-xl" />
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h2 className="text-3xl font-bold text-[#1D1D1F] dark:text-[#F5F5F7]">{project.name}</h2>
                <p className="text-sm text-[#0071E3] mt-1">{project.organizationName}</p>
              </div>
              <span className="bg-[#0071E3]/10 text-[#0071E3] px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">{project.verificationStandard}</span>
            </div>
            <p className="text-sm text-[#86868B]">{project.location}</p>
          </div>
          <p className="text-base text-[#86868B] leading-relaxed">{project.longDescription}</p>

          <Card className="space-y-4">
            <h3 className="font-semibold text-[#1D1D1F] dark:text-[#F5F5F7]">Support This Project</h3>
            <div>
              <label className="text-sm text-[#86868B] mb-2 block">Donation Goal ($)</label>
              <div className="flex gap-2 items-center">
                <input type="range" min="5" max="500" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))} className="flex-1 accent-[#0071E3]" />
                <input type="number" min="5" value={donationAmount} onChange={(e) => setDonationAmount(Number(e.target.value))}
                  className="w-16 bg-[#F5F5F7] dark:bg-[#2C2C2E] border-0 rounded-lg px-2 py-1 text-[#1D1D1F] dark:text-[#F5F5F7] text-center text-sm" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-[#0071E3]/10 to-transparent p-4 rounded-xl">
              <p className="text-sm text-[#86868B]">Estimated offset from ${donationAmount} donation:</p>
              <p className="text-2xl font-bold text-[#0071E3] mt-2">{estimatedOffset} kg CO₂e</p>
              <p className="text-xs text-[#86868B] mt-1">≈ {(estimatedOffset / 20).toFixed(1)} trees worth of annual carbon removal</p>
            </div>
            <Button onClick={() => onSupport(donationAmount)} className="w-full">Visit {project.organizationName} Donation Page →</Button>
            <p className="text-xs text-[#86868B] text-center">You&apos;ll be redirected to their secure donation page. EcoTrace handles no payments.</p>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
