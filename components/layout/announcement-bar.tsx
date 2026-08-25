export default function AnnouncementBar() {
  return (
    <div
      className="w-full"
      style={{
        background:
          'linear-gradient(90deg, #C9513A 0%, #BE4A34 50%, #C9513A 100%)',
      }}
    >
      <p className="px-4 py-2.5 text-center text-[10.5px] font-light uppercase tracking-[0.28em] text-white/95">
        Authentic French Cosmetics
        <span className="mx-2.5 text-white/45">·</span>
        Free Delivery Nationwide
        <span className="mx-2.5 text-white/45">·</span>
        COD Available
      </p>
    </div>
  );
}
