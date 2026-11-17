"use client";

import { useLayoutEffect } from "react";

// Receita do motion kit (skill landing-page-architect, ref. 12 §6) adaptada ao
// Next: em vez de um script global que roda uma vez, um efeito que monta e
// desmonta com a landing (navegação do App Router). Usa os mesmos atributos
// do kit: data-mk, data-mk-scene, data-mk-draw. As cores e estados ficam no
// globals.css; aqui só entram as classes e variáveis que os disparam.

declare global {
  interface Window {
    __mkReady?: boolean;
  }
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function MotionLayer() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("no-js");

    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const saveData =
      (navigator as Navigator & { connection?: { saveData?: boolean } })
        .connection?.saveData === true;
    // Navegação interna depois de um carregamento em que a classe caiu.
    if (!reduce && !saveData) root.classList.add("mk-motion");
    const motion = root.classList.contains("mk-motion");
    window.__mkReady = true;

    const cleanups: Array<() => void> = [];
    const $$ = <T extends Element>(sel: string) =>
      Array.from(document.querySelectorAll<T>(sel));

    // ---------- R2 + L1: revelações (uma vez) ----------
    $$("[data-mk-stagger]").forEach((parent) => {
      Array.from(parent.children).forEach((child, i) => {
        if (child.hasAttribute("data-mk"))
          (child as HTMLElement).style.setProperty("--mk-i", String(i));
      });
    });
    const reveals = $$<HTMLElement>("[data-mk], .sig-word");
    if (!motion) {
      reveals.forEach((el) => el.classList.add("mk-in"));
    } else {
      // A assinatura precisa da largura da palavra para o traço atravessá-la.
      $$<HTMLElement>(".sig-word").forEach((el) =>
        el.style.setProperty("--sig-w", `${el.offsetWidth}px`),
      );
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            e.target.classList.add("mk-in");
            io.unobserve(e.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
      );
      reveals.forEach((el) => {
        // O hero (LCP) dispara já no carregamento.
        if (el.closest("[data-mk-now]")) {
          requestAnimationFrame(() => el.classList.add("mk-in"));
        } else {
          io.observe(el);
        }
      });
      cleanups.push(() => io.disconnect());
    }

    // ---------- Cenas de cor: a seção no meio da tela pinta a página ----------
    const scenes = $$<HTMLElement>("[data-mk-scene]");
    if (scenes.length) {
      const sio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting)
              root.dataset.mkScene = (e.target as HTMLElement).dataset.mkScene;
          });
        },
        { rootMargin: "-50% 0px -50% 0px" },
      );
      scenes.forEach((s) => sio.observe(s));
      cleanups.push(() => {
        sio.disconnect();
        delete root.dataset.mkScene;
      });
    }

    // ---------- S1: palco do portal (qual recurso está no centro) ----------
    $$<HTMLElement>("[data-stage]").forEach((stage) => {
      const steps = Array.from(
        stage.querySelectorAll<HTMLElement>("[data-stage-step]"),
      );
      const setActive = (key: string) => {
        stage.dataset.stageActive = key;
        steps.forEach((s) =>
          s.dataset.stageStep === key
            ? s.setAttribute("data-active", "")
            : s.removeAttribute("data-active"),
        );
      };
      if (steps[0]) setActive(steps[0].dataset.stageStep!);
      const stio = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting)
              setActive((e.target as HTMLElement).dataset.stageStep!);
          });
        },
        { rootMargin: "-45% 0px -45% 0px" },
      );
      steps.forEach((s) => stio.observe(s));
      cleanups.push(() => stio.disconnect());
    });

    // ---------- S6: fio condutor desenhado pela rolagem ----------
    const scopes = $$<HTMLElement>("[data-mk-draw-scope]");
    if (motion && scopes.length) {
      let ticking = false;
      const update = () => {
        ticking = false;
        const vh = window.innerHeight;
        scopes.forEach((scope) => {
          const r = scope.getBoundingClientRect();
          const t = clamp((vh * 0.8 - r.top) / Math.max(r.height * 0.85, vh * 0.45), 0, 1);
          scope.style.setProperty("--draw-offset", (1 - t).toFixed(4));
          const marks = scope.querySelectorAll<HTMLElement>("[data-step]");
          marks.forEach((m, i) => {
            const at = marks.length > 1 ? i / (marks.length - 1) : 0;
            if (t >= at * 0.98) m.setAttribute("data-reached", "");
            else m.removeAttribute("data-reached");
          });
        });
      };
      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      };
      update();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll);
      cleanups.push(() => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onScroll);
      });
    } else {
      $$("[data-step]").forEach((m) => m.setAttribute("data-reached", ""));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
