/* Quattro rivoluzioni industriali — interazioni */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- quadrante + era attiva ---------- */
  var hand = document.getElementById("dialHand");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".era-pill"));
  var eraSections = Array.prototype.slice.call(document.querySelectorAll("section[data-era]"));
  var angles = { "1": -135, "2": -45, "3": 45, "4": 135 };

  if (hand) hand.style.transform = "rotate(" + angles["1"] + "deg)";

  function setEra(era) {
    var key = String(era);
    if (!angles[key] || body.dataset.era === key) return;
    body.dataset.era = key;
    if (hand) hand.style.transform = "rotate(" + angles[key] + "deg)";
    navLinks.forEach(function (a) {
      var on = a.dataset.nav === key;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }

  if ("IntersectionObserver" in window) {
    var eraObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setEra(entry.target.dataset.era);
      });
    }, { rootMargin: "-42% 0px -50% 0px", threshold: 0 });
    eraSections.forEach(function (s) { eraObserver.observe(s); });
  }

  /* ---------- barra di avanzamento ---------- */
  var progressBar = document.getElementById("progressBar");
  var head = document.querySelector(".site-head");
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (progressBar) progressBar.style.transform = "scaleX(" + p + ")";
    if (head) head.classList.toggle("is-scrolled", window.scrollY > 10);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  /* ---------- reveal ---------- */
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- contatori ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var target = parseInt(el.dataset.count, 10) || 0;
        var start = performance.now();
        var duration = 1100;
        function tick(now) {
          var t = Math.min(1, (now - start) / duration);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = String(Math.round(target * eased));
          if (t < 1) window.requestAnimationFrame(tick);
        }
        window.requestAnimationFrame(tick);
        countObserver.unobserve(el);
      });
    }, { threshold: 0.7 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  }

  /* ---------- laboratorio macchina a vapore ---------- */
  var steamParts = {
    caldaia: {
      role: "01 · La fonte di energia",
      title: "La caldaia",
      text: "Brucia carbone per portare l'acqua a ebollizione e produrre vapore ad alta pressione. È il cuore energetico della fabbrica: senza calore, nessun movimento."
    },
    pistone: {
      role: "02 · Il movimento",
      title: "Cilindro e pistone",
      text: "Il vapore spinge il pistone dentro il cilindro. Il moto rettilineo diventa così il moto rotatorio che aziona telai, pompe e macchinari."
    },
    volano: {
      role: "03 · La stabilizzazione",
      title: "Il volano",
      text: "La grande ruota immagazzina energia e rende regolare la rotazione. Dalle sue cinghie la forza arriva a tutte le macchine dello stabilimento."
    },
    condensatore: {
      role: "04 · L'efficienza",
      title: "Il condensatore",
      text: "Raffredda il vapore e lo riporta allo stato liquido, permettendo al ciclo di ricominciare. È il miglioramento decisivo introdotto da James Watt, che riduce gli sprechi di energia."
    }
  };

  var stage = document.getElementById("steamStage");
  var steamTabs = Array.prototype.slice.call(document.querySelectorAll(".steam-tab"));
  var hotspots = Array.prototype.slice.call(document.querySelectorAll(".hotspot"));
  var roleEl = document.getElementById("steamRole");
  var titleEl = document.getElementById("steamTitle");
  var textEl = document.getElementById("steamText");

  function setSteamPart(key) {
    var part = steamParts[key];
    if (!part || !titleEl) return;
    roleEl.textContent = part.role;
    titleEl.textContent = part.title;
    textEl.textContent = part.text;
    steamTabs.forEach(function (tab) {
      var on = tab.dataset.part === key;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", String(on));
    });
    hotspots.forEach(function (h) {
      h.classList.toggle("is-active", h.dataset.part === key);
    });
  }

  steamTabs.forEach(function (tab) {
    tab.addEventListener("click", function () { setSteamPart(tab.dataset.part); });
  });
  hotspots.forEach(function (h) {
    h.addEventListener("click", function () { setSteamPart(h.dataset.part); });
    h.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        setSteamPart(h.dataset.part);
      }
    });
  });

  var steamToggle = document.getElementById("steamToggle");
  if (steamToggle && stage) {
    steamToggle.addEventListener("click", function () {
      var running = stage.dataset.running === "true";
      stage.dataset.running = String(!running);
      steamToggle.textContent = running ? "Avvia la macchina" : "Ferma la macchina";
      steamToggle.setAttribute("aria-pressed", String(!running));
    });
  }

  /* ---------- linea del tempo terza rivoluzione ---------- */
  var railSteps = [
    {
      year: "1947",
      title: "Il transistor",
      text: "Inventato nei Bell Labs, sostituisce le valvole: i dispositivi elettronici diventano più piccoli, affidabili ed efficienti. È il mattone di tutta l'elettronica moderna.",
      foot: "Elettronica · Stati Uniti"
    },
    {
      year: "1957",
      title: "Sputnik 1",
      text: "L'Unione Sovietica lancia il primo satellite artificiale della storia. Comincia l'era spaziale e cambiano per sempre le comunicazioni a distanza.",
      foot: "Spazio · URSS"
    },
    {
      year: "1958",
      title: "Il circuito integrato",
      text: "Più componenti elettronici riuniti su un unico supporto. Da qui nasce la miniaturizzazione che renderà possibile il personal computer.",
      foot: "Microelettronica"
    },
    {
      year: "1962",
      title: "Telstar 1",
      text: "Il satellite permette di trasmettere segnali televisivi attraverso l'Oceano Atlantico: le immagini iniziano a viaggiare intorno al mondo.",
      foot: "Telecomunicazioni"
    },
    {
      year: "1969",
      title: "ARPANET",
      text: "Nasce negli Stati Uniti la rete che collega diversi centri di ricerca, permettendo di comunicare e condividere informazioni: è l'antenata di Internet.",
      foot: "Reti · Stati Uniti"
    },
    {
      year: "1971",
      title: "Intel 4004",
      text: "Uno dei primi microprocessori commerciali: un processore completo su un solo chip, capace di eseguire istruzioni ed elaborare informazioni.",
      foot: "Informatica"
    },
    {
      year: "1983",
      title: "Il protocollo TCP/IP",
      text: "Un sistema comune di comunicazione permette di collegare reti diverse tra loro. Internet diventa una rete di reti.",
      foot: "Internet"
    },
    {
      year: "1989",
      title: "Il World Wide Web",
      text: "Tim Berners-Lee propone al CERN un sistema per collegare documenti tramite link ipertestuali. Il Web diventa pubblico nei primi anni Novanta.",
      foot: "Web · CERN"
    }
  ];

  var railButtons = Array.prototype.slice.call(document.querySelectorAll(".rail-btn"));
  var railPanel = document.getElementById("railPanel");
  var railYear = document.getElementById("railPanelYear");
  var railTitle = document.getElementById("railPanelTitle");
  var railText = document.getElementById("railPanelText");
  var railFoot = document.getElementById("railPanelFoot");

  function showRailStep(index) {
    var step = railSteps[index];
    if (!step) return;
    railYear.textContent = step.year;
    railTitle.textContent = step.title;
    railText.textContent = step.text;
    railFoot.textContent = step.foot;
    railButtons.forEach(function (btn, i) {
      var on = i === index;
      btn.classList.toggle("is-active", on);
      btn.setAttribute("aria-selected", String(on));
    });
    if (railPanel && !reduceMotion) {
      railPanel.classList.remove("swap");
      void railPanel.offsetWidth;
      railPanel.classList.add("swap");
    }
  }

  railButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showRailStep(parseInt(btn.dataset.step, 10));
    });
  });

  /* ---------- schede flip ---------- */
  Array.prototype.slice.call(document.querySelectorAll(".flip")).forEach(function (card) {
    card.addEventListener("click", function () { card.classList.toggle("is-flipped"); });
  });

  /* ---------- confronto ---------- */
  var cmp = document.querySelector(".cmp");
  var cmpButtons = Array.prototype.slice.call(document.querySelectorAll(".cmp-btn"));
  cmpButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (!cmp) return;
      cmp.dataset.focus = btn.dataset.col;
      cmpButtons.forEach(function (b) {
        var on = b === btn;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    });
  });

  /* ---------- anno footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
