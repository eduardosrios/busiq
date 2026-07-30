(function ($) {
  "use strict";

  $(function () {
    var $navigation = $("#primaryNavigation");
    var $contactForm = $("#contactForm");
    var $contactSuccess = $("#contactSuccess");

    var videoVariants = [
      { source: 4, number: 73, file: "leadership-meeting.mp4" },
      { source: 14, number: 74, file: "strategy-workshop.mp4" },
      { source: 16, number: 75, file: "office-collaboration.mp4" },
      { source: 33, number: 76, file: "planning-session.mp4" },
      { source: 42, number: 77, file: "partner-discussion.mp4" },
      { source: 63, number: 78, file: "project-review.mp4" }
    ];

    function remapCloneIds($clone, suffix) {
      var idMap = {};

      $clone.find("[id]").addBack("[id]").each(function () {
        var oldId = this.id;
        var newId = oldId + suffix;
        idMap[oldId] = newId;
        this.id = newId;
      });

      $clone.find("*").addBack().each(function () {
        var element = this;
        ["for", "aria-controls", "aria-describedby", "aria-labelledby"].forEach(function (attribute) {
          var value = element.getAttribute && element.getAttribute(attribute);
          if (!value) {
            return;
          }
          var remapped = value.split(/\s+/).map(function (token) { return idMap[token] || token; }).join(" ");
          element.setAttribute(attribute, remapped);
        });
        ["href", "data-bs-target", "data-target"].forEach(function (attribute) {
          var value = element.getAttribute && element.getAttribute(attribute);
          if (value && value.charAt(0) === "#" && idMap[value.slice(1)]) {
            element.setAttribute(attribute, "#" + idMap[value.slice(1)]);
          }
        });
      });
    }

    videoVariants.forEach(function (variant) {
      var $sourceSection = $("[data-stage2-section='" + variant.source + "']").first();
      if (!$sourceSection.length) {
        return;
      }

      var $clone = $sourceSection.clone(false, false);
      var suffix = "-video-" + variant.number;
      remapCloneIds($clone, suffix);
      $clone.removeAttr("data-stage2-section")
        .attr("data-video-variant", variant.number)
        .attr("data-reference-source", variant.source)
        .addClass("stage4-video-variant");

      $clone.find("img").each(function () {
        var $image = $(this);
        var $video = $("<video>", {
          "class": (($image.attr("class") || "") + " stage4-section-video").trim(),
          autoplay: true,
          loop: true,
          muted: true,
          playsinline: true,
          preload: "metadata",
          poster: $image.attr("src"),
          "aria-label": $image.attr("alt") || "Busiqe team at work"
        }).prop("muted", true).prop("autoplay", true).prop("loop", true).prop("playsInline", true);
        $video.append($("<source>", { src: "assets/videos/" + variant.file, type: "video/mp4" }));
        $image.replaceWith($video);
      });

      $clone.find(".story-play").remove();
      $clone.insertAfter($sourceSection);
      $clone.find("video").each(function () {
        var video = this;
        video.muted = true;
        var playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {
            video.addEventListener("canplay", function resumeVideo() {
              video.removeEventListener("canplay", resumeVideo);
              video.play().catch(function () {});
            });
          });
        }
      });
    });

    var referenceData = window.BusiqeReferences || {};
    var selectedReferenceNumbers = [];
    var referenceMultiCopy = false;

    function copyReferenceText(value) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).catch(function () { fallbackCopy(value); });
        return;
      }
      fallbackCopy(value);
    }

    function fallbackCopy(value) {
      var field = document.createElement("textarea");
      field.value = value;
      field.setAttribute("readonly", "");
      field.className = "reference-copy-field";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      document.body.removeChild(field);
    }

    function addReferenceTools($section, entry) {
      if (!entry || !$section.length || $section.children(".reference-tools").length) {
        return;
      }
      var $tools = $("<div>", { "class": "reference-tools", "aria-label": "Design reference controls" });
      var $cropped = $("<a>", { "class": "reference-link reference-cropped", href: entry.cropped, target: "_blank", rel: "noopener noreferrer", text: "C", "aria-label": "Open cropped design reference " + entry.number });
      var $original = $("<a>", { "class": "reference-link reference-original", href: entry.original, target: "_blank", rel: "noopener noreferrer", text: "O", "aria-label": "Open original design reference " + entry.number });
      var $number = $("<button>", { "class": "reference-number", type: "button", text: entry.number, "data-reference-number": entry.number, "aria-label": "Copy design reference number " + entry.number });
      var $multi = $("<button>", { "class": "reference-copy-toggle", type: "button", text: "C+", "aria-pressed": "false", "aria-label": "Enable multi-reference copying" });
      $tools.append($cropped, $original, $number, $multi);
      $section.append($tools);
    }

    addReferenceTools($(".hero-section").first(), referenceData.hero);
    $("[data-stage2-section]").each(function () {
      var key = String($(this).data("stage2-section"));
      addReferenceTools($(this), referenceData.sections && referenceData.sections[key]);
    });
    $("[data-video-variant]").each(function () {
      var $variant = $(this);
      var sourceKey = String($variant.data("reference-source"));
      var sourceEntry = referenceData.sections && referenceData.sections[sourceKey];
      if (sourceEntry) {
        addReferenceTools($variant, { number: Number($variant.data("video-variant")), cropped: sourceEntry.cropped, original: sourceEntry.original });
      }
    });
    addReferenceTools($(".site-footer").first(), referenceData.footer);

    $(document).on("click", ".reference-copy-toggle", function () {
      referenceMultiCopy = !referenceMultiCopy;
      if (!referenceMultiCopy) {
        selectedReferenceNumbers = [];
      }
      $(".reference-copy-toggle").toggleClass("is-active", referenceMultiCopy).attr("aria-pressed", String(referenceMultiCopy));
    });

    $(document).on("click", ".reference-number", function () {
      var number = Number($(this).data("reference-number"));
      if (referenceMultiCopy) {
        if (selectedReferenceNumbers.indexOf(number) === -1) {
          selectedReferenceNumbers.push(number);
        }
      } else {
        selectedReferenceNumbers = [number];
      }
      var copyValue = selectedReferenceNumbers.join(",");
      copyReferenceText(copyValue);
      $(this).attr("aria-label", "Copied design reference " + copyValue);
    });

    $(".submenu-toggle").on("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      var $button = $(this);
      var $item = $button.closest(".has-submenu");
      var opening = !$item.hasClass("is-open");
      $(".has-submenu").removeClass("is-open").find(".submenu-toggle").attr("aria-expanded", "false");
      if (opening) {
        $item.addClass("is-open");
        $button.attr("aria-expanded", "true");
      }
    });

    $(document).on("click", function (event) {
      if (!$(event.target).closest(".has-submenu").length) {
        $(".has-submenu").removeClass("is-open").find(".submenu-toggle").attr("aria-expanded", "false");
      }
    }).on("keydown", function (event) {
      if (event.key === "Escape") {
        $(".has-submenu").removeClass("is-open").find(".submenu-toggle").attr("aria-expanded", "false");
      }
    });

    var $siteHeader = $(".site-header");
    var lastScrollPosition = window.pageYOffset;
    var headerScrollQueued = false;

    function updateStickyHeader() {
      var currentScrollPosition = window.pageYOffset;
      var beyondHeader = currentScrollPosition > Math.max(160, $siteHeader.outerHeight());
      $siteHeader.toggleClass("has-scrolled", beyondHeader);
      if (!beyondHeader) {
        $siteHeader.removeClass("is-visible");
      } else {
        $siteHeader.toggleClass("is-visible", currentScrollPosition < lastScrollPosition);
      }
      lastScrollPosition = currentScrollPosition;
      headerScrollQueued = false;
    }

    $(window).on("scroll", function () {
      if (!headerScrollQueued) {
        window.requestAnimationFrame(updateStickyHeader);
        headerScrollQueued = true;
      }
    });

    $("a[href^='#']").on("click", function (event) {
      var targetId = $(this).attr("href");
      var $target = $(targetId);
      var isSkipLink = $(this).hasClass("skip-link");
      var collapse = bootstrap.Collapse.getInstance($navigation[0]);
      var openNavigationHeight = $navigation.hasClass("show") ? $siteHeader.outerHeight() : 0;

      if (targetId.length > 1 && $target.length) {
        event.preventDefault();
        if (isSkipLink) {
          $("html, body").stop(true).scrollTop($target.offset().top);
          $target.trigger("focus");
        } else {
          $("html, body").stop().animate({ scrollTop: Math.max(0, $target.offset().top - openNavigationHeight) }, 450);
        }
      }

      $(".has-submenu").removeClass("is-open").find(".submenu-toggle").attr("aria-expanded", "false");
      if (collapse) {
        collapse.hide();
      }
    });

    $(".integration-node").on("click", function () {
      $(".integration-node").removeClass("active");
      $(this).addClass("active");
      $("#integrationStatus").text($(this).data("integration") + " connected");
    });

    $(".pricing-switch button").on("click", function () {
      var billing = $(this).data("billing");

      $(".pricing-switch button")
        .removeClass("active")
        .attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");

      $(".pricing-value strong[data-monthly]").each(function () {
        $(this).text($(this).data(billing));
        $(this).closest(".pricing-value").toggleClass("yearly", billing === "yearly");
      });
    });

    var compactQuoteIndex = 0;
    var $compactQuotes = $("[data-compact-quote]");

    $("[data-compact-direction]").on("click", function () {
      var direction = $(this).data("compact-direction");
      compactQuoteIndex = (compactQuoteIndex + (direction === "next" ? 1 : -1) + $compactQuotes.length) % $compactQuotes.length;
      $compactQuotes.attr("hidden", true).eq(compactQuoteIndex).removeAttr("hidden");
    });

    $("#inlineContactForm").on("submit", function (event) {
      event.preventDefault();
      var $inlineForm = $(this);
      var inlineValid = true;

      $inlineForm.find("[required]").each(function () {
        var fieldValid = this.checkValidity();
        $(this).parent().toggleClass("was-invalid", !fieldValid);
        inlineValid = inlineValid && fieldValid;
      });

      if (inlineValid) {
        $inlineForm.attr("hidden", true);
        $("#inlineContactSuccess").removeAttr("hidden");
      }
    });

    $("[data-process-step]").on("click", function () {
      $("[data-process-step]").removeClass("active").attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");
    });

    $("[data-case-study-index]").on("click", function () {
      $("[data-case-study-index]").removeClass("active").attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");
      $("#caseStudySector").text($(this).data("sector"));
      $("#caseStudyResult").text($(this).data("result"));
      $("#case-study-title").text($(this).data("title"));
      $("#caseStudySummary").text($(this).data("summary"));
    });

    var impactPersonIndex = 2;
    var $impactPeople = $("[data-impact-person]");

    $("[data-impact-direction]").on("click", function () {
      var impactDirection = $(this).data("impact-direction");
      impactPersonIndex = (impactPersonIndex + (impactDirection === "next" ? 1 : -1) + $impactPeople.length) % $impactPeople.length;
      $impactPeople.removeClass("is-active").removeAttr("aria-current");
      $impactPeople.eq(impactPersonIndex).addClass("is-active").attr("aria-current", "true");
    });

    $("[data-service-page]").on("click", function () {
      var servicePage = $(this).data("service-page");

      $("[data-service-page]").removeClass("active").attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");
      $("[data-service-card]").attr("hidden", true);
      $("[data-service-card='" + servicePage + "']").removeAttr("hidden");
    });

    $("[data-testimonial-index]").on("click", function () {
      var testimonialIndex = $(this).data("testimonial-index");

      $("[data-testimonial-index]").removeClass("active").attr("aria-pressed", "false");
      $(this).addClass("active").attr("aria-pressed", "true");
      $("[data-testimonial-card]").removeClass("is-featured");
      $("[data-testimonial-card='" + testimonialIndex + "']").addClass("is-featured");
    });

    var $insightCards = $("[data-insight-card]");
    var insightStart = 0;

    function renderInsightCards() {
      var visibleCount = window.matchMedia("(max-width: 767.98px)").matches ? 1 : 3;

      $insightCards.attr("hidden", true);
      for (var index = 0; index < visibleCount; index += 1) {
        $insightCards.eq((insightStart + index) % $insightCards.length).removeAttr("hidden");
      }
    }

    $("[data-insights-direction]").on("click", function () {
      var direction = $(this).data("insights-direction");
      insightStart = (insightStart + (direction === "next" ? 1 : -1) + $insightCards.length) % $insightCards.length;
      renderInsightCards();
    });

    $(window).on("resize", renderInsightCards);
    renderInsightCards();

    var workflowDescriptions = {
      Design: "A brand system built to be remembered, trusted, and used consistently.",
      Define: "A focused strategic brief that aligns audiences, priorities, and measures of success.",
      Build: "A practical experience and operating system that turns the strategy into daily action.",
      Launch: "A coordinated market activation with fast feedback loops and accountable owners."
    };

    $("[data-workflow-step]").on("click", function () {
      var workflowStep = $(this).data("workflow-step");

      $("[data-workflow-step]").removeClass("is-active").attr("aria-pressed", "false");
      $(this).addClass("is-active").attr("aria-pressed", "true");
      $("#workflowStatus").text(workflowStep);
      $("#workflowDescription").text(workflowDescriptions[workflowStep]);
    });
    $("[data-selected-work]").on("click", function () {
      var $control = $(this);

      $("[data-selected-work]").removeClass("is-active").attr("aria-pressed", "false");
      $("[data-selected-work] .selected-work-detail").attr("hidden", true);
      $control.addClass("is-active").attr("aria-pressed", "true");
      $control.find(".selected-work-detail").removeAttr("hidden");
    });
    $("[data-growth-path]").on("click", function () {
      var $growthPath = $(this);

      $("[data-growth-path]").removeClass("is-featured").attr("aria-pressed", "false");
      $growthPath.addClass("is-featured").attr("aria-pressed", "true");
      $("#growthPathStatus").text($growthPath.data("growth-path"));
    });
    $("[data-delivery-step]").on("click", function () {
      var $deliveryStep = $(this);

      $("[data-delivery-step]").removeClass("is-active").attr("aria-pressed", "false");
      $deliveryStep.addClass("is-active").attr("aria-pressed", "true");
      $("#deliveryProcessStatus").text($deliveryStep.data("delivery-step"));
      $("#deliveryProcessDescription").text($deliveryStep.data("delivery-description"));
    });
    $("[data-person-name]").on("click", function () {
      var $person = $(this);

      $("[data-person-name]").removeClass("is-active").attr("aria-pressed", "false");
      $person.addClass("is-active").attr("aria-pressed", "true");
      $("#keyPersonName").text($person.data("person-name"));
      $("#keyPersonRole").text($person.data("person-role"));
      $("#keyPersonSummary").text($person.data("person-summary"));
    });
    $("[data-tailored-service]").on("click", function () {
      var $service = $(this);

      $("[data-tailored-service]").removeClass("is-active").attr("aria-pressed", "false");
      $service.addClass("is-active").attr("aria-pressed", "true");
      $("#tailoredServiceStatus").text($service.data("tailored-service"));
    });
    var $agencyVoices = $("[data-agency-voice]");
    var agencyVoiceStart = 0;

    function renderAgencyVoices() {
      var visibleAgencyVoices = window.matchMedia("(max-width: 991.98px)").matches ? 1 : 3;

      $agencyVoices.attr("hidden", true);
      for (var agencyVoiceIndex = 0; agencyVoiceIndex < visibleAgencyVoices; agencyVoiceIndex += 1) {
        $agencyVoices.eq((agencyVoiceStart + agencyVoiceIndex) % $agencyVoices.length).removeAttr("hidden");
      }
    }

    $("[data-agency-voice-direction]").on("click", function () {
      var agencyVoiceDirection = $(this).data("agency-voice-direction");
      agencyVoiceStart = (agencyVoiceStart + (agencyVoiceDirection === "next" ? 1 : -1) + $agencyVoices.length) % $agencyVoices.length;
      renderAgencyVoices();
    });

    $(window).on("resize", renderAgencyVoices);
    renderAgencyVoices();
    $("[data-dark-faq]").on("click", function () {
      var $darkFaqButton = $(this);
      var darkFaqId = $darkFaqButton.data("dark-faq");
      var wasExpanded = $darkFaqButton.attr("aria-expanded") === "true";

      $("[data-dark-faq]").attr("aria-expanded", "false").find("i").removeClass("fa-minus").addClass("fa-plus");
      $(".dark-faq-item").removeClass("is-open").children("div").attr("hidden", true);

      if (!wasExpanded) {
        $darkFaqButton.attr("aria-expanded", "true").find("i").removeClass("fa-plus").addClass("fa-minus");
        $darkFaqButton.closest(".dark-faq-item").addClass("is-open");
        $("#" + darkFaqId).removeAttr("hidden");
      }
    });
    var featuredProjects = [
      { title: "Northline Infrastructure", location: "Toronto, Canada", scope: "Enterprise transformation", duration: "14 months", outcome: "18% faster delivery", image: "assets/images/hero-building.png", alt: "Modern headquarters for Northline Infrastructure" },
      { title: "Summit Energy", location: "Denver, United States", scope: "Growth and operating model", duration: "10 months", outcome: "24% portfolio uplift", image: "assets/images/reliability-mountains.webp", alt: "Mountain landscape representing Summit Energy" },
      { title: "Meridian Health", location: "London, United Kingdom", scope: "Decision intelligence", duration: "8 months", outcome: "3.1× faster insights", image: "assets/images/analytics-mobile-dashboard.webp", alt: "Analytics platform for Meridian Health" }
    ];
    var featuredProjectIndex = 0;

    function renderFeaturedProject() {
      var project = featuredProjects[featuredProjectIndex];
      $("#featuredProjectImage").attr({ src: project.image, alt: project.alt });
      $("#featuredProjectTitle").text(project.title);
      $("#featuredProjectLocation").text(project.location);
      $("#featuredProjectScope").text(project.scope);
      $("#featuredProjectDuration").text(project.duration);
      $("#featuredProjectOutcome").text(project.outcome);
      $("#featuredProjectCount").text(String(featuredProjectIndex + 1).padStart(2, "0") + " / 03");
    }

    $("[data-featured-project-direction]").on("click", function () {
      var featuredProjectDirection = $(this).data("featured-project-direction");
      featuredProjectIndex = (featuredProjectIndex + (featuredProjectDirection === "next" ? 1 : -1) + featuredProjects.length) % featuredProjects.length;
      renderFeaturedProject();
    });
    $(".capability-narrative-nav a").on("click", function () {
      $(".capability-narrative-nav a").removeClass("is-active").removeAttr("aria-current");
      $(this).addClass("is-active").attr("aria-current", "location");
    });
    var $portfolioGroups = $("[data-portfolio-group]");
    var portfolioGroupIndex = 0;

    function renderPortfolioGroup() {
      $portfolioGroups.attr("hidden", true).eq(portfolioGroupIndex).removeAttr("hidden");
      $("#portfolioGroupStatus").text("Portfolio group " + (portfolioGroupIndex + 1) + " of " + $portfolioGroups.length);
    }

    $("[data-portfolio-direction]").on("click", function () {
      var direction = $(this).data("portfolio-direction");
      portfolioGroupIndex = (portfolioGroupIndex + (direction === "next" ? 1 : -1) + $portfolioGroups.length) % $portfolioGroups.length;
      renderPortfolioGroup();
    });

    $("[data-network-view]").on("click", function () {
      var $view = $(this);
      $("[data-network-view]").removeClass("is-active").attr("aria-pressed", "false");
      $view.addClass("is-active").attr("aria-pressed", "true");
      $("#networkCompanyCount").text($view.data("company-count"));
      $("#networkGrowthRate").text($view.data("growth"));
      $("#networkCompanyNote").text($view.data("network-note"));
    });
    $("[data-visibility-tab]").on("click", function () {
      var $tab = $(this);
      $("[data-visibility-tab]").removeClass("is-active").attr("aria-pressed", "false");
      $tab.addClass("is-active").attr("aria-pressed", "true");
      $("#visibility-platform-title").text($tab.data("title"));
      $("#visibilityPlatformCopy").text($tab.data("copy"));
    });
    var trustedGrowthQuotes = [
      { quote: "“Busiqe gave us instant visibility into our pipeline and helped our team move from debate to focused action faster.”", name: "Daniel Reed", role: "Chief Operating Officer · Northline", image: "assets/images/team-daniel.webp", alt: "Daniel Reed, client operations leader" },
      { quote: "“The team connected our growth choices to an operating rhythm the whole organization could understand and use.”", name: "Sofia Marin", role: "Chief Growth Officer · Meridian", image: "assets/images/team-sofia.webp", alt: "Sofia Marin, client growth leader" }
    ];
    var trustedGrowthIndex = 0;

    $("[data-trusted-growth-next]").on("click", function () {
      trustedGrowthIndex = (trustedGrowthIndex + 1) % trustedGrowthQuotes.length;
      var quote = trustedGrowthQuotes[trustedGrowthIndex];
      $("#trustedGrowthQuote").text(quote.quote);
      $("#trustedGrowthName").text(quote.name);
      $("#trustedGrowthRole").text(quote.role);
      $("#trustedGrowthPortrait").attr({ src: quote.image, alt: quote.alt });
    });
    $("[data-creative-technology]").on("click", function () {
      var $service = $(this);
      $("[data-creative-technology]").removeClass("is-active").attr("aria-pressed", "false");
      $service.addClass("is-active").attr("aria-pressed", "true");
      $("#creativeTechnologyImage").attr({ src: $service.data("image"), alt: $service.data("alt") });
    });
    $("[data-economic-step]").on("click", function () {
      var $step = $(this);
      $("[data-economic-step]").removeClass("is-active").attr("aria-pressed", "false");
      $step.addClass("is-active").attr("aria-pressed", "true");
      $("#economicGrowthCopy").text($step.data("copy"));
    });
    $("[data-reason-card]").on("click", function () {
      var $card = $(this);
      $("[data-reason-card]").removeClass("is-active").attr("aria-pressed", "false");
      $card.addClass("is-active").attr("aria-pressed", "true");
    });

    $("[data-co-create-service]").on("click", function () {
      var $service = $(this);
      $("[data-co-create-service]").removeClass("is-active").attr("aria-pressed", "false");
      $service.addClass("is-active").attr("aria-pressed", "true");
      $("#coCreateImage").attr({
        src: $service.data("image"),
        alt: $service.data("alt")
      });
    });
    $("[data-product-demo-tab]").on("click", function () {
      var $tab = $(this);
      $("[data-product-demo-tab]").removeClass("is-active").attr("aria-pressed", "false");
      $tab.addClass("is-active").attr("aria-pressed", "true");
      $("#productDemoHeading").text($tab.data("title"));
      $("#productDemoStatus").text($tab.data("status"));
    });

    $("[data-business-solution]").on("click", function () {
      var $button = $(this);
      var $article = $button.closest("article");
      var title = $article.find("h3").text();
      $("[data-business-solution]").attr("aria-pressed", "false").closest("article").removeClass("is-active");
      $button.attr("aria-pressed", "true");
      $article.addClass("is-active");
      $("#businessSolutionCopy").text("Ready to explore how " + title.toLowerCase() + " can strengthen your next chapter?");
    });
    var $newsletterForm = $("#footerNewsletterForm");
    var $newsletterEmail = $("#footerNewsletterEmail");
    var $newsletterStatus = $("#footerNewsletterStatus");

    $newsletterForm.on("submit", function (event) {
      event.preventDefault();
      var email = String($newsletterEmail.val() || "").trim();
      var isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      if (!isValidEmail) {
        $newsletterEmail.attr("aria-invalid", "true").trigger("focus");
        $newsletterStatus.removeClass("is-success").addClass("is-error").text("Enter a valid work email to subscribe.");
        return;
      }

      $newsletterEmail.removeAttr("aria-invalid");
      $newsletterStatus.removeClass("is-error").addClass("is-success").text("You’re subscribed. Watch your inbox for the next Busiqe briefing.");
      $newsletterForm.find("button[type='submit']").text("Subscribed").prop("disabled", true);
    });

    $newsletterEmail.on("input", function () {
      $(this).removeAttr("aria-invalid");
      if ($newsletterStatus.hasClass("is-error")) {
        $newsletterStatus.removeClass("is-error").text("One concise note each month. Unsubscribe anytime.");
      }
    });
    $contactForm.on("submit", function (event) {
      event.preventDefault();

      if (!this.checkValidity()) {
        event.stopPropagation();
        $(this).addClass("was-validated");
        return;
      }

      $contactForm.attr("hidden", true);
      $contactSuccess.removeAttr("hidden");
    });

    $("#contactModal").on("hidden.bs.modal", function () {
      $contactForm[0].reset();
      $contactForm.removeClass("was-validated").removeAttr("hidden");
      $contactSuccess.attr("hidden", true);
    });
  });
})(jQuery);