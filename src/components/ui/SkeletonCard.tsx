export default function SkeletonCard() {
  return (
    <div className="bg-white border-4 border-[#C41E3A] rounded-[36px] p-6 md:p-8 flex flex-col items-center text-center animate-pulse">
      <div className="w-full aspect-square rounded-[24px] mb-6 bg-[#C41E3A]/10 border-2 border-[#C41E3A]/5" />
      <div className="h-8 w-3/4 bg-[#C41E3A]/10 rounded-lg mb-3" />
      <div className="h-4 w-full bg-[#C41E3A]/10 rounded mb-2" />
      <div className="h-4 w-5/6 bg-[#C41E3A]/10 rounded mb-6" />
      <div className="flex items-center justify-between w-full mt-auto pt-4 border-t-2 border-[#C41E3A]/5">
        <div className="h-6 w-20 bg-[#FFB81C]/20 rounded-lg" />
        <div className="flex gap-2">
          <div className="w-10 h-10 bg-[#C41E3A]/10 rounded-full" />
          <div className="w-10 h-10 bg-[#FFB81C]/30 rounded-full" />
        </div>
      </div>
    </div>
  );
}
