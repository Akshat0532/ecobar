export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
        <p className="text-sm uppercase tracking-[0.3em] text-mist/60">Last Updated January 2026</p>
        <h1 className="text-4xl font-semibold text-mist">Privacy Policy</h1>
        <p className="text-base leading-8 text-mist/75">
          EcoTrace values your privacy. We store only the information required to give you a better carbon tracking experience, including your email address when you sign up and any saved footprint logs.
        </p>
        <div className="space-y-6 text-mist/80">
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-mist">What we collect</h2>
            <p>
              When you register or save calculations, EcoTrace stores your email, profile settings, and carbon footprint entries. This data helps us show your progress, export logs, and keep your account private.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-mist">How we use your data</h2>
            <p>
              We use your information to provide the service, enable authentication, and save your footprint history. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-2xl font-semibold text-mist">Your rights</h2>
            <p>
              You can request deletion of your account and logs at any time. Contact us through the contact page and we will process your request promptly.
            </p>
          </section>

          <section className="space-y-3" id="cookies">
            <h2 className="text-2xl font-semibold text-mist">Cookies & preferences</h2>
            <p>
              EcoTrace uses browser storage for guest mode and non-persistent preview sessions. We recommend using the guest session only for temporary reviews.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
