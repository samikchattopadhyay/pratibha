"use client";

interface FacebookTabProps {
  fbInterval: string;
}

export default function FacebookTab({ fbInterval }: FacebookTabProps) {
  return (
    <div className="space-y-6 bg-charcoal-light border border-terracotta/15 rounded-2xl p-6">
      <h3 className="font-serif text-base font-bold">Facebook Group Scraper Analytics</h3>
      <div className="space-y-4 text-sm font-semibold text-cream/80">
        <p>Status: <span className="text-green-400 font-bold">Online (Scraping every {fbInterval} mins)</span></p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5">
            <p className="text-cream/50 text-sm font-bold">Top Trending Category</p>
            <p className="text-lg font-bold text-cream">Poetry Recitation</p>
          </div>
          <div className="p-4 bg-charcoal rounded-xl border border-terracotta/5">
            <p className="text-cream/50 text-sm font-bold">Community Engagement Status</p>
            <p className="text-lg font-bold text-cream">Healthy</p>
          </div>
        </div>
      </div>
    </div>
  );
}
