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
      return;
    }

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
  });
})(jQuery, window.gsap, window.ScrollTrigger);