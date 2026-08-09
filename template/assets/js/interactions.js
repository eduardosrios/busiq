(function ($, gsap, ScrollTrigger) {
  "use strict";

  $(function () {
    var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var progressFrame = null;
    var $progress = $("<div>", { "class": "site-scroll-progress", "aria-hidden": "true" }).append("<span></span>");

    $("body").prepend($progress);

    function renderProgress() {
      var maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var value = Math.min(1, Math.max(0, window.pageYOffset / maximum));
      $progress.children("span").css("transform", "scaleX(" + value + ")");
      progressFrame = null;
    }

    $(window).on("scroll resize", function () {
      if (progressFrame === null) {
        progressFrame = window.requestAnimationFrame(renderProgress);
      }
    });
    renderProgress();

    if (!gsap || !ScrollTrigger || reducedMotion) {
      $("html").addClass("motion-reduced");
    } else {
      gsap.registerPlugin(ScrollTrigger);
    $("html").addClass("motion-ready");

    var heroTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
    heroTimeline
      .from(".veritas-wordmark", { autoAlpha: 0, y: 18, duration: 0.52, clearProps: "transform,translate,rotate,scale,opacity,visibility" })
      .from(".veritas-hero-intro h1", { autoAlpha: 0, y: 36, duration: 0.78, clearProps: "transform,translate,rotate,scale,opacity,visibility" }, "-=0.26")
      .from(".veritas-consultation", { autoAlpha: 0, y: 16, duration: 0.46, clearProps: "transform,translate,rotate,scale,opacity,visibility" }, "-=0.36")
      .from(".veritas-hero-card", { autoAlpha: 0, y: 28, duration: 0.58, stagger: 0.09, clearProps: "transform,translate,rotate,scale,opacity,visibility" }, "-=0.2");

    gsap.from(".legacy-hero-section .hero-copy > *", {
      autoAlpha: 0,
      y: 28,
      duration: 0.62,
      stagger: 0.08,
      ease: "power2.out",
      scrollTrigger: { trigger: ".legacy-hero-section", start: "top 78%", once: true }
    });

    gsap.from(".legacy-hero-section .hero-image-wrap", {
      autoAlpha: 0,
      clipPath: "inset(0 0 100% 0)",
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: ".legacy-hero-section", start: "top 78%", once: true }
    });

    gsap.to(".legacy-hero-section .hero-image-wrap img", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".legacy-hero-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.7
      }
    });

    gsap.to("[data-stage2-section='22'] > img", {
      yPercent: 7,
      scale: 1.04,
      ease: "none",
      scrollTrigger: {
        trigger: "[data-stage2-section='22']",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8
      }
    });

    $("[data-stage2-section]").filter(function () {
      return Number($(this).data("stage2-section")) <= 30;
    }).each(function () {
      var section = this;
      var revealTarget = section.querySelector(":scope > .container, :scope > .container-fluid, :scope > .container-lg, :scope > .container-xl, :scope > .container-xxl") || section.firstElementChild;
      if (!revealTarget) {
        return;
      }
      gsap.fromTo(revealTarget,
        { autoAlpha: 0, y: 34 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.72,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 88%",
            once: true
          }
        }
      );
    });

    gsap.from(".site-footer-shell", {
      autoAlpha: 0,
      y: 36,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".site-footer",
        start: "top 88%",
        once: true
      }
    });

    ScrollTrigger.refresh();
    }

    var $lightboxImages = $("[data-busiq-lightbox]");
    var $lightboxModal = $("#imageLightbox");
    var $lightboxImage = $("#imageLightboxAsset");
    var $lightboxCaption = $("#imageLightboxCaption");
    var $lightboxCount = $("#imageLightboxCount");
    var lightboxIndex = 0;
    var lightboxReturnFocus = null;

    $lightboxImages.each(function (index) {
      var $image = $(this);
      var $button = $("<button>", {
        "class": "busiq-lightbox-trigger",
        type: "button",
        "data-lightbox-index": index,
        "aria-label": "Open image gallery: " + ($image.attr("alt") || "Busiq image")
      });
      $image.wrap($button);
    });

    var $lightboxTriggers = $(".busiq-lightbox-trigger");

    function renderLightbox(index, direction) {
      lightboxIndex = (index + $lightboxTriggers.length) % $lightboxTriggers.length;
      var $source = $lightboxImages.eq(lightboxIndex);
      var source = $source.attr("src");
      var alternative = $source.attr("alt") || "Busiq perspective";

      $lightboxImage.attr({ src: source, alt: alternative });
      $lightboxCaption.text(alternative);
      $lightboxCount.text("Image " + (lightboxIndex + 1) + " of " + $lightboxTriggers.length);

      if (gsap && !reducedMotion) {
        gsap.fromTo($lightboxImage[0],
          { autoAlpha: 0, x: direction === "previous" ? -24 : 24 },
          { autoAlpha: 1, x: 0, duration: 0.35, ease: "power2.out", overwrite: true }
        );
      }
    }

    function openLightbox(trigger) {
      lightboxReturnFocus = trigger;
      renderLightbox(Number($(trigger).data("lightbox-index")), "next");
      bootstrap.Modal.getOrCreateInstance($lightboxModal[0]).show();
    }

    $lightboxTriggers.on("click", function () {
      openLightbox(this);
    }).on("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(this);
      }
    });

    $("[data-lightbox-direction]").on("click", function () {
      var direction = $(this).data("lightbox-direction");
      renderLightbox(lightboxIndex + (direction === "next" ? 1 : -1), direction);
    });

    $lightboxModal.on("keydown", function (event) {
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.preventDefault();
        var direction = event.key === "ArrowRight" ? "next" : "previous";
        renderLightbox(lightboxIndex + (direction === "next" ? 1 : -1), direction);
      }
    });

    $lightboxModal.on("shown.bs.modal", function () {
      window.setTimeout(function () {
        $lightboxModal.find(".btn-close").trigger("focus");
      }, 0);
    }).on("hidden.bs.modal", function () {
      if (lightboxReturnFocus) {
        window.setTimeout(function () {
          $(lightboxReturnFocus).trigger("focus");
        }, 80);
      }
    });

    var teamProfiles = [
      {
        name: "Omar Rahman",
        role: "Managing Partner · Strategy",
        image: "assets/images/advisor-portrait.webp",
        alt: "Omar Rahman, Managing Partner",
        bio: "Omar helps executive teams turn complex market choices into a focused growth agenda, clear ownership, and a delivery rhythm that holds under pressure.",
        expertise: ["Enterprise strategy", "Portfolio choices", "Executive alignment"]
      },
      {
        name: "Aisha Bennett",
        role: "Strategy Director · Transformation",
        image: "assets/images/team-aisha.webp",
        alt: "Aisha Bennett, Strategy Director",
        bio: "Aisha connects transformation ambition to the practical operating changes, leadership routines, and customer evidence required to make progress visible.",
        expertise: ["Transformation", "Customer value", "Change leadership"]
      },
      {
        name: "Daniel Cho",
        role: "Partner · Operations",
        image: "assets/images/team-daniel.webp",
        alt: "Daniel Cho, Operations Partner",
        bio: "Daniel designs operating systems that clarify decisions, remove coordination drag, and strengthen performance without adding unnecessary process.",
        expertise: ["Operating models", "Performance systems", "Delivery governance"]
      },
      {
        name: "Sofia Alvarez",
        role: "Partner · Growth",
        image: "assets/images/team-sofia.webp",
        alt: "Sofia Alvarez, Growth Partner",
        bio: "Sofia combines customer insight, commercial strategy, and brand experience to help organizations find and scale their most valuable growth opportunities.",
        expertise: ["Growth strategy", "Customer insight", "Commercial activation"]
      }
    ];
    var $teamCards = $("[data-stage2-section='6'] .team-card");
    var $teamModal = $("#teamProfileModal");
    var teamReturnFocus = null;

    $teamCards.each(function (index) {
      var profile = teamProfiles[index];
      var $button = $("<button>", {
        "class": "team-profile-open",
        type: "button",
        "data-team-profile": index,
        "aria-label": "View profile for " + profile.name,
        html: "<i class='fa-solid fa-arrow-up-right-from-square' aria-hidden='true'></i>"
      });
      $(this).append($button);
    });

    function renderTeamProfile(index) {
      var profile = teamProfiles[index];
      $("#teamProfileImage").attr({ src: profile.image, alt: profile.alt });
      $("#teamProfileName").text(profile.name);
      $("#teamProfileRole").text(profile.role);
      $("#teamProfileBio").text(profile.bio);
      $("#teamProfileExpertise").empty().append(profile.expertise.map(function (item) {
        return $("<li>").text(item);
      }));
    }

    $(document).on("click", ".team-profile-open", function () {
      teamReturnFocus = this;
      renderTeamProfile(Number($(this).data("team-profile")));
      bootstrap.Modal.getOrCreateInstance($teamModal[0]).show();
    });

    $teamModal.on("shown.bs.modal", function () {
      window.setTimeout(function () {
        $teamModal.find(".btn-close").trigger("focus");
      }, 0);
    }).on("hidden.bs.modal", function () {
      if (teamReturnFocus) {
        window.setTimeout(function () {
          $(teamReturnFocus).trigger("focus");
        }, 80);
      }
    });

    var platformDetails = {
      Google: "Connect demand signals, analytics, documents, and collaboration without fragmenting the leadership view.",
      Microsoft: "Bring Teams, Microsoft 365, Azure, and Power BI into one accountable operating rhythm.",
      Meta: "Connect audience evidence and campaign performance to the commercial choices leaders need to make.",
      Salesforce: "Translate live customer and pipeline signals into clear priorities, interventions, and ownership.",
      HubSpot: "Align content, demand generation, sales activity, and customer evidence around one growth agenda.",
      Stripe: "Connect payment, revenue, and subscription signals to the decisions shaping customer and enterprise value."
    };
    var $platformItems = $("[data-stage2-section='23'] .connected-platforms-grid li");
    var $platformLabel = $("[data-stage2-section='23'] .connected-platforms-note span");
    var $platformCopy = $("[data-stage2-section='23'] .connected-platforms-note p");

    $platformItems.each(function (index) {
      var $item = $(this);
      var name = $item.find("span").text().trim();
      var $button = $("<button>", {
        "class": "platform-choice",
        type: "button",
        "data-platform-name": name,
        "aria-pressed": index === 0 ? "true" : "false"
      });
      $button.append($item.contents());
      $item.append($button);
    });

    function activatePlatform($button, animate) {
      var name = $button.data("platform-name");
      $(".platform-choice").removeClass("is-active").attr("aria-pressed", "false");
      $button.addClass("is-active").attr("aria-pressed", "true");
      $platformLabel.text(name + " connected");
      $platformCopy.text(platformDetails[name]);
      if (animate && gsap && !reducedMotion) {
        gsap.fromTo($platformCopy[0], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" });
      }
    }

    $(document).on("click", ".platform-choice", function () {
      activatePlatform($(this), true);
    });
    activatePlatform($(".platform-choice").first(), false);

    var journeyViews = [
      {
        image: "assets/images/consulting-collaboration.webp",
        alt: "Two consultants reviewing an operating plan",
        status: "Current focus: build one evidence-led view of the business."
      },
      {
        image: "assets/images/strategy-workshop.webp",
        alt: "Leadership team aligning around a strategy table",
        status: "Current focus: align leaders on the few moves that matter most."
      },
      {
        image: "assets/images/analytics-mobile-dashboard.webp",
        alt: "Executive analytics dashboards showing accountable delivery measures",
        status: "Current focus: connect ownership, cadence, and measures for delivery."
      }
    ];
    var $journeySteps = $("[data-stage2-section='7'] .journey-steps li");
    var $journeyImage = $("[data-stage2-section='7'] .journey-image-secondary img");
    var $journeyStatus = $("<p>", {
      "class": "journey-step-status",
      role: "status",
      "aria-live": "polite"
    });

    $("[data-stage2-section='7'] .journey-copy .btn").before($journeyStatus);
    $journeySteps.each(function (index) {
      var $item = $(this);
      var $choice = $("<button>", {
        "class": "journey-step-choice",
        type: "button",
        "data-journey-step": index,
        "aria-pressed": index === 0 ? "true" : "false"
      });
      $choice.append($item.contents());
      $item.append($choice);
    });

    function activateJourneyStep($choice, animate) {
      if (!$choice || !$choice.length) {
        return;
      }

      var index = Number($choice.data("journey-step"));
      var view = journeyViews[index];

      if (!view) {
        return;
      }
      $(".journey-step-choice").removeClass("is-active").attr("aria-pressed", "false");
      $choice.addClass("is-active").attr("aria-pressed", "true");
      $journeyStatus.text(view.status);

      function updateJourneyImage() {
        $journeyImage.attr({ src: view.image, alt: view.alt });
      }

      if (animate && gsap && !reducedMotion) {
        gsap.to($journeyImage[0], {
          autoAlpha: 0,
          scale: 0.985,
          duration: 0.18,
          ease: "power1.out",
          onComplete: function () {
            updateJourneyImage();
            gsap.to($journeyImage[0], { autoAlpha: 1, scale: 1, duration: 0.32, ease: "power2.out" });
          }
        });
      } else {
        updateJourneyImage();
      }
    }

    $(document).on("click", ".journey-step-choice", function () {
      activateJourneyStep($(this), true);
    });
    activateJourneyStep($(".journey-step-choice").first(), false);

    function formatMetric(value, decimals, suffix) {
      var rendered = decimals ? value.toFixed(decimals) : String(Math.round(value));
      return rendered + suffix;
    }

    var $metrics = $("[data-stage2-section='2'] .outcome-card > strong, [data-stage2-section='14'] .reliability-stats strong, [data-stage2-section='18'] .expertise-proof-stats strong");
    $metrics.each(function () {
      var element = this;
      var finalText = $(element).text().trim();
      var match = finalText.match(/^(\d+(?:\.\d+)?)(.*)$/);
      if (!match || reducedMotion || !gsap || !ScrollTrigger) {
        return;
      }
      var target = Number(match[1]);
      var decimals = match[1].indexOf(".") === -1 ? 0 : match[1].split(".")[1].length;
      var suffix = match[2];
      var state = { value: 0 };
      $(element).text(formatMetric(0, decimals, suffix)).attr("aria-label", finalText);
      gsap.to(state, {
        value: target,
        duration: 1.25,
        ease: "power2.out",
        scrollTrigger: { trigger: element, start: "top 90%", once: true },
        onUpdate: function () {
          $(element).text(formatMetric(state.value, decimals, suffix));
        },
        onComplete: function () {
          $(element).text(finalText);
        }
      });
    });

    $("[data-stage2-section='18'] [role='progressbar']").each(function () {
      var bar = this;
      var value = Number($(bar).attr("aria-valuenow"));
      var fill = bar.querySelector("span");
      if (!fill || reducedMotion || !gsap || !ScrollTrigger) {
        return;
      }
      gsap.set(fill, { width: "0%" });
      gsap.to(fill, {
        width: value + "%",
        duration: 1.15,
        ease: "power2.out",
        scrollTrigger: { trigger: bar, start: "top 90%", once: true }
      });
    });

    var officeTimes = [
      { zone: "America/New_York", label: "New York" },
      { zone: "America/Sao_Paulo", label: "São Paulo" }
    ];

    var $officeAddresses = $(".site-footer-main address");

    $officeAddresses.each(function (index) {
      $(this).append($("<time>", {
        "class": "office-local-time",
        "data-office-time": index,
        "aria-label": "Current local time in " + officeTimes[index].label
      }));
    });

    function updateOfficeTimes() {
      var now = new Date();
      $("[data-office-time]").each(function () {
        var index = Number($(this).data("office-time"));
        var details = officeTimes[index];
        var localFormatter = new Intl.DateTimeFormat("en-US", {
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
          hour12: true,
          timeZone: details.zone
        });
        $(this).attr("datetime", now.toISOString()).text("Local time · " + localFormatter.format(now));
      });
    }

    updateOfficeTimes();
    window.setInterval(updateOfficeTimes, 60000);
  });
})(jQuery, window.gsap, window.ScrollTrigger);

