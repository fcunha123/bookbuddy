-- ============================================================
--  BookBuddy — Supabase PostgreSQL Schema
--  Paste this into: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ── 1. PROFILES ─────────────────────────────────────────────
-- One profile per user (auto-created on sign-up via trigger)
CREATE TABLE public.profiles (
  id            UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  avatar_emoji  TEXT        DEFAULT '📚',
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.profiles IS 'Public user profiles, one per auth.users row';


-- ── 2. BOOKS ────────────────────────────────────────────────
CREATE TABLE public.books (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  titulo            TEXT        NOT NULL,
  autor             TEXT,
  genero            TEXT        DEFAULT 'Outros',
  paginas           INTEGER,
  nota              INTEGER     DEFAULT 5 CHECK (nota BETWEEN 1 AND 5),
  descricao         TEXT,                     -- description shown to all friends
  descricao_usuario TEXT,                     -- user's personal annotation (private)
  capa_url          TEXT,                     -- Supabase Storage public URL
  disponivel        BOOLEAN     DEFAULT TRUE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.books IS 'Books that belong to a user''s shelf';


-- ── 3. FRIENDSHIPS ──────────────────────────────────────────
-- status: 'pending' → requester sent invite, waiting for addressee
--         'accepted' → both are friends
--         'blocked'  → addressee blocked requester
CREATE TABLE public.friendships (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  addressee_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status        TEXT        DEFAULT 'pending'
                CHECK (status IN ('pending','accepted','blocked')),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (requester_id, addressee_id),
  CHECK (requester_id <> addressee_id)
);
COMMENT ON TABLE public.friendships IS 'Bidirectional friend relationships between users';


-- ── 4. INVITES ──────────────────────────────────────────────
-- Email invitations sent by existing users
CREATE TABLE public.invites (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  inviter_id  UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  email       TEXT        NOT NULL,
  token       TEXT        UNIQUE NOT NULL DEFAULT uuid_generate_v4()::TEXT,
  status      TEXT        DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','expired')),
  sent_at     TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);
COMMENT ON TABLE public.invites IS 'Email invitations sent to non-users';


-- ── 5. LOANS ────────────────────────────────────────────────
-- status: 'requested' → borrower asked, waiting for lender to approve
--         'active'    → book is currently with the borrower
--         'returned'  → book has been given back
--         'rejected'  → lender declined the request
CREATE TABLE public.loans (
  id            UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  book_id       UUID        REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
  lender_id     UUID        REFERENCES public.profiles(id) NOT NULL,
  borrower_id   UUID        REFERENCES public.profiles(id) NOT NULL,
  status        TEXT        DEFAULT 'requested'
                CHECK (status IN ('requested','active','returned','rejected')),
  due_date      TIMESTAMPTZ,
  requested_at  TIMESTAMPTZ DEFAULT NOW(),
  returned_at   TIMESTAMPTZ,
  CHECK (lender_id <> borrower_id)
);
COMMENT ON TABLE public.loans IS 'Book borrowing records between friends';


-- ── 6. NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE public.notifications (
  id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID        REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo             TEXT        NOT NULL
                   CHECK (tipo IN ('pedido','devolucao','amizade','atraso')),
  titulo           TEXT        NOT NULL,
  texto            TEXT        NOT NULL,
  lida             BOOLEAN     DEFAULT FALSE,
  related_user_id  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_book_id  UUID        REFERENCES public.books(id) ON DELETE SET NULL,
  related_loan_id  UUID        REFERENCES public.loans(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE public.notifications IS 'In-app notifications per user';


-- ============================================================
--  INDEXES for query performance
-- ============================================================
CREATE INDEX idx_books_user_id        ON public.books(user_id);
CREATE INDEX idx_books_disponivel     ON public.books(disponivel);
CREATE INDEX idx_friendships_req      ON public.friendships(requester_id, status);
CREATE INDEX idx_friendships_addr     ON public.friendships(addressee_id, status);
CREATE INDEX idx_loans_book           ON public.loans(book_id);
CREATE INDEX idx_loans_lender         ON public.loans(lender_id, status);
CREATE INDEX idx_loans_borrower       ON public.loans(borrower_id, status);
CREATE INDEX idx_notifs_user_unread   ON public.notifications(user_id, lida);


-- ============================================================
--  HELPER FUNCTIONS
-- ============================================================

-- Returns TRUE if two users are accepted friends
CREATE OR REPLACE FUNCTION public.are_friends(user1 UUID, user2 UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.friendships
    WHERE status = 'accepted'
    AND (
      (requester_id = user1 AND addressee_id = user2) OR
      (requester_id = user2 AND addressee_id = user1)
    )
  );
$$;

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER trg_friendships_updated_at
  BEFORE UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
--  TRIGGER: Auto-create profile when a user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, avatar_emoji)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'avatar_emoji', '📚')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
--  TRIGGER: Notify lender when a loan is requested
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_loan_request()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  borrower_name TEXT;
  book_title    TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT nome INTO borrower_name FROM public.profiles WHERE id = NEW.borrower_id;
    SELECT titulo INTO book_title   FROM public.books    WHERE id = NEW.book_id;

    INSERT INTO public.notifications
      (user_id, tipo, titulo, texto, related_user_id, related_book_id, related_loan_id)
    VALUES (
      NEW.lender_id,
      'pedido',
      'Pedido de empréstimo',
      borrower_name || ' quer pegar "' || book_title || '" emprestado!',
      NEW.borrower_id,
      NEW.book_id,
      NEW.id
    );

  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'returned' AND OLD.status = 'active' THEN
    SELECT nome INTO borrower_name FROM public.profiles WHERE id = NEW.borrower_id;
    SELECT titulo INTO book_title   FROM public.books    WHERE id = NEW.book_id;

    INSERT INTO public.notifications
      (user_id, tipo, titulo, texto, related_user_id, related_book_id, related_loan_id)
    VALUES (
      NEW.lender_id,
      'devolucao',
      'Livro devolvido!',
      borrower_name || ' devolveu "' || book_title || '". Ele voltou para a sua estante.',
      NEW.borrower_id,
      NEW.book_id,
      NEW.id
    );

    -- Mark book as available again
    UPDATE public.books SET disponivel = TRUE WHERE id = NEW.book_id;

  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status = 'requested' THEN
    -- Mark book as unavailable
    UPDATE public.books SET disponivel = FALSE WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_loan_changed
  AFTER INSERT OR UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.notify_loan_request();


-- ============================================================
--  TRIGGER: Notify on friendship events
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_friendship()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  requester_name TEXT;
  addressee_name TEXT;
BEGIN
  SELECT nome INTO requester_name FROM public.profiles WHERE id = NEW.requester_id;
  SELECT nome INTO addressee_name FROM public.profiles WHERE id = NEW.addressee_id;

  IF TG_OP = 'INSERT' THEN
    -- Notify addressee of new friend request
    INSERT INTO public.notifications
      (user_id, tipo, titulo, texto, related_user_id)
    VALUES (
      NEW.addressee_id,
      'amizade',
      'Novo Amigo Leitor',
      requester_name || ' quer ser seu Amigo Leitor!',
      NEW.requester_id
    );

  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Notify requester that their request was accepted
    INSERT INTO public.notifications
      (user_id, tipo, titulo, texto, related_user_id)
    VALUES (
      NEW.requester_id,
      'amizade',
      'Amizade aceita! 🎉',
      addressee_name || ' aceitou o seu pedido de amizade!',
      NEW.addressee_id
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_friendship_changed
  AFTER INSERT OR UPDATE ON public.friendships
  FOR EACH ROW EXECUTE FUNCTION public.notify_friendship();
