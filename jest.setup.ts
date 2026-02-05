import '@testing-library/jest-dom'

// Mock Next.js App Router navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  useParams() {
    return {}
  },
}))

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => {
    return children
  }
})

// Mock UUID
jest.mock('uuid', () => ({
  v4: () => 'test-uuid-123'
}))

// Mock Next.js server components
class MockNextRequest {
  url: string;
  method: string;
  headers: Headers;
  nextUrl: URL;

  constructor(url: string, init?: { method?: string; headers?: HeadersInit }) {
    this.url = url;
    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.nextUrl = new URL(url);
  }
}

const MockNextResponse = {
  json: (data: any, init?: { status?: number }) => {
    return {
      json: async () => data,
      status: init?.status || 200,
    };
  },
};

jest.mock('next/server', () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}))