(function () {
  "use strict";

  var carousel = document.querySelector("[data-saas-orbit]");
  if (!carousel) {
    return;
  }

  var cards = Array.prototype.slice.call(carousel.querySelectorAll("[data-saas-orbit-card]"));
  var directionButtons = Array.prototype.slice.call(carousel.querySelectorAll("[data-saas-orbit-direction]"));
  var status = carousel.querySelector("[data-saas-orbit-status]");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var autoTimer = null;
  var manualResumeTimer = null;
  var delay = 2000;
  var manualDelay = 5000;
  var isHovered = false;
  var isCardFocused = false;
  var wrapFadeDuration = 280;

  function moveWrappedCard(card, slot) {
    if (reducedMotion) {
      card.classList.add("is-wrapping");
      card.setAttribute("data-slot", String(slot));
      window.requestAnimationFrame(function () {
        card.classList.remove("is-wrapping");
      });
      return;
    }

    card.classList.add("is-wrap-fading");
    window.setTimeout(function () {
      card.classList.add("is-wrapping");
      card.setAttribute("data-slot", String(slot));
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          card.classList.remove("is-wrapping");
          card.classList.remove("is-wrap-fading");
        });
      });
    }, wrapFadeDuration);
  }

  function rotateCounterClockwise() {
    cards.forEach(function (card) {
      var slot = Number(card.getAttribute("data-slot"));
      if (slot === -1) {
        moveWrappedCard(card, 5);
      } else {
        card.setAttribute("data-slot", String(slot - 1));
      }
    });
  }

  function rotateClockwise() {
    cards.forEach(function (card) {
      var slot = Number(card.getAttribute("data-slot"));
      if (slot === 5) {
        moveWrappedCard(card, -1);
      } else {
        card.setAttribute("data-slot", String(slot + 1));
      }
    });
  }

  function stopAutoRotation() {
    if (autoTimer !== null) {
      window.clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function startAutoRotation() {
    if (reducedMotion || autoTimer !== null || manualResumeTimer !== null || isHovered || isCardFocused || document.hidden) {
      return;
    }
    autoTimer = window.setInterval(rotateCounterClockwise, delay);
  }

  function updateStatus(direction) {
    if (!status) {
      return;
    }
    var centeredCard = carousel.querySelector('[data-saas-orbit-card][data-slot="2"]');
    var productName = centeredCard ? centeredCard.querySelector("strong") : null;
    status.textContent = (productName ? productName.textContent + " centered. " : "") + "Carousel rotated " + direction + ".";
  }

  function scheduleAutoResume() {
    if (manualResumeTimer !== null) {
      window.clearTimeout(manualResumeTimer);
    }
    manualResumeTimer = window.setTimeout(function () {
      manualResumeTimer = null;
      startAutoRotation();
    }, manualDelay);
  }

  directionButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var direction = button.getAttribute("data-saas-orbit-direction");
      stopAutoRotation();
      if (direction === "clockwise") {
        rotateClockwise();
      } else {
        rotateCounterClockwise();
      }
      updateStatus(direction);
      scheduleAutoResume();
    });
  });

  carousel.addEventListener("mouseenter", function () {
    isHovered = true;
    stopAutoRotation();
  });

  carousel.addEventListener("mouseleave", function () {
    isHovered = false;
    startAutoRotation();
  });

  carousel.addEventListener("focusin", function (event) {
    if (event.target.closest("[data-saas-orbit-card]")) {
      isCardFocused = true;
      stopAutoRotation();
    }
  });

  carousel.addEventListener("focusout", function () {
    window.setTimeout(function () {
      isCardFocused = Boolean(document.activeElement && document.activeElement.closest("[data-saas-orbit-card]"));
      startAutoRotation();
    }, 0);
  });

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopAutoRotation();
    } else {
      startAutoRotation();
    }
  });

  startAutoRotation();
})();
/* Physics services section */
(function (Matter) {
  "use strict";

  var section = document.querySelector("[data-physics-services]");
  if (!section || !Matter) {
    return;
  }

  var stage = section.querySelector("[data-physics-stage]");
  var canvasHost = section.querySelector("[data-physics-canvas]");
  var bubbleLayer = section.querySelector("[data-physics-bubbles]");
  var bubbles = Array.prototype.slice.call(section.querySelectorAll("[data-physics-item]"));
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var instance = null;
  var spawnTimers = [];
  var resizeTimer = null;
  var hasAppeared = false;

  function clearSpawnTimers() {
    spawnTimers.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    spawnTimers = [];
  }

  function resetBubbleElements() {
    bubbles.forEach(function (bubble) {
      bubble.classList.remove("is-visible", "is-hovered", "is-dragging");
      bubble.style.removeProperty("width");
      bubble.style.removeProperty("height");
      bubble.style.removeProperty("transform");
    });
  }

  function destroyPhysics() {
    clearSpawnTimers();

    if (!instance) {
      resetBubbleElements();
      return;
    }

    Matter.Render.stop(instance.render);
    Matter.Runner.stop(instance.runner);
    Matter.World.clear(instance.engine.world, false);
    Matter.Engine.clear(instance.engine);

    if (instance.render.canvas && instance.render.canvas.parentNode) {
      instance.render.canvas.parentNode.removeChild(instance.render.canvas);
    }

    instance.render.textures = {};
    instance = null;
    resetBubbleElements();
    stage.removeAttribute("data-physics-state");
  }

  function createPhysics() {
    if (instance || window.innerWidth <= 767 || !hasAppeared) {
      return;
    }

    var width = stage.clientWidth;
    var height = stage.clientHeight;

    if (!width || !height) {
      return;
    }

    var engine = Matter.Engine.create();
    var runner = Matter.Runner.create();
    var render = Matter.Render.create({
      element: canvasHost,
      engine: engine,
      options: {
        width: width,
        height: height,
        pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
        background: "transparent",
        wireframes: false
      }
    });

    render.canvas.setAttribute("aria-hidden", "true");
    render.canvas.setAttribute("tabindex", "-1");

    var wallThickness = 160;
    var boundaries = [
      Matter.Bodies.rectangle(width / 2 + 160, height + 80, width + 320, wallThickness, { isStatic: true }),
      Matter.Bodies.rectangle(-80, 0, wallThickness, height * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width + 80, 0, wallThickness, height * 2, { isStatic: true }),
      Matter.Bodies.rectangle(width / 2 + 160, -80, width + 320, wallThickness, { isStatic: true })
    ];

    Matter.World.add(engine.world, boundaries);

    var mouse = Matter.Mouse.create(render.canvas);
    var mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    if (mouse.element && mouse.mousewheel) {
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);
    }

    Matter.World.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    var physicsCircles = [];

    function syncCircle(circle) {
      var x = circle.body.position.x - circle.baseRadius;
      var y = circle.body.position.y - circle.baseRadius;
      circle.element.style.transform = "translate3d(" + x + "px, " + y + "px, 0) scale(" + circle.scale + ")";
    }

    function applyCircleScale(circle, nextScale) {
      if (Math.abs(circle.scale - nextScale) < 0.0001) {
        circle.scale = nextScale;
        circle.radius = circle.baseRadius * nextScale;
        return;
      }

      var scaleFactor = nextScale / circle.scale;
      Matter.Body.scale(circle.body, scaleFactor, scaleFactor);
      circle.scale = nextScale;
      circle.radius = circle.baseRadius * nextScale;
    }

    function setCircleExpanded(circle, expanded) {
      circle.targetScale = expanded ? 1.2 : 1;
      circle.element.classList.toggle("is-hovered", expanded);

      if (reducedMotion) {
        applyCircleScale(circle, circle.targetScale);
        syncCircle(circle);
      }
    }

    function spawnCircle(index) {
      var element = bubbles[index];
      var size = parseFloat(window.getComputedStyle(element).getPropertyValue("--physics-circle-size"));
      var radius = size * 0.5;
      var body = Matter.Bodies.circle(Math.floor(Math.random() * width), 0, radius, {
        render: { fillStyle: "transparent", strokeStyle: "transparent" },
        restitution: 0.5,
        friction: 0,
        density: 0.01
      });

      element.style.width = size + "px";
      element.style.height = size + "px";
      element.classList.add("is-visible");

      var circle = {
        body: body,
        element: element,
        baseRadius: radius,
        radius: radius,
        scale: 1,
        targetScale: 1
      };

      physicsCircles.push(circle);
      Matter.World.add(engine.world, body);
      syncCircle(circle);
    }

    Matter.Events.on(engine, "afterUpdate", function () {
      physicsCircles.forEach(function (circle) {
        var scaleDelta = circle.targetScale - circle.scale;

        if (Math.abs(scaleDelta) > 0.01) {
          applyCircleScale(circle, circle.scale + scaleDelta * 0.45);
        } else if (circle.scale !== circle.targetScale) {
          applyCircleScale(circle, circle.targetScale);
        }

        syncCircle(circle);
      });
    });

    Matter.Events.on(mouseConstraint, "mousemove", function (event) {
      var bodies = physicsCircles.map(function (circle) {
        return circle.body;
      });
      var hovered = Matter.Query.point(bodies, event.mouse.position)[0];

      physicsCircles.forEach(function (circle) {
        setCircleExpanded(circle, circle.body === hovered);
      });

      render.canvas.style.cursor = hovered ? "grab" : "default";
    });

    Matter.Events.on(mouseConstraint, "startdrag", function (event) {
      var circle = physicsCircles.find(function (entry) {
        return entry.body === event.body;
      });

      if (circle) {
        setCircleExpanded(circle, true);
        circle.element.classList.add("is-dragging");
        render.canvas.style.cursor = "grabbing";
      }
    });

    Matter.Events.on(mouseConstraint, "enddrag", function (event) {
      var circle = physicsCircles.find(function (entry) {
        return entry.body === event.body;
      });

      if (circle) {
        circle.element.classList.remove("is-dragging");
      }

      render.canvas.style.cursor = "default";
    });

    render.canvas.addEventListener("mouseleave", function () {
      physicsCircles.forEach(function (circle) {
        setCircleExpanded(circle, false);
      });
      render.canvas.style.cursor = "default";
    });

    instance = {
      engine: engine,
      runner: runner,
      render: render,
      circles: physicsCircles,
      width: width,
      height: height
    };

    stage.setAttribute("data-physics-state", reducedMotion ? "settled" : "running");

    if (reducedMotion) {
      bubbles.forEach(function (_, index) {
        spawnCircle(index);
      });

      for (var step = 0; step < 540; step += 1) {
        Matter.Engine.update(engine, 1000 / 60);
      }

      physicsCircles.forEach(syncCircle);
      Matter.Render.run(render);
      return;
    }

    bubbles.forEach(function (_, index) {
      spawnTimers.push(window.setTimeout(function () {
        spawnCircle(index);
      }, index * 450));
    });

    Matter.Runner.run(runner, engine);
    Matter.Render.run(render);
  }

  function handleResponsiveChange() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      var shouldRun = window.innerWidth > 767;
      var sizeChanged = instance && (
        Math.abs(instance.width - stage.clientWidth) > 1 ||
        Math.abs(instance.height - stage.clientHeight) > 1
      );

      if (!shouldRun || sizeChanged) {
        destroyPhysics();
      }

      if (shouldRun) {
        createPhysics();
      }
    }, 220);
  }

  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (entry) { return entry.isIntersecting; })) {
        hasAppeared = true;
        createPhysics();
        observer.disconnect();
      }
    }, {
      threshold: 0.08
    });

    observer.observe(stage);
  } else {
    hasAppeared = true;
    createPhysics();
  }

  if ("IntersectionObserver" in window) {
    var visibilityObserver = new IntersectionObserver(function (entries) {
      var inView = entries.some(function (entry) {
        return entry.isIntersecting && entry.intersectionRatio > 0.03;
      });
      document.documentElement.classList.toggle("physics-services-in-view", inView);
    }, {
      threshold: [0, 0.03, 0.1]
    });

    visibilityObserver.observe(stage);
  }

  window.addEventListener("resize", handleResponsiveChange);
})(window.Matter);