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
  });
})(jQuery, window.gsap, window.ScrollTrigger);