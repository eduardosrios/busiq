(function ($) {
  "use strict";

  $(function () {
    var $navigation = $("#primaryNavigation");
    var $contactForm = $("#contactForm");
    var $contactSuccess = $("#contactSuccess");

    $("a[href^='#']").on("click", function (event) {
      var targetId = $(this).attr("href");
      var $target = $(targetId);

      if (targetId.length > 1 && $target.length) {
        event.preventDefault();
        $("html, body").stop().animate({ scrollTop: $target.offset().top }, 450);
      }

      var collapse = bootstrap.Collapse.getInstance($navigation[0]);
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