/**
 * MDX 组件注册的唯一清单。
 * `components/mdx.tsx`、`mdx-components.tsx`、`lib/mdx-globals.ts` 均从此导出，
 * 避免三处注册表漂移。
 */
import { Callout } from 'fumadocs-ui/components/callout';
import type { MDXComponents } from 'mdx/types';
import { Badge } from '@/components/Badge';
import { BeginnerTip } from '@/components/BeginnerTip';
import { Card } from '@/components/Card';
import { ChatMessage, ChatPanel } from '@/components/ChatPanel';
import { CheckItem, CheckProgress } from '@/components/CheckItem';
import { ConfigField, ConfigFieldGrid } from '@/components/ConfigField';
import { Contact } from '@/components/Contact';
import { CopyRight } from '@/components/CopyRight';
import { ChatLayout } from '@/components/chat/ChatLayout';
import { DataPanel } from '@/components/DataPanel';
import { DecisionTree } from '@/components/DecisionTree';
import { FaqList } from '@/components/FaqList';
import { FlowDiagram } from '@/components/FlowDiagram';
import { HubEmbed } from '@/components/HubEmbed';
import { NavCard } from '@/components/NavCard';
import { NextSteps } from '@/components/NextSteps';
import { OsTabs } from '@/components/OsTabs';
import { PageInfo } from '@/components/PageInfo';
import { PathWizard } from '@/components/PathWizard';
import { PkgManager } from '@/components/PkgManager';
import { TimeEstimate } from '@/components/TimeEstimate';
import { VideoLink } from '@/components/VideoLink';

/** 可在 MDX 中直接使用的自定义组件（不含 heading 覆盖） */
export const customMdxComponents = {
  Badge,
  Card,
  CheckItem,
  CheckProgress,
  NavCard,
  DataPanel,
  PageInfo,
  PkgManager,
  VideoLink,
  CopyRight,
  Contact,
  ChatLayout,
  ChatPanel,
  ChatMessage,
  FaqList,
  Callout,
  DecisionTree,
  PathWizard,
  ConfigField,
  ConfigFieldGrid,
  HubEmbed,
  BeginnerTip,
  FlowDiagram,
  OsTabs,
  NextSteps,
  TimeEstimate,
} satisfies MDXComponents;

export type CustomMdxComponentName = keyof typeof customMdxComponents;
