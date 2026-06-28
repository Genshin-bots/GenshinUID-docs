export interface NodeMessage {
  type: string;
  data: string;
}

export interface NodeContent {
  id: string;
  username: string;
  avatar: string;
  messages: NodeMessage[];
}

export interface ChatMessage {
  type: 'sent' | 'received' | 'system' | 'node';
  text?: string;
  html?: string;
  sender?: {
    nickname: string;
    avatar: string;
  };
  buttons?: Array<{
    text: string;
    data: string;
    style?: number;
  }>;
  nodeData?: NodeContent[];
}
