import { Developer } from '../models/Developer';

declare global {
  namespace Express {
    interface Request {
      developer?: Developer;
    }
  }
}

// This file doesn't need any exports - it extends global Express types