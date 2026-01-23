export const metadata = {
  title: 'Privacy Policy - Swasthik Telugu Calendar 2026',
  description: 'Privacy Policy for Swasthik Telugu Calendar 2026',
};

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="glass rounded-3xl p-8 shadow-soft border border-white/50">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-indigo-900">
          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">App Name</h2>
            <p>Swasthik Telugu Calendar 2026</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Microphone / Audio Permission (RECORD_AUDIO)</h2>
            <p>
              Our app requires access to your device's microphone (RECORD_AUDIO permission) to provide audio-based features. 
              This permission is used solely for processing audio commands or playing notification sounds within the app.
              We do not record, store, or transmit your voice data to any external servers without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Data Usage & Collection</h2>
            <p>
              We are committed to protecting your privacy. We do not collect, store, or share any personal identification information 
              from our users. Any data processed by the application is done locally on your device or technically necessary for 
              the app's core functionality (such as fetching Panchangam data).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-indigo-600 mb-2">Contact Us</h2>
            <p>
              If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.
            </p>
          </section>
          
          <div className="pt-6 text-sm text-indigo-400">
            <p>Last updated: January 2026</p>
          </div>
        </div>
      </div>
    </div>
  );
}
