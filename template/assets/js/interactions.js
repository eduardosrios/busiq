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
      .from(".hero-copy .eyebrow", { autoAlpha: 0, y: 18, duration: 0.5 })
      .from(".hero-copy h1", { autoAlpha: 0, y: 44, duration: 0.78 }, "-=0.2")
      .from(".hero-copy .hero-lead", { autoAlpha: 0, y: 24, duration: 0.55 }, "-=0.42")
      .from(".hero-actions > *", { autoAlpha: 0, y: 18, duration: 0.45, stagger: 0.1 }, "-=0.3")
      .from(".hero-image-wrap", { autoAlpha: 0, clipPath: "inset(0 0 100% 0)", duration: 0.9 }, 0.12);

    gsap.to(".hero-image-wrap img", {
      yPercent: 8,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
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

    var $lightboxImages = $("[data-busiqe-lightbox]");
    var $lightboxModal = $("#imageLightbox");
    var $lightboxImage = $("#imageLightboxAsset");
    var $lightboxCaption = $("#imageLightboxCaption");
    var $lightboxCount = $("#imageLightboxCount");
    var lightboxIndex = 0;
    var lightboxReturnFocus = null;

    $lightboxImages.each(function (index) {
      var $image = $(this);
      var $button = $("<button>", {
        "class": "busiqe-lightbox-trigger",
        type: "button",
        "data-lightbox-index": index,
        "aria-label": "Open image gallery: " + ($image.attr("alt") || "Busiqe image")
      });
      $image.wrap($button);
    });

    var $lightboxTriggers = $(".busiqe-lightbox-trigger");

    function renderLightbox(index, direction) {
      lightboxIndex = (index + $lightboxTriggers.length) % $lightboxTriggers.length;
      var $source = $lightboxImages.eq(lightboxIndex);
      var source = $source.attr("src");
      var alternative = $source.attr("alt") || "Busiqe perspective";

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
    activatePlatform($(".platform-choice").first(), false);});
})(jQuery, window.gsap, window.ScrollTrigger);