# Busiq

Busiq is a production-ready corporate website template for consulting, strategy, technology, finance, operations, marketing, management, agency, and enterprise service organizations.

The project is a static HTML, CSS, and JavaScript website. It does not use React or require an application build step.

## Release Status

Version 1.1.0 is the completed responsive release with a new stepped-card hero above the retained original Busiq hero.

The template includes a branded header, flexible hero experiences, rich business content, local media, responsive navigation, and a premium footer.

## Features

- Layered stepped-card hero with the original Busiq building hero retained below
- Responsive layouts validated from 320px phones through 2560px displays
- Desktop and mobile navigation with accessible submenu behavior
- Consulting, services, portfolio, team, pricing, FAQ, testimonial, analytics, and contact experiences
- Accessible image gallery and senior advisor profiles
- Interactive platform, journey, workflow, case-study, portfolio, and capability selectors
- Local GSAP motion runtime with reduced-motion support
- Animated metrics, capability bars, and a restrained page-progress indicator
- Six local autoplaying, muted, looping, inline business videos
- Validated contact, inline inquiry, and newsletter states
- Keyboard-visible focus, skip navigation, modal focus return, and 48px control targets
- Proprietary project license

## Technology

- Semantic HTML5
- CSS3 and Bootstrap 5
- JavaScript and jQuery
- GSAP 3.15.0 with ScrollTrigger
- Font Awesome
- Manrope typography

Runtime libraries, icons, raster images, and video assets are stored inside `template/assets/`. Manrope is loaded from Google Fonts.

## Preview

Serve the repository through any static HTTP server, then open `/template/`.

For example, from the repository root:

```text
python -m http.server 8000
```

Then visit `http://localhost:8000/template/` in a browser.

Opening the files through an HTTP server is recommended because the template includes local media and interactive behavior that should be tested in a normal web origin.

## Project Structure

```text
template/
├── index.html
└── assets/
    ├── css/
    ├── images/
    ├── js/
    ├── vendor/
    └── videos/
```

## Quality Verification

The completed release was reviewed in Chromium with Playwright across:

- 2560 × 1440 ultrawide desktop
- 1440 × 900 standard desktop
- 1024 × 1366 iPad Pro equivalent
- 768 × 1024 iPad equivalent
- 375 × 667 iPhone 6 equivalent
- 320 × 568 iPhone 5 equivalent

All 72 numbered sections, the hero, and the footer were also captured individually and compared against their approved design direction. The final checks confirmed no page-level horizontal overflow, nested page scrollbars, empty sections, broken images, duplicate IDs, unresolved internal links, unlabeled buttons, or browser console errors.

## Contributing and Security

Review [CONTRIBUTING.md](CONTRIBUTING.md) before proposing a change. Report security concerns according to [SECURITY.md](SECURITY.md).

## License

Copyright © 2026 Eduardo Silveira Rios. All rights reserved.

This repository and its source code are proprietary. Viewing the source on GitHub does not grant permission to use, copy, modify, distribute, commercialize, sublicense, or create derivative works without prior written authorization from the copyright holder. See [LICENSE](LICENSE) for the complete terms.
