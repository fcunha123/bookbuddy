// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Use env vars if set, fall back to project defaults.
// The anon key is safe to expose — it's protected by RLS policies.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel for best practice.
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL
  || "https://dqwtohkgbfhgtypucuhq.supabase.co";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY
  || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxd3RvaGtnYmZoZ3R5cHVjdWhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNjk4OTMsImV4cCI6MjA5MTc0NTg5M30.W4Pmq84YAPzr_SK_V7v8epmx2v6DtkifsunDL-MwbN8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: { persistSession: true, autoRefreshToken: true },
});

// ── TYPES ────────────────────────────────────────────────────────────────────
export interface Profile {
  id: string;
  nome: string;
  email: string;
  avatar_emoji: string;
}

export interface Book {
  id: string;
  user_id: string;
  titulo: string;
  autor: string | null;
  genero: string;
  paginas: number | null;
  nota: number;
  descricao: string | null;
  descricao_usuario: string | null;
  capa_url: string | null;
  disponivel: boolean;
  created_at: string;
  profile?: Profile;
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: "pending" | "accepted" | "blocked";
  profile?: Profile;
}

export interface Loan {
  id: string;
  book_id: string;
  lender_id: string;
  borrower_id: string;
  status: "requested" | "active" | "returned" | "rejected";
  due_date: string | null;
  requested_at: string;
  returned_at: string | null;
  book?: Book;
  lender?: Profile;
  borrower?: Profile;
}

export interface Notification {
  id: string;
  user_id: string;
  tipo: "pedido" | "devolucao" | "amizade" | "atraso";
  titulo: string;
  texto: string;
  lida: boolean;
  related_loan_id: string | null;
  related_user_id: string | null;
  created_at: string;
}

export interface UserStats {
  livros: number;
  emprestados: number;
  amigos: number;
}

// ── AUTH ─────────────────────────────────────────────────────────────────────
export const signUp = async (
  email: string, password: string, nome: string, avatar_emoji: string
) => {
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { nome, avatar_emoji } },
  });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// FIX: implement password reset
export const resetPassword = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
};

export const onAuthChange = (cb: (session: unknown) => void) =>
  supabase.auth.onAuthStateChange((_event, session) => cb(session));

// ── PROFILE ──────────────────────────────────────────────────────────────────
export const getProfile = async (userId: string): Promise<Profile | null> => {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
};

// ── STATS ────────────────────────────────────────────────────────────────────
// FIX: real stats for Início screen — three parallel queries, very fast
export const getUserStats = async (userId: string): Promise<UserStats> => {
  const [booksRes, loansRes, friendsRes] = await Promise.all([
    supabase.from("books").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("loans").select("id", { count: "exact", head: true })
      .eq("borrower_id", userId).in("status", ["requested", "active"]),
    supabase.from("friendships").select("id", { count: "exact", head: true })
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
      .eq("status", "accepted"),
  ]);
  return {
    livros:      booksRes.count  ?? 0,
    emprestados: loansRes.count  ?? 0,
    amigos:      friendsRes.count ?? 0,
  };
};

