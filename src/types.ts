export interface Term {
  found: boolean;
  term: string;
  id?: number;
  url?: string;
  description?: string;
  example?: string;
  createdAt?: Date;
  author?: {
    name: string;
    url: string;
  };
  thumbs?: {
    up: number;
    down: number;
  };
}

export interface Options {
  formatMarkdown?: boolean;
}
