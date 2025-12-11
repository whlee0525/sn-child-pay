export function FooterInfo() {
  return (
    <div className="text-[11px] text-gray-500 leading-relaxed">
      <p className="mb-1">📊 <strong>데이터 출처:</strong> 신한카드 2025년 6월 자료 (매년 업데이트 예정)</p>

      <p className="flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-amber-400">
          <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
          <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
        </svg>
        <strong>개발/광고 문의:</strong> <a href="mailto:whlee0525@gmail.com" className="text-blue-600 hover:underline">whlee0525@gmail.com</a>
      </p>
    </div>
  );
}
