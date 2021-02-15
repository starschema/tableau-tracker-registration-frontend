$(function(){
  var BASE_URL = config.base_url;
  var REGISTER_URL = BASE_URL + "/events/register";
  var EXTENSION_HTML_URL = BASE_URL + "/events/tableau-extension";
  var TREX_DOWNLOAD_URL = BASE_URL + "/events/trex";


  function isValidEmail(email) {
    return  /[^@]+@[a-zA-Z0-9_\-]+\.[A-Za-z]+/.test(email);
  }

  function isNonEmptyString(what) {
    return (typeof what === 'string') && (what.length > 0);
  }

  function validate(data) {
    var errs = [];

    if (!data['is-privacy-policy-accepted']) {
      errs.push("The Privacy Policy must be accepted");
    }


    if (!data.email || !isValidEmail(data.email)) {
      errs.push("Missing or invalid email address");
    }

    return errs;
  }


  var $validationMessages = $('#validation-messages');
  var $loader = $('#loader');

  var $results = $('#results');
  var $deploymentId = $('input[name="deploymentId"]');
  var $adminKey = $('input[name="adminKey"]');

  var $inputs = $('.fields input');


  // Enable / disable the inputs to disallow editing and signal sending
  // to the user
  function enableInputs() { $inputs.removeAttr('disabled'); }
  function disableInputs() { $inputs.attr('disabled', 'disabled'); }

  // Show / hide the loader graphic
  function showLoader() { $loader.show(100); disableInputs(); }
  function hideLoader() { $loader.hide(100); enableInputs();  }

  // Hide validation error messages
  function hideValidationErrors() { $validationMessages.html(''); }

  // Show a list of validation error messages or keep hiding the validation messages
  // if the error list is empty
  function showValidationErrors(errors) {
    if (errors.length === 0) {
      $validationMessages.html('').hide();
      return;
    }

    var rows = errors.map(function(errMsg) {
      return "<li class='error'>" + errMsg.toString() + "</li>";
    });

    $validationMessages.html(rows.join('')).show(100);
  }


  // Sends registration data over to the registration lambda
  function sendRegistration(data) {
    return new Promise(function(resolve, reject){
      $.ajax({
        url: REGISTER_URL,
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        success: resolve,
        error: function(xhr, textStatus, err) {
            hideLoader();
            showValidationErrors(["Sorry, something went wrong. Maybe you've already registered. Please try again!"]);
          console.error("[ERRR] " + textStatus + "  " + err);
          reject(err);
        }
      });
    });
  }


  // Shows the results (deploymentId + adminKey + Trex)
  // and fills each field from the data passed
  function showResults(data) {
    $results.show(100);
    $deploymentId.val(data.deploymentId);
    $adminKey.val(data.adminKey);

  }

  // Hides the results display (useful for sending)
  function hideResults() {
    $results.hide();
  }


  // Attempts to collect the values of
  // - inputs marked with data-send="true"
  // - checkboxes marked with data-checkbox="true"
  function collectInputData() {
    // geather
    var data = {};
    $('input[data-send="true"]').each(function(index, input){
      var $input = $(input);
      data[$input.attr('name')] = $input.val();
    });

    $('input[data-checkbox="true"]').each(function(index, input){
      var $input = $(input);
      data[$input.attr('name')] = $input.is(':checked');
    });

    return data;
  }

  $('#submit-button').click(function(e){
    if (e.preventDefault) { e.preventDefault(); } else { e.returnValue = false; }
    hideValidationErrors();
    hideResults();

    // gather
    var data = collectInputData();

    // validate
    var validationErrors = validate(data);
    showValidationErrors(validationErrors);

    if (validationErrors.length == 0) {
      showLoader();
      sendRegistration(data)
          .then(function (regData) {
            hideLoader();
            showResults(regData);
          })
          .catch(function (err) {console.error("While sending registration: ", err);});
    }

    console.log(data);
  });


  $('#download-trex').click(function(){
    // If trex url in config file is undefined uses sender url in trex file. If trex url configured, uses that in trex file
    if (config.trex_url === undefined) {
      window.open(TREX_DOWNLOAD_URL, '_blank');
    } else {
      window.open(TREX_DOWNLOAD_URL + '?url=' + config.trex_url, '_blank');
    }
  });

  $('#download-txt').click(function(){
    var deploymentId = $('#deployment-id-input').val();
    var adminKey = $('#admin-key-input').val();
    var blob = new Blob([txtTemplate({deploymentId: deploymentId, adminKey: adminKey})], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "tabusage-tracker-" + deploymentId + ".txt");
  });


  function txtTemplate(creds) {
    return "Tabusage Tracker credentials\r\n" +
            "============================\r\n\r\n" +
            "Deployment Id:  " + creds.deploymentId + "\r\n" +
            "Admin Key:      " + creds.adminKey + "\r\n";
  }
});
