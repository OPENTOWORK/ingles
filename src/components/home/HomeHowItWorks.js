'use client';

/** Single CTA to launch the guided tour (registered users only). */
export default function HomeHowItWorks({ onStartTour }) {
  return (
    <div className="home-how-trigger">
      <button type="button" className="home-how__toggle" onClick={onStartTour}>
        How it works
      </button>
    </div>
  );
}
