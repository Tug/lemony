import { Magic } from '@magic-sdk/admin';
import atob from 'atob';

// initiating Magic instance for server-side methods
export const magic = new Magic(process.env.MAGIC_API_KEY);
