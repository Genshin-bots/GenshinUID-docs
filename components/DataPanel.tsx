'use client';

import { Heart } from 'lucide-react';
import { useEffect } from 'react';

declare global {
  interface Window {
    busuanzi?: any;
  }
}

export function DataPanel() {
  useEffect(() => {
    // 不蒜子统计
    const script = document.createElement('script');
    script.async = true;
    script.src =
      'https://busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    document.body.appendChild(script);
  }, []);

  return (
    <div className="mt-12 px-6 sm:px-12 md:px-16">
      <div className="mx-auto max-w-6xl min-h-8 rounded-lg bg-fd-card w-full">
        <section className="grid grid-cols-3 items-center justify-items-center py-3 px-6">
          <h2 className="text-base font-semibold leading-6">
            本站总访问量{' '}
            <span id="busuanzi_value_site_pv" className="font-bold" /> 次
          </h2>
          <Heart className="h-5 w-5 text-red-500 animate-pulse" />
          <h2 className="text-base leading-6">
            本站访客数{' '}
            <span id="busuanzi_value_site_uv" className="font-bold" /> 人次
          </h2>
        </section>
      </div>
    </div>
  );
}
