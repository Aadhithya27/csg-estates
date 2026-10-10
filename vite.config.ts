import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function localJsonDatabasePlugin(): Plugin {
  const dbPath = path.resolve(process.cwd(), 'server-data.json')

  const getDb = () => {
    if (!fs.existsSync(dbPath)) {
      const initial = {
        properties: [],
        homes: [],
        bills: [],
        payments: [],
        expenses: [],
        settings: {
          estateName: 'C S G Estates',
          ownerContactPhone: '9444423448',
          currencySymbol: '₹',
          invoiceNote: 'Thank you for your prompt payment!',
          googleClientId: '',
        },
        user: {
          id: 'usr-family',
          name: 'C S G Family Owner',
          email: 'family@csgestates.com',
          role: 'Owner',
          provider: 'passkey',
        },
        passkey: '9444423448',
        lastUpdated: new Date().toISOString(),
      }
      fs.writeFileSync(dbPath, JSON.stringify(initial, null, 2), 'utf-8')
      return initial
    }
    try {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
    } catch {
      return {}
    }
  }

  const mergeListsById = <T extends { id?: string }>(
    currentList: T[] = [],
    incomingList: T[] = [],
    deletedIds: string[] = []
  ): T[] => {
    const map = new Map<string, T>();
    if (Array.isArray(currentList)) {
      for (const item of currentList) {
        if (item && item.id && !deletedIds.includes(item.id)) {
          map.set(item.id, item);
        }
      }
    }
    if (Array.isArray(incomingList)) {
      for (const item of incomingList) {
        if (item && item.id && !deletedIds.includes(item.id)) {
          const existing = map.get(item.id);
          map.set(item.id, existing ? { ...existing, ...item } : item);
        }
      }
    }
    return Array.from(map.values());
  };

  const handleApiRequest = (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (url === '/api/db' || url.startsWith('/api/db?') || url.startsWith('/api/db/')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }

      if (req.method === 'GET') {
        const data = getDb();
        res.statusCode = 200;
        res.end(JSON.stringify(data));
        return;
      }

      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: any) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body);
            const current = getDb();
            const deletedIds = Array.isArray(parsed.deletedIds) ? parsed.deletedIds : [];

            // Robust merge: never wipe out records when incoming device is just starting up
            const merged = {
              ...current,
              properties: mergeListsById(current.properties, parsed.properties, deletedIds),
              homes: mergeListsById(current.homes, parsed.homes, deletedIds),
              bills: mergeListsById(current.bills, parsed.bills, deletedIds),
              payments: mergeListsById(current.payments, parsed.payments, deletedIds),
              expenses: mergeListsById(current.expenses, parsed.expenses, deletedIds),
              settings: {
                ...(current.settings || {}),
                ...(parsed.settings || {}),
              },
              user: parsed.user || current.user,
              passkey: parsed.passkey || current.passkey || '9444423448',
              lastUpdated: new Date().toISOString(),
            };

            fs.writeFileSync(dbPath, JSON.stringify(merged, null, 2), 'utf-8');
            res.statusCode = 200;
            res.end(JSON.stringify({ success: true, data: merged }));
          } catch (e: any) {
            res.statusCode = 400;
            res.end(JSON.stringify({ success: false, error: e.message }));
          }
        });
        return;
      }
    }
    next();
  };

  return {
    name: 'local-json-database',
    configureServer(server) {
      server.middlewares.use(handleApiRequest)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleApiRequest)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), localJsonDatabasePlugin()],
  server: {
    host: true,
    port: 5173,
  },
  preview: {
    host: true,
    port: 5173,
  },
})

