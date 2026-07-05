import { useState, useMemo, useRef, useEffect } from "react";
import { toast, Toaster } from "sonner";
import {
  Database, Server, Globe, Shield, Zap, Trophy, Star, Award,
  ChevronRight, ArrowRight, Layers, Link2, BarChart3, Image,
  Video, Users, Swords, Calendar, MapPin, Hash, GitBranch, Box,
  Code2, Search, Rss, Medal, TrendingUp, Filter, Heart,
  MessageCircle, Share2, ChevronUp, ChevronDown, X, Plus,
  Check, Upload, AlertCircle, ChevronLeft, Clipboard,
  FileText, Flag, Lock, Mail, Eye, EyeOff,
  User, Phone, LogIn, UserPlus, Bell, Settings,
  ExternalLink, BarChart2, ShieldCheck, ShieldAlert,
  UserCheck, UserX, Clock, Activity, Trash2, Save, Globe2,
  KeyRound, BadgeCheck, CheckCheck, TrendingDown, Percent, Play,
  Menu, QrCode, Download, Printer, Copy, Sparkles,
  Send, Bookmark,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell,
} from "recharts";

type Tab = "landing" | "login" | "feed" | "busca" | "ranking" | "estatisticas" | "perfil" | "proprietario" | "cadastro" | "campeonatos" | "admin" | "configuracoes" | "banco" | "stack" | "certificado";

// ─────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────

const tables = [
  { name: "users", label: "Usuários", color: "border-sky-500/50 bg-sky-950/30", headerColor: "bg-sky-900/60 text-sky-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "name", type: "VARCHAR" }, { name: "email", type: "VARCHAR UNIQUE" }, { name: "phone", type: "VARCHAR" }, { name: "document", type: "VARCHAR" }, { name: "avatar_url", type: "TEXT" }, { name: "bio", type: "TEXT" }, { name: "role", type: "ENUM" }, { name: "created_at", type: "TIMESTAMP" }] },
  { name: "horses", label: "Cavalos", color: "border-amber-500/50 bg-amber-950/30", headerColor: "bg-amber-900/60 text-amber-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "name", type: "VARCHAR NOT NULL" }, { name: "abqm_registration", type: "VARCHAR UNIQUE" }, { name: "birth_date", type: "DATE" }, { name: "sex", type: "ENUM" }, { name: "coat_color", type: "VARCHAR" }, { name: "bio", type: "TEXT" }, { name: "profile_photo_url", type: "TEXT" }, { name: "cover_photo_url", type: "TEXT" }, { name: "breeder_id", type: "UUID → users", fk: true }, { name: "current_owner_id", type: "UUID → users", fk: true }, { name: "sire_id", type: "UUID → horses", fk: true }, { name: "dam_id", type: "UUID → horses", fk: true }, { name: "created_at", type: "TIMESTAMP" }] },
  { name: "championships", label: "Campeonatos", color: "border-emerald-500/50 bg-emerald-950/30", headerColor: "bg-emerald-900/60 text-emerald-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "name", type: "VARCHAR" }, { name: "organization", type: "VARCHAR" }, { name: "year", type: "INTEGER" }, { name: "description", type: "TEXT" }, { name: "logo_url", type: "TEXT" }, { name: "created_at", type: "TIMESTAMP" }] },
  { name: "championship_stages", label: "Etapas", color: "border-emerald-400/40 bg-emerald-950/20", headerColor: "bg-emerald-900/50 text-emerald-300", columns: [{ name: "id", type: "UUID", pk: true }, { name: "championship_id", type: "UUID → championships", fk: true }, { name: "stage_number", type: "INTEGER" }, { name: "name", type: "VARCHAR" }, { name: "start_date", type: "DATE" }, { name: "end_date", type: "DATE" }, { name: "city", type: "VARCHAR" }, { name: "state", type: "CHAR(2)" }] },
  { name: "competitions", label: "Competições / Bolões", color: "border-violet-500/40 bg-violet-950/20", headerColor: "bg-violet-900/50 text-violet-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "stage_id", type: "UUID → championship_stages", fk: true }, { name: "name", type: "VARCHAR" }, { name: "date", type: "DATE" }, { name: "location", type: "VARCHAR" }, { name: "total_prize_pool", type: "NUMERIC(12,2)" }, { name: "status", type: "ENUM" }] },
  { name: "competition_categories", label: "Provas / Categorias", color: "border-violet-400/40 bg-violet-950/15", headerColor: "bg-violet-900/40 text-violet-300", columns: [{ name: "id", type: "UUID", pk: true }, { name: "competition_id", type: "UUID → competitions", fk: true }, { name: "name", type: "VARCHAR" }, { name: "category_type", type: "ENUM" }, { name: "role", type: "ENUM" }, { name: "prize_pool", type: "NUMERIC(12,2)" }, { name: "points_formula", type: "TEXT" }] },
  { name: "horse_competition_results", label: "Resultados / Participações", color: "border-rose-500/40 bg-rose-950/20", headerColor: "bg-rose-900/50 text-rose-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "horse_id", type: "UUID → horses", fk: true }, { name: "category_id", type: "UUID → competition_categories", fk: true }, { name: "rider_id", type: "UUID → users", fk: true }, { name: "partner_horse_id", type: "UUID → horses", fk: true }, { name: "placement", type: "VARCHAR" }, { name: "placement_numeric", type: "INTEGER" }, { name: "prize_money", type: "NUMERIC(12,2)" }, { name: "points_earned", type: "NUMERIC(10,2)" }, { name: "notes", type: "TEXT" }, { name: "registered_at", type: "TIMESTAMP" }] },
  { name: "result_media", label: "Mídia dos Resultados", color: "border-orange-500/40 bg-orange-950/20", headerColor: "bg-orange-900/50 text-orange-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "result_id", type: "UUID → horse_competition_results", fk: true }, { name: "media_type", type: "ENUM" }, { name: "url", type: "TEXT" }, { name: "thumbnail_url", type: "TEXT" }, { name: "caption", type: "TEXT" }, { name: "uploaded_at", type: "TIMESTAMP" }] },
  { name: "abqm_titles", label: "Títulos ABQM", color: "border-yellow-500/40 bg-yellow-950/20", headerColor: "bg-yellow-900/50 text-yellow-200", columns: [{ name: "id", type: "UUID", pk: true }, { name: "horse_id", type: "UUID → horses", fk: true }, { name: "title_name", type: "VARCHAR" }, { name: "title_type", type: "ENUM" }, { name: "year", type: "INTEGER" }, { name: "event", type: "VARCHAR" }, { name: "certificate_url", type: "TEXT" }, { name: "verified", type: "BOOLEAN" }, { name: "verified_by", type: "UUID → users", fk: true }] },
  { name: "horse_ownership_history", label: "Histórico de Proprietários", color: "border-sky-400/30 bg-sky-950/15", headerColor: "bg-sky-900/40 text-sky-300", columns: [{ name: "id", type: "UUID", pk: true }, { name: "horse_id", type: "UUID → horses", fk: true }, { name: "owner_id", type: "UUID → users", fk: true }, { name: "acquired_at", type: "DATE" }, { name: "transferred_at", type: "DATE NULL" }, { name: "transfer_value", type: "NUMERIC(12,2)" }, { name: "notes", type: "TEXT" }] },
];

const stackItems = [
  { layer: "Frontend", icon: Globe, color: "text-sky-400", bg: "bg-sky-950/40 border-sky-500/30", items: [{ name: "Next.js 15", role: "Framework React com App Router, SSR e SSG", badge: "Core" }, { name: "TypeScript", role: "Type safety em todo o projeto", badge: "Core" }, { name: "Tailwind CSS", role: "Estilização utilitária e design system", badge: "Core" }, { name: "shadcn/ui", role: "Componentes acessíveis e customizáveis", badge: "UI" }, { name: "TanStack Query", role: "Cache, refetch e estado de servidor", badge: "Data" }, { name: "Recharts", role: "Gráficos de evolução de pontos e prêmios", badge: "Data" }, { name: "Zustand", role: "Estado global leve (filtros, UI state)", badge: "State" }] },
  { layer: "Backend / API", icon: Server, color: "text-emerald-400", bg: "bg-emerald-950/40 border-emerald-500/30", items: [{ name: "Node.js + Fastify", role: "API REST de alta performance com plugins", badge: "Core" }, { name: "Prisma ORM", role: "Schema type-safe, migrations e queries", badge: "Core" }, { name: "Zod", role: "Validação de schemas e DTOs na API", badge: "Validação" }, { name: "Bull / BullMQ", role: "Filas para processamento de imagens e notificações", badge: "Jobs" }, { name: "JWT + Refresh Tokens", role: "Autenticação stateless escalável", badge: "Auth" }] },
  { layer: "Banco de Dados & Storage", icon: Database, color: "text-amber-400", bg: "bg-amber-950/40 border-amber-500/30", items: [{ name: "PostgreSQL 16", role: "Banco relacional principal (ACID, full-text search)", badge: "Core" }, { name: "Redis", role: "Cache de rankings, sessions e rate-limiting", badge: "Cache" }, { name: "Cloudflare R2", role: "Storage de fotos (S3-compatible, sem egress)", badge: "Storage" }, { name: "Cloudflare Images", role: "CDN + resize automático para fotos de perfil/capa", badge: "CDN" }] },
  { layer: "Infraestrutura & DevOps", icon: Layers, color: "text-violet-400", bg: "bg-violet-950/40 border-violet-500/30", items: [{ name: "Vercel", role: "Deploy do frontend Next.js com edge functions", badge: "Deploy" }, { name: "Railway / Render", role: "Deploy da API Node.js com scaling automático", badge: "Deploy" }, { name: "GitHub Actions", role: "CI/CD: lint, testes, migrations e deploy", badge: "CI/CD" }, { name: "Sentry", role: "Monitoramento de erros em produção", badge: "Observ." }] },
  { layer: "Segurança & Qualidade", icon: Shield, color: "text-rose-400", bg: "bg-rose-950/40 border-rose-500/30", items: [{ name: "Helmet.js", role: "Headers de segurança HTTP na API", badge: "Sec" }, { name: "Rate Limiting", role: "Proteção contra abuso via Redis", badge: "Sec" }, { name: "Vitest + Playwright", role: "Testes unitários e E2E automatizados", badge: "QA" }, { name: "ESLint + Prettier", role: "Padronização de código no monorepo", badge: "QA" }] },
];

const mockResults = [
  { championship: "Circuito AVACE", stage: "3ª Etapa", competition: "Vaquejada do Parque Ecológico", category: "Profissional Puxador", placement: "1º Lugar", prize: 8500, points: 120, date: "Abr 2025", city: "Mossoró, RN" },
  { championship: "Circuito AVACE", stage: "2ª Etapa", competition: "Vaquejada da Serra", category: "Derby Open", placement: "Rachou o Prêmio", prize: 4200, points: 90, date: "Mar 2025", city: "Caruaru, PE" },
  { championship: "Liga Nordestina", stage: "1ª Etapa", competition: "Vaquejada do Vaqueiro", category: "Profissional Puxador", placement: "2º Lugar", prize: 5000, points: 100, date: "Fev 2025", city: "Campina Grande, PB" },
  { championship: "Circuito AVACE", stage: "1ª Etapa", competition: "Festival Nordeste Show", category: "Aspirante", placement: "1º Lugar", prize: 3000, points: 80, date: "Jan 2025", city: "Fortaleza, CE" },
];

const chartData = [
  { mes: "Jan", pontos: 80, premios: 3000 },
  { mes: "Fev", pontos: 180, premios: 8000 },
  { mes: "Mar", pontos: 270, premios: 12200 },
  { mes: "Abr", pontos: 390, premios: 20700 },
];

const genealogy = [
  { role: "Pai (Sire)", name: "Rei do Brejo", abqm: "Q-824.613", detail: "Campeão Nacional ABQM 2019" },
  { role: "Mãe (Dam)", name: "Estrela do Sertão", abqm: "Q-791.245", detail: "Potro do Futuro 2016" },
  { role: "Avô Paterno", name: "Duque de Ouro", abqm: "Q-720.100", detail: "" },
  { role: "Avó Paterna", name: "Princesa Serrana", abqm: "Q-704.388", detail: "" },
  { role: "Avô Materno", name: "Flash do Nordeste", abqm: "Q-698.771", detail: "" },
  { role: "Avó Materna", name: "Lua Cheia do Vale", abqm: "Q-680.002", detail: "" },
];

const abqmTitles = [
  { name: "Registro de Mérito em Vaquejada", year: 2024, event: "Nacional ABQM", icon: Award },
  { name: "Campeão Nordestino", year: 2024, event: "Circuito AVACE", icon: Trophy },
  { name: "Potro do Futuro", year: 2022, event: "ABQM Nordeste", icon: Star },
];

const feedPosts = [
  { id: 1, type: "resultado", horse: "Trovão do Nordeste", horseAbqm: "Q-912.847", owner: "José Raimundo Santos", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format", horsePhoto: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=400&h=260&fit=crop&auto=format", action: "conquistou 1º lugar na prova Profissional Puxador", competition: "Vaquejada do Parque Ecológico · Circuito AVACE 3ª Etapa", prize: "R$ 8.500", points: "+120 pts", time: "2 horas atrás", likes: 347, comments: 42, city: "Mossoró, RN" },
  { id: 2, type: "titulo", horse: "Fumaça da Caatinga", horseAbqm: "Q-887.332", owner: "Haras Sertão Vivo", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&auto=format", horsePhoto: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=400&h=260&fit=crop&auto=format", action: "recebeu o título oficial de Registro de Mérito em Vaquejada (ABQM)", competition: "Associação Brasileira do Cavalo Quarto de Milha", prize: null, points: null, time: "5 horas atrás", likes: 892, comments: 118, city: "Fortaleza, CE" },
  { id: 3, type: "resultado", horse: "Relâmpago do Norte", horseAbqm: "Q-905.001", owner: "Marcos Andrade", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&auto=format", horsePhoto: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=260&fit=crop&auto=format", action: "rachou o prêmio da prova Derby Open", competition: "Festival do Boi · Liga Nordestina 2ª Etapa", prize: "R$ 6.200", points: "+90 pts", time: "1 dia atrás", likes: 214, comments: 27, city: "Campina Grande, PB" },
];

const rankingData = [
  { pos: 1, name: "Trovão do Nordeste", abqm: "Q-912.847", owner: "José Raimundo Santos", points: 1840, prize: 87400, wins: 12, participations: 18, trend: "up", photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=48&h=48&fit=crop&auto=format", coat: "Alazão", sex: "Macho" },
  { pos: 2, name: "Fumaça da Caatinga", abqm: "Q-887.332", owner: "Haras Sertão Vivo", points: 1720, prize: 74200, wins: 10, participations: 16, trend: "up", photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=48&h=48&fit=crop&auto=format", coat: "Tordilho", sex: "Macho" },
  { pos: 3, name: "Rainha do Agreste", abqm: "Q-899.114", owner: "Fazenda Boa Esperança", points: 1610, prize: 68000, wins: 9, participations: 15, trend: "down", photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=48&h=48&fit=crop&auto=format", coat: "Castanha", sex: "Fêmea" },
  { pos: 4, name: "Relâmpago do Norte", abqm: "Q-905.001", owner: "Marcos Andrade", points: 1540, prize: 61500, wins: 8, participations: 17, trend: "up", photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=48&h=48&fit=crop&auto=format", coat: "Ruão", sex: "Macho" },
  { pos: 5, name: "Estrela Dalva III", abqm: "Q-874.220", owner: "Haras Serra Bonita", points: 1480, prize: 57300, wins: 7, participations: 14, trend: "stable", photo: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=48&h=48&fit=crop&auto=format", coat: "Alazã Escura", sex: "Fêmea" },
  { pos: 6, name: "Cangaceiro do Brejo", abqm: "Q-918.556", owner: "Pedro Cândido Neto", points: 1390, prize: 52100, wins: 7, participations: 19, trend: "down", photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=48&h=48&fit=crop&auto=format", coat: "Tordilho Mosqueado", sex: "Macho" },
  { pos: 7, name: "Brisa da Caatinga", abqm: "Q-891.003", owner: "Haras Vale Verde", points: 1310, prize: 48700, wins: 6, participations: 13, trend: "up", photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=48&h=48&fit=crop&auto=format", coat: "Rosilha", sex: "Fêmea" },
  { pos: 8, name: "Coronel do Sertão", abqm: "Q-903.788", owner: "Ana Paula Ferreira", points: 1240, prize: 44200, wins: 5, participations: 15, trend: "stable", photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=48&h=48&fit=crop&auto=format", coat: "Zaino", sex: "Macho" },
];

const searchHorses = [
  { name: "Trovão do Nordeste", abqm: "Q-912.847", sex: "Macho", coat: "Alazão", owner: "José Raimundo Santos", points: 1840, prize: 87400, photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=80&h=80&fit=crop&auto=format", titles: 3 },
  { name: "Fumaça da Caatinga", abqm: "Q-887.332", sex: "Macho", coat: "Tordilho", owner: "Haras Sertão Vivo", points: 1720, prize: 74200, photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=80&h=80&fit=crop&auto=format", titles: 2 },
  { name: "Rainha do Agreste", abqm: "Q-899.114", sex: "Fêmea", coat: "Castanha", owner: "Fazenda Boa Esperança", points: 1610, prize: 68000, photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=80&h=80&fit=crop&auto=format", titles: 1 },
  { name: "Relâmpago do Norte", abqm: "Q-905.001", sex: "Macho", coat: "Ruão", owner: "Marcos Andrade", points: 1540, prize: 61500, photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=80&h=80&fit=crop&auto=format", titles: 0 },
  { name: "Estrela Dalva III", abqm: "Q-874.220", sex: "Fêmea", coat: "Alazã Escura", owner: "Haras Serra Bonita", points: 1480, prize: 57300, photo: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=80&h=80&fit=crop&auto=format", titles: 2 },
  { name: "Cangaceiro do Brejo", abqm: "Q-918.556", sex: "Macho", coat: "Tordilho Mosqueado", owner: "Pedro Cândido Neto", points: 1390, prize: 52100, photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=80&h=80&fit=crop&auto=format", titles: 1 },
];

const championshipsData = [
  {
    id: 1, name: "Circuito AVACE 2025", org: "AVACE", year: 2025,
    totalPrize: 820000, status: "ongoing",
    stages: [
      { id: 1, n: "1ª Etapa", city: "Fortaleza", state: "CE", date: "18–20 Jan 2025", status: "finished", competitions: [{ name: "Vaquejada Festival Nordeste Show", prize: 120000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Aspirante", "Derby Open"], results: 248 }] },
      { id: 2, n: "2ª Etapa", city: "Caruaru", state: "PE", date: "15–17 Mar 2025", status: "finished", competitions: [{ name: "Vaquejada da Serra", prize: 180000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Derby Open", "Mirim"], results: 312 }] },
      { id: 3, n: "3ª Etapa", city: "Mossoró", state: "RN", date: "12–14 Abr 2025", status: "finished", competitions: [{ name: "Vaquejada do Parque Ecológico", prize: 200000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Aspirante", "Derby Open", "Mirim", "Feminino"], results: 389 }] },
      { id: 4, n: "4ª Etapa", city: "Campina Grande", state: "PB", date: "12–14 Jul 2025", status: "upcoming", competitions: [{ name: "Vaquejada do Vaqueiro Paraibano", prize: 220000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Derby Open"], results: 0 }] },
    ],
  },
  {
    id: 2, name: "Liga Nordestina de Vaquejada 2025", org: "LNV", year: 2025,
    totalPrize: 540000, status: "ongoing",
    stages: [
      { id: 5, n: "1ª Etapa", city: "Natal", state: "RN", date: "08–10 Fev 2025", status: "finished", competitions: [{ name: "Vaquejada do Vaqueiro", prize: 150000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador"], results: 201 }] },
      { id: 6, n: "2ª Etapa", city: "Recife", state: "PE", date: "22–24 Mar 2025", status: "finished", competitions: [{ name: "Festival do Boi", prize: 180000, categories: ["Profissional Puxador", "Amador", "Derby Open"], results: 267 }] },
      { id: 7, n: "3ª Etapa", city: "João Pessoa", state: "PB", date: "02–04 Ago 2025", status: "upcoming", competitions: [{ name: "Vaquejada Capital da Paraíba", prize: 210000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Aspirante", "Derby Open", "Mirim"], results: 0 }] },
    ],
  },
  {
    id: 3, name: "Campeonato Cearense 2025", org: "FCVAQ", year: 2025,
    totalPrize: 280000, status: "upcoming",
    stages: [
      { id: 8, n: "Única Etapa", city: "Fortaleza", state: "CE", date: "20–22 Set 2025", status: "upcoming", competitions: [{ name: "Grande Final Cearense", prize: 280000, categories: ["Profissional Puxador", "Profissional Esteireiro", "Amador", "Derby Open", "Mirim", "Feminino"], results: 0 }] },
    ],
  },
];

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ placeholder, value, onChange, type = "text" }: { placeholder?: string; value?: string; onChange?: (v: string) => void; type?: string }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors w-full"
    />
  );
}

function Select({ options, value, onChange }: { options: string[]; value?: string; onChange?: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors w-full appearance-none"
    >
      <option value="">Selecionar…</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function Textarea({ placeholder, rows = 3 }: { placeholder?: string; rows?: number }) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors w-full resize-none"
    />
  );
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${done ? "bg-primary border-primary text-primary-foreground" : active ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
      {done ? <Check className="w-4 h-4" /> : n}
    </div>
  );
}

// ─────────────────────────────────────────────
// CADASTRO (multi-step form)
// ─────────────────────────────────────────────

const STEPS = [
  { label: "Identificação", icon: Clipboard },
  { label: "Genealogia", icon: GitBranch },
  { label: "Fotos", icon: Image },
  { label: "Revisão", icon: Check },
];

function Cadastro() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "", abqm: "", birthDate: "", sex: "", coat: "", bio: "",
    owner: "", breeder: "",
    sire: "", dam: "",
    sireGrandSire: "", sireGrandDam: "", damGrandSire: "", damGrandDam: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const coats = ["Alazão", "Alazã Escura", "Castanho", "Zaino", "Tordilho", "Tordilho Mosqueado", "Ruão", "Rosilho", "Lobuno", "Palomino", "Cremelo"];
  const sexOptions = ["Macho", "Fêmea", "Castrado"];

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-full bg-emerald-900/40 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Cavalo Cadastrado!</h2>
        <p className="text-muted-foreground text-sm mb-2"><span className="text-foreground font-semibold">{form.name || "Novo Cavalo"}</span> foi registrado com sucesso na plataforma.</p>
        <p className="text-xs text-muted-foreground mb-8">O perfil já está disponível para visualização. Você pode adicionar resultados de provas a qualquer momento.</p>
        <button onClick={() => { setSubmitted(false); setStep(0); setForm({ name: "", abqm: "", birthDate: "", sex: "", coat: "", bio: "", owner: "", breeder: "", sire: "", dam: "", sireGrandSire: "", sireGrandDam: "", damGrandSire: "", damGrandDam: "" }); }} className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">
          Cadastrar Outro Cavalo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Cadastrar Cavalo</h2>
        <p className="text-sm text-muted-foreground">Preencha os dados do animal. Apenas nome e proprietário são obrigatórios.</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-10">
        {STEPS.map((s, i) => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 flex-1">
                <StepDot n={i + 1} active={step === i} done={step > i} />
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${step === i ? "text-primary" : step > i ? "text-muted-foreground" : "text-muted-foreground/50"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-1 mb-4 transition-colors ${step > i ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 0: Identificação */}
      {step === 0 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Dados Básicos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nome do Cavalo" required>
                <Input placeholder="Ex: Trovão do Nordeste" value={form.name} onChange={set("name")} />
              </Field>
              <Field label="Registro ABQM">
                <Input placeholder="Ex: Q-912.847" value={form.abqm} onChange={set("abqm")} />
              </Field>
              <Field label="Data de Nascimento">
                <Input type="date" value={form.birthDate} onChange={set("birthDate")} />
              </Field>
              <Field label="Sexo">
                <Select options={sexOptions} value={form.sex} onChange={set("sex")} />
              </Field>
              <Field label="Pelagem">
                <Select options={coats} value={form.coat} onChange={set("coat")} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pessoas Envolvidas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Proprietário Atual" required>
                <Input placeholder="Nome ou buscar usuário…" value={form.owner} onChange={set("owner")} />
              </Field>
              <Field label="Criador">
                <Input placeholder="Haras ou pessoa física" value={form.breeder} onChange={set("breeder")} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Resumo Biográfico</h3>
            <Field label="Descrição do Animal">
              <Textarea placeholder="Conte a história do cavalo, suas características marcantes, conquistas iniciais…" rows={4} />
            </Field>
          </div>
        </div>
      )}

      {/* Step 1: Genealogia */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-4 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Os campos de genealogia aceitam o <span className="text-foreground font-medium">Registro ABQM</span> ou o <span className="text-foreground font-medium">nome</span> do cavalo. O sistema busca automaticamente o perfil correspondente. Os avós são calculados a partir do sire e dam — preencha aqui para registro explícito.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Pais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Pai (Sire)">
                <Input placeholder="Reg. ABQM ou nome" value={form.sire} onChange={set("sire")} />
              </Field>
              <Field label="Mãe (Dam)">
                <Input placeholder="Reg. ABQM ou nome" value={form.dam} onChange={set("dam")} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Avós Paternos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Avô Paterno (Sire do Pai)">
                <Input placeholder="Reg. ABQM ou nome" value={form.sireGrandSire} onChange={set("sireGrandSire")} />
              </Field>
              <Field label="Avó Paterna (Dam do Pai)">
                <Input placeholder="Reg. ABQM ou nome" value={form.sireGrandDam} onChange={set("sireGrandDam")} />
              </Field>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Avós Maternos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Avô Materno (Sire da Mãe)">
                <Input placeholder="Reg. ABQM ou nome" value={form.damGrandSire} onChange={set("damGrandSire")} />
              </Field>
              <Field label="Avó Materna (Dam da Mãe)">
                <Input placeholder="Reg. ABQM ou nome" value={form.damGrandDam} onChange={set("damGrandDam")} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Fotos */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Foto de Capa</h3>
            <div className="relative border-2 border-dashed border-border rounded-xl h-40 flex flex-col items-center justify-center gap-3 hover:border-primary/40 transition-colors cursor-pointer group">
              <div
                className="absolute inset-0 rounded-xl bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url(https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=800&h=300&fit=crop&auto=format)" }}
              />
              <Upload className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors relative" />
              <div className="text-center relative">
                <p className="text-sm font-medium text-foreground">Arraste a foto de capa</p>
                <p className="text-xs text-muted-foreground">PNG, JPG — Recomendado 1200×400px</p>
              </div>
              <button className="relative text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-1.5 rounded-full transition-colors">
                Selecionar Arquivo
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Foto de Perfil</h3>
            <div className="flex items-center gap-6">
              <div className="relative border-2 border-dashed border-border rounded-xl w-32 h-32 flex flex-col items-center justify-center gap-2 hover:border-primary/40 transition-colors cursor-pointer group shrink-0">
                <img src="https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=128&h=128&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-25" />
                <Upload className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors relative" />
                <p className="text-[10px] text-muted-foreground relative text-center">Foto de Perfil</p>
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                <p className="font-semibold text-foreground mb-1">Foto quadrada do animal</p>
                <p>Recomendado <span className="font-mono text-xs text-primary">400×400px</span> ou maior.</p>
                <p className="mt-1">A foto de perfil aparece em cards de busca, ranking e feed.</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Galeria Inicial</h3>
            <p className="text-xs text-muted-foreground">Adicione fotos para a galeria do perfil. Você pode adicionar mais fotos depois em cada resultado de prova.</p>
            <div className="grid grid-cols-3 gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border-2 border-dashed border-border rounded-xl h-28 flex flex-col items-center justify-center gap-1 hover:border-primary/40 transition-colors cursor-pointer">
                  <Plus className="w-5 h-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">Adicionar</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Revisão */}
      {step === 3 && (
        <div className="space-y-5">
          <div className="rounded-xl border border-primary/30 bg-card overflow-hidden">
            <div className="bg-primary/10 px-6 py-4 border-b border-primary/20">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Resumo do Cadastro</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {[
                  { label: "Nome", val: form.name || "—" },
                  { label: "Registro ABQM", val: form.abqm || "—" },
                  { label: "Nascimento", val: form.birthDate || "—" },
                  { label: "Sexo", val: form.sex || "—" },
                  { label: "Pelagem", val: form.coat || "—" },
                  { label: "Proprietário", val: form.owner || "—" },
                  { label: "Criador", val: form.breeder || "—" },
                  { label: "Pai (Sire)", val: form.sire || "—" },
                  { label: "Mãe (Dam)", val: form.dam || "—" },
                  { label: "Avô Paterno", val: form.sireGrandSire || "—" },
                  { label: "Avó Paterna", val: form.sireGrandDam || "—" },
                  { label: "Avô Materno", val: form.damGrandSire || "—" },
                  { label: "Avó Materna", val: form.damGrandDam || "—" },
                ].map((r) => (
                  <div key={r.label}>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.label}</div>
                    <div className={`text-sm mt-0.5 ${r.val === "—" ? "text-muted-foreground/40 italic" : "text-foreground font-medium"}`}>{r.val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {!form.name && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-950/20 p-4 flex items-center gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-xs text-rose-300">O <span className="font-semibold">nome do cavalo</span> é obrigatório para finalizar o cadastro.</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Anterior
        </button>

        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === step ? "bg-primary w-4" : i < step ? "bg-primary/60" : "bg-border"}`} />
          ))}
        </div>

        {step < STEPS.length - 1 ? (
          <button
            onClick={() => setStep((s) => s + 1)}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors"
          >
            Próximo <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => { if (form.name) { setSubmitted(true); toast.success(`${form.name} cadastrado com sucesso!`, { description: "O perfil já está disponível na plataforma." }); } }}
            disabled={!form.name}
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 px-5 py-2 rounded-lg transition-opacity disabled:opacity-40 disabled:pointer-events-none"
          >
            <Check className="w-4 h-4" /> Finalizar Cadastro
          </button>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CAMPEONATOS
// ─────────────────────────────────────────────

type ResultModalData = { stage: string; competition: string; category: string } | null;

function ResultModal({ data, onClose }: { data: ResultModalData; onClose: () => void }) {
  const [saved, setSaved] = useState(false);
  if (!data) return null;

  const placements = ["1º Lugar", "2º Lugar", "3º Lugar", "4º Lugar", "5º Lugar", "Rachou o Prêmio", "Participação"];

  if (saved) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl p-8 max-w-sm w-full mx-4 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-900/40 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Resultado Lançado!</h3>
          <p className="text-sm text-muted-foreground mb-6">Os pontos e prêmios foram somados automaticamente ao perfil do cavalo.</p>
          <button onClick={onClose} className="w-full py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity">Fechar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Lançar Resultado</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{data.competition} · {data.category}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <Field label="Cavalo" required>
            <Input placeholder="Buscar por nome ou Registro ABQM…" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Cavalo Parceiro">
              <Input placeholder="Puxador ou Esteireiro" />
            </Field>
            <Field label="Vaqueiro (Rider)">
              <Input placeholder="Nome do vaqueiro" />
            </Field>
          </div>

          <Field label="Colocação / Resultado" required>
            <Select options={placements} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Prêmio em R$">
              <Input placeholder="0,00" type="number" />
            </Field>
            <Field label="Pontos Obtidos">
              <Input placeholder="0" type="number" />
            </Field>
          </div>

          <Field label="Observações">
            <Textarea placeholder="Notas adicionais sobre a apresentação…" rows={2} />
          </Field>

          <div className="rounded-lg border border-border bg-secondary/30 p-4 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mídia da Prova</p>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload de Fotos
              </button>
              <button className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-2 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors">
                <Video className="w-3.5 h-3.5" /> Link YouTube/Vimeo
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={() => { setSaved(true); toast.success("Resultado lançado!", { description: "Pontos e prêmios somados automaticamente ao perfil do cavalo." }); }} className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity">
            Salvar Resultado
          </button>
        </div>
      </div>
    </div>
  );
}

function Campeonatos() {
  const [selectedChampionship, setSelectedChampionship] = useState<number | null>(null);
  const [expandedStage, setExpandedStage] = useState<number | null>(null);
  const [modal, setModal] = useState<ResultModalData>(null);

  const statusBadge = (s: string) => {
    if (s === "finished") return <span className="text-[10px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full">Encerrada</span>;
    if (s === "ongoing") return <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded-full">Em Andamento</span>;
    return <span className="text-[10px] font-bold text-amber-400 bg-amber-900/40 px-2 py-0.5 rounded-full">Em Breve</span>;
  };

  const championship = selectedChampionship !== null ? championshipsData.find((c) => c.id === selectedChampionship) : null;

  if (championship) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => { setSelectedChampionship(null); setExpandedStage(null); }} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ChevronLeft className="w-4 h-4" /> Todos os Campeonatos
        </button>

        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{championship.org} · {championship.year}</div>
              <h2 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{championship.name}</h2>
            </div>
            <div className="flex gap-4 text-center shrink-0">
              <div>
                <div className="text-xl font-bold text-emerald-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {championship.totalPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total em Prêmios</div>
              </div>
              <div>
                <div className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{championship.stages.length}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Etapas</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {championship.stages.map((stage) => (
            <div key={stage.id} className="rounded-xl border border-border bg-card overflow-hidden">
              <button
                onClick={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Flag className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-foreground">{stage.n}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{stage.city}, {stage.state}</div>
                      <span className="text-muted-foreground">·</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{stage.date}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {statusBadge(stage.status)}
                  <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${expandedStage === stage.id ? "rotate-90" : ""}`} />
                </div>
              </button>

              {expandedStage === stage.id && (
                <div className="border-t border-border px-5 py-4 space-y-4">
                  {stage.competitions.map((comp) => (
                    <div key={comp.name} className="rounded-lg border border-border bg-secondary/20 p-4 space-y-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{comp.name}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-bold text-emerald-400">{comp.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span>
                            {comp.results > 0 && <span className="text-xs text-muted-foreground">{comp.results} resultados registrados</span>}
                          </div>
                        </div>
                        {stage.status === "finished" && (
                          <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground border border-border hover:border-primary/40 hover:text-primary px-3 py-1.5 rounded-lg transition-colors shrink-0">
                            <FileText className="w-3.5 h-3.5" /> Ver Resultados
                          </button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Provas / Categorias</p>
                        <div className="flex flex-wrap gap-2">
                          {comp.categories.map((cat) => (
                            <button
                              key={cat}
                              onClick={() => stage.status !== "finished" ? undefined : setModal({ stage: stage.n, competition: comp.name, category: cat })}
                              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${stage.status === "finished" ? "border-primary/30 text-primary bg-primary/5 hover:bg-primary/15 cursor-pointer" : "border-border text-muted-foreground cursor-default"}`}
                            >
                              {cat}
                              {stage.status === "finished" && <Plus className="w-3 h-3 inline ml-1" />}
                            </button>
                          ))}
                        </div>
                        {stage.status === "finished" && (
                          <p className="text-[10px] text-muted-foreground">Clique em uma prova para lançar resultado de um cavalo.</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <ResultModal data={modal} onClose={() => setModal(null)} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Campeonatos</h2>
          <p className="text-sm text-muted-foreground mt-1">Selecione um campeonato para ver etapas, competições e lançar resultados.</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> Novo Campeonato
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {championshipsData.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedChampionship(c.id)}
            className="rounded-xl border border-border bg-card p-5 text-left hover:border-primary/30 hover:bg-secondary/20 transition-all group"
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{c.org} · {c.year}</span>
                  {statusBadge(c.status)}
                </div>
                <h3 className="text-lg font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{c.name}</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
            </div>

            <div className="flex items-center gap-6 mt-4 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flag className="w-3.5 h-3.5" />
                <span><span className="text-foreground font-semibold">{c.stages.length}</span> etapas</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">{c.totalPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span>
                <span>em prêmios</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Medal className="w-3.5 h-3.5" />
                <span><span className="text-foreground font-semibold">{c.stages.reduce((a, s) => a + s.competitions.reduce((b, comp) => b + comp.results, 0), 0)}</span> resultados</span>
              </div>
            </div>

            <div className="flex gap-1.5 mt-4 overflow-x-auto">
              {c.stages.map((s) => (
                <div key={s.id} className={`shrink-0 text-[10px] font-medium px-2.5 py-1 rounded-full border ${s.status === "finished" ? "border-slate-600 text-slate-400 bg-slate-800/40" : s.status === "ongoing" ? "border-emerald-600/50 text-emerald-400 bg-emerald-900/20" : "border-amber-600/30 text-amber-400 bg-amber-900/10"}`}>
                  {s.n}
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// TABLE + STACK HELPERS
// ─────────────────────────────────────────────

function TableCard({ table }: { table: (typeof tables)[0] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-lg border ${table.color} transition-all duration-200`}>
      <button onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-4 py-3 text-left">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${table.headerColor}`}>{table.name}</span>
          <span className="text-xs text-muted-foreground">{table.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{table.columns.length} cols</span>
          <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>
      {open && (
        <div className="border-t border-border/50 divide-y divide-border/30">
          {table.columns.map((col) => (
            <div key={col.name} className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-2">
                {col.pk && <span className="text-[9px] font-bold text-amber-400 bg-amber-900/50 px-1 rounded">PK</span>}
                {col.fk && <Link2 className="w-3 h-3 text-violet-400 shrink-0" />}
                {!col.pk && !col.fk && <div className="w-3 h-3 shrink-0" />}
                <span className="text-xs font-mono text-foreground/90">{col.name}</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">{col.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StackLayer({ item }: { item: (typeof stackItems)[0] }) {
  const Icon = item.icon;
  const badgeColors: Record<string, string> = {
    Core: "bg-foreground/10 text-foreground/70", UI: "bg-sky-900/60 text-sky-300",
    Data: "bg-amber-900/60 text-amber-300", State: "bg-emerald-900/60 text-emerald-300",
    Auth: "bg-rose-900/60 text-rose-300", Jobs: "bg-violet-900/60 text-violet-300",
    Cache: "bg-orange-900/60 text-orange-300", Storage: "bg-cyan-900/60 text-cyan-300",
    CDN: "bg-teal-900/60 text-teal-300", Deploy: "bg-blue-900/60 text-blue-300",
    "CI/CD": "bg-indigo-900/60 text-indigo-300", "Observ.": "bg-yellow-900/60 text-yellow-300",
    Validação: "bg-lime-900/60 text-lime-300", Sec: "bg-red-900/60 text-red-300",
    QA: "bg-purple-900/60 text-purple-300",
  };
  return (
    <div className={`rounded-xl border p-5 ${item.bg}`}>
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${item.color}`} />
        <h3 className="text-sm font-semibold" style={{ fontFamily: "'Playfair Display', serif" }}>{item.layer}</h3>
      </div>
      <div className="flex flex-col gap-2.5">
        {item.items.map((tech) => (
          <div key={tech.name} className="flex items-start gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="text-sm font-semibold text-foreground">{tech.name}</span>
                <p className="text-xs text-muted-foreground leading-relaxed">{tech.role}</p>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 ${badgeColors[tech.badge] || "bg-foreground/10 text-foreground/70"}`}>{tech.badge}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HORSE PROFILE
// ─────────────────────────────────────────────

function HorseProfile() {
  const [activeTab, setActiveTab] = useState<"historico" | "evolucao" | "genealogia" | "titulos">("historico");
  const [shareResult, setShareResult] = useState<ShareResult | null>(null);
  return (
    <div className="max-w-4xl mx-auto">
      {shareResult && <ResultShareCard result={shareResult} onClose={() => setShareResult(null)} />}
      <div className="relative rounded-xl overflow-hidden mb-0">
        <div className="h-52 bg-cover bg-center" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=1200&h=400&fit=crop&auto=format)", backgroundColor: "#2a1c0a" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end gap-5">
          <div className="relative shrink-0">
            <img src="https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=120&h=120&fit=crop&auto=format" alt="Trovão do Nordeste" className="w-24 h-24 rounded-xl border-4 border-card object-cover" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-card" />
          </div>
          <div className="mb-1 flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>Trovão do Nordeste</h2>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="text-xs font-mono text-muted-foreground">ABQM Q-912.847</span>
              <span className="text-xs text-muted-foreground">Macho · Alazão · Nasc. 15/03/2020</span>
            </div>
          </div>
          <div className="hidden md:flex gap-4 mb-1 shrink-0">
            {[{ label: "Pontos", val: "1.840" }, { label: "Prêmios", val: "R$ 87,4k" }, { label: "Vitórias", val: "12" }].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card border border-border border-t-0 px-6 py-3 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5" />Proprietário: <span className="text-foreground font-medium">José Raimundo Santos</span></div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Star className="w-3.5 h-3.5" />Criador: <span className="text-foreground font-medium">Haras Brejo Fundo</span></div>
      </div>

      <div className="bg-card border border-border border-t-0 px-6 py-4">
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          "Filho do renomado <span className="text-foreground font-medium">Rei do Brejo</span> com a premiada <span className="text-foreground font-medium">Estrela do Sertão</span>, Trovão do Nordeste herdou a bravura e a docilidade que definem os grandes campeões."
        </p>
      </div>

      <div className="bg-card border border-border border-t-0 rounded-b-xl overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {([
            { id: "historico", label: "Histórico de Provas", icon: BarChart3 },
            { id: "evolucao", label: "Evolução", icon: TrendingUp },
            { id: "genealogia", label: "Genealogia", icon: GitBranch },
            { id: "titulos", label: "Títulos ABQM", icon: Award },
          ] as const).map((t) => {
            const TIcon = t.icon;
            return (
              <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <TIcon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "historico" && (
            <div className="space-y-3">
              {mockResults.map((r, i) => (
                <div key={i} className="rounded-lg border border-border bg-secondary/30 p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">{r.championship}</span>
                        <span className="text-[10px] text-muted-foreground">{r.stage} · {r.category}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{r.competition}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="w-3 h-3" />{r.date}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{r.city}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Colocação</div>
                        <div className={`text-sm font-bold ${r.placement.includes("1º") ? "text-amber-400" : r.placement.includes("2º") ? "text-slate-300" : "text-primary"}`}>{r.placement}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Prêmio</div>
                        <div className="text-sm font-bold text-emerald-400">{r.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Pontos</div>
                        <div className="text-sm font-bold text-primary">+{r.points}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded px-2 py-0.5"><Image className="w-3 h-3" /> Fotos</button>
                    <button className="text-[10px] flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors border border-border/50 rounded px-2 py-0.5"><Video className="w-3 h-3" /> Vídeos</button>
                    <button
                      onClick={() => setShareResult({
                        horse: "Trovão do Nordeste", abqm: "Q-912.847",
                        photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=80&h=80&fit=crop&auto=format",
                        placement: r.placement, category: r.category,
                        competition: r.competition, championship: r.championship,
                        city: r.city, date: r.date, prize: r.prize, points: r.points,
                      })}
                      className="text-[10px] flex items-center gap-1 text-primary hover:opacity-80 transition-opacity border border-primary/30 bg-primary/5 rounded px-2 py-0.5 ml-auto"
                    >
                      <Share2 className="w-3 h-3" /> Compartilhar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "evolucao" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Acumulado de Pontos — 2025</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="gradPontos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#c9902a" stopOpacity={0.3} /><stop offset="95%" stopColor="#c9902a" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="mes" tick={{ fill: "#9a7d52", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9a7d52", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#231608", border: "1px solid rgba(201,144,42,0.2)", borderRadius: 6, color: "#f5ead6", fontSize: 12 }} />
                    <Area type="monotone" dataKey="pontos" stroke="#c9902a" strokeWidth={2} fill="url(#gradPontos)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Prêmios Acumulados (R$) — 2025</p>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData}>
                    <defs><linearGradient id="gradPremios" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} /><stop offset="95%" stopColor="#4ade80" stopOpacity={0} /></linearGradient></defs>
                    <XAxis dataKey="mes" tick={{ fill: "#9a7d52", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9a7d52", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={{ backgroundColor: "#231608", border: "1px solid rgba(201,144,42,0.2)", borderRadius: 6, color: "#f5ead6", fontSize: 12 }} formatter={(v: number) => [`R$ ${v.toLocaleString("pt-BR")}`, "Prêmios"]} />
                    <Area type="monotone" dataKey="premios" stroke="#4ade80" strokeWidth={2} fill="url(#gradPremios)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "genealogia" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {genealogy.map((g) => (
                <div key={g.role} className="rounded-lg border border-border bg-secondary/30 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{g.role}</div>
                  <div className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{g.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-muted-foreground">{g.abqm}</span>
                    {g.detail && <><span className="text-muted-foreground">·</span><span className="text-[10px] text-primary">{g.detail}</span></>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "titulos" && (
            <div className="space-y-3">
              {abqmTitles.map((t, i) => {
                const TIcon = t.icon;
                return (
                  <div key={i} className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0"><TIcon className="w-5 h-5 text-primary" /></div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">{t.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{t.event} · {t.year}</div>
                    </div>
                    <div className="ml-auto"><span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/40 px-2 py-0.5 rounded">Verificado ABQM</span></div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LOGIN / REGISTER
// ─────────────────────────────────────────────

const ownerProfiles = [
  { name: "José Raimundo Santos", handle: "@jraimundo", role: "Proprietário · Vaqueiro", horses: 4, points: 6780, prize: 298400, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format", city: "Mossoró, RN", since: "2019", verified: true },
  { name: "Haras Sertão Vivo", handle: "@haras.sertaovivo", role: "Haras · Criador", horses: 12, points: 14200, prize: 620000, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format", city: "Fortaleza, CE", since: "2015", verified: true },
];

function Login({ onLogin }: { onLogin: (name: string, avatar: string, isNew?: boolean) => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPass, setShowPass] = useState(false);
  const [roleType, setRoleType] = useState<"owner" | "rider" | "fan">("owner");
  const [step, setStep] = useState<"form" | "success">("form");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");

  const roleOptions = [
    { id: "owner", label: "Proprietário / Haras", desc: "Gerencio cavalos e acompanho resultados" },
    { id: "rider", label: "Vaqueiro", desc: "Monto cavalos em competições" },
    { id: "fan", label: "Entusiasta", desc: "Acompanho a vaquejada" },
  ] as const;

  if (step === "success") {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 rounded-full bg-emerald-900/40 border-2 border-emerald-500/50 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            {mode === "login" ? "Bem-vindo de volta!" : "Conta criada!"}
          </h2>
          <p className="text-muted-foreground text-sm mb-8">
            {mode === "login"
              ? `Entrando como ${email || "usuário"}…`
              : `Sua conta foi criada com sucesso, ${name || "novo usuário"}!`}
          </p>
          <button
            onClick={() => onLogin(name || ownerProfiles[0].name, ownerProfiles[0].avatar, mode === "register")}
            className="px-8 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Acessar a Plataforma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex">
      {/* Left panel — branding */}
      <div
        className="hidden lg:flex flex-col justify-between w-96 shrink-0 rounded-xl overflow-hidden relative p-8"
        style={{ background: "linear-gradient(160deg, #2a1c0a 0%, #1a1008 60%, #0f0800 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=600&h=900&fit=crop&auto=format)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Trophy className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <p className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>VaquejaData</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Rede Social Equestre</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <blockquote className="text-foreground/90 italic leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
            "A maior plataforma de gestão e história para cavalos de vaquejada do Brasil."
          </blockquote>
          <div className="flex gap-6">
            {[{ val: "1.842", label: "Cavalos" }, { val: "3.918", label: "Provas" }, { val: "R$ 4,2M", label: "Em Prêmios" }].map((s) => (
              <div key={s.label}>
                <div className="text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          {/* Toggle */}
          <div className="flex rounded-xl border border-border bg-card p-1 gap-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition-all ${mode === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {m === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {m === "login" ? "Entrar" : "Criar Conta"}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                {mode === "login" ? "Acessar sua conta" : "Criar nova conta"}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                {mode === "login" ? "Entre para acessar seus cavalos e resultados." : "Registre-se gratuitamente para cadastrar seus animais."}
              </p>
            </div>

            {/* Role picker — register only */}
            {mode === "register" && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Você é…</label>
                <div className="grid grid-cols-1 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRoleType(r.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${roleType === r.id ? "border-primary bg-primary/8" : "border-border hover:border-foreground/20"}`}
                    >
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${roleType === r.id ? "border-primary" : "border-muted-foreground"}`}>
                        {roleType === r.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{r.label}</div>
                        <div className="text-xs text-muted-foreground">{r.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Fields */}
            <div className="space-y-3">
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={roleType === "owner" && name === "" ? "Nome ou Razão Social do Haras" : "Seu nome completo"}
                    className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              )}

              {mode === "register" && roleType === "owner" && (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input placeholder="Telefone / WhatsApp" className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Senha"
                  className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
                <button
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {mode === "register" && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="password" placeholder="Confirmar senha" className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
              )}
            </div>

            {mode === "login" && (
              <div className="text-right">
                <button className="text-xs text-primary hover:underline">Esqueci minha senha</button>
              </div>
            )}

            <button
              onClick={() => {
                setStep("success");
                toast.success(mode === "login" ? "Login realizado com sucesso!" : "Conta criada com sucesso!", {
                  description: mode === "login" ? "Bem-vindo de volta ao VaquejaData." : "Seu perfil está pronto para uso.",
                });
              }}
              className="w-full py-3 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              {mode === "login" ? "Entrar" : "Criar Conta Gratuitamente"}
            </button>

            {mode === "register" && (
              <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
                Ao criar uma conta você concorda com os <span className="text-primary underline cursor-pointer">Termos de Uso</span> e a <span className="text-primary underline cursor-pointer">Política de Privacidade</span> da plataforma.
              </p>
            )}
          </div>

          {/* Social proof */}
          {mode === "login" && (
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Entrar com conta de demonstração</p>
              <div className="flex flex-col gap-2">
                {ownerProfiles.map((p) => (
                  <button
                    key={p.handle}
                    onClick={() => { onLogin(p.name, p.avatar); toast.success(`Entrando como ${p.name.split(" ")[0]}`, { description: "Conta de demonstração ativada." }); }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/40 transition-colors text-left group"
                  >
                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-foreground">{p.name}</div>
                      <div className="text-[10px] text-muted-foreground">{p.role}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// PERFIL DO PROPRIETÁRIO
// ─────────────────────────────────────────────

const ownerHorses = [
  { name: "Trovão do Nordeste", abqm: "Q-912.847", sex: "Macho", coat: "Alazão", points: 1840, prize: 87400, wins: 12, photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=80&h=80&fit=crop&auto=format", titles: 3, role: "Puxador" },
  { name: "Ventania do Sertão", abqm: "Q-923.018", sex: "Fêmea", coat: "Rosilha", points: 920, prize: 41200, wins: 6, photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=80&h=80&fit=crop&auto=format", titles: 1, role: "Esteireiro" },
  { name: "Corisco do Vale", abqm: "Q-934.550", sex: "Macho", coat: "Tordilho", points: 640, prize: 28700, wins: 3, photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=80&h=80&fit=crop&auto=format", titles: 0, role: "Puxador" },
  { name: "Serena da Caatinga", abqm: "Q-941.882", sex: "Fêmea", coat: "Castanha", points: 210, prize: 9400, wins: 1, photo: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=80&h=80&fit=crop&auto=format", titles: 0, role: "Esteireiro" },
];

const ownerActivity = [
  { type: "resultado", text: "Trovão do Nordeste — 1º Lugar · Profissional Puxador", sub: "Vaquejada do Parque Ecológico · Mossoró, RN", date: "12 Abr", color: "text-amber-400" },
  { type: "cadastro", text: "Serena da Caatinga adicionada ao plantel", sub: "Registro ABQM Q-941.882 verificado", date: "03 Mar", color: "text-emerald-400" },
  { type: "resultado", text: "Ventania do Sertão — Rachou o Prêmio · Derby Open", sub: "Vaquejada da Serra · Caruaru, PE", date: "17 Mar", color: "text-primary" },
  { type: "titulo", text: "Trovão do Nordeste — Registro de Mérito ABQM", sub: "Conquista verificada pela ABQM", date: "01 Fev", color: "text-amber-400" },
];

function PerfilProprietario({ loggedUser }: { loggedUser: { name: string; avatar: string } | null }) {
  const [activeTab, setActiveTab] = useState<"plantel" | "atividade" | "estatisticas" | "favoritos">("plantel");
  const profile = ownerProfiles[0];
  const totalPoints = ownerHorses.reduce((a, h) => a + h.points, 0);
  const totalPrize = ownerHorses.reduce((a, h) => a + h.prize, 0);
  const totalWins = ownerHorses.reduce((a, h) => a + h.wins, 0);
  const isOwnProfile = !!loggedUser;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Cover */}
      <div className="relative rounded-xl overflow-hidden">
        <div
          className="h-44 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=1200&h=350&fit=crop&auto=format)", backgroundColor: "#2a1c0a" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-4 flex items-end gap-4">
          <div className="relative shrink-0">
            <img
              src={loggedUser?.avatar || profile.avatar}
              alt={loggedUser?.name || profile.name}
              className="w-20 h-20 rounded-xl border-4 border-card object-cover"
            />
            {profile.verified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-card">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                {loggedUser?.name || profile.name}
              </h2>
              {profile.verified && <span className="text-[10px] font-bold text-primary bg-primary/15 px-2 py-0.5 rounded-full">Verificado</span>}
            </div>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">{profile.handle}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs text-muted-foreground">{profile.role}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3" />{profile.city}</div>
            </div>
          </div>
          {isOwnProfile && (
            <button className="flex items-center gap-1.5 text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 px-3 py-1.5 rounded-lg transition-colors shrink-0 mb-1">
              <Settings className="w-3.5 h-3.5" /> Editar Perfil
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-card border border-border border-t-0 px-6 py-4 flex flex-wrap gap-6">
        {[
          { label: "Cavalos no Plantel", val: ownerHorses.length, color: "text-foreground" },
          { label: "Pontos Totais", val: totalPoints.toLocaleString("pt-BR"), color: "text-primary" },
          { label: "Prêmios Totais", val: totalPrize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), color: "text-emerald-400" },
          { label: "Vitórias", val: totalWins, color: "text-amber-400" },
          { label: "Na plataforma desde", val: profile.since, color: "text-muted-foreground" },
        ].map((s) => (
          <div key={s.label}>
            <div className={`text-base font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border border-t-0 rounded-b-xl overflow-hidden">
        <div className="flex border-b border-border">
          {([
            { id: "plantel", label: "Plantel", icon: Swords },
            { id: "favoritos", label: "Favoritos", icon: Bookmark },
            { id: "atividade", label: "Atividade", icon: Bell },
            { id: "estatisticas", label: "Estatísticas", icon: BarChart2 },
          ] as const).map((t) => {
            const TIcon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <TIcon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* PLANTEL */}
          {activeTab === "plantel" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{ownerHorses.length} animais no plantel</p>
                {isOwnProfile && (
                  <button className="flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-3 py-1.5 rounded-lg transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Adicionar Cavalo
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ownerHorses.map((h) => (
                  <div key={h.abqm} className="rounded-xl border border-border bg-secondary/20 p-4 hover:border-primary/30 hover:bg-secondary/40 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <img src={h.photo} alt={h.name} className="w-14 h-14 rounded-xl object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</h3>
                            <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{h.abqm}</p>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-muted-foreground">{h.sex} · {h.coat}</span>
                          <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">{h.role}</span>
                          {h.titles > 0 && (
                            <span className="text-[10px] font-bold text-amber-400 bg-amber-900/30 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Award className="w-2.5 h-2.5" />{h.titles}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/50">
                      <div className="text-xs"><span className="font-bold text-primary">{h.points.toLocaleString("pt-BR")}</span> <span className="text-muted-foreground">pts</span></div>
                      <div className="text-xs"><span className="font-bold text-emerald-400">{h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span></div>
                      <div className="text-xs ml-auto"><span className="font-bold text-amber-400">{h.wins}</span> <span className="text-muted-foreground">vitória{h.wins !== 1 ? "s" : ""}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAVORITOS */}
          {activeTab === "favoritos" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">Cavalos que você salvou para acompanhar. Clique no ícone <span className="text-primary">♥</span> em qualquer perfil para adicionar.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {searchHorses.slice(1, 5).map((h) => (
                  <div key={h.abqm} className="rounded-xl border border-border bg-secondary/20 p-4 flex items-center gap-3 hover:border-primary/30 hover:bg-secondary/40 transition-all cursor-pointer group">
                    <img src={h.photo} alt={h.name} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</p>
                      <p className="text-[10px] font-mono text-muted-foreground">{h.abqm}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-bold text-primary">{h.points.toLocaleString("pt-BR")} pts</span>
                        <span className="text-xs text-emerald-400">{h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); toast.success("Removido dos favoritos", { description: h.name }); }}
                      className="p-1.5 rounded-lg text-rose-400 bg-rose-900/20 hover:bg-rose-900/40 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                      title="Remover dos favoritos"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-border bg-card/50 p-4 text-center">
                <Bookmark className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">Explore o <span className="text-primary cursor-pointer font-medium">Ranking</span> ou a <span className="text-primary cursor-pointer font-medium">Busca</span> para salvar mais cavalos.</p>
              </div>
            </div>
          )}

          {/* ATIVIDADE */}
          {activeTab === "atividade" && (
            <div className="space-y-1">
              {ownerActivity.map((a, i) => (
                <div key={i} className="flex items-start gap-4 py-3 border-b border-border/40 last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${a.color === "text-amber-400" ? "bg-amber-400" : a.color === "text-emerald-400" ? "bg-emerald-400" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{a.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{a.sub}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{a.date}</span>
                </div>
              ))}
            </div>
          )}

          {/* ESTATÍSTICAS */}
          {activeTab === "estatisticas" && (
            <div className="space-y-6">
              {/* Distribution by category */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-border bg-secondary/20 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Distribuição por Função</p>
                  <div className="space-y-3">
                    {[
                      { label: "Puxador", count: 2, pct: 50 },
                      { label: "Esteireiro", count: 2, pct: 50 },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground font-medium">{r.label}</span>
                          <span className="text-xs font-bold text-primary">{r.count} cavalos</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-secondary/20 p-5">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Pontos por Animal</p>
                  <div className="space-y-3">
                    {ownerHorses.map((h) => (
                      <div key={h.abqm}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground font-medium truncate pr-2">{h.name.split(" ").slice(0, 2).join(" ")}</span>
                          <span className="text-xs font-bold text-primary shrink-0">{h.points.toLocaleString("pt-BR")}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${(h.points / totalPoints) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prêmios por animal */}
              <div className="rounded-xl border border-border bg-secondary/20 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Prêmios por Animal (R$)</p>
                <div className="space-y-3">
                  {ownerHorses.map((h) => (
                    <div key={h.abqm} className="flex items-center gap-3">
                      <img src={h.photo} alt={h.name} className="w-7 h-7 rounded-lg object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-foreground font-medium truncate pr-2" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</span>
                          <span className="text-xs font-bold text-emerald-400 shrink-0">
                            {h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-emerald-500/70 rounded-full" style={{ width: `${(h.prize / totalPrize) * 100}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Melhor Cavalo", val: "Trovão do Nordeste", sub: "1.840 pts", color: "text-primary" },
                  { label: "Maior Premiação", val: "R$ 87.400", sub: "Trovão do Nordeste", color: "text-emerald-400" },
                  { label: "Taxa de Vitória", val: "27%", sub: "22 vitórias em 81 provas", color: "text-amber-400" },
                  { label: "Títulos ABQM", val: "4 títulos", sub: "3 verificados", color: "text-violet-400" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-secondary/20 p-4 text-center">
                    <div className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
                    <div className="text-[10px] text-muted-foreground/60 mt-1">{s.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ADMIN PANEL
// ─────────────────────────────────────────────

const pendingTitles = [
  { id: 1, horse: "Fumaça da Caatinga", abqm: "Q-887.332", owner: "Haras Sertão Vivo", title: "Registro de Mérito em Vaquejada", event: "Nacional ABQM", year: 2025, submittedAt: "há 2 dias", photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=48&h=48&fit=crop&auto=format", cert: true },
  { id: 2, horse: "Relâmpago do Norte", abqm: "Q-905.001", owner: "Marcos Andrade", title: "Campeão Estadual RN", event: "Circuito AVACE 2024", year: 2024, submittedAt: "há 3 dias", photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=48&h=48&fit=crop&auto=format", cert: true },
  { id: 3, horse: "Estrela Dalva III", abqm: "Q-874.220", owner: "Haras Serra Bonita", title: "Potro do Futuro", event: "ABQM Nordeste 2023", year: 2023, submittedAt: "há 5 dias", photo: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=48&h=48&fit=crop&auto=format", cert: false },
  { id: 4, horse: "Corisco do Vale", abqm: "Q-934.550", owner: "José Raimundo Santos", title: "Reservado Campeão Nordestino", event: "Liga Nordestina 2025", year: 2025, submittedAt: "há 6 dias", photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=48&h=48&fit=crop&auto=format", cert: true },
];

const pendingHorses = [
  { id: 1, name: "Vento Forte do Sul", abqm: "Q-947.001", owner: "Fazenda Nova Esperança", sex: "Macho", coat: "Alazão", submittedAt: "há 1 dia", photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=48&h=48&fit=crop&auto=format", hasCert: true },
  { id: 2, name: "Princesa do Sertão IV", abqm: "Q-951.228", owner: "Ana Paula Ferreira", sex: "Fêmea", coat: "Rosilha", submittedAt: "há 4 dias", photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=48&h=48&fit=crop&auto=format", hasCert: false },
  { id: 3, name: "Barão do Cariri", abqm: "Q-958.440", owner: "Haras Vale Verde", sex: "Macho", coat: "Tordilho", submittedAt: "há 5 dias", photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=48&h=48&fit=crop&auto=format", hasCert: true },
];

const adminStats = [
  { label: "Usuários Ativos", val: "3.841", delta: "+142 esta semana", color: "text-sky-400", icon: Users },
  { label: "Cavalos Cadastrados", val: "1.842", delta: "+38 este mês", color: "text-amber-400", icon: Swords },
  { label: "Provas Registradas", val: "3.918", delta: "+214 este mês", color: "text-emerald-400", icon: Medal },
  { label: "Títulos Verificados", val: "729", delta: "12 pendentes", color: "text-violet-400", icon: BadgeCheck },
  { label: "Prêmios Registrados", val: "R$ 4,2M", delta: "+R$ 420k este mês", color: "text-primary", icon: Trophy },
  { label: "Cadastros Pendentes", val: "3", delta: "aguardando revisão", color: "text-rose-400", icon: Clock },
];

const recentActions = [
  { actor: "Sistema", action: "Novo resultado lançado automaticamente via integração AVACE", time: "agora", type: "system" },
  { actor: "Admin Maria", action: "Verificou título de Trovão do Nordeste — Registro de Mérito", time: "2h atrás", type: "approve" },
  { actor: "Admin Carlos", action: "Rejeitou cadastro de cavalo sem registro ABQM válido", time: "5h atrás", type: "reject" },
  { actor: "Sistema", action: "Backup automático do banco de dados concluído", time: "6h atrás", type: "system" },
  { actor: "Admin Maria", action: "Aprovou cadastro: Vento Forte do Sul (Q-947.001)", time: "1 dia atrás", type: "approve" },
  { actor: "Admin Carlos", action: "Editou perfil de Haras Sertão Vivo — atualização de contato", time: "1 dia atrás", type: "edit" },
];

function Admin() {
  const [adminTab, setAdminTab] = useState<"overview" | "titulos" | "cavalos" | "usuarios">("overview");
  const [titleStates, setTitleStates] = useState<Record<number, "approved" | "rejected" | null>>({});
  const [horseStates, setHorseStates] = useState<Record<number, "approved" | "rejected" | null>>({});

  const actColor = (type: string) =>
    type === "approve" ? "text-emerald-400" : type === "reject" ? "text-rose-400" : "text-muted-foreground";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Painel Administrativo</h2>
          </div>
          <p className="text-sm text-muted-foreground">Gestão da plataforma, verificações ABQM e moderação de conteúdo.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-900/30 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <Activity className="w-3.5 h-3.5" /> Sistema Online
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {adminStats.map((s) => {
          const SIcon = s.icon;
          return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <SIcon className={`w-4 h-4 ${s.color}`} />
                <span className="text-[10px] text-muted-foreground">{s.delta}</span>
              </div>
              <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Admin tabs */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex border-b border-border overflow-x-auto">
          {([
            { id: "overview", label: "Visão Geral", icon: Activity },
            { id: "titulos", label: `Títulos ABQM (${pendingTitles.length})`, icon: BadgeCheck },
            { id: "cavalos", label: `Cadastros (${pendingHorses.length})`, icon: Clock },
            { id: "usuarios", label: "Usuários", icon: Users },
          ] as const).map((t) => {
            const TIcon = t.icon;
            const hasBadge = (t.id === "titulos" || t.id === "cavalos");
            return (
              <button
                key={t.id}
                onClick={() => setAdminTab(t.id)}
                className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${adminTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                <TIcon className="w-3.5 h-3.5" />
                {t.label}
                {hasBadge && adminTab !== t.id && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* OVERVIEW */}
          {adminTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent actions */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Log de Ações Recentes</h3>
                <div className="space-y-0">
                  {recentActions.map((a, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 border-b border-border/40 last:border-0">
                      <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.type === "approve" ? "bg-emerald-400" : a.type === "reject" ? "bg-rose-400" : "bg-muted-foreground"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-foreground leading-relaxed">
                          <span className={`font-semibold ${actColor(a.type)}`}>{a.actor}</span>
                          {" — "}{a.action}
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick stats */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Distribuição por Estado</h3>
                <div className="space-y-2.5">
                  {[
                    { state: "Ceará", val: 412, pct: 72 },
                    { state: "Pernambuco", val: 318, pct: 56 },
                    { state: "Rio Grande do Norte", val: 287, pct: 50 },
                    { state: "Paraíba", val: 241, pct: 42 },
                    { state: "Piauí", val: 156, pct: 27 },
                    { state: "Outros", val: 428, pct: 75 },
                  ].map((r) => (
                    <div key={r.state}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-foreground">{r.state}</span>
                        <span className="text-xs font-bold text-primary">{r.val} cavalos</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-border overflow-hidden">
                        <div className="h-full bg-primary/70 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-lg border border-rose-500/20 bg-rose-950/10 p-4 mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span className="text-xs font-semibold text-rose-300">Itens que precisam de atenção</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />{pendingTitles.length} títulos ABQM aguardando verificação</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />{pendingHorses.length} cadastros de cavalos aguardando aprovação</li>
                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />1 certificado sem arquivo anexado (Estrela Dalva III)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TÍTULOS */}
          {adminTab === "titulos" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Títulos submetidos pelos proprietários aguardando verificação oficial. Confira o certificado antes de aprovar.
              </p>
              <div className="space-y-3">
                {pendingTitles.map((t) => {
                  const state = titleStates[t.id];
                  return (
                    <div key={t.id} className={`rounded-xl border p-4 transition-all ${state === "approved" ? "border-emerald-500/40 bg-emerald-950/20" : state === "rejected" ? "border-rose-500/30 bg-rose-950/10 opacity-60" : "border-border bg-secondary/20"}`}>
                      <div className="flex items-start gap-4 flex-wrap">
                        <img src={t.photo} alt={t.horse} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{t.horse}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{t.abqm}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Proprietário: <span className="text-foreground">{t.owner}</span></p>
                          <div className="mt-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2">
                            <p className="text-xs font-semibold text-primary">{t.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{t.event} · {t.year}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-muted-foreground">Submetido {t.submittedAt}</span>
                            <span className={`text-[10px] font-semibold flex items-center gap-1 ${t.cert ? "text-emerald-400" : "text-rose-400"}`}>
                              {t.cert ? <><Check className="w-3 h-3" /> Certificado anexado</> : <><AlertCircle className="w-3 h-3" /> Sem certificado</>}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {state ? (
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${state === "approved" ? "text-emerald-400 bg-emerald-900/30" : "text-rose-400 bg-rose-900/30"}`}>
                              {state === "approved" ? <><ShieldCheck className="w-4 h-4" /> Aprovado</> : <><ShieldAlert className="w-4 h-4" /> Rejeitado</>}
                            </div>
                          ) : (
                            <>
                              <button onClick={() => { setTitleStates((p) => ({ ...p, [t.id]: "approved" })); toast.success("Título verificado!", { description: `"${t.title}" foi aprovado e publicado no perfil.` }); }} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                                <UserCheck className="w-3.5 h-3.5" /> Verificar
                              </button>
                              <button onClick={() => { setTitleStates((p) => ({ ...p, [t.id]: "rejected" })); toast.error("Título rejeitado", { description: "O proprietário será notificado." }); }} className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                <UserX className="w-3.5 h-3.5" /> Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CAVALOS */}
          {adminTab === "cavalos" && (
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Cadastros de novos cavalos aguardando revisão. Verifique se o Registro ABQM é válido antes de aprovar.
              </p>
              <div className="space-y-3">
                {pendingHorses.map((h) => {
                  const state = horseStates[h.id];
                  return (
                    <div key={h.id} className={`rounded-xl border p-4 transition-all ${state === "approved" ? "border-emerald-500/40 bg-emerald-950/20" : state === "rejected" ? "border-rose-500/30 bg-rose-950/10 opacity-60" : "border-border bg-secondary/20"}`}>
                      <div className="flex items-center gap-4 flex-wrap">
                        <img src={h.photo} alt={h.name} className="w-12 h-12 rounded-xl object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{h.abqm}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap text-xs text-muted-foreground">
                            <span>{h.sex} · {h.coat}</span>
                            <span>Prop.: <span className="text-foreground">{h.owner}</span></span>
                            <span>Submetido {h.submittedAt}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-[10px] font-semibold flex items-center gap-1 ${h.hasCert ? "text-emerald-400" : "text-rose-400"}`}>
                              {h.hasCert ? <><Check className="w-3 h-3" /> Doc. ABQM anexado</> : <><AlertCircle className="w-3 h-3" /> Sem documentação</>}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          {state ? (
                            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${state === "approved" ? "text-emerald-400 bg-emerald-900/30" : "text-rose-400 bg-rose-900/30"}`}>
                              {state === "approved" ? <><Check className="w-4 h-4" /> Aprovado</> : <><X className="w-4 h-4" /> Rejeitado</>}
                            </div>
                          ) : (
                            <>
                              <button onClick={() => { setHorseStates((p) => ({ ...p, [h.id]: "approved" })); toast.success(`${h.name} aprovado!`, { description: "Perfil publicado e visível na plataforma." }); }} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition-colors">
                                <Check className="w-3.5 h-3.5" /> Aprovar
                              </button>
                              <button onClick={() => { setHorseStates((p) => ({ ...p, [h.id]: "rejected" })); toast.error(`${h.name} rejeitado`, { description: "Proprietário notificado para correção." }); }} className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 bg-rose-900/20 hover:bg-rose-900/40 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                <X className="w-3.5 h-3.5" /> Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* USUÁRIOS */}
          {adminTab === "usuarios" && (
            <div className="space-y-3">
              {[
                { name: "José Raimundo Santos", handle: "@jraimundo", role: "Proprietário", horses: 4, status: "active", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format", since: "Jan 2019" },
                { name: "Haras Sertão Vivo", handle: "@haras.sertaovivo", role: "Haras / Criador", horses: 12, status: "active", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&auto=format", since: "Mar 2015" },
                { name: "Marcos Andrade", handle: "@m.andrade", role: "Proprietário", horses: 2, status: "active", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&auto=format", since: "Jun 2021" },
                { name: "Ana Paula Ferreira", handle: "@anapaula.f", role: "Proprietária", horses: 3, status: "suspended", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&auto=format", since: "Set 2022" },
                { name: "Pedro Cândido Neto", handle: "@pedrocandido", role: "Proprietário", horses: 5, status: "active", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop&auto=format", since: "Abr 2020" },
              ].map((u) => (
                <div key={u.handle} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-secondary/20 transition-colors">
                  <img src={u.avatar} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-border shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{u.name}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${u.status === "active" ? "text-emerald-400 bg-emerald-900/30" : "text-rose-400 bg-rose-900/30"}`}>
                        {u.status === "active" ? "Ativo" : "Suspenso"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground flex-wrap">
                      <span>{u.handle}</span>
                      <span>{u.role}</span>
                      <span>{u.horses} cavalo{u.horses !== 1 ? "s" : ""}</span>
                      <span>Desde {u.since}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors" title="Editar"><Settings className="w-3.5 h-3.5" /></button>
                    <button className={`p-1.5 rounded-lg transition-colors ${u.status === "active" ? "text-muted-foreground hover:text-rose-400 hover:bg-rose-900/20" : "text-muted-foreground hover:text-emerald-400 hover:bg-emerald-900/20"}`} title={u.status === "active" ? "Suspender" : "Reativar"}>
                      {u.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                    </button>
                    <button className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-900/20 transition-colors" title="Excluir"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CONFIGURAÇÕES
// ─────────────────────────────────────────────

function Configuracoes({ loggedUser }: { loggedUser: { name: string; avatar: string } | null }) {
  const [configTab, setConfigTab] = useState<"perfil" | "notificacoes" | "privacidade" | "seguranca">("perfil");
  const [saved, setSaved] = useState(false);

  const [notifSettings, setNotifSettings] = useState({
    resultados: true,
    titulos: true,
    campeonatos: true,
    follows: false,
    email_semanal: true,
    email_imediato: false,
  });

  const [privSettings, setPrivSettings] = useState({
    perfil_publico: true,
    cavalos_publicos: true,
    historico_publico: true,
    premios_publicos: false,
  });

  const toggleNotif = (k: keyof typeof notifSettings) => setNotifSettings((p) => ({ ...p, [k]: !p[k] }));
  const togglePriv = (k: keyof typeof privSettings) => setPrivSettings((p) => ({ ...p, [k]: !p[k] }));

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    toast.success("Configurações salvas!", { description: "Suas preferências foram atualizadas com sucesso." });
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button onClick={onToggle} className={`relative w-10 h-5.5 rounded-full border transition-colors shrink-0 ${on ? "bg-primary border-primary" : "bg-secondary border-border"}`} style={{ height: 22 }}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${on ? "translate-x-4.5" : ""}`} style={{ transform: on ? "translateX(18px)" : "translateX(0)" }} />
    </button>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Configurações</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie sua conta, notificações e privacidade.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg transition-all ${saved ? "bg-emerald-900/40 text-emerald-400 border border-emerald-500/30" : "bg-primary text-primary-foreground hover:opacity-90"}`}
        >
          {saved ? <><Check className="w-4 h-4" /> Salvo!</> : <><Save className="w-4 h-4" /> Salvar Alterações</>}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Config tabs */}
        <div className="flex border-b border-border overflow-x-auto">
          {([
            { id: "perfil", label: "Perfil", icon: User },
            { id: "notificacoes", label: "Notificações", icon: Bell },
            { id: "privacidade", label: "Privacidade", icon: Globe2 },
            { id: "seguranca", label: "Segurança", icon: KeyRound },
          ] as const).map((t) => {
            const TIcon = t.icon;
            return (
              <button key={t.id} onClick={() => setConfigTab(t.id)} className={`flex items-center gap-1.5 px-5 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${configTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
                <TIcon className="w-3.5 h-3.5" />{t.label}
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-6">
          {/* PERFIL */}
          {configTab === "perfil" && (
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-5">
                <div className="relative shrink-0">
                  <img src={loggedUser?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"} alt="Avatar" className="w-20 h-20 rounded-xl object-cover border-2 border-border" />
                  <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center border-2 border-card hover:opacity-90 transition-opacity">
                    <Upload className="w-3 h-3 text-primary-foreground" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{loggedUser?.name || "José Raimundo Santos"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Foto de perfil · JPG ou PNG, máx. 2 MB</p>
                  <div className="flex gap-2 mt-2">
                    <button className="text-xs text-primary hover:underline">Trocar foto</button>
                    <span className="text-muted-foreground text-xs">·</span>
                    <button className="text-xs text-rose-400 hover:underline">Remover</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome Completo</label>
                  <input defaultValue={loggedUser?.name || "José Raimundo Santos"} className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome de Usuário</label>
                  <input defaultValue="@jraimundo" className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">E-mail</label>
                  <input defaultValue="j.raimundo@email.com" type="email" className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefone / WhatsApp</label>
                  <input defaultValue="(84) 99812-3456" className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cidade</label>
                  <input defaultValue="Mossoró" className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Estado (UF)</label>
                  <select defaultValue="RN" className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors appearance-none">
                    {["CE", "PE", "RN", "PB", "PI", "MA", "BA", "AL", "SE"].map((uf) => <option key={uf} value={uf}>{uf}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bio / Apresentação</label>
                <textarea rows={3} defaultValue="Proprietário e criador de cavalos de vaquejada no Nordeste há mais de 10 anos. Apaixonado pelo esporte e pela cultura sertaneja." className="bg-secondary/40 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors resize-none" />
              </div>

              <div className="rounded-lg border border-border bg-secondary/20 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Tipo de Conta</p>
                <div className="flex items-center gap-3">
                  {["Proprietário / Haras", "Vaqueiro", "Entusiasta"].map((r) => (
                    <label key={r} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="role" defaultChecked={r === "Proprietário / Haras"} className="accent-primary" />
                      <span className="text-xs text-foreground">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICAÇÕES */}
          {configTab === "notificacoes" && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Notificações no App</h3>
                {([
                  { key: "resultados", label: "Novos resultados dos meus cavalos", desc: "Quando um resultado é lançado para um dos seus animais" },
                  { key: "titulos", label: "Títulos ABQM verificados", desc: "Quando um título submetido é aprovado ou rejeitado" },
                  { key: "campeonatos", label: "Próximas competições", desc: "Lembretes de competições abertas para inscrição" },
                  { key: "follows", label: "Novos seguidores", desc: "Quando alguém começa a seguir o seu perfil" },
                ] as const).map((n) => (
                  <div key={n.key} className="flex items-center justify-between gap-4 py-3.5 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle on={notifSettings[n.key]} onToggle={() => toggleNotif(n.key)} />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Notificações por E-mail</h3>
                {([
                  { key: "email_imediato", label: "E-mail imediato", desc: "Receba um e-mail a cada evento relevante" },
                  { key: "email_semanal", label: "Resumo semanal", desc: "Resumo dos destaques da semana toda segunda-feira" },
                ] as const).map((n) => (
                  <div key={n.key} className="flex items-center justify-between gap-4 py-3.5 border-b border-border/40 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle on={notifSettings[n.key]} onToggle={() => toggleNotif(n.key)} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PRIVACIDADE */}
          {configTab === "privacidade" && (
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Visibilidade do Perfil</h3>
              {([
                { key: "perfil_publico", label: "Perfil público", desc: "Qualquer pessoa pode ver seu perfil e informações básicas" },
                { key: "cavalos_publicos", label: "Plantel visível", desc: "Lista de cavalos aparece para todos os usuários" },
                { key: "historico_publico", label: "Histórico de provas público", desc: "Resultados e participações em competições são visíveis" },
                { key: "premios_publicos", label: "Prêmios em dinheiro públicos", desc: "Valores de premiação ficam visíveis no perfil e ranking" },
              ] as const).map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-4 py-3.5 border-b border-border/40 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                  </div>
                  <Toggle on={privSettings[p.key]} onToggle={() => togglePriv(p.key)} />
                </div>
              ))}

              <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Mesmo com o perfil privado, seus resultados continuam contabilizados no <span className="text-foreground font-medium">ranking geral</span> da plataforma. Apenas o valor dos prêmios pode ser ocultado individualmente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SEGURANÇA */}
          {configTab === "seguranca" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Alterar Senha</h3>
                <div className="space-y-3">
                  {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label) => (
                    <div key={label} className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input type="password" placeholder="••••••••" className="w-full bg-secondary/40 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary/60 transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
                <button className="text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-lg transition-colors">
                  Atualizar Senha
                </button>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sessões Ativas</h3>
                {[
                  { device: "Chrome — Windows 11", location: "Mossoró, RN", time: "Agora", current: true },
                  { device: "Safari — iPhone 14", location: "Fortaleza, CE", time: "há 2 dias", current: false },
                ].map((s) => (
                  <div key={s.device} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{s.device}</p>
                        {s.current && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-900/30 px-1.5 py-0.5 rounded">Esta sessão</span>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.location} · {s.time}</p>
                    </div>
                    {!s.current && <button className="text-xs text-rose-400 hover:underline shrink-0">Encerrar</button>}
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Zona de Perigo</h3>
                <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-4 space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    A exclusão da conta é <span className="text-rose-400 font-semibold">permanente e irreversível</span>. Todos os dados, cavalos e histórico de provas serão apagados definitivamente.
                  </p>
                  <button className="flex items-center gap-1.5 text-xs font-bold text-rose-400 border border-rose-500/40 hover:bg-rose-900/20 px-4 py-2 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Excluir minha conta
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ESTATÍSTICAS AVANÇADAS
// ─────────────────────────────────────────────

const statHorses = ["Trovão do Nordeste", "Fumaça da Caatinga", "Rainha do Agreste", "Relâmpago do Norte"];
const COLORS = ["#c9902a", "#4ade80", "#818cf8", "#f87171"];

const monthlyPoints: Record<string, { mes: string; [k: string]: number | string }[]> = {
  "2025": [
    { mes: "Jan", "Trovão do Nordeste": 80,  "Fumaça da Caatinga": 60,  "Rainha do Agreste": 45,  "Relâmpago do Norte": 30  },
    { mes: "Fev", "Trovão do Nordeste": 180, "Fumaça da Caatinga": 140, "Rainha do Agreste": 110, "Relâmpago do Norte": 90  },
    { mes: "Mar", "Trovão do Nordeste": 270, "Fumaça da Caatinga": 230, "Rainha do Agreste": 190, "Relâmpago do Norte": 160 },
    { mes: "Abr", "Trovão do Nordeste": 390, "Fumaça da Caatinga": 340, "Rainha do Agreste": 290, "Relâmpago do Norte": 240 },
    { mes: "Mai", "Trovão do Nordeste": 480, "Fumaça da Caatinga": 420, "Rainha do Agreste": 360, "Relâmpago do Norte": 310 },
    { mes: "Jun", "Trovão do Nordeste": 610, "Fumaça da Caatinga": 530, "Rainha do Agreste": 440, "Relâmpago do Norte": 380 },
  ],
  "2024": [
    { mes: "Jan", "Trovão do Nordeste": 40,  "Fumaça da Caatinga": 55,  "Rainha do Agreste": 30,  "Relâmpago do Norte": 20  },
    { mes: "Fev", "Trovão do Nordeste": 110, "Fumaça da Caatinga": 130, "Rainha do Agreste": 80,  "Relâmpago do Norte": 60  },
    { mes: "Mar", "Trovão do Nordeste": 200, "Fumaça da Caatinga": 210, "Rainha do Agreste": 150, "Relâmpago do Norte": 120 },
    { mes: "Abr", "Trovão do Nordeste": 310, "Fumaça da Caatinga": 290, "Rainha do Agreste": 230, "Relâmpago do Norte": 180 },
    { mes: "Mai", "Trovão do Nordeste": 420, "Fumaça da Caatinga": 380, "Rainha do Agreste": 310, "Relâmpago do Norte": 260 },
    { mes: "Jun", "Trovão do Nordeste": 560, "Fumaça da Caatinga": 490, "Rainha do Agreste": 400, "Relâmpago do Norte": 330 },
    { mes: "Jul", "Trovão do Nordeste": 680, "Fumaça da Caatinga": 590, "Rainha do Agreste": 500, "Relâmpago do Norte": 420 },
    { mes: "Ago", "Trovão do Nordeste": 820, "Fumaça da Caatinga": 720, "Rainha do Agreste": 620, "Relâmpago do Norte": 530 },
    { mes: "Set", "Trovão do Nordeste": 940, "Fumaça da Caatinga": 840, "Rainha do Agreste": 730, "Relâmpago do Norte": 640 },
    { mes: "Out", "Trovão do Nordeste":1060, "Fumaça da Caatinga": 960, "Rainha do Agreste": 840, "Relâmpago do Norte": 740 },
    { mes: "Nov", "Trovão do Nordeste":1200, "Fumaça da Caatinga":1090, "Rainha do Agreste": 960, "Relâmpago do Norte": 850 },
    { mes: "Dez", "Trovão do Nordeste":1380, "Fumaça da Caatinga":1240, "Rainha do Agreste":1090, "Relâmpago do Norte": 970 },
  ],
};

const prizeByChampionship = [
  { championship: "AVACE", "Trovão do Nordeste": 42000, "Fumaça da Caatinga": 35000, "Rainha do Agreste": 28000, "Relâmpago do Norte": 22000 },
  { championship: "Liga NE",  "Trovão do Nordeste": 28000, "Fumaça da Caatinga": 22000, "Rainha do Agreste": 19000, "Relâmpago do Norte": 17000 },
  { championship: "Cearense","Trovão do Nordeste": 12000, "Fumaça da Caatinga": 10000, "Rainha do Agreste": 9000,  "Relâmpago do Norte": 8000  },
  { championship: "Outros",   "Trovão do Nordeste": 5400,  "Fumaça da Caatinga": 7200,  "Rainha do Agreste": 12000, "Relâmpago do Norte": 14500 },
];

const categoryPie = [
  { name: "Profissional Puxador", value: 38 },
  { name: "Profissional Esteireiro", value: 22 },
  { name: "Derby Open", value: 18 },
  { name: "Amador", value: 12 },
  { name: "Mirim / Feminino", value: 10 },
];

const topPerformance = [
  { name: "Trovão do Nordeste", wins: 12, top3: 18, participations: 24, winRate: 50, photo: "https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=36&h=36&fit=crop&auto=format" },
  { name: "Fumaça da Caatinga",  wins: 10, top3: 15, participations: 21, winRate: 48, photo: "https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=36&h=36&fit=crop&auto=format" },
  { name: "Rainha do Agreste",   wins: 9,  top3: 13, participations: 20, winRate: 45, photo: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=36&h=36&fit=crop&auto=format" },
  { name: "Relâmpago do Norte",  wins: 8,  top3: 14, participations: 22, winRate: 36, photo: "https://images.unsplash.com/photo-1599443015574-be5fe8a05783?w=36&h=36&fit=crop&auto=format" },
  { name: "Estrela Dalva III",   wins: 7,  top3: 11, participations: 18, winRate: 39, photo: "https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=36&h=36&fit=crop&auto=format" },
];

const tooltipStyle = { backgroundColor: "#231608", border: "1px solid rgba(201,144,42,0.2)", borderRadius: 6, color: "#f5ead6", fontSize: 11 };

function Estatisticas() {
  const [period, setPeriod] = useState<"2025" | "2024">("2025");
  const [metric, setMetric] = useState<"points" | "prize">("points");
  const [visibleHorses, setVisibleHorses] = useState<Record<string, boolean>>(
    Object.fromEntries(statHorses.map((h) => [h, true]))
  );

  const toggleHorse = (h: string) => setVisibleHorses((p) => ({ ...p, [h]: !p[h] }));

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
          Estatísticas Avançadas
        </h2>
        <p className="text-sm text-muted-foreground">Análise comparativa de performance, prêmios e distribuição por categoria.</p>
      </div>

      {/* Summary KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Melhor Taxa de Vitória", val: "50%", sub: "Trovão do Nordeste", icon: Percent, color: "text-primary" },
          { label: "Maior Sequência", val: "4 vitórias", sub: "Trovão do Nordeste · Mar–Abr", icon: TrendingUp, color: "text-emerald-400" },
          { label: "Menor Performance", val: "36%", sub: "Relâmpago do Norte", icon: TrendingDown, color: "text-rose-400" },
          { label: "Provas Analisadas", val: "105", sub: "Top 5 cavalos · 2024–2025", icon: BarChart2, color: "text-violet-400" },
        ].map((k) => {
          const KIcon = k.icon;
          return (
            <div key={k.label} className="rounded-xl border border-border bg-card p-4">
              <KIcon className={`w-4 h-4 ${k.color} mb-2`} />
              <div className={`text-xl font-bold ${k.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{k.val}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{k.label}</div>
              <div className="text-[10px] text-muted-foreground/60 mt-1">{k.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Evolução de pontos / prêmios */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Evolução Acumulada — {metric === "points" ? "Pontos" : "Prêmios (R$)"}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Metric toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["points", "prize"] as const).map((m) => (
                <button key={m} onClick={() => setMetric(m)} className={`px-3 py-1.5 font-semibold transition-colors ${metric === m ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {m === "points" ? "Pontos" : "Prêmios"}
                </button>
              ))}
            </div>
            {/* Period */}
            <div className="flex rounded-lg border border-border overflow-hidden text-xs">
              {(["2025", "2024"] as const).map((p) => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 font-semibold transition-colors ${period === p ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Horse toggles */}
        <div className="flex flex-wrap gap-2">
          {statHorses.map((h, i) => (
            <button
              key={h}
              onClick={() => toggleHorse(h)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all ${visibleHorses[h] ? "border-transparent text-card" : "border-border text-muted-foreground opacity-50"}`}
              style={visibleHorses[h] ? { backgroundColor: COLORS[i] } : {}}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i] }} />
              {h.split(" ").slice(0, 2).join(" ")}
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyPoints[period]}>
            <XAxis dataKey="mes" tick={{ fill: "#9a7d52", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fill: "#9a7d52", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={metric === "prize" ? (v) => `${(v / 1000).toFixed(0)}k` : undefined}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number, name: string) =>
                metric === "prize"
                  ? [`R$ ${v.toLocaleString("pt-BR")}`, name.split(" ").slice(0, 2).join(" ")]
                  : [v, name.split(" ").slice(0, 2).join(" ")]
              }
            />
            {statHorses.map((h, i) =>
              visibleHorses[h] ? (
                <Line
                  key={h}
                  type="monotone"
                  dataKey={h}
                  stroke={COLORS[i]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: COLORS[i] }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Prize by championship + category pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar: prize by championship */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Prêmios por Campeonato (R$)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={prizeByChampionship} barGap={3} barCategoryGap="28%">
              <XAxis dataKey="championship" tick={{ fill: "#9a7d52", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9a7d52", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`R$ ${v.toLocaleString("pt-BR")}`, name.split(" ")[0]]} />
              {statHorses.map((h, i) =>
                visibleHorses[h] ? (
                  <Bar key={h} dataKey={h} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                ) : null
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie: participations by category */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Provas por Categoria</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <RechartsPie>
                <Pie
                  data={categoryPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#1a1008"
                >
                  {categoryPie.map((_, i) => (
                    <Cell key={i} fill={["#c9902a", "#4ade80", "#818cf8", "#f87171", "#fb923c"][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, name: string) => [`${v}%`, name]} />
              </RechartsPie>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {categoryPie.map((c, i) => (
                <div key={c.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ["#c9902a", "#4ade80", "#818cf8", "#f87171", "#fb923c"][i] }} />
                  <span className="text-xs text-muted-foreground flex-1 leading-tight">{c.name}</span>
                  <span className="text-xs font-bold text-foreground">{c.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Tabela de Performance — Top 5</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <th className="px-5 py-3 text-left">Cavalo</th>
                <th className="px-4 py-3 text-right">Vitórias</th>
                <th className="px-4 py-3 text-right">Top 3</th>
                <th className="px-4 py-3 text-right">Provas</th>
                <th className="px-4 py-3 text-right">Taxa Vitória</th>
                <th className="px-5 py-3 text-right">Índice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {topPerformance.map((h, i) => {
                const idx = Math.round((h.winRate * 0.6) + ((h.top3 / h.participations) * 100 * 0.4));
                return (
                  <tr key={h.name} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={h.photo} alt={h.name} className="w-8 h-8 rounded-lg object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                        <span className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-amber-400">{h.wins}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm font-bold text-foreground">{h.top3}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="text-sm text-muted-foreground">{h.participations}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${h.winRate}%` }} />
                        </div>
                        <span className="text-sm font-bold text-primary w-8 text-right">{h.winRate}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${i === 0 ? "text-amber-400 bg-amber-900/30" : i === 1 ? "text-slate-300 bg-slate-800/40" : "text-foreground bg-secondary/40"}`}>
                        {idx}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-6 py-3 border-t border-border/50 flex items-center gap-2 text-[10px] text-muted-foreground">
          <AlertCircle className="w-3 h-3 shrink-0" />
          Índice calculado: (taxa de vitória × 60%) + (taxa de top 3 × 40%)
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// SKELETON LOADERS
// ─────────────────────────────────────────────

function Skel({ className = "" }: { className?: string }) {
  return <div className={`rounded-lg bg-secondary/60 ${className}`} style={{ animation: "pulse 1.6s ease-in-out infinite" }} />;
}

function FeedSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <Skel className="w-10 h-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2"><Skel className="h-3 w-32" /><Skel className="h-2.5 w-24" /></div>
          </div>
          <div className="px-5 pb-3 space-y-2"><Skel className="h-3 w-3/4" /><Skel className="h-2.5 w-1/2" /></div>
          <Skel className="h-52 w-full rounded-none" />
          <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
            <Skel className="h-7 w-16 rounded-lg" /><Skel className="h-7 w-16 rounded-lg" /><Skel className="h-7 w-24 rounded-lg ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-3 gap-3">{[1,2,3].map((i) => <Skel key={i} className="h-24 rounded-xl" />)}</div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><Skel className="h-3 w-48" /></div>
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50">
            <Skel className="w-8 h-8 rounded-full shrink-0" /><Skel className="w-9 h-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5"><Skel className="h-3 w-40" /><Skel className="h-2.5 w-24" /></div>
            <Skel className="h-3 w-14" /><Skel className="h-3 w-20" /><Skel className="h-3 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// COMMENTS PANEL
// ─────────────────────────────────────────────

const seedComments: Record<number, {id:number;author:string;avatar:string;text:string;time:string;likes:number;liked:boolean;replies?:{id:number;author:string;avatar:string;text:string;time:string}[]}[]> = {
  1: [
    { id:1, author:"Haras Sertão Vivo", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&auto=format", text:"Que apresentação incrível! O Trovão tá voando esse ano 🏆", time:"1h atrás", likes:24, liked:false, replies:[{id:11,author:"José Raimundo",avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format",text:"Obrigado! Muito orgulho desse cavalo",time:"58min"}] },
    { id:2, author:"Marcos Andrade", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&auto=format", text:"Parabéns! Merecido demais. Qual o segredo do treinamento?", time:"1h atrás", likes:8, liked:false },
    { id:3, author:"Pedro Cândido Neto", avatar:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=32&h=32&fit=crop&auto=format", text:"Top! Vocês tão favoritos pra final do AVACE 🤠", time:"2h atrás", likes:15, liked:false },
  ],
  2: [
    { id:4, author:"José Raimundo Santos", avatar:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format", text:"Merecido! A Fumaça é uma égua excepcional 👏", time:"3h atrás", likes:41, liked:false },
    { id:5, author:"Marcos Andrade", avatar:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&auto=format", text:"Que belo título! Parabéns ao Haras Sertão Vivo 🤠", time:"4h atrás", likes:22, liked:false },
  ],
  3: [
    { id:6, author:"Haras Serra Bonita", avatar:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=32&h=32&fit=crop&auto=format", text:"Boa corrida! O Relâmpago tá se destacando muito 🐴", time:"22h atrás", likes:12, liked:false },
  ],
};

function CommentsPanel({ postId, horse, competition, onClose }: { postId: number; horse: string; competition: string; onClose: () => void }) {
  const [comments, setComments] = useState(seedComments[postId] || []);
  const [newText, setNewText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!newText.trim()) return;
    const nc = { id: Date.now(), author: "José Raimundo Santos", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format", text: newText.trim(), time: "agora", likes: 0, liked: false };
    if (replyingTo !== null) {
      setComments((prev) => prev.map((c) => c.id === replyingTo ? { ...c, replies: [...(c.replies||[]), {id:Date.now(),author:nc.author,avatar:nc.avatar,text:nc.text,time:"agora"}] } : c));
      setReplyingTo(null);
    } else {
      setComments((prev) => [nc, ...prev]);
    }
    setNewText("");
    toast.success("Comentário enviado!");
  };

  const toggleLike = (id: number) => setComments((prev) => prev.map((c) => c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes-1 : c.likes+1 } : c));

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-card border-l border-border flex flex-col shadow-2xl" style={{ animation: "slideInRight 0.22s ease" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <h3 className="text-sm font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Comentários</h3>
            <p className="text-[10px] text-muted-foreground mt-0.5 truncate max-w-64">{horse} · {competition}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {comments.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MessageCircle className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum comentário ainda. Seja o primeiro!</p>
            </div>
          )}
          {comments.map((c) => (
            <div key={c.id} className="space-y-3">
              <div className="flex items-start gap-3">
                <img src={c.avatar} alt={c.author} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="bg-secondary/40 rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-foreground mb-1">{c.author}</p>
                    <p className="text-sm text-foreground/90 leading-relaxed">{c.text}</p>
                  </div>
                  <div className="flex items-center gap-3 mt-1.5 px-1">
                    <span className="text-[10px] text-muted-foreground">{c.time}</span>
                    <button onClick={() => toggleLike(c.id)} className={`flex items-center gap-1 text-[10px] font-semibold transition-colors ${c.liked ? "text-rose-400" : "text-muted-foreground hover:text-foreground"}`}>
                      <Heart className={`w-3 h-3 ${c.liked ? "fill-current" : ""}`} />{c.likes > 0 && c.likes}
                    </button>
                    <button onClick={() => { setReplyingTo(c.id); inputRef.current?.focus(); }} className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors">Responder</button>
                  </div>
                </div>
              </div>
              {c.replies && c.replies.length > 0 && (
                <div className="ml-11 space-y-2">
                  {c.replies.map((r) => (
                    <div key={r.id} className="flex items-start gap-2.5">
                      <ChevronRight className="w-3 h-3 text-muted-foreground/40 mt-2 shrink-0 rotate-90" />
                      <img src={r.avatar} alt={r.author} className="w-6 h-6 rounded-full object-cover border border-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="bg-secondary/30 rounded-xl px-3 py-2">
                          <p className="text-[10px] font-semibold text-foreground mb-0.5">{r.author}</p>
                          <p className="text-xs text-foreground/90 leading-relaxed">{r.text}</p>
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-1 px-1">{r.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {replyingTo !== null && (
          <div className="px-5 py-2 bg-primary/5 border-t border-primary/20 flex items-center justify-between">
            <p className="text-xs text-primary">Respondendo a <span className="font-semibold">{comments.find((c) => c.id === replyingTo)?.author}</span></p>
            <button onClick={() => setReplyingTo(null)} className="text-muted-foreground hover:text-foreground transition-colors"><X className="w-3.5 h-3.5" /></button>
          </div>
        )}

        <div className="px-5 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format" alt="Você" className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
            <div className="flex-1 flex items-center gap-2 bg-secondary/40 border border-border rounded-xl px-4 py-2.5 focus-within:border-primary/50 transition-colors">
              <input ref={inputRef} value={newText} onChange={(e) => setNewText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submit()} placeholder={replyingTo !== null ? "Escrever resposta…" : "Adicionar comentário…"} className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none" />
              <button onClick={submit} disabled={!newText.trim()} className="text-primary disabled:opacity-30 transition-opacity hover:opacity-70">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// ONBOARDING MODAL
// ─────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { icon: Swords, title: "Cadastre seu cavalo", desc: "Registre o animal com nome, ABQM, pelagem, genealogia de 3 gerações e fotos. Leva menos de 5 minutos.", color: "text-amber-400", bg: "bg-amber-900/30 border-amber-500/30" },
  { icon: Trophy, title: "Lance os resultados das provas", desc: "Para cada competição, registre a colocação, prêmio em R$ e pontos obtidos. Os totais são calculados automaticamente.", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  { icon: BadgeCheck, title: "Solicite verificação de títulos ABQM", desc: "Anexe o certificado oficial e solicite a verificação. Títulos verificados aparecem com selo especial no perfil.", color: "text-emerald-400", bg: "bg-emerald-900/30 border-emerald-500/30" },
  { icon: Share2, title: "Compartilhe o Certificado Digital", desc: "Gere o certificado oficial do animal e compartilhe com compradores, parceiros e vaqueiros por WhatsApp ou link.", color: "text-violet-400", bg: "bg-violet-900/30 border-violet-500/30" },
];

function OnboardingModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === ONBOARDING_STEPS.length - 1;
  const s = ONBOARDING_STEPS[step];
  const SIcon = s.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl" style={{ animation: "fadein 0.2s ease" }}>
        <div className="h-1 bg-border"><div className="h-full bg-primary transition-all duration-300" style={{ width: `${((step+1)/ONBOARDING_STEPS.length)*100}%` }} /></div>
        <div className="p-8">
          <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-6 ${s.bg}`}><SIcon className={`w-8 h-8 ${s.color}`} /></div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Passo {step+1} de {ONBOARDING_STEPS.length}</p>
          <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>{s.title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          <div className="flex items-center gap-1.5 my-6">
            {ONBOARDING_STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)} className={`rounded-full transition-all ${i === step ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border hover:bg-muted-foreground"}`} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Pular introdução</button>
            <div className="flex items-center gap-2">
              {step > 0 && <button onClick={() => setStep((s) => s-1)} className="flex items-center gap-1.5 text-sm text-muted-foreground border border-border px-4 py-2 rounded-lg hover:text-foreground hover:border-foreground/30 transition-colors"><ChevronLeft className="w-4 h-4" /> Voltar</button>}
              <button onClick={() => { if (isLast) { onClose(); toast.success("Bem-vindo ao VaquejaData! 🏆", { description: "Comece cadastrando seu primeiro cavalo." }); } else setStep((s) => s+1); }} className="flex items-center gap-1.5 text-sm font-bold bg-primary text-primary-foreground px-5 py-2 rounded-lg hover:opacity-90 transition-opacity">
                {isLast ? <><Sparkles className="w-4 h-4" /> Começar!</> : <>Próximo <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// HORSE QUICK-VIEW MODAL
// ─────────────────────────────────────────────

function HorseQuickView({ horse, onClose }: { horse: (typeof searchHorses)[0]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ animation: "fadein 0.18s ease" }}>
        <div className="relative h-32">
          <img src={horse.photo.replace("w=80&h=80","w=600&h=200")} alt="" className="w-full h-full object-cover opacity-40" style={{ backgroundColor: "#2a1c0a" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/40 text-white hover:bg-black/60 transition-colors"><X className="w-4 h-4" /></button>
          <div className="absolute bottom-0 left-4 translate-y-1/2"><img src={horse.photo} alt={horse.name} className="w-16 h-16 rounded-xl border-4 border-card object-cover" style={{ backgroundColor: "#2a1c0a" }} /></div>
        </div>
        <div className="px-5 pt-12 pb-5 space-y-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>{horse.name}</h2>
              {horse.titles > 0 && <span className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Award className="w-3 h-3" />{horse.titles} título{horse.titles>1?"s":""}</span>}
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">{horse.abqm} · {horse.sex} · {horse.coat}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Prop.: {horse.owner}</p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Pontos", val: horse.points.toLocaleString("pt-BR"), color: "text-primary" },
              { label: "Prêmios", val: horse.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }), color: "text-emerald-400" },
              { label: "Vitórias", val: String(rankingData.find((r) => r.abqm === horse.abqm)?.wins ?? "—"), color: "text-amber-400" },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-xl bg-secondary/40 py-3">
                <div className={`text-base font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button className="flex-1 flex items-center justify-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground py-2.5 rounded-xl hover:opacity-90 transition-opacity" onClick={onClose}>
              <ExternalLink className="w-4 h-4" /> Ver Perfil Completo
            </button>
            <button onClick={() => toast.success("Cavalo salvo!", { description: `${horse.name} adicionado aos favoritos.` })} className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors">
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FEED
// ─────────────────────────────────────────────

function Feed() {
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [comments, setComments] = useState<{ id: number; horse: string; competition: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const toggle = (id: number) => setLiked((p) => ({ ...p, [id]: !p[id] }));

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);
  if (loading) return <FeedSkeleton />;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {comments && <CommentsPanel postId={comments.id} horse={comments.horse} competition={comments.competition} onClose={() => setComments(null)} />}
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Próximas Competições</p>
        <div className="flex gap-3 overflow-x-auto pb-1">
          {[
            { name: "Vaquejada Parque Ecológico", date: "12 Jul", city: "Mossoró, RN", prize: "R$ 120k", status: "Em breve" },
            { name: "Festival do Vaqueiro", date: "19 Jul", city: "Caruaru, PE", prize: "R$ 80k", status: "Inscrições" },
            { name: "Circuito AVACE — 4ª Etapa", date: "02 Ago", city: "Fortaleza, CE", prize: "R$ 200k", status: "Em breve" },
          ].map((ev) => (
            <div key={ev.name} className="shrink-0 w-48 rounded-lg border border-border bg-secondary/40 p-3">
              <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{ev.status}</div>
              <p className="text-xs font-semibold text-foreground leading-tight">{ev.name}</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground"><Calendar className="w-3 h-3" />{ev.date}</div>
              <div className="flex items-center gap-1 mt-0.5 text-[10px] text-muted-foreground"><MapPin className="w-3 h-3" />{ev.city}</div>
              <div className="mt-2 text-xs font-bold text-emerald-400">{ev.prize}</div>
            </div>
          ))}
        </div>
      </div>
      {feedPosts.map((post) => (
        <div key={post.id} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <img src={post.avatar} alt={post.owner} className="w-10 h-10 rounded-full object-cover border border-border" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{post.owner}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">{post.time}</span>
                <span className="text-muted-foreground text-xs">·</span>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><MapPin className="w-3 h-3" />{post.city}</div>
              </div>
            </div>
          </div>
          <div className="px-5 pb-3">
            <p className="text-sm text-foreground leading-relaxed">
              <span className="font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>{post.horse}</span>{" "}
              <span className="font-mono text-[10px] text-muted-foreground">({post.horseAbqm})</span>{" "}
              {post.action}.
            </p>
            <p className="text-xs text-muted-foreground mt-1">{post.competition}</p>
          </div>
          <div className="relative">
            <img src={post.horsePhoto} alt={post.horse} className="w-full h-56 object-cover" style={{ backgroundColor: "#2a1c0a" }} />
            {(post.prize || post.points) && (
              <div className="absolute bottom-3 right-3 flex gap-2">
                {post.prize && <span className="text-xs font-bold text-emerald-300 bg-black/70 backdrop-blur px-2.5 py-1 rounded-full">{post.prize}</span>}
                {post.points && <span className="text-xs font-bold text-primary bg-black/70 backdrop-blur px-2.5 py-1 rounded-full">{post.points}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 px-4 py-3 border-t border-border">
            <button onClick={() => toggle(post.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${liked[post.id] ? "text-rose-400 bg-rose-900/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
              <Heart className={`w-4 h-4 ${liked[post.id] ? "fill-current" : ""}`} />{post.likes + (liked[post.id] ? 1 : 0)}
            </button>
            <button onClick={() => setComments({ id: post.id, horse: post.horse, competition: post.competition })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"><MessageCircle className="w-4 h-4" />{post.comments}</button>
            <button onClick={() => toast.success("Link copiado!", { description: "Cole no WhatsApp ou Instagram." })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors ml-auto"><Share2 className="w-4 h-4" /> Compartilhar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────
// BUSCA
// ─────────────────────────────────────────────

function Busca() {
  const [query, setQuery] = useState("");
  const [sexFilter, setSexFilter] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [quickView, setQuickView] = useState<(typeof searchHorses)[0] | null>(null);
  const [showSugg, setShowSugg] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return searchHorses.filter((h) =>
      h.name.toLowerCase().includes(query.toLowerCase()) ||
      h.abqm.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }, [query]);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (suggRef.current && !suggRef.current.contains(e.target as Node) &&
          inputRef.current && !inputRef.current.contains(e.target as Node))
        setShowSugg(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const hi = (text: string) => {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (!query || idx === -1) return <span>{text}</span>;
    return <span>{text.slice(0, idx)}<span className="text-primary font-semibold">{text.slice(idx, idx + query.length)}</span>{text.slice(idx + query.length)}</span>;
  };

  const filtered = useMemo(() => searchHorses.filter((h) => {
    const mq = query === "" || h.name.toLowerCase().includes(query.toLowerCase()) || h.abqm.toLowerCase().includes(query.toLowerCase()) || h.owner.toLowerCase().includes(query.toLowerCase());
    return mq && (sexFilter === null || h.sex === sexFilter);
  }), [query, sexFilter]);

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {quickView && <HorseQuickView horse={quickView} onClose={() => setQuickView(null)} />}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSugg(true); }}
          onFocus={() => query.length >= 2 && setShowSugg(true)}
          placeholder="Buscar por nome, registro ABQM ou proprietário…"
          className="w-full bg-card border border-border rounded-xl pl-11 pr-12 py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
        />
        <button onClick={() => setShowFilters((v) => !v)} className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${showFilters ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"}`}><Filter className="w-4 h-4" /></button>
        {showSugg && suggestions.length > 0 && (
          <div ref={suggRef} className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-border bg-card shadow-2xl z-30 overflow-hidden" style={{ animation: "fadein 0.12s ease" }}>
            {suggestions.map((h, i) => (
              <button key={h.abqm} onClick={() => { setQuickView(h); setShowSugg(false); setQuery(h.name); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-secondary/50 transition-colors ${i < suggestions.length - 1 ? "border-b border-border/40" : ""}`}>
                <img src={h.photo} alt={h.name} className="w-8 h-8 rounded-lg object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{hi(h.name)}</p>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{h.abqm} · {h.owner}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-primary">{h.points.toLocaleString("pt-BR")} pts</p>
                  <p className="text-[10px] text-emerald-400">{h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</p>
                </div>
              </button>
            ))}
            <div className="px-4 py-2 bg-secondary/20 border-t border-border/40 text-[10px] text-muted-foreground">
              {suggestions.length} resultado{suggestions.length !== 1 ? "s" : ""} para "<span className="text-foreground">{query}</span>"
            </div>
          </div>
        )}
      </div>
      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-wrap gap-3 items-center">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sexo:</span>
          {["Macho", "Fêmea"].map((s) => (
            <button key={s} onClick={() => setSexFilter(sexFilter === s ? null : s)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sexFilter === s ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>{s}</button>
          ))}
          {sexFilter && <button onClick={() => setSexFilter(null)} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground ml-auto"><X className="w-3 h-3" /> Limpar</button>}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{filtered.length} cavalo{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}</p>
      <div className="grid grid-cols-1 gap-3">
        {filtered.map((h) => (
          <div key={h.abqm} onClick={() => setQuickView(h)} className="rounded-xl border border-border bg-card p-4 flex items-center gap-4 hover:border-primary/30 hover:bg-secondary/20 transition-all cursor-pointer">
            <img src={h.photo} alt={h.name} className="w-16 h-16 rounded-xl object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</h3>
                  <p className="text-[10px] font-mono text-muted-foreground mt-0.5">{h.abqm}</p>
                </div>
                {h.titles > 0 && <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full shrink-0"><Award className="w-3 h-3" />{h.titles} título{h.titles !== 1 ? "s" : ""}</div>}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                <span className="text-xs text-muted-foreground">{h.sex} · {h.coat}</span>
                <span className="text-xs text-muted-foreground">Prop.: <span className="text-foreground/80">{h.owner}</span></span>
              </div>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-xs"><span className="font-bold text-primary">{h.points.toLocaleString("pt-BR")}</span> <span className="text-muted-foreground">pts</span></div>
                <div className="text-xs"><span className="font-bold text-emerald-400">{h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span></div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-16 text-muted-foreground"><Search className="w-8 h-8 mx-auto mb-3 opacity-30" /><p className="text-sm">Nenhum cavalo encontrado</p></div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// RANKING
// ─────────────────────────────────────────────

function CompareModal({ horses, onClose }: { horses: [typeof rankingData[0], typeof rankingData[0]]; onClose: () => void }) {
  const [a, b] = horses;
  const metrics = [
    { label: "Pontos Acumulados", va: a.points, vb: b.points, fmt: (v: number) => v.toLocaleString("pt-BR") },
    { label: "Prêmios em R$", va: a.prize, vb: b.prize, fmt: (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }) },
    { label: "Vitórias", va: a.wins, vb: b.wins, fmt: (v: number) => String(v) },
    { label: "Participações", va: a.participations, vb: b.participations, fmt: (v: number) => String(v) },
    { label: "Taxa de Vitória", va: Math.round((a.wins / a.participations) * 100), vb: Math.round((b.wins / b.participations) * 100), fmt: (v: number) => v + "%" },
  ];
  const winsA = metrics.filter((m) => m.va > m.vb).length;
  const winsB = metrics.filter((m) => m.vb > m.va).length;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()} style={{ animation: "fadein 0.18s ease" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-base font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Comparar Cavalos</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] px-6 py-5 border-b border-border gap-4">
          {[a, b].map((h, i) => (
            <div key={h.abqm} className={`flex flex-col items-center gap-2 ${i === 1 ? "items-end" : ""}`}>
              <img src={h.photo} alt={h.name} className="w-14 h-14 rounded-xl object-cover border-2 border-border" style={{ backgroundColor: "#2a1c0a" }} />
              <div className={i === 1 ? "text-right" : ""}>
                <p className="text-sm font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</p>
                <p className="text-[10px] font-mono text-muted-foreground">{h.abqm}</p>
              </div>
            </div>
          ))}
          <div className="flex items-center justify-center"><span className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>VS</span></div>
        </div>
        <div className="px-6 py-4 space-y-4">
          {metrics.map((m) => {
            const max = Math.max(m.va, m.vb) || 1;
            const wa = m.va > m.vb; const wb = m.vb > m.va;
            return (
              <div key={m.label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center mb-2">{m.label}</p>
                <div className="grid grid-cols-[1fr_24px_1fr] items-center gap-2">
                  <div className="flex items-center justify-end gap-2">
                    <span className={`text-sm font-bold ${wa ? "text-primary" : "text-foreground/60"}`}>{m.fmt(m.va)}</span>
                    <div className="h-2 w-24 rounded-full bg-border overflow-hidden flex justify-end">
                      <div className={`h-full rounded-full ${wa ? "bg-primary" : "bg-muted-foreground/30"}`} style={{ width: `${(m.va / max) * 100}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    {wa && <span className="text-[9px] font-bold text-primary-foreground bg-primary rounded-full w-4 h-4 flex items-center justify-center">A</span>}
                    {wb && <span className="text-[9px] font-bold text-primary-foreground bg-violet-500 rounded-full w-4 h-4 flex items-center justify-center">B</span>}
                    {!wa && !wb && <span className="text-[9px] text-muted-foreground">=</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-border overflow-hidden">
                      <div className={`h-full rounded-full ${wb ? "bg-violet-400" : "bg-muted-foreground/30"}`} style={{ width: `${(m.vb / max) * 100}%` }} />
                    </div>
                    <span className={`text-sm font-bold ${wb ? "text-violet-400" : "text-foreground/60"}`}>{m.fmt(m.vb)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className={`mx-6 mb-6 rounded-xl border p-4 text-center ${winsA > winsB ? "border-primary/30 bg-primary/8" : winsB > winsA ? "border-violet-500/30 bg-violet-900/10" : "border-border bg-secondary/20"}`}>
          {winsA === winsB
            ? <p className="text-sm font-bold">Empate técnico — {winsA} métricas cada</p>
            : <><p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Vencedor por {Math.abs(winsA - winsB)} métrica{Math.abs(winsA - winsB) > 1 ? "s" : ""}</p>
               <p className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: winsA > winsB ? "#c9902a" : "#a78bfa" }}>{winsA > winsB ? a.name : b.name}</p>
               <p className="text-xs text-muted-foreground mt-0.5">{winsA > winsB ? winsA : winsB} vitórias vs {winsA > winsB ? winsB : winsA}</p></>
          }
        </div>
      </div>
    </div>
  );
}

function Ranking() {
  const [sortBy, setSortBy] = useState<"points" | "prize" | "wins">("points");
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const sorted = useMemo(() => [...rankingData].sort((a, b) => b[sortBy === "points" ? "points" : sortBy === "prize" ? "prize" : "wins"] - a[sortBy === "points" ? "points" : sortBy === "prize" ? "prize" : "wins"]), [sortBy]);
  const medalColors = ["text-amber-400", "text-slate-300", "text-amber-700"];
  const toggleSel = (abqm: string) => setSelected((p) => p.includes(abqm) ? p.filter((x) => x !== abqm) : p.length < 2 ? [...p, abqm] : p);
  const compareHorses = selected.length === 2 ? [rankingData.find((h) => h.abqm === selected[0])!, rankingData.find((h) => h.abqm === selected[1])!] as [typeof rankingData[0], typeof rankingData[0]] : null;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);
  if (loading) return <RankingSkeleton />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {comparing && compareHorses && <CompareModal horses={compareHorses} onClose={() => { setComparing(false); setSelected([]); }} />}
      <div className="grid grid-cols-3 gap-3">
        {[{ label: "Cavalos Cadastrados", val: "1.842", icon: Swords, color: "text-primary" }, { label: "Total em Prêmios (2025)", val: "R$ 4,2M", icon: Trophy, color: "text-emerald-400" }, { label: "Provas Registradas", val: "3.918", icon: Medal, color: "text-violet-400" }].map((s) => {
          const SIcon = s.icon; return (
            <div key={s.label} className="rounded-xl border border-border bg-card p-4 text-center">
              <SIcon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
              <div className={`text-xl font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">{s.label}</div>
            </div>
          );
        })}
      </div>
      {/* Compare bar */}
      <div className={`rounded-xl border px-4 py-3 flex items-center justify-between flex-wrap gap-2 transition-all ${selected.length > 0 ? "border-primary/40 bg-primary/5" : "border-border bg-card/50"}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground">
            {selected.length === 0 ? "☑ Marque 2 cavalos para comparar" : selected.length === 1 ? "Selecione mais 1 cavalo" : "Prontos para comparar!"}
          </span>
          {selected.map((abqm) => { const h = rankingData.find((r) => r.abqm === abqm)!; return (
            <div key={abqm} className="flex items-center gap-1.5 bg-secondary/60 border border-border rounded-full px-2.5 py-1">
              <img src={h.photo} alt={h.name} className="w-4 h-4 rounded-full object-cover" />
              <span className="text-xs font-medium text-foreground max-w-20 truncate">{h.name.split(" ")[0]}</span>
              <button onClick={() => setSelected((p) => p.filter((x) => x !== abqm))}><X className="w-3 h-3 text-muted-foreground hover:text-foreground" /></button>
            </div>
          ); })}
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && <button onClick={() => setSelected([])} className="text-xs text-muted-foreground hover:text-foreground transition-colors">Limpar</button>}
          <button disabled={selected.length !== 2} onClick={() => setComparing(true)}
            className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30 disabled:pointer-events-none">
            <BarChart2 className="w-3.5 h-3.5" /> Comparar
          </button>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ordenar por:</span>
        {([{ id: "points", label: "Pontos" }, { id: "prize", label: "Prêmios" }, { id: "wins", label: "Vitórias" }] as const).map((o) => (
          <button key={o.id} onClick={() => setSortBy(o.id)} className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${sortBy === o.id ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>{o.label}</button>
        ))}
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="grid grid-cols-[28px_40px_1fr_80px_100px_60px] gap-0 px-4 py-2 border-b border-border text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <span /><span>#</span><span>Cavalo</span><span className="text-right">Pontos</span><span className="text-right">Prêmios</span><span className="text-right">Vitórias</span>
        </div>
        <div className="divide-y divide-border/50">
          {sorted.map((h, i) => {
            const isSel = selected.includes(h.abqm);
            const isOff = selected.length === 2 && !isSel;
            return (
              <div key={h.abqm} className={`grid grid-cols-[28px_40px_1fr_80px_100px_60px] gap-0 px-4 py-3.5 items-center transition-colors ${isSel ? "bg-primary/8" : isOff ? "opacity-40" : "hover:bg-secondary/30"}`}>
                <button onClick={() => !isOff && toggleSel(h.abqm)} disabled={isOff}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors disabled:pointer-events-none ${isSel ? "border-primary bg-primary" : "border-border hover:border-primary/60"}`}>
                  {isSel && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                </button>
                <div className="flex items-center justify-center">
                  {i < 3 ? <Medal className={`w-4 h-4 ${medalColors[i]}`} /> : <span className="text-sm font-bold text-muted-foreground">{i + 1}</span>}
                </div>
                <div className="flex items-center gap-3 min-w-0">
                  <img src={h.photo} alt={h.name} className="w-9 h-9 rounded-lg object-cover border border-border shrink-0" style={{ backgroundColor: "#2a1c0a" }} />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-foreground truncate" style={{ fontFamily: "'Playfair Display', serif" }}>{h.name}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-muted-foreground">{h.abqm}</span>
                      {h.trend === "up" && <ChevronUp className="w-3 h-3 text-emerald-400" />}
                      {h.trend === "down" && <ChevronDown className="w-3 h-3 text-rose-400" />}
                    </div>
                  </div>
                </div>
                <div className="text-right"><span className={`text-sm font-bold ${sortBy === "points" ? "text-primary" : "text-foreground"}`}>{h.points.toLocaleString("pt-BR")}</span></div>
                <div className="text-right"><span className={`text-sm font-bold ${sortBy === "prize" ? "text-emerald-400" : "text-foreground"}`}>{h.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span></div>
                <div className="text-right"><span className={`text-sm font-bold ${sortBy === "wins" ? "text-amber-400" : "text-foreground"}`}>{h.wins}</span></div>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-border/50 bg-secondary/10 text-[10px] text-muted-foreground">
          Marque 2 cavalos e clique em <span className="text-primary font-semibold">Comparar</span> para análise lado a lado.
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
// RESULT SHARE CARD
// ─────────────────────────────────────────────

type ShareResult = { horse: string; abqm: string; photo: string; placement: string; category: string; competition: string; championship: string; city: string; date: string; prize: number; points: number };

function ResultShareCard({ result, onClose }: { result: ShareResult; onClose: () => void }) {
  const placementColor =
    result.placement.includes("1º") ? "#c9902a" :
    result.placement.includes("2º") ? "#94a3b8" :
    result.placement.includes("3º") ? "#92400e" : "#c9902a";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()} style={{ animation: "fadein 0.2s ease" }}>

        {/* The card itself — designed for screenshot/share */}
        <div
          className="rounded-2xl overflow-hidden shadow-2xl"
          style={{ background: "linear-gradient(160deg, #1a1008 0%, #231608 60%, #1a1008 100%)", border: "1px solid rgba(201,144,42,0.3)" }}
        >
          {/* Top brand strip */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="text-xs font-bold text-primary tracking-widest uppercase">VaquejaData</span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">{result.abqm}</span>
          </div>

          {/* Horse photo */}
          <div className="relative mx-5 rounded-xl overflow-hidden" style={{ height: 220 }}>
            <img
              src={result.photo.replace("w=80&h=80", "w=400&h=300")}
              alt={result.horse}
              className="w-full h-full object-cover"
              style={{ backgroundColor: "#2a1c0a" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            {/* Placement badge */}
            <div
              className="absolute bottom-3 left-3 px-4 py-2 rounded-xl font-black text-xl"
              style={{ backgroundColor: placementColor, color: "#0f0800", fontFamily: "'Playfair Display', serif", textShadow: "none" }}
            >
              {result.placement}
            </div>

            {/* Prize badge */}
            {result.prize > 0 && (
              <div className="absolute bottom-3 right-3 bg-emerald-900/80 border border-emerald-500/40 backdrop-blur rounded-xl px-3 py-2 text-center">
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">Prêmio</p>
                <p className="text-sm font-bold text-emerald-300">{result.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</p>
              </div>
            )}
          </div>

          {/* Info block */}
          <div className="px-5 py-4 space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-foreground leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>{result.horse}</h2>
              <p className="text-sm text-primary mt-0.5 font-semibold">{result.category}</p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
              <span className="font-semibold text-foreground">{result.competition}</span>
              <span>·</span>
              <span>{result.championship}</span>
            </div>

            <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{result.city}</div>
              <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{result.date}</div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="rounded-lg bg-primary/10 border border-primary/20 px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pontos</p>
                <p className="text-lg font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>+{result.points}</p>
              </div>
              <div className="rounded-lg bg-emerald-900/30 border border-emerald-500/20 px-3 py-2 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Prêmio</p>
                <p className="text-lg font-bold text-emerald-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {result.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-4 border-t border-border/30 pt-3 flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">vaquejaData.com.br</p>
            <p className="text-[10px] text-primary font-semibold">Rede Social Equestre</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { toast.success("Link copiado!", { description: "Cole no WhatsApp ou Instagram." }); }}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold border border-border text-foreground py-3 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all"
          >
            <Copy className="w-4 h-4" /> Copiar Link
          </button>
          <button
            onClick={() => { toast.success("Imagem baixada!", { description: `${result.horse} · ${result.placement}` }); }}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold bg-primary text-primary-foreground py-3 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Download className="w-4 h-4" /> Baixar Card
          </button>
        </div>

        <button onClick={onClose} className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">Fechar</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// CERTIFICADO DIGITAL
// ─────────────────────────────────────────────

function Certificado() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    toast.success("Link copiado!", { description: "Compartilhe no WhatsApp, Instagram ou e-mail." });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    toast.success("Download iniciado", { description: "O certificado será salvo como PDF." });
  };

  const handlePrint = () => {
    toast("Abrindo impressão…", { description: "Use Ctrl+P ou ⌘+P para imprimir o certificado." });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Certificado Digital</h2>
          <p className="text-sm text-muted-foreground">Documento oficial do perfil do animal — compartilhável e imprimível.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 px-4 py-2 rounded-lg transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? "Copiado!" : "Copiar Link"}
          </button>
          <button onClick={handleDownload} className="flex items-center gap-1.5 text-xs font-semibold border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 px-4 py-2 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> Baixar PDF
          </button>
          <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-semibold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            <Printer className="w-3.5 h-3.5" /> Imprimir
          </button>
        </div>
      </div>

      {/* Certificate card */}
      <div
        className="rounded-2xl overflow-hidden border-2 border-primary/40 shadow-2xl"
        style={{ background: "linear-gradient(145deg, #1a1008 0%, #231608 50%, #1a1008 100%)" }}
      >
        {/* Header strip */}
        <div className="relative h-48 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=1200&h=400&fit=crop&auto=format"
            alt="Capa"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#1a1008]" />

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
            <span className="text-[8rem] font-black text-primary tracking-tighter leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>VD</span>
          </div>

          {/* Top badge */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-primary/20 border border-primary/40 backdrop-blur rounded-full px-4 py-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Certificado Oficial VaquejaData</span>
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>

          {/* Profile photo */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-28 h-28 rounded-2xl border-4 border-primary/60 overflow-hidden shadow-xl" style={{ backgroundColor: "#2a1c0a" }}>
              <img src="https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=200&h=200&fit=crop&auto=format" alt="Trovão do Nordeste" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="pt-18 px-8 pb-8 mt-14">
          {/* Name and ID */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
              Trovão do Nordeste
            </h1>
            <p className="text-sm font-mono text-primary mt-1 tracking-widest">ABQM Nº Q-912.847</p>
            <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
              <span>Macho</span><span className="text-border">·</span>
              <span>Alazão</span><span className="text-border">·</span>
              <span>Nasc. 15/03/2020</span>
            </div>
          </div>

          {/* Divider with ornament */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <Trophy className="w-5 h-5 text-primary" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>

          {/* Main stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Pontos Acumulados", val: "1.840", color: "text-primary", border: "border-primary/30" },
              { label: "Total em Prêmios", val: "R$ 87.400", color: "text-emerald-400", border: "border-emerald-500/30" },
              { label: "Vitórias Oficiais", val: "12", color: "text-amber-400", border: "border-amber-500/30" },
            ].map((s) => (
              <div key={s.label} className={`text-center rounded-xl border ${s.border} bg-black/20 py-4 px-2`}>
                <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            {/* Identity */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Identificação</p>
              {[
                { label: "Proprietário Atual", val: "José Raimundo Santos" },
                { label: "Criador", val: "Haras Brejo Fundo" },
                { label: "Sexo", val: "Macho" },
                { label: "Pelagem", val: "Alazão" },
                { label: "Data de Nascimento", val: "15 de Março de 2020" },
              ].map((r) => (
                <div key={r.label} className="flex items-baseline gap-2 text-xs">
                  <span className="text-muted-foreground w-36 shrink-0">{r.label}</span>
                  <span className="text-foreground font-medium">{r.val}</span>
                </div>
              ))}
            </div>

            {/* Genealogy */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Genealogia</p>
              {[
                { label: "Pai (Sire)", val: "Rei do Brejo · Q-824.613" },
                { label: "Mãe (Dam)", val: "Estrela do Sertão · Q-791.245" },
                { label: "Avô Paterno", val: "Duque de Ouro · Q-720.100" },
                { label: "Avó Paterna", val: "Princesa Serrana · Q-704.388" },
                { label: "Avô Materno", val: "Flash do Nordeste · Q-698.771" },
              ].map((r) => (
                <div key={r.label} className="flex items-baseline gap-2 text-xs">
                  <span className="text-muted-foreground w-28 shrink-0">{r.label}</span>
                  <span className="text-foreground font-medium font-mono text-[11px]">{r.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Titles */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Títulos Oficiais ABQM</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {abqmTitles.map((t, i) => {
                const TIcon = t.icon;
                return (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                    <TIcon className="w-5 h-5 text-primary shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-foreground leading-tight">{t.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{t.year} · {t.event}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent results */}
          <div className="mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Últimas Provas</p>
            <div className="space-y-2">
              {mockResults.slice(0, 3).map((r, i) => (
                <div key={i} className="flex items-center gap-3 text-xs py-2 border-b border-border/30 last:border-0">
                  <span className={`font-bold w-28 shrink-0 ${r.placement.includes("1º") ? "text-amber-400" : r.placement.includes("2º") ? "text-slate-300" : "text-primary"}`}>{r.placement}</span>
                  <span className="text-foreground flex-1">{r.category}</span>
                  <span className="text-muted-foreground">{r.competition}</span>
                  <span className="font-bold text-emerald-400 shrink-0">{r.prize.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 })}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-end justify-between pt-6 border-t border-border/40">
            <div>
              <p className="text-[10px] text-muted-foreground">Emitido em {new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })}</p>
              <p className="text-[10px] text-muted-foreground">ID: VD-2025-Q912847-CERT</p>
              <p className="text-[10px] text-primary mt-1 font-semibold">vaquejaData.com.br · Verificado e Autenticado</p>
            </div>

            {/* QR code placeholder */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-16 h-16 rounded-lg border border-border bg-white/5 flex items-center justify-center">
                <QrCode className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-[9px] text-muted-foreground text-center">Escanear<br />para verificar</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sharing tip */}
      <div className="rounded-xl border border-border bg-card p-4 flex items-start gap-3">
        <Share2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-sm">
          <span className="font-semibold text-foreground">Compartilhe o certificado</span>
          <span className="text-muted-foreground"> — envie para compradores, parceiros e vaqueiros como cartão de apresentação oficial do animal. O link público permanece ativo enquanto o perfil estiver na plataforma.</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────

function LandingPage({ onLogin, onGoLogin }: { onLogin: (name: string, avatar: string) => void; onGoLogin: () => void }) {
  const features = [
    { icon: Swords, title: "Perfil Completo do Animal", desc: "Foto de capa, perfil, registro ABQM, pelagem, genealogia de 3 gerações e resumo biográfico." },
    { icon: GitBranch, title: "Genealogia Automática", desc: "Pai, mãe e todos os avós calculados automaticamente com links para os perfis dos antepassados." },
    { icon: Trophy, title: "Histórico de Competições", desc: "Cada prova registrada com campeonato, etapa, colocação, prêmio em R$ e pontos obtidos." },
    { icon: BadgeCheck, title: "Títulos ABQM Verificados", desc: "Registro de Mérito, Campeão Nacional, Potro do Futuro — verificados diretamente pela plataforma." },
    { icon: BarChart2, title: "Ranking em Tempo Real", desc: "Classificação geral por pontos, prêmios ou vitórias, atualizada automaticamente a cada resultado." },
    { icon: TrendingUp, title: "Estatísticas Avançadas", desc: "Gráficos de evolução, comparativos entre animais, taxa de vitória e distribuição por categoria." },
  ];

  const testimonials = [
    { name: "Haras Sertão Vivo", role: "Criador e Proprietário · Fortaleza, CE", text: "Finalmente uma plataforma que trata o cavalo de vaquejada com a seriedade que ele merece. Meu plantel inteiro num só lugar.", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=48&h=48&fit=crop&auto=format" },
    { name: "José Raimundo Santos", role: "Proprietário · Mossoró, RN", text: "Antes eu anotava tudo em caderno. Agora o VaquejaData calcula os pontos e prêmios automaticamente. Não vivo sem.", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=48&h=48&fit=crop&auto=format" },
    { name: "Marcos Andrade", role: "Vaqueiro Profissional · Campina Grande, PB", text: "Meu cavalo aparece no ranking com histórico completo. Dá credibilidade na hora de negociar com compradores.", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&auto=format" },
  ];

  return (
    <div className="space-y-0 -mt-8 -mx-4 sm:-mx-6">
      {/* HERO */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url(https://images.unsplash.com/photo-1553284965-e2815db4c9b6?w=1600&h=900&fit=crop&auto=format)", backgroundColor: "#0f0800" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-6 sm:px-10 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 border border-primary/30 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
              <Zap className="w-3.5 h-3.5" /> Plataforma #1 de Vaquejada no Brasil
            </div>

            <div>
              <h1 className="font-bold leading-tight text-foreground" style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.2rem, 5vw, 3.5rem)", lineHeight: 1.1 }}>
                O Currículo Definitivo<br />
                <span className="text-primary">do seu Cavalo</span><br />
                de Vaquejada
              </h1>
              <p className="mt-5 text-base text-muted-foreground leading-relaxed max-w-lg">
                Cadastre seu animal com genealogia completa, acompanhe cada prova, acumule pontos e exiba os títulos ABQM — tudo em um perfil que valoriza o seu patrimônio.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={onGoLogin}
                className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity text-sm"
              >
                <UserPlus className="w-4 h-4" /> Criar Conta Gratuita
              </button>
              <button
                onClick={() => onLogin(ownerProfiles[0].name, ownerProfiles[0].avatar)}
                className="flex items-center gap-2 border border-border text-foreground font-semibold px-6 py-3 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-sm"
              >
                <Play className="w-4 h-4" /> Ver Demonstração
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Gratuito para começar
              <span className="mx-1">·</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Sem cartão de crédito
              <span className="mx-1">·</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" /> Dados seguros
            </div>
          </div>

          {/* Hero stats card */}
          <div className="hidden lg:block">
            <div className="rounded-2xl border border-border bg-card/80 backdrop-blur p-6 space-y-5 shadow-2xl">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <img src="https://images.unsplash.com/photo-1534774867517-5a0b1972ea5c?w=56&h=56&fit=crop&auto=format" alt="" className="w-14 h-14 rounded-xl object-cover border border-border" style={{ backgroundColor: "#2a1c0a" }} />
                <div>
                  <p className="font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>Trovão do Nordeste</p>
                  <p className="text-xs text-muted-foreground font-mono">ABQM Q-912.847 · Alazão · Macho</p>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-bold text-primary" style={{ fontFamily: "'Playfair Display', serif" }}>1.840</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">pontos</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[{ label: "Prêmios", val: "R$ 87,4k", color: "text-emerald-400" }, { label: "Vitórias", val: "12", color: "text-amber-400" }, { label: "Títulos", val: "3", color: "text-primary" }].map((s) => (
                  <div key={s.label} className="rounded-lg bg-secondary/40 p-3">
                    <div className={`text-lg font-bold ${s.color}`} style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Última prova</p>
                <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/20">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">1º Lugar — Profissional Puxador</p>
                    <p className="text-[10px] text-muted-foreground">Vaquejada do Parque Ecológico · Mossoró, RN</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-400 shrink-0">+R$ 8.500</span>
                </div>
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Genealogia</p>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[{ role: "Pai", name: "Rei do Brejo" }, { role: "Mãe", name: "Estrela do Sertão" }, { role: "Avô Pat.", name: "Duque de Ouro" }, { role: "Avô Mat.", name: "Flash do Nordeste" }].map((g) => (
                    <div key={g.role} className="flex items-center gap-1.5">
                      <span className="text-[9px] text-muted-foreground w-12 shrink-0">{g.role}</span>
                      <span className="text-foreground/80 truncate">{g.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="border-y border-border bg-card/60 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          {[
            { val: "1.842", label: "Cavalos Cadastrados", icon: Swords },
            { val: "3.918", label: "Provas Registradas", icon: Medal },
            { val: "R$ 4,2M", label: "Em Prêmios Mapeados", icon: Trophy },
            { val: "729", label: "Títulos ABQM Verificados", icon: BadgeCheck },
          ].map((s) => {
            const SIcon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-3">
                <SIcon className="w-5 h-5 text-primary shrink-0" />
                <div>
                  <div className="text-xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>{s.val}</div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Funcionalidades</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Tudo que seu animal merece ter registrado</h2>
          <p className="text-muted-foreground text-sm mt-3 max-w-xl mx-auto">Uma plataforma construída por e para quem vive a vaquejada — do criador ao proprietário, do vaqueiro ao torcedor.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => {
            const FIcon = f.icon;
            return (
              <div key={f.title} className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:bg-secondary/20 transition-all group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <FIcon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-foreground mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>{f.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-border bg-card/40">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Como Funciona</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Em 3 passos, seu cavalo está na plataforma</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {[
              { n: "01", title: "Cadastre o Animal", desc: "Preencha nome, registro ABQM, genealogia e fotos. Leva menos de 5 minutos.", icon: Plus },
              { n: "02", title: "Registre as Provas", desc: "Adicione cada resultado: campeonato, etapa, colocação, prêmio e pontos obtidos.", icon: Clipboard },
              { n: "03", title: "Acompanhe a Evolução", desc: "Ranking atualizado em tempo real, gráficos de performance e histórico completo.", icon: TrendingUp },
            ].map((s, i) => {
              const SIcon = s.icon;
              return (
                <div key={s.n} className="relative text-center">
                  {i < 2 && <div className="hidden sm:block absolute top-8 left-[60%] w-[80%] h-px border-t border-dashed border-border" />}
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-5 relative z-10">
                    <SIcon className="w-7 h-7 text-primary" />
                    <span className="absolute -top-2 -right-2 text-[9px] font-bold text-primary bg-card border border-primary/30 w-5 h-5 rounded-full flex items-center justify-center">{s.n}</span>
                  </div>
                  <h3 className="font-bold text-foreground mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{s.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-48 mx-auto">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-6 sm:px-10 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-primary mb-3">Depoimentos</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>Quem já usa o VaquejaData</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {testimonials.map((t) => (
            <div key={t.name} className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-primary fill-current" />)}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed italic flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-border">
                <img src={t.avatar} alt={t.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                <div>
                  <p className="text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="border-t border-border bg-card/40">
        <div className="max-w-3xl mx-auto px-6 sm:px-10 py-20 text-center space-y-6">
          <h2 className="text-4xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
            Seu campeão merece<br />um registro à altura.
          </h2>
          <p className="text-muted-foreground leading-relaxed">Junte-se a mais de 3.800 cavalos já cadastrados e comece a construir o histórico definitivo do seu animal hoje mesmo.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button onClick={onGoLogin} className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity text-sm">
              <UserPlus className="w-4 h-4" /> Criar Conta Gratuita
            </button>
            <button onClick={() => onLogin(ownerProfiles[0].name, ownerProfiles[0].avatar)} className="flex items-center gap-2 border border-border font-semibold px-8 py-3.5 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-sm">
              <Play className="w-4 h-4" /> Ver Demo
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// FOOTER
// ─────────────────────────────────────────────

function Footer({ onTabChange }: { onTabChange: (t: Tab) => void }) {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="sm:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0"><Trophy className="w-4 h-4 text-primary-foreground" /></div>
              <span className="font-bold text-lg" style={{ fontFamily: "'Playfair Display', serif" }}>VaquejaData</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">A rede social oficial dos cavalos de vaquejada do Brasil. Registro, histórico e genealogia em um só lugar.</p>
            <div className="flex gap-3 mt-4">
              {["Instagram", "YouTube", "Facebook"].map((s) => (
                <button key={s} className="text-[10px] text-muted-foreground hover:text-foreground transition-colors">{s}</button>
              ))}
            </div>
          </div>

          {/* Links */}
          {[
            { title: "Plataforma", links: [{ label: "Feed", tab: "feed" as Tab }, { label: "Busca de Cavalos", tab: "busca" as Tab }, { label: "Ranking", tab: "ranking" as Tab }, { label: "Estatísticas", tab: "estatisticas" as Tab }] },
            { title: "Gestão", links: [{ label: "Cadastrar Cavalo", tab: "cadastro" as Tab }, { label: "Campeonatos", tab: "campeonatos" as Tab }, { label: "Minha Conta", tab: "proprietario" as Tab }, { label: "Configurações", tab: "configuracoes" as Tab }] },
            { title: "Sobre", links: [{ label: "Como Funciona", tab: "landing" as Tab }, { label: "Banco de Dados", tab: "banco" as Tab }, { label: "Stack Técnica", tab: "stack" as Tab }, { label: "Admin", tab: "admin" as Tab }] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{col.title}</p>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button onClick={() => onTabChange(l.tab)} className="text-xs text-muted-foreground hover:text-foreground transition-colors text-left">
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-muted-foreground">
          <span>© 2025 VaquejaData. Todos os direitos reservados.</span>
          <div className="flex gap-4">
            <button className="hover:text-foreground transition-colors">Termos de Uso</button>
            <button className="hover:text-foreground transition-colors">Política de Privacidade</button>
            <button className="hover:text-foreground transition-colors">Contato</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
// NOTIFICATIONS DATA
// ─────────────────────────────────────────────

const NOTIFS = [
  { id: 1, type: "resultado", text: "Trovão do Nordeste conquistou 1º lugar", sub: "Profissional Puxador · Mossoró, RN", time: "2h atrás", read: false, icon: Trophy },
  { id: 2, type: "titulo", text: "Seu título foi verificado pela ABQM", sub: "Registro de Mérito em Vaquejada — aprovado", time: "5h atrás", read: false, icon: BadgeCheck },
  { id: 3, type: "competicao", text: "Inscrições abertas: 4ª Etapa AVACE", sub: "Campina Grande, PB · 12 Jul 2025", time: "1 dia atrás", read: true, icon: Calendar },
  { id: 4, type: "resultado", text: "Ventania do Sertão — 2º lugar", sub: "Derby Open · Caruaru, PE", time: "2 dias atrás", read: true, icon: Medal },
  { id: 5, type: "sistema", text: "Bem-vindo ao VaquejaData!", sub: "Cadastre seus cavalos e acompanhe os resultados.", time: "3 dias atrás", read: true, icon: Star },
];

function NotifDropdown({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(NOTIFS);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onClose]);

  const markAll = () => setNotifs((n) => n.map((x) => ({ ...x, read: true })));
  const unread = notifs.filter((n) => !n.read).length;

  const iconColor = (type: string) =>
    type === "resultado" ? "text-amber-400 bg-amber-900/30" :
    type === "titulo"    ? "text-primary bg-primary/15" :
    type === "competicao"? "text-emerald-400 bg-emerald-900/30" :
    "text-muted-foreground bg-secondary/50";

  return (
    <div ref={ref} className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">Notificações</span>
          {unread > 0 && <span className="text-[10px] font-bold text-primary-foreground bg-primary px-1.5 py-0.5 rounded-full">{unread}</span>}
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors">
            <CheckCheck className="w-3 h-3" /> Marcar todas como lidas
          </button>
        )}
      </div>
      <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
        {notifs.map((n) => {
          const NIcon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-secondary/30 transition-colors ${!n.read ? "bg-primary/4" : ""}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${iconColor(n.type)}`}>
                <NIcon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-snug ${!n.read ? "font-semibold text-foreground" : "text-foreground/80"}`}>{n.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">{n.sub}</p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">{n.time}</p>
              </div>
              {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />}
            </button>
          );
        })}
      </div>
      <div className="px-4 py-2.5 border-t border-border text-center">
        <button className="text-xs text-primary hover:underline">Ver todas as notificações</button>
      </div>
    </div>
  );
}

// Nav groups for logged-in users
const NAV_MAIN = [
  { id: "feed" as Tab, label: "Feed", icon: Rss },
  { id: "busca" as Tab, label: "Busca", icon: Search },
  { id: "ranking" as Tab, label: "Ranking", icon: Medal },
  { id: "estatisticas" as Tab, label: "Stats", icon: BarChart2 },
  { id: "campeonatos" as Tab, label: "Campeonatos", icon: Trophy },
];
const NAV_MANAGE = [
  { id: "cadastro" as Tab, label: "Cadastrar", icon: Plus },
  { id: "perfil" as Tab, label: "Perfil Cavalo", icon: Swords },
  { id: "certificado" as Tab, label: "Certificado", icon: BadgeCheck },
  { id: "proprietario" as Tab, label: "Minha Conta", icon: User },
  { id: "configuracoes" as Tab, label: "Config.", icon: Settings },
];
const NAV_DEV = [
  { id: "admin" as Tab, label: "Admin", icon: ShieldCheck },
  { id: "banco" as Tab, label: "BD", icon: Database },
  { id: "stack" as Tab, label: "Stack", icon: Code2 },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("landing");
  const [loggedUser, setLoggedUser] = useState<{ name: string; avatar: string } | null>(null);
  const [showNotifs, setShowNotifs] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const unreadCount = NOTIFS.filter((n) => !n.read).length;

  const handleLogin = (name: string, avatar: string, isNew = false) => {
    setLoggedUser({ name, avatar });
    setTab("feed");
    setMobileMenuOpen(false);
    if (isNew) setTimeout(() => setShowOnboarding(true), 400);
  };

  const handleLogout = () => {
    setLoggedUser(null);
    setTab("landing");
    setMobileMenuOpen(false);
  };

  const goTo = (t: Tab) => { setTab(t); setMobileMenuOpen(false); };

  const isLanding = tab === "landing" || tab === "login";
  const allNavTabs = [...NAV_MAIN, ...NAV_MANAGE, ...NAV_DEV];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background: "#231608", border: "1px solid rgba(201,144,42,0.25)", color: "#f5ead6", fontFamily: "'Inter', sans-serif" },
          classNames: { title: "font-semibold text-sm", description: "text-xs text-muted-foreground" },
        }}
      />
      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      {/* ── HEADER ── */}
      <header className="border-b border-border bg-card/90 backdrop-blur sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <button onClick={() => goTo(loggedUser ? "feed" : "landing")} className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0 group-hover:opacity-90 transition-opacity">
                <Trophy className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-bold leading-none" style={{ fontFamily: "'Playfair Display', serif" }}>VaquejaData</p>
                <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Rede Social Equestre</p>
              </div>
            </button>

            {/* Desktop nav — logged in only */}
            {loggedUser && (
              <nav className="hidden lg:flex items-center gap-0 border-l border-border ml-6 pl-6">
                {NAV_MAIN.map((t) => {
                  const TIcon = t.icon;
                  return (
                    <button key={t.id} onClick={() => goTo(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                      <TIcon className="w-3.5 h-3.5" />{t.label}
                    </button>
                  );
                })}
                <div className="w-px h-5 bg-border mx-1" />
                {NAV_MANAGE.map((t) => {
                  const TIcon = t.icon;
                  return (
                    <button key={t.id} onClick={() => goTo(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                      <TIcon className="w-3.5 h-3.5" />{t.label}
                    </button>
                  );
                })}
                <div className="w-px h-5 bg-border mx-1" />
                {NAV_DEV.map((t) => {
                  const TIcon = t.icon;
                  return (
                    <button key={t.id} onClick={() => goTo(t.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                      <TIcon className="w-3.5 h-3.5" />{t.label}
                    </button>
                  );
                })}
              </nav>
            )}

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {loggedUser && (
                <div className="relative">
                  <button onClick={() => setShowNotifs((v) => !v)} className={`relative p-2 rounded-lg border transition-colors ${showNotifs ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"}`}>
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-[9px] font-bold text-primary-foreground flex items-center justify-center">{unreadCount}</span>}
                  </button>
                  {showNotifs && <NotifDropdown onClose={() => setShowNotifs(false)} />}
                </div>
              )}

              {loggedUser ? (
                <div className="flex items-center gap-2">
                  <button onClick={() => goTo("proprietario")} className="hidden sm:flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 hover:border-foreground/20 transition-colors">
                    <img src={loggedUser.avatar} alt={loggedUser.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="text-xs font-medium text-foreground">{loggedUser.name.split(" ")[0]}</span>
                  </button>
                  <button onClick={handleLogout} className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <LogIn className="w-3.5 h-3.5 rotate-180" /> Sair
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={() => goTo("login")} className="hidden sm:block text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5">
                    Entrar
                  </button>
                  <button onClick={() => goTo("login")} className="flex items-center gap-1.5 text-xs font-bold bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                    <UserPlus className="w-3.5 h-3.5" /> Cadastrar
                  </button>
                </div>
              )}

              {/* Hamburger */}
              <button onClick={() => setMobileMenuOpen((v) => !v)} className="lg:hidden p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors">
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <div className="max-w-6xl mx-auto px-4 py-4 space-y-1">
              {!loggedUser && (
                <>
                  <button onClick={() => goTo("landing")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors">
                    <Globe className="w-4 h-4" /> Início
                  </button>
                  <button onClick={() => goTo("login")} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary bg-primary/10 transition-colors">
                    <LogIn className="w-4 h-4" /> Entrar / Criar Conta
                  </button>
                </>
              )}
              {loggedUser && (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 border-b border-border pb-3">
                    <img src={loggedUser.avatar} alt={loggedUser.name} className="w-8 h-8 rounded-full object-cover border border-border" />
                    <div>
                      <p className="text-sm font-semibold text-foreground">{loggedUser.name}</p>
                      <button onClick={handleLogout} className="text-[10px] text-rose-400 hover:underline">Sair da conta</button>
                    </div>
                  </div>
                  {allNavTabs.map((t) => {
                    const TIcon = t.icon;
                    return (
                      <button key={t.id} onClick={() => goTo(t.id)} className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition-colors ${tab === t.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                        <TIcon className="w-4 h-4" />{t.label}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main key={tab} className={`flex-1 animate-fadein ${isLanding ? "" : "max-w-6xl mx-auto w-full px-4 sm:px-6 py-8"} ${loggedUser ? "pb-20 lg:pb-0" : ""}`}
        style={{ animation: "fadein 0.18s ease" }}
      >
        {tab === "landing" && <LandingPage onLogin={handleLogin} onGoLogin={() => goTo("login")} />}
        {tab === "login"   && <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8"><Login onLogin={handleLogin} /></div>}
        {tab === "feed"         && <Feed />}
        {tab === "busca"        && <Busca />}
        {tab === "ranking"      && <Ranking />}
        {tab === "estatisticas" && <Estatisticas />}
        {tab === "perfil"       && <HorseProfile />}
        {tab === "proprietario" && <PerfilProprietario loggedUser={loggedUser} />}
        {tab === "cadastro"     && <Cadastro />}
        {tab === "campeonatos"  && <Campeonatos />}
        {tab === "admin"        && <Admin />}
        {tab === "configuracoes"  && <Configuracoes loggedUser={loggedUser} />}
        {tab === "certificado"    && <Certificado />}

        {tab === "banco" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Banco de Dados</h2>
              <p className="text-muted-foreground text-sm max-w-2xl">PostgreSQL 16 · 10 tabelas · genealogia auto-referenciada · VIEW de soma automática.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Entidades Principais</h3>
                <div className="space-y-2">{tables.slice(0, 2).map((t) => <TableCard key={t.name} table={t} />)}</div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-4"><Trophy className="w-3.5 h-3.5" /> Competições</h3>
                <div className="space-y-2">{tables.slice(2, 6).map((t) => <TableCard key={t.name} table={t} />)}</div>
              </div>
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><BarChart3 className="w-3.5 h-3.5" /> Resultados & Mídia</h3>
                <div className="space-y-2">{tables.slice(6, 9).map((t) => <TableCard key={t.name} table={t} />)}</div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2 mt-4"><Hash className="w-3.5 h-3.5" /> Histórico & Views</h3>
                <div className="space-y-2">
                  {tables.slice(9).map((t) => <TableCard key={t.name} table={t} />)}
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-primary">VIEW: horse_stats</span></div>
                    <pre className="text-[11px] font-mono text-muted-foreground leading-relaxed overflow-x-auto">{`SELECT h.id, SUM(hcr.points_earned) AS total_points,\n  SUM(hcr.prize_money) AS total_prize_money,\n  COUNT(hcr.id) AS total_participations\nFROM horses h\nLEFT JOIN horse_competition_results hcr ON h.id = hcr.horse_id\nGROUP BY h.id;`}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "stack" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>Stack Tecnológica</h2>
              <p className="text-muted-foreground text-sm max-w-2xl">Escolhas orientadas a escalabilidade e custo-benefício para MVP — sem complexidade prematura.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{stackItems.map((item) => <StackLayer key={item.layer} item={item} />)}</div>
          </div>
        )}
      </main>

      {/* ── FOOTER ── */}
      {!mobileMenuOpen && <Footer onTabChange={goTo} />}

      {/* ── MOBILE BOTTOM NAV ── */}
      {loggedUser && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-card/95 backdrop-blur border-t border-border">
          <div className="grid grid-cols-5 h-16">
            {[
              { id: "feed" as Tab, label: "Feed", icon: Rss },
              { id: "busca" as Tab, label: "Busca", icon: Search },
              { id: "ranking" as Tab, label: "Ranking", icon: Medal },
              { id: "campeonatos" as Tab, label: "Eventos", icon: Trophy },
              { id: "proprietario" as Tab, label: "Conta", icon: User },
            ].map((t) => {
              const TIcon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => goTo(t.id)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <TIcon className={`w-5 h-5 transition-transform ${active ? "scale-110" : ""}`} />
                  <span className={`text-[9px] font-semibold uppercase tracking-wider ${active ? "text-primary" : ""}`}>{t.label}</span>
                  {active && <span className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />}
                </button>
              );
            })}
          </div>
          {/* Safe area padding for iOS */}
          <div className="h-safe-area-inset-bottom" />
        </nav>
      )}
    </div>
  );
}
