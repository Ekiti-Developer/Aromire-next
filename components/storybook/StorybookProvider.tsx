"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { StorybookNextStory, StorybookProgram } from "@/lib/storybook";

const Storybook = dynamic(() => import("./Storybook"), {
  ssr: false,
  loading: () => (
    <div className="storybook-loading" role="status">
      Opening storybook…
    </div>
  ),
});

type OpenState = { page: number; photoKey?: string };

type StorybookContextValue = {
  open: (page?: number, photoKey?: string) => void;
  close: () => void;
  isOpen: boolean;
};

const StorybookContext = createContext<StorybookContextValue | null>(null);

export function useStorybook() {
  const context = useContext(StorybookContext);
  if (!context) {
    throw new Error("useStorybook must be used inside <StorybookProvider>");
  }
  return context;
}

function readBookParam() {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get("book");
  if (!raw) return null;
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

export default function StorybookProvider({
  program,
  nextStory = null,
  children,
}: {
  program: StorybookProgram;
  nextStory?: StorybookNextStory;
  children: ReactNode;
}) {
  const router = useRouter();
  const [openState, setOpenState] = useState<OpenState | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const openStateRef = useRef<OpenState | null>(null);

  const updateUrl = useCallback(
    (page: number, remove = false) => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      if (remove) url.searchParams.delete("book");
      else url.searchParams.set("book", String(page));
      router.replace(`${url.pathname}${url.search}${url.hash}`, { scroll: false });
    },
    [router],
  );

  // If the page is opened from a shared ?book=N link, open the viewer there.
  useEffect(() => {
    const page = readBookParam();
    if (page !== null) {
      openerRef.current = document.activeElement as HTMLElement | null;
      const frame = requestAnimationFrame(() => setOpenState({ page }));
      return () => cancelAnimationFrame(frame);
    }
  }, []);

  const open = useCallback(
    (page = 0, photoKey?: string) => {
      openerRef.current = document.activeElement as HTMLElement | null;
      const next = { page, photoKey };
      openStateRef.current = next;
      setOpenState(next);
      updateUrl(page);
    },
    [updateUrl],
  );

  const close = useCallback(() => {
    setOpenState(null);
    openStateRef.current = null;
    updateUrl(0, true);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, [updateUrl]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (openStateRef.current) {
        openStateRef.current = { ...openStateRef.current, page };
      }
      updateUrl(page);
    },
    [updateUrl],
  );

  const value = useMemo<StorybookContextValue>(
    () => ({ open, close, isOpen: openState !== null }),
    [open, close, openState],
  );

  return (
    <StorybookContext.Provider value={value}>
      {children}
      {openState && (
        <Storybook
          program={program}
          nextStory={nextStory}
          initialPage={openState.page}
          initialPhotoKey={openState.photoKey}
          onPageChange={handlePageChange}
          onClose={close}
        />
      )}
    </StorybookContext.Provider>
  );
}
