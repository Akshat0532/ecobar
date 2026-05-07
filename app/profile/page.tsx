'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getBrowserSupabaseClient } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

// ─── Data fetchers ────────────────────────────────────────────────────────────
async function fetchProfile() {
  const supabase = getBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (error) throw error;
  return { ...data, email: user.email };
}

async function fetchHouseholdMembers() {
  const supabase = getBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('household_members')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

async function fetchCarbonLogs() {
  const supabase = getBrowserSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('carbon_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const selectClass =
  'w-full rounded-xl border border-eco-sage/30 dark:border-[#2A3D2A] bg-eco-offwhite dark:bg-[#1E331E] px-4 py-2.5 text-sm ' +
  'text-eco-forest dark:text-[#E8F0E8] outline-none transition focus:border-eco-emerald focus:ring-2 focus:ring-eco-emerald/20';

const fieldLabel = 'block text-sm font-semibold text-eco-forest dark:text-[#E8F0E8] mb-1.5';

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Add-member form state
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRelationship, setNewMemberRelationship] = useState('');
  const [saveConfirm, setSaveConfirm] = useState('');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ['householdMembers'],
    queryFn: fetchHouseholdMembers,
  });
  const { data: logs = [], isLoading: logsLoading } = useQuery({
    queryKey: ['carbonLogs'],
    queryFn: fetchCarbonLogs,
  });

  // ── Mutations ──────────────────────────────────────────────────────────────
  const updateProfile = useMutation({
    mutationFn: async (updates: Record<string, unknown>) => {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveConfirm('Saved!');
      setTimeout(() => setSaveConfirm(''), 2000);
    },
  });

  const addMember = useMutation({
    mutationFn: async (member: { name: string; relationship: string }) => {
      const supabase = getBrowserSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('household_members')
        .insert({ user_id: user.id, name: member.name, relationship: member.relationship });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['householdMembers'] });
      setNewMemberName('');
      setNewMemberRelationship('');
    },
  });

  const deleteMember = useMutation({
    mutationFn: async (id: string) => {
      const supabase = getBrowserSupabaseClient();
      const { error } = await supabase.from('household_members').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['householdMembers'] }),
  });

  const signOut = useMutation({
    mutationFn: async () => {
      const supabase = getBrowserSupabaseClient();
      await supabase.auth.signOut();
    },
    onSuccess: () => router.push('/login'),
  });

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportData = () => {
    if (!logs || !profile) return;
    const blob = new Blob(
      [JSON.stringify({ profile, householdMembers: members, carbonLogs: logs }, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ecotrace-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (profileLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 pb-16 pt-12 lg:px-10">
        <div className="space-y-4 animate-pulse">
          <div className="h-10 w-64 rounded-xl bg-eco-sage/20" />
          <div className="h-4 w-80 rounded-lg bg-eco-sage/10" />
          <div className="grid gap-6 lg:grid-cols-2 mt-8">
            <div className="h-64 rounded-2xl bg-eco-sage/10" />
            <div className="h-64 rounded-2xl bg-eco-sage/10" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 pb-20 pt-12 lg:px-10">
      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-widest text-eco-olive mb-1">
          Account
        </p>
        <h1 className="text-3xl font-bold text-eco-forest dark:text-[#E8F0E8]">Settings</h1>
        <p className="mt-1.5 text-sm text-eco-forest/60 dark:text-[#A8BEA8]">
          Manage your profile, household, and account preferences
        </p>
        {profile?.email && (
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-eco-sage/20
                         px-3 py-1 text-xs font-medium text-eco-emerald">
            🌿 {profile.email}
          </p>
        )}
      </header>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ── LEFT COLUMN ─────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Personal Settings */}
          <Card>
            <h2 className="text-base font-semibold text-eco-forest dark:text-[#E8F0E8] mb-5 flex items-center gap-2">
              <span className="text-lg">⚙️</span> Personal Settings
            </h2>
            <div className="space-y-4">

              {/* Household Size */}
              <div>
                <label className={fieldLabel}>Household Size</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  defaultValue={profile?.household_size ?? 1}
                  onBlur={(e) =>
                    updateProfile.mutate({ household_size: Number(e.target.value) })
                  }
                />
                <p className="mt-1 text-xs text-eco-forest/50 dark:text-[#7A987A]">
                  Used for per-capita carbon calculations
                </p>
              </div>

              {/* Pincode */}
              <div>
                <label className={fieldLabel}>Pincode / Zip Code</label>
                <Input
                  placeholder="e.g. 400001"
                  defaultValue={profile?.zip_code ?? ''}
                  onBlur={(e) => updateProfile.mutate({ zip_code: e.target.value })}
                />
              </div>

              {/* Distance Unit */}
              <div>
                <label className={fieldLabel}>Distance Unit</label>
                <select
                  value={profile?.distance_unit ?? 'km'}
                  onChange={(e) => updateProfile.mutate({ distance_unit: e.target.value })}
                  className={selectClass}
                >
                  <option value="km">Kilometres (km)</option>
                  <option value="mi">Miles (mi)</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className={fieldLabel}>Currency</label>
                <select
                  value={profile?.currency ?? 'INR'}
                  onChange={(e) => updateProfile.mutate({ currency: e.target.value })}
                  className={selectClass}
                >
                  <option value="INR">INR (₹) — Indian Rupee</option>
                  <option value="USD">USD ($) — US Dollar</option>
                  <option value="EUR">EUR (€) — Euro</option>
                  <option value="GBP">GBP (£) — British Pound</option>
                </select>
              </div>

            </div>

            {/* Save feedback */}
            {saveConfirm && (
              <p className="mt-4 text-sm font-medium text-eco-emerald flex items-center gap-1">
                ✅ {saveConfirm}
              </p>
            )}
          </Card>

          {/* Household Members */}
          <Card>
            <h2 className="text-base font-semibold text-eco-forest dark:text-[#E8F0E8] mb-5 flex items-center gap-2">
              <span className="text-lg">👨‍👩‍👧‍👦</span> Household Members
            </h2>

            {/* Members list */}
            {membersLoading ? (
              <p className="text-sm text-eco-forest/50 dark:text-[#7A987A] mb-4">Loading members…</p>
            ) : members.length === 0 ? (
              <p className="text-sm text-eco-forest/50 dark:text-[#7A987A] mb-4 italic">
                No members added yet.
              </p>
            ) : (
              <ul className="space-y-2 mb-5">
                {members.map((member: any) => (
                  <li
                    key={member.id}
                    className="flex items-center justify-between rounded-xl
                               border border-eco-sage/20 dark:border-[#2A3D2A] bg-eco-offwhite dark:bg-[#1E331E] px-4 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-semibold text-eco-forest dark:text-[#E8F0E8]">{member.name}</p>
                      <p className="text-xs text-eco-forest/50 dark:text-[#7A987A] capitalize">
                        {member.relationship}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteMember.mutate(member.id)}
                      disabled={deleteMember.status === 'pending'}
                      aria-label={`Remove ${member.name}`}
                      className="rounded-lg p-1.5 text-eco-terra/70 transition
                                 hover:bg-eco-terra/10 hover:text-eco-terra
                                 focus:outline-none focus:ring-2 focus:ring-eco-terra/30"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                           fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clipRule="evenodd" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add member form */}
            <div className="border-t border-eco-sage/20 pt-4 space-y-3">
              <p className="text-xs font-semibold text-eco-forest/60 dark:text-[#A8BEA8] uppercase tracking-wide">
                Add Member
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Input
                  placeholder="Name"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                />
                <Input
                  placeholder="Relationship (e.g. Spouse)"
                  value={newMemberRelationship}
                  onChange={(e) => setNewMemberRelationship(e.target.value)}
                />
              </div>
              <Button
                onClick={() =>
                  addMember.mutate({ name: newMemberName, relationship: newMemberRelationship })
                }
                disabled={
                  !newMemberName || !newMemberRelationship || addMember.status === 'pending'
                }
                className="w-full"
              >
                {addMember.status === 'pending' ? 'Adding…' : '+ Add Member'}
              </Button>
            </div>
          </Card>
        </div>

        {/* ── RIGHT COLUMN ────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Recent Activity */}
          <Card>
            <h2 className="text-base font-semibold text-eco-forest dark:text-[#E8F0E8] mb-5 flex items-center gap-2">
              <span className="text-lg">📋</span> Recent Activity
            </h2>
            {logsLoading ? (
              <p className="text-sm text-eco-forest/50 dark:text-[#7A987A]">Loading logs…</p>
            ) : logs.length === 0 ? (
              <p className="text-sm text-eco-forest/50 dark:text-[#7A987A] italic">No calculations yet.</p>
            ) : (
              <ul className="space-y-2">
                {logs.slice(0, 6).map((log: any) => (
                  <li
                    key={log.id}
                    className="flex items-center justify-between rounded-xl
                               border border-eco-sage/20 dark:border-[#2A3D2A] bg-eco-offwhite dark:bg-[#1E331E] px-4 py-2.5"
                  >
                    <p className="text-xs text-eco-forest/50 dark:text-[#7A987A]">
                      {new Date(log.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm font-semibold text-eco-emerald">
                      {Number(log.estimate).toFixed(1)} kg CO₂e
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Data Export */}
          <Card>
            <h2 className="text-base font-semibold text-eco-forest dark:text-[#E8F0E8] mb-2 flex items-center gap-2">
              <span className="text-lg">📦</span> Export Your Data
            </h2>
            <p className="text-sm text-eco-forest/60 dark:text-[#A8BEA8] mb-4">
              Download all your profile, household, and carbon log data as JSON.
            </p>
            <Button variant="secondary" onClick={exportData} className="w-full">
              ⬇ Export as JSON
            </Button>
          </Card>

          {/* Account / Danger Zone */}
          <Card>
            <h2 className="text-base font-semibold text-eco-forest dark:text-[#E8F0E8] mb-2 flex items-center gap-2">
              <span className="text-lg">🔐</span> Account
            </h2>
            <p className="text-sm text-eco-forest/60 dark:text-[#A8BEA8] mb-4">
              Sign out of your EcoTrace account on this device.
            </p>
            <Button
              variant="ghost"
              onClick={() => signOut.mutate()}
              disabled={signOut.status === 'pending'}
              className="w-full border border-eco-terra/30 text-eco-terra
                         hover:bg-eco-terra/10 hover:border-eco-terra/60"
            >
              {signOut.status === 'pending' ? 'Signing out…' : '→ Sign Out'}
            </Button>
          </Card>

        </div>
      </div>
    </main>
  );
}
