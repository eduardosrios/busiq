(function ($) {
  "use strict";

  $(function () {
    var $navigation = $("#primaryNavigation");
    var $contactForm = $("#contactForm");
    var $contactSuccess = $("#contactSuccess");

    var referenceData = window.BusiqReferences || {};
    var selectedReferenceNumbers = [];
    var referenceMultiCopy = false;

    function copyReferenceText(value) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(value).then(function () {
          return true;
        }).catch(function () {
          return fallbackCopy(value);
        });
      }
      return Promise.resolve(fallbackCopy(value));
    }

    function fallbackCopy(value) {
      var field = document.createElement("textarea");
      var copied = false;
      field.value = value;
      field.setAttribute("readonly", "");
      field.className = "reference-copy-field";
      document.body.appendChild(field);
      field.select();
      try {
        copied = document.execCommand("copy");
      } catch (error) {
        copied = false;
      }
      document.body.removeChild(field);
      return copied;
    }

    function showReferenceCopiedState($button, number, copyValue) {
      var previousTimer = $button.data("copy-feedback-timer");
      if (previousTimer) {
        window.clearTimeout(previousTimer);
      }
      $button
        .addClass("is-copied")
        .attr("aria-label", "Copied design reference " + copyValue)
        .html('<i class="fa-solid fa-check" aria-hidden="true"></i>');
      var feedbackTimer = window.setTimeout(function () {
        $button
          .removeClass("is-copied")
          .attr("aria-label", "Copy design reference number " + number)
          .text(number)
          .removeData("copy-feedback-timer");
      }, 1400);
      $button.data("copy-feedback-timer", feedbackTimer);
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

    addReferenceTools($(".site-footer").first(), referenceData.footer);

    function parseCssColor(value) {
      var match = String(value || "").match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
      if (!match) {
        return null;
      }
      return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] === undefined ? 1 : Number(match[4])
      };
    }

    function compositeColor(foreground, background) {
      var alpha = foreground.a + background.a * (1 - foreground.a);
      if (!alpha) {
        return { r: 255, g: 255, b: 255, a: 1 };
      }
      return {
        r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
        g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
        b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
        a: alpha
      };
    }

    function effectiveBackground(element) {
      var chain = [];
      var node = element;
      var background = { r: 255, g: 255, b: 255, a: 1 };
      while (node && node.nodeType === 1) {
        chain.unshift(node);
        node = node.parentElement;
      }
      chain.forEach(function (current) {
        var color = parseCssColor(window.getComputedStyle(current).backgroundColor);
        if (color && color.a > 0) {
          background = compositeColor(color, background);
        }
      });
      return background;
    }

    function relativeLuminance(color) {
      function channel(value) {
        value /= 255;
        return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
      }
      return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b);
    }

    function contrastRatio(foreground, background) {
      var light = relativeLuminance(foreground);
      var dark = relativeLuminance(background);
      return (Math.max(light, dark) + 0.05) / (Math.min(light, dark) + 0.05);
    }

    function isBlueSurface(color) {
      var red = color.r / 255;
      var green = color.g / 255;
      var blue = color.b / 255;
      var maximum = Math.max(red, green, blue);
      var minimum = Math.min(red, green, blue);
      var delta = maximum - minimum;
      var lightness = (maximum + minimum) / 2;
      var saturation = delta ? delta / (1 - Math.abs(2 * lightness - 1)) : 0;
      var hue = 0;
      if (delta) {
        if (maximum === red) {
          hue = 60 * (((green - blue) / delta) % 6);
        } else if (maximum === green) {
          hue = 60 * ((blue - red) / delta + 2);
        } else {
          hue = 60 * ((red - green) / delta + 4);
        }
      }
      if (hue < 0) {
        hue += 360;
      }
      return hue >= 195 && hue <= 265 && saturation >= 0.42 && lightness < 0.82;
    }

    function isVisibleContrastNode(element) {
      var style = window.getComputedStyle(element);
      var rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 1 && rect.height > 1;
    }

    function syncBusiqBlueContrast() {
      var selector = "button, a, h1, h2, h3, h4, p, span, strong, small, li, label, i, b";
      var whiteControls = [];
      var whiteText = [];
      var whiteIcons = [];

      $(".busiq-contrast-white-control, .busiq-contrast-white-text, .busiq-contrast-white-icon")
        .removeClass("busiq-contrast-white-control busiq-contrast-white-text busiq-contrast-white-icon");

      $(selector).each(function () {
        var element = this;
        if (!isVisibleContrastNode(element)) {
          return;
        }
        var background = effectiveBackground(element);
        if (!isBlueSurface(background)) {
          return;
        }
        var foreground = parseCssColor(window.getComputedStyle(element).color);
        if (!foreground) {
          return;
        }
        foreground = compositeColor(foreground, background);
        if (contrastRatio(foreground, background) >= 4.5) {
          return;
        }

        var control = element.matches("button, a") ? element : element.closest("button, a");
        if (control && isBlueSurface(effectiveBackground(control))) {
          whiteControls.push(control);
          return;
        }

        var ownBackground = parseCssColor(window.getComputedStyle(element).backgroundColor);
        if (element.matches("i") && ownBackground && ownBackground.a > 0.15 && isBlueSurface(compositeColor(ownBackground, { r: 255, g: 255, b: 255, a: 1 }))) {
          whiteIcons.push(element);
          return;
        }
        whiteText.push(element);
      });

      $(whiteControls).addClass("busiq-contrast-white-control");
      $(whiteText).addClass("busiq-contrast-white-text");
      $(whiteIcons).addClass("busiq-contrast-white-icon");
    }

    var busiqContrastResizeTimer = null;
    syncBusiqBlueContrast();
    window.setTimeout(syncBusiqBlueContrast, 80);
    window.setTimeout(syncBusiqBlueContrast, 500);
    $(window).on("load", syncBusiqBlueContrast);
    $(document).on("click", "button, a", function () {
      window.setTimeout(syncBusiqBlueContrast, 80);
      window.setTimeout(syncBusiqBlueContrast, 420);
    });
    $(window).on("resize", function () {
      window.clearTimeout(busiqContrastResizeTimer);
      busiqContrastResizeTimer = window.setTimeout(syncBusiqBlueContrast, 140);
    });

    var busiqColorMutationTimer = null;
    function unmanagedClassList(value) {
      return String(value || "").split(/\s+/).filter(function (className) {
        return className && className.indexOf("busiq-contrast-") !== 0;
      }).sort().join(" ");
    }

    var busiqColorObserver = new MutationObserver(function (mutations) {
      var needsSync = mutations.some(function (mutation) {
        if (mutation.type !== "attributes" || mutation.attributeName !== "class") {
          return true;
        }
        return unmanagedClassList(mutation.oldValue) !== unmanagedClassList(mutation.target.className);
      });
      if (!needsSync) {
        return;
      }
      window.clearTimeout(busiqColorMutationTimer);
      busiqColorMutationTimer = window.setTimeout(syncBusiqBlueContrast, 80);
    });

    busiqColorObserver.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeOldValue: true,
      attributeFilter: ["class", "style", "hidden"]
    });

    $(document).on("click", ".reference-copy-toggle", function () {
      referenceMultiCopy = !referenceMultiCopy;
      if (!referenceMultiCopy) {
        selectedReferenceNumbers = [];
      }
      $(".reference-copy-toggle").toggleClass("is-active", referenceMultiCopy).attr("aria-pressed", String(referenceMultiCopy));
    });

    $(document).on("click", ".reference-number", function () {
      var $button = $(this);
      var number = Number($button.data("reference-number"));
      if (referenceMultiCopy) {
        if (selectedReferenceNumbers.indexOf(number) === -1) {
          selectedReferenceNumbers.push(number);
        }
      } else {
        selectedReferenceNumbers = [number];
      }
      var copyValue = selectedReferenceNumbers.join(",");
      copyReferenceText(copyValue).then(function (copied) {
        if (copied) {
          showReferenceCopiedState($button, number, copyValue);
        }
      });
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

    var $impactCarousel = $("[data-impact-carousel]");
    var $impactPeople = $impactCarousel.children("[data-impact-person]");
    var impactSetSize = $impactPeople.length;
    var impactPersonIndex = 0;
    var impactPhysicalIndex = impactSetSize;
    var impactAnimating = false;
    var impactScrollTimer;
    var impactAnimationTimer;
    var impactResizeTimer;
    var $impactSlides = $();

    function setImpactPerson(nextIndex) {
      if (!impactSetSize) {
        return;
      }

      impactPersonIndex = (nextIndex + impactSetSize) % impactSetSize;
      $impactPeople.removeClass("is-active").removeAttr("aria-current");
      $impactPeople.eq(impactPersonIndex).addClass("is-active").attr("aria-current", "true");
    }

    function getImpactSlideLeft(slideIndex) {
      var carouselElement = $impactCarousel.get(0);
      var slideElement = $impactSlides.get(slideIndex);
      var carouselBox;
      var slideBox;

      if (!carouselElement || !slideElement) {
        return 0;
      }

      carouselBox = carouselElement.getBoundingClientRect();
      slideBox = slideElement.getBoundingClientRect();
      return carouselElement.scrollLeft + slideBox.left - carouselBox.left;
    }

    function jumpImpactCarousel(slideIndex) {
      var carouselElement = $impactCarousel.get(0);

      if (!carouselElement || !$impactSlides.length) {
        return;
      }

      impactPhysicalIndex = slideIndex;
      $impactCarousel.addClass("is-resetting");
      carouselElement.scrollLeft = getImpactSlideLeft(impactPhysicalIndex);
      carouselElement.offsetHeight;
      window.requestAnimationFrame(function () {
        $impactCarousel.removeClass("is-resetting");
      });
    }

    function normalizeImpactCarousel() {
      var normalizedIndex = impactPhysicalIndex;

      if (normalizedIndex < impactSetSize) {
        normalizedIndex += impactSetSize;
      } else if (normalizedIndex >= impactSetSize * 2) {
        normalizedIndex -= impactSetSize;
      }

      if (normalizedIndex !== impactPhysicalIndex) {
        jumpImpactCarousel(normalizedIndex);
      }
    }

    function finishImpactMove() {
      impactAnimating = false;
      normalizeImpactCarousel();
    }

    function scrollImpactCarousel(slideIndex) {
      var carouselElement = $impactCarousel.get(0);
      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (!carouselElement || !$impactSlides.length) {
        return;
      }

      impactPhysicalIndex = slideIndex;
      impactAnimating = true;
      window.clearTimeout(impactAnimationTimer);

      if (typeof carouselElement.scrollTo === "function") {
        carouselElement.scrollTo({
          left: getImpactSlideLeft(impactPhysicalIndex),
          behavior: reducedMotion ? "auto" : "smooth"
        });
      } else {
        carouselElement.scrollLeft = getImpactSlideLeft(impactPhysicalIndex);
      }

      impactAnimationTimer = window.setTimeout(finishImpactMove, reducedMotion ? 0 : 520);
    }

    function moveImpactCarousel(direction) {
      if (!impactSetSize) {
        return;
      }

      setImpactPerson(impactPersonIndex + direction);
      scrollImpactCarousel(impactPhysicalIndex + direction);
    }

    if ($impactCarousel.length && impactSetSize) {
      var $impactBefore = $impactPeople.clone(false).addClass("impact-person-clone").removeClass("is-active").attr("aria-hidden", "true").removeAttr("role aria-roledescription aria-label aria-current");
      var $impactAfter = $impactPeople.clone(false).addClass("impact-person-clone").removeClass("is-active").attr("aria-hidden", "true").removeAttr("role aria-roledescription aria-label aria-current");

      $impactBefore.add($impactAfter).find("[id]").removeAttr("id");
      $impactCarousel.prepend($impactBefore).append($impactAfter);
      $impactSlides = $impactCarousel.children("[data-impact-person]");
      setImpactPerson(0);

      window.requestAnimationFrame(function () {
        jumpImpactCarousel(impactSetSize);
      });
    }

    $("[data-impact-direction]").on("click", function () {
      moveImpactCarousel($(this).data("impact-direction") === "next" ? 1 : -1);
    });

    $impactCarousel.on("keydown", function (event) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
        return;
      }

      event.preventDefault();
      moveImpactCarousel(event.key === "ArrowRight" ? 1 : -1);
    });

    $impactCarousel.on("scroll", function () {
      var carouselElement = this;

      if (impactAnimating || $impactCarousel.hasClass("is-resetting")) {
        return;
      }

      window.clearTimeout(impactScrollTimer);
      impactScrollTimer = window.setTimeout(function () {
        var carouselLeft = carouselElement.getBoundingClientRect().left;
        var closestIndex = impactPhysicalIndex;
        var closestDistance = Infinity;

        $impactSlides.each(function (index) {
          var distance = Math.abs(this.getBoundingClientRect().left - carouselLeft);

          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });

        impactPhysicalIndex = closestIndex;
        setImpactPerson(parseInt($impactSlides.eq(closestIndex).attr("data-impact-person"), 10));
        normalizeImpactCarousel();
      }, 140);
    });

    $(window).on("resize.impactCarousel", function () {
      window.clearTimeout(impactResizeTimer);
      impactResizeTimer = window.setTimeout(function () {
        jumpImpactCarousel(impactPhysicalIndex);
      }, 120);
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
      { quote: "“Busiq gave us instant visibility into our pipeline and helped our team move from debate to focused action faster.”", name: "Daniel Reed", role: "Chief Operating Officer · Northline", image: "assets/images/team-daniel.webp", alt: "Daniel Reed, client operations leader" },
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
      $newsletterStatus.removeClass("is-error").addClass("is-success").text("You’re subscribed. Watch your inbox for the next Busiq briefing.");
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
// Stage 02b interactions 73-115
(function ($) {
  "use strict";

  $(function () {
    $("[data-s2b-performance-slider]").each(function (sliderIndex) {
      var list = this;
      var items = Array.prototype.slice.call(list.querySelectorAll("li"));
      var activeIndex = 0;
      var interval = 1500;
      var step = 42;
      var direction = sliderIndex % 2 === 0 ? -1 : 1;

      if (items.length < 5) {
        return;
      }

      function setItemState(item, offset, state) {
        item.style.setProperty("--s2b-slider-y", (offset * step) + "px");
        if (state) {
          item.setAttribute("data-s2b-slider-state", state);
        } else {
          item.removeAttribute("data-s2b-slider-state");
        }
      }

      function updateSlider() {
        var count = items.length;
        items.forEach(function (item, index) {
          item.removeAttribute("data-s2b-slider-state");
          item.style.setProperty("--s2b-slider-y", "126px");
          if (index === activeIndex) {
            setItemState(item, 0, "center");
          } else if (index === (activeIndex + 1) % count) {
            setItemState(item, 1, "adjacent");
          } else if (index === (activeIndex + 2) % count) {
            setItemState(item, 2, "outer");
          } else if (index === (activeIndex - 1 + count) % count) {
            setItemState(item, -1, "adjacent");
          } else if (index === (activeIndex - 2 + count) % count) {
            setItemState(item, -2, "outer");
          }
        });
      }

      updateSlider();
      window.requestAnimationFrame(function () {
        list.classList.add("is-slider-ready");
      });
      window.setInterval(function () {
        activeIndex = (activeIndex + direction + items.length) % items.length;
        updateSlider();
      }, interval);
    });
    $(document).on("click", "[data-s2b-billing]", function () {
      var $button = $(this);
      var billing = $button.attr("data-s2b-billing");
      var $section = $button.closest(".s2b-pricing");
      $section.find("[data-s2b-billing]").removeClass("is-active").attr("aria-pressed", "false");
      $button.addClass("is-active").attr("aria-pressed", "true");
      $section.find("[data-price-monthly]").each(function () {
        $(this).text($(this).attr(billing === "annual" ? "data-price-annual" : "data-price-monthly"));
      });
    });

    $(document).on("click", "[data-s2b-service]", function () {
      var $button = $(this);
      var name = $button.attr("data-s2b-service");
      var description = $button.find("span").text();
      var $section = $button.closest(".s2b-service-tabs");
      $section.find("[data-s2b-service]").removeClass("is-active").attr("aria-selected", "false");
      $button.addClass("is-active").attr("aria-selected", "true");
      $section.find("#s2bServiceStatus").text(name + " selected — " + description.charAt(0).toLowerCase() + description.slice(1));
    });

    $(document).on("click", "[data-s2b-community]", function () {
      var $button = $(this);
      var $group = $button.closest("[role='tablist']");
      $group.find("[data-s2b-community]").removeClass("is-active").attr("aria-selected", "false");
      $button.addClass("is-active").attr("aria-selected", "true");
    });

    $(document).on("submit", "[data-s2b-signup]", function (event) {
      event.preventDefault();
      var form = this;
      var $status = $(form).siblings("[data-s2b-signup-status]");
      if (!form.checkValidity()) {
        form.reportValidity();
        $status.text("Enter a valid work email to continue.");
        return;
      }
      $status.text("Thanks — your Busiq Align trial request is ready.");
      form.reset();
    });
  });
}(jQuery));