// ── BOOKS ────────────────────────────────────────────────────────────────────
export const getMyBooks = async (userId: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const getFriendBooks = async (friendId: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from("books").select("*").eq("user_id", friendId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
};

export const addBook = async (userId: string, book: {
  titulo: string; autor?: string; genero?: string; paginas?: number;
  nota?: number; descricao?: string; descricao_usuario?: string; capa_url?: string;
}): Promise<Book> => {
  const { data, error } = await supabase
    .from("books").insert({ ...book, user_id: userId }).select().single();
  if (error) throw error;
  return data;
};

export const updateBook = async (bookId: string, updates: Partial<Book>) => {
  const { error } = await supabase.from("books").update(updates).eq("id", bookId);
  if (error) throw error;
};

export const uploadCover = async (bookId: string, dataUrl: string): Promise<string> => {
  const res  = await fetch(dataUrl);
  const blob = await res.blob();
  const ext  = blob.type.split("/")[1] || "jpg";
  const path = `covers/${bookId}.${ext}`;
  const { error } = await supabase.storage
    .from("book-covers").upload(path, blob, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from("book-covers").getPublicUrl(path);
  return data.publicUrl;
};

// ── FRIENDSHIPS ──────────────────────────────────────────────────────────────
export const getFriends = async (userId: string): Promise<(Friendship & { profile: Profile })[]> => {
  const { data: friendships, error } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    .eq("status", "accepted");
  if (error) throw error;
  if (!friendships?.length) return [];

  const otherIds = friendships.map(f =>
    f.requester_id === userId ? f.addressee_id : f.requester_id
  );
  const { data: profiles } = await supabase
    .from("profiles").select("id, nome, email, avatar_emoji").in("id", otherIds);

  const profileMap: Record<string, Profile> = {};
  (profiles ?? []).forEach(p => { profileMap[p.id] = p; });

  return friendships.map(f => {
    const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
    return { ...f, profile: profileMap[otherId] };
  });
};

export const getPendingRequests = async (userId: string) => {
  const { data: requests, error } = await supabase
    .from("friendships")
    .select("id, status, requester_id")
    .eq("addressee_id", userId).eq("status", "pending");
  if (error) throw error;
  if (!requests?.length) return [];

  const requesterIds = requests.map(r => r.requester_id);
  const { data: profiles } = await supabase
    .from("profiles").select("id, nome, email, avatar_emoji").in("id", requesterIds);

  const profileMap: Record<string, Profile> = {};
  (profiles ?? []).forEach(p => { profileMap[p.id] = p; });

  return requests.map(r => ({ ...r, profile: profileMap[r.requester_id] ?? null }));
};

export const sendFriendRequest = async (requesterId: string, addresseeId: string) => {
  const { error } = await supabase
    .from("friendships").insert({ requester_id: requesterId, addressee_id: addresseeId });
  if (error) throw error;
};

export const respondFriendRequest = async (id: string, action: "accepted" | "blocked") => {
  const { error } = await supabase
    .from("friendships").update({ status: action }).eq("id", id);
  if (error) throw error;
};

// ── LOANS ────────────────────────────────────────────────────────────────────
// FIX: rewritten as two-step queries — FK join syntax was silently failing

export const getMyBorrowedLoans = async (userId: string): Promise<Loan[]> => {
  const { data: loans, error } = await supabase
    .from("loans")
    .select("*, book:books(*)")
    .eq("borrower_id", userId)
    .in("status", ["requested", "active"])
    .order("requested_at", { ascending: false });
  if (error) throw error;
  if (!loans?.length) return [];

  const lenderIds = [...new Set(loans.map(l => l.lender_id))];
  const { data: lenders } = await supabase
    .from("profiles").select("id, nome, avatar_emoji").in("id", lenderIds);
  const lenderMap: Record<string, Profile> = {};
  (lenders ?? []).forEach(p => { lenderMap[p.id] = p; });

  return loans.map(l => ({ ...l, lender: lenderMap[l.lender_id] }));
};

export const getMyLentLoans = async (userId: string): Promise<Loan[]> => {
  const { data: loans, error } = await supabase
    .from("loans")
    .select("*, book:books(*)")
    .eq("lender_id", userId)
    .in("status", ["requested", "active"])
    .order("requested_at", { ascending: false });
  if (error) throw error;
  if (!loans?.length) return [];

  const borrowerIds = [...new Set(loans.map(l => l.borrower_id))];
  const { data: borrowers } = await supabase
    .from("profiles").select("id, nome, avatar_emoji").in("id", borrowerIds);
  const borrowerMap: Record<string, Profile> = {};
  (borrowers ?? []).forEach(p => { borrowerMap[p.id] = p; });

  return loans.map(l => ({ ...l, borrower: borrowerMap[l.borrower_id] }));
};

export const requestLoan = async (
  bookId: string, lenderId: string, borrowerId: string
): Promise<Loan> => {
  const due = new Date();
  due.setDate(due.getDate() + 14);
  const { data, error } = await supabase
    .from("loans")
    .insert({ book_id: bookId, lender_id: lenderId, borrower_id: borrowerId, due_date: due.toISOString() })
    .select().single();
  if (error) throw error;
  return data;
};

export const approveLoan = async (loanId: string) => {
  const { error } = await supabase.from("loans").update({ status: "active" }).eq("id", loanId);
  if (error) throw error;
};

export const rejectLoan = async (loanId: string) => {
  const { error } = await supabase.from("loans").update({ status: "rejected" }).eq("id", loanId);
  if (error) throw error;
};

export const returnLoan = async (loanId: string) => {
  const { error } = await supabase
    .from("loans")
    .update({ status: "returned", returned_at: new Date().toISOString() })
    .eq("id", loanId);
  if (error) throw error;
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data, error } = await supabase
    .from("notifications").select("*").eq("user_id", userId)
    .order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return data ?? [];
};

export const markNotifRead = async (id: string) => {
  await supabase.from("notifications").update({ lida: true }).eq("id", id);
};

export const markAllNotifsRead = async (userId: string) => {
  await supabase.from("notifications")
    .update({ lida: true }).eq("user_id", userId).eq("lida", false);
};

export const deleteNotif = async (id: string) => {
  await supabase.from("notifications").delete().eq("id", id);
};

export const subscribeNotifs = (userId: string, onNew: (n: Notification) => void) => {
  const ch = supabase.channel(`notifs:${userId}`)
    .on("postgres_changes", {
      event: "INSERT", schema: "public", table: "notifications",
      filter: `user_id=eq.${userId}`,
    }, payload => onNew(payload.new as Notification))
    .subscribe();
  return () => supabase.removeChannel(ch);
};

// ── INVITE HELPERS ────────────────────────────────────────────────────────────
export const getProfileById = async (id: string): Promise<Profile | null> => {
  const { data } = await supabase
    .from("profiles").select("id, nome, email, avatar_emoji").eq("id", id).single();
  return data ?? null;
};

export const checkFriendship = async (userId: string, otherId: string) => {
  const { data } = await supabase
    .from("friendships")
    .select("id, status")
    .or(`and(requester_id.eq.${userId},addressee_id.eq.${otherId}),and(requester_id.eq.${otherId},addressee_id.eq.${userId})`)
    .maybeSingle();
  return data ?? null;
};
