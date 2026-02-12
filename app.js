(() => {
  const TZ = "America/Bogota";

    const letterToggle = document.getElementById("open-letter");
    const cta = document.querySelector(".cta");
    const ctaText = document.querySelector(".cta-text");
    const closeBtn = document.querySelector(".close-letter");
    const letter = document.getElementById("love-letter");


  const fmtDateLong = (date) =>
    new Intl.DateTimeFormat("es-CO", { dateStyle: "long", timeZone: TZ }).format(date);

  const parseISODateLocal = (isoDate) => {
    const [y, m, d] = isoDate.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0);
  };

  const atNoon = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0);

  const diffDays = (fromISO, toDate = new Date()) => {
    const from = parseISODateLocal(fromISO).getTime();
    const to = atNoon(toDate).getTime();
    return Math.max(0, Math.floor((to - from) / 86400000));
  };

  const addYears = (date, years) => {
    const d = new Date(date);
    d.setFullYear(d.getFullYear() + years);
    return d;
  };

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  const diffYMD = (fromISO, toDate = new Date()) => {
    const start = atNoon(parseISODateLocal(fromISO));
    const end = atNoon(toDate);

    if (end < start) return { years: 0, months: 0, days: 0 };

    // Años
    let years = end.getFullYear() - start.getFullYear();
    let cursor = addYears(start, years);
    if (cursor > end) {
      years -= 1;
      cursor = addYears(start, years);
    }

    // Meses
    let months =
      (end.getFullYear() - cursor.getFullYear()) * 12 +
      (end.getMonth() - cursor.getMonth());
    let cursor2 = addMonths(cursor, months);
    if (cursor2 > end) {
      months -= 1;
      cursor2 = addMonths(cursor, months);
    }

    // Días restantes
    const days = Math.max(0, Math.floor((end.getTime() - cursor2.getTime()) / 86400000));
    return { years, months, days };
  };

  const pluralEs = (n, singular, plural) => (n === 1 ? singular : plural);

  const fmtYMD = ({ years, months, days }) => {
    const y = `${years} ${pluralEs(years, "año", "años")}`;
    const m = `${months} ${pluralEs(months, "mes", "meses")}`;
    const d = `${days} ${pluralEs(days, "día", "días")}`;
    return `${y} ${m} ${d}`;
  };

  const setText = (el, value) => {
    if (!el) return;
    el.textContent = value;
  };

  document.querySelectorAll(".js-date[data-iso]").forEach((el) => {
    const iso = el.getAttribute("data-iso");
    if (!iso) return;
    setText(el, fmtDateLong(parseISODateLocal(iso)));
  });

  document.querySelectorAll('.js-date[data-today="true"]').forEach((el) => {
    setText(el, fmtDateLong(new Date()));
  });

    const daysBox = document.querySelector(".days[data-since]");
    const daysNum = document.querySelector(".days-num");
    const todayEl = document.querySelector(".js-today");
    const ymdEl = document.querySelector(".js-ymd");

    const renderCounters = () => {
    if (!daysBox) return;
    const since = daysBox.getAttribute("data-since") || "2025-11-01";
    setText(daysNum, String(diffDays(since)));
    setText(ymdEl, fmtYMD(diffYMD(since)));
    setText(todayEl, fmtDateLong(new Date()));
    };

    renderCounters();

    const scheduleNextDayTick = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
    const ms = next.getTime() - now.getTime();
    setTimeout(() => {
        renderCounters();
        scheduleNextDayTick();
    }, ms);
    };

    scheduleNextDayTick();

    const syncCTA = () => {
    const openText = cta?.getAttribute("data-open-text") || "Abrir la carta";
    const closeText = cta?.getAttribute("data-close-text") || "Cerrar la carta";
    const isOpen = !!letterToggle?.checked;

    setText(ctaText, isOpen ? closeText : openText);

    if (cta) {
        cta.setAttribute("aria-label", isOpen ? "Cerrar la carta" : "Abrir la carta");
        cta.setAttribute("aria-expanded", String(isOpen));
    }

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

    if (isOpen) {
        requestAnimationFrame(() => {
        letter?.scrollIntoView?.({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        closeBtn?.focus?.();
        });
    } else {
        requestAnimationFrame(() => cta?.focus?.());
    }
    };

    letterToggle?.addEventListener("change", syncCTA);
    syncCTA();

    cta?.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    e.preventDefault();
    if (!letterToggle) return;
    letterToggle.checked = !letterToggle.checked;
    letterToggle.dispatchEvent(new Event("change"));
    });

  closeBtn?.addEventListener("click", () => {
    if (!letterToggle) return;
    letterToggle.checked = false;
    letterToggle.dispatchEvent(new Event("change"));
    cta?.focus?.();
  });

    window.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!letterToggle?.checked) return;
    letterToggle.checked = false;
    letterToggle.dispatchEvent(new Event("change"));
    cta?.focus?.();
    });

    document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (!letterToggle?.checked) return;
    if (!letter) return;

    const focusables = letter.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
    } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
    }
    });
})();
