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