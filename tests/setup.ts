import '@testing-library/jest-dom';
import 'openai/shims/node';

// Polyfill Request and Response for Next.js server components
if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    body: unknown;

    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
      this.body = init?.body;
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }

    async formData() {
      return this.body as FormData;
    }
  } as unknown as typeof Request;
}

if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    body: unknown;
    status: number;
    statusText: string;
    headers: Headers;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.statusText = init?.statusText || 'OK';
      this.headers = new Headers(init?.headers);
    }

    async json() {
      return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
    }
  } as unknown as typeof Response;
}

// Mock environment variables for testing
process.env.DATABASE_URL = 'mysql://test:test@localhost:3306/test_lims';
process.env.OPENAI_API_KEY = 'sk-test-key';
process.env.NODE_ENV = 'test';
