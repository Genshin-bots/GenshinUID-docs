import { Play } from 'lucide-react';
import type { ReactNode } from 'react';

interface VideoLinkProps {
  bvId: string;
  children?: ReactNode;
}

export function VideoLink({ bvId, children }: VideoLinkProps) {
  const link = `https://www.bilibili.com/video/${bvId}/`;
  return (
    <div className="my-2">
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded bg-blue-500/10 px-4 py-3 transition-colors hover:bg-blue-500/20"
      >
        <Play className="h-5 w-5 flex-none" />
        {children}
      </a>
    </div>
  );
}
