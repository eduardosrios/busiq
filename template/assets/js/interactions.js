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
      var index = Number($choice.data("journey-step"));
      var view = journeyViews[index];
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