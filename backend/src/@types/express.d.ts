import 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      email?: string;
      name?: string;
      currentWorkspace?: string;
      roles?: string[];
    }
    // Optionally extend Request if you want stronger typing for session or custom props
    interface Request {
      user?: User;
    }
  }
}

export {};