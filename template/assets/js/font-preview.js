(() => {
  "use strict";

  const fontFamilies = [
    "Inter",
    "Manrope",
    "Inter Tight",
    "Roboto",
    "Roboto Flex",
    "Roboto Condensed",
    "Roboto Serif",
    "Roboto Mono",
    "Open Sans",
    "Lato",
    "Montserrat",
    "Montserrat Alternates",
    "Poppins",
    "Nunito",
    "Nunito Sans",
    "Raleway",
    "Ubuntu",
    "Ubuntu Sans",
    "Ubuntu Condensed",
    "Ubuntu Mono",
    "Ubuntu Sans Mono",
    "Work Sans",
    "Fira Sans",
    "Fira Sans Condensed",
    "Fira Sans Extra Condensed",
    "Fira Mono",
    "Fira Code",
    "Noto Sans",
    "Noto Sans Display",
    "Noto Sans Mono",
    "Noto Serif",
    "Noto Serif Display",
    "Source Sans 3",
    "Source Serif 4",
    "Source Code Pro",
    "IBM Plex Sans",
    "IBM Plex Sans Condensed",
    "IBM Plex Serif",
    "IBM Plex Mono",
    "DM Sans",
    "DM Serif Display",
    "DM Mono",
    "Plus Jakarta Sans",
    "Space Grotesk",
    "Space Mono",
    "Sora",
    "Outfit",
    "Urbanist",
    "Figtree",
    "Geist",
    "Geist Mono",
    "Onest",
    "Instrument Sans",
    "Instrument Serif",
    "Afacad",
    "Afacad Flux",
    "Albert Sans",
    "Alegreya Sans",
    "Archivo",
    "Archivo Black",
    "Archivo Narrow",
    "AR One Sans",
    "Arimo",
    "Asap",
    "Asap Condensed",
    "Assistant",
    "Atkinson Hyperlegible",
    "Atkinson Hyperlegible Next",
    "Bai Jamjuree",
    "Barlow",
    "Barlow Condensed",
    "Barlow Semi Condensed",
    "Be Vietnam Pro",
    "Bellota Sans",
    "Bricolage Grotesque",
    "Cabin",
    "Cabin Condensed",
    "Cairo",
    "Carlito",
    "Catamaran",
    "Chivo",
    "Chivo Mono",
    "Commissioner",
    "Didact Gothic",
    "Dosis",
    "Encode Sans",
    "Encode Sans Condensed",
    "Encode Sans Semi Condensed",
    "Epilogue",
    "Exo",
    "Exo 2",
    "Gabarito",
    "Gantari",
    "Golos Text",
    "Gothic A1",
    "Heebo",
    "Hind",
    "Hind Madurai",
    "Inria Sans",
    "Istok Web",
    "Josefin Sans",
    "Kanit",
    "Karla",
    "Khand",
    "Lexend",
    "Lexend Deca",
    "Libre Franklin",
    "Livvic",
    "M PLUS 1p",
    "Maven Pro",
    "Merriweather Sans",
    "Mulish",
    "Oxygen",
    "Palanquin",
    "Pathway Extreme",
    "Prompt",
    "Public Sans",
    "Quicksand",
    "Readex Pro",
    "Red Hat Display",
    "Red Hat Text",
    "Rubik",
    "Schibsted Grotesk",
    "Sen",
    "Signika",
    "Tajawal",
    "Titillium Web",
    "Varela Round",
    "Wix Madefor Display",
    "Wix Madefor Text",
    "Yantramanav",
    "Abel",
    "Acme",
    "Aldrich",
    "Audiowide",
    "Bruno Ace",
    "Bruno Ace SC",
    "Chakra Petch",
    "Changa",
    "Comfortaa",
    "Concert One",
    "Cuprum",
    "Electrolize",
    "Geo",
    "Geologica",
    "Gruppo",
    "Iceland",
    "Jura",
    "K2D",
    "Michroma",
    "Orbitron",
    "Oxanium",
    "Quantico",
    "Rajdhani",
    "Rationale",
    "Russo One",
    "Share Tech",
    "Share Tech Mono",
    "Staatliches",
    "Syne",
    "Syne Mono",
    "Teko",
    "Tektur",
    "Tomorrow",
    "Trispace",
    "Turret Road",
    "Unbounded",
    "Azeret Mono",
    "B612 Mono",
    "Cousine",
    "Cutive Mono",
    "Fragment Mono",
    "Inconsolata",
    "JetBrains Mono",
    "Martian Mono",
    "Overpass",
    "Overpass Mono",
    "PT Mono",
    "Red Hat Mono",
    "Sono",
    "Victor Mono",
    "Bitter",
    "Bodoni Moda",
    "Cormorant Garamond",
    "Crimson Pro",
    "EB Garamond",
    "Fraunces",
    "Libre Baskerville",
    "Lora",
    "Merriweather",
    "Newsreader",
    "Playfair Display",
    "PT Serif",
    "Spectral",
    "Vollkorn",
    "Zilla Slab",
    "Spline Sans",
    "Spline Sans Mono",
    "League Spartan",
    "League Gothic"
  ];

  const fonts = fontFamilies.map((family) => ({
    family,
    query: encodeURIComponent(family).replace(/%20/g, "+")
  }));

  if (window.BusiqFontPreview?.destroy) {
    window.BusiqFontPreview.destroy();
  }

  const loadedFonts = new Set();
  const root = document.documentElement;
  let currentIndex = -1;

  const style = document.createElement("style");
  style.id = "busiq-font-preview-styles";
  style.textContent = `
    html.busiq-font-preview-active body :where(
      h1, h2, h3, h4, h5, h6, p, a, button, input, textarea, select, option,
      label, li, dt, dd, blockquote, address, figcaption, caption, th, td,
      span, small, strong, b, em
    ) {
      font-family: var(--busiq-font-preview-family) !important;
    }

    html.busiq-font-preview-active body :where(input, textarea)::placeholder {
      font-family: var(--busiq-font-preview-family) !important;
    }
    html.busiq-font-preview-active body .physics-services-title-line {
      font-family: var(--busiq-font-preview-family) !important;
    }


    #busiq-font-preview,
    #busiq-font-preview * {
      box-sizing: border-box;
      font-family: Arial, sans-serif !important;
    }

    #busiq-font-preview {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 2147483647;
      display: grid;
      grid-template-columns: 48px minmax(210px, auto) 48px 40px;
      min-height: 48px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.24);
      color: #fff;
      background: #111;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.28);
    }

    #busiq-font-preview button {
      display: grid;
      min-width: 0;
      min-height: 48px;
      margin: 0;
      padding: 0;
      border: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 0;
      color: #fff;
      background: #173cf5;
      font-size: 21px !important;
      line-height: 1 !important;
      place-items: center;
      cursor: pointer;
    }

    #busiq-font-preview button:hover,
    #busiq-font-preview button:focus-visible {
      background: #0f35dc;
    }

    #busiq-font-preview button:focus-visible {
      outline: 2px solid #fff;
      outline-offset: -4px;
    }

    #busiq-font-preview output {
      display: flex;
      min-width: 210px;
      padding: 8px 15px;
      flex-direction: column;
      justify-content: center;
      line-height: 1.1;
    }

    #busiq-font-preview strong {
      color: #fff;
      font-size: 14px !important;
      font-weight: 700;
    }

    #busiq-font-preview small {
      margin-top: 4px;
      color: rgba(255, 255, 255, 0.62);
      font-size: 10px !important;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    #busiq-font-preview [data-font-preview-close] {
      border-right: 0;
      color: #fff;
      background: #2b2b2b;
      font-size: 18px !important;
    }

    @media (max-width: 575.98px) {
      #busiq-font-preview {
        right: 12px;
        bottom: 12px;
        left: 12px;
        grid-template-columns: 44px 1fr 44px 40px;
      }

      #busiq-font-preview output {
        min-width: 0;
      }
    }
  `;
  document.head.appendChild(style);

  const panel = document.createElement("div");
  panel.id = "busiq-font-preview";
  panel.setAttribute("data-font-preview-ui", "");
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Google Font preview controls");
  panel.innerHTML = `
    <button type="button" data-font-preview-prev aria-label="Previous font">←</button>
    <output aria-live="polite">
      <strong data-font-preview-name></strong>
      <small data-font-preview-count></small>
    </output>
    <button type="button" data-font-preview-next aria-label="Next font">→</button>
    <button type="button" data-font-preview-close aria-label="Restore original site font" title="Restore original font">×</button>
  `;
  document.body.appendChild(panel);

  const nameOutput = panel.querySelector("[data-font-preview-name]");
  const countOutput = panel.querySelector("[data-font-preview-count]");

  const loadFont = (font) => {
    if (loadedFonts.has(font.family)) return;

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${font.query}&display=swap`;
    link.dataset.fontPreviewFamily = font.family;
    document.head.appendChild(link);
    loadedFonts.add(font.family);
  };

  const select = (index) => {
    currentIndex = (index + fonts.length) % fonts.length;
    const font = fonts[currentIndex];

    loadFont(font);
    root.style.setProperty("--busiq-font-preview-family", `"${font.family}", sans-serif`);
    root.classList.add("busiq-font-preview-active");
    nameOutput.textContent = font.family;
    countOutput.textContent = `${currentIndex + 1} / ${fonts.length}`;
  };

  const reset = () => {
    root.classList.remove("busiq-font-preview-active");
    root.style.removeProperty("--busiq-font-preview-family");
    nameOutput.textContent = "Disabled";
    countOutput.textContent = `0 / ${fonts.length}`;
  };

  const onKeydown = (event) => {
    if (!event.altKey) return;
    if (event.key === "ArrowLeft") select(currentIndex < 0 ? fonts.length - 1 : currentIndex - 1);
    if (event.key === "ArrowRight") select(currentIndex < 0 ? 0 : currentIndex + 1);
  };

  const destroy = () => {
    reset();
    document.removeEventListener("keydown", onKeydown);
    panel.remove();
    style.remove();
    document.querySelectorAll("link[data-font-preview-family]").forEach((link) => link.remove());
    delete window.BusiqFontPreview;
  };

  panel.querySelector("[data-font-preview-prev]").addEventListener("click", () => select(currentIndex < 0 ? fonts.length - 1 : currentIndex - 1));
  panel.querySelector("[data-font-preview-next]").addEventListener("click", () => select(currentIndex < 0 ? 0 : currentIndex + 1));
  panel.querySelector("[data-font-preview-close]").addEventListener("click", reset);
  document.addEventListener("keydown", onKeydown);

  window.BusiqFontPreview = {
    fonts: fonts.map(({ family }) => family),
    next: () => select(currentIndex < 0 ? 0 : currentIndex + 1),
    previous: () => select(currentIndex < 0 ? fonts.length - 1 : currentIndex - 1),
    reset,
    select,
    destroy
  };

  reset();
})();