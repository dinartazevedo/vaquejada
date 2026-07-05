# VaquejaData — Guia de Instalação e Deploy

## Estrutura do Projeto

```
vaquejaData/
├── index.html              # Entry point HTML
├── vite.config.ts          # Config Vite (build)
├── tsconfig.json           # TypeScript config
├── vercel.json             # Deploy Vercel (automático)
├── netlify.toml            # Deploy Netlify (automático)
├── .env.example            # Variáveis de ambiente
├── package.deploy.json     # Renomear para package.json em projeto novo
├── prisma/
│   └── schema.prisma       # Schema completo do banco de dados
├── public/
│   ├── favicon.svg         # Ícone da aba
│   ├── manifest.json       # PWA manifest
│   └── robots.txt          # SEO
└── src/
    ├── main.tsx            # Entrada React
    ├── app/
    │   └── App.tsx         # Aplicação completa (4058 linhas)
    └── styles/
        ├── index.css       # Importa tudo
        ├── fonts.css       # Google Fonts + animações
        └── theme.css       # Tokens de cores dark theme
```

---

## Opção 1 — Deploy Rápido (Vercel) ✅ RECOMENDADO

### Pré-requisitos
- Conta gratuita em [vercel.com](https://vercel.com)
- Git instalado

### Passo a passo

```bash
# 1. Copie os arquivos do projeto para uma pasta
mkdir vaquejaData && cd vaquejaData

# 2. Copie todos os arquivos do projeto para esta pasta
# (index.html, src/, public/, prisma/, vite.config.ts, etc.)

# 3. Renomeie o arquivo de dependências
cp package.deploy.json package.json

# 4. Instale as dependências
npm install

# 5. Teste localmente
npm run dev
# Acesse http://localhost:5173

# 6. Faça o build de produção
npm run build

# 7. Inicialize o git e suba para GitHub
git init
git add .
git commit -m "feat: VaquejaData inicial"
git remote add origin https://github.com/SEU_USUARIO/vaquejaData.git
git push -u origin main

# 8. No Vercel: importe o repositório GitHub
# Settings → Build Command: vite build
# Settings → Output Directory: dist
# Clique em Deploy — pronto em ~60 segundos!
```

---

## Opção 2 — Deploy Netlify

```bash
# Após o build (npm run build), arraste a pasta dist/
# para netlify.com/drop — publicado instantaneamente!

# Ou via CLI:
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Opção 3 — Servidor Próprio (VPS/HostGator/etc.)

```bash
# 1. Build local
npm run build

# 2. Copie a pasta dist/ para o servidor via FTP/SSH
scp -r dist/ usuario@seu-servidor.com:/var/www/vaquejaData/

# 3. Configure o servidor web para servir o index.html
# em todas as rotas (SPA routing)
```

**Nginx (coloque em `/etc/nginx/sites-available/vaquejaData`):**
```nginx
server {
    listen 80;
    server_name vaquejaData.com.br www.vaquejaData.com.br;
    root /var/www/vaquejaData;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache para assets com hash no nome
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## Banco de Dados (PostgreSQL)

O arquivo `prisma/schema.prisma` contém o schema completo com 10 tabelas.

```bash
# 1. Instale o Prisma CLI
npm install prisma @prisma/client

# 2. Configure a connection string no .env
cp .env.example .env
# Edite DATABASE_URL com suas credenciais

# 3. Crie o banco e aplique as migrations
npx prisma migrate dev --name init

# 4. (Opcional) Visualize o banco
npx prisma studio
```

### Provedores de PostgreSQL gratuitos
| Provedor | Limite Free | Link |
|---|---|---|
| **Supabase** | 500 MB | supabase.com |
| **Neon** | 512 MB | neon.tech |
| **Railway** | $5 crédito/mês | railway.app |
| **Render** | 1 GB, 90 dias | render.com |

---

## Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."
JWT_SECRET="chave-secreta-minimo-32-chars"
VITE_APP_URL="https://vaquejaData.com.br"
VITE_API_URL="https://api.vaquejaData.com.br"
```

> **No Vercel/Netlify:** adicione as variáveis no painel web em
> Settings → Environment Variables (nunca no código!)

---

## Domínio Personalizado

1. **Registre o domínio** em registro.br, GoDaddy ou Namecheap
2. **No Vercel:** Settings → Domains → Add Domain → `vaquejaData.com.br`
3. **No seu registrador:** adicione os registros DNS fornecidos pelo Vercel
4. **SSL/HTTPS:** gerado automaticamente pelo Vercel (Let's Encrypt)

---

## Checklist de Go-Live

- [ ] `npm run build` roda sem erros
- [ ] `npm run dev` funciona localmente
- [ ] Variáveis de ambiente configuradas no provedor
- [ ] Domínio personalizado apontado
- [ ] HTTPS ativo (automático no Vercel/Netlify)
- [ ] Google Analytics / Umami configurado (opcional)
- [ ] Schema do banco criado (`prisma migrate deploy`)
- [ ] Backup automático do banco configurado

---

## Suporte Técnico

Stack utilizada:
- **Frontend:** React 18 + Vite + Tailwind CSS 4 + TypeScript
- **UI:** lucide-react, sonner, recharts
- **Banco:** PostgreSQL 16 via Prisma ORM
- **Deploy:** Vercel (recomendado) ou Netlify
