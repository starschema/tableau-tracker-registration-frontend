//Polyfill for IE
if (typeof String.prototype.endsWith !== 'function') {
    String.prototype.endsWith = function(suffix) {
        return this.indexOf(suffix, this.length - suffix.length) !== -1;
    };
}

const config = {

    base_url : "/api/1.0",

    trex_url : undefined,

    links: {
        starschema_link : 'https://starschema.com',
        starschema_logo : 'https://starschema.com',
        tableau_link : 'https://tableau.com',
        tableau_partner_logo : 'https://tableau.com',
        starschema_sales_email : 'sales@starschema.com',
        starschema_contact_email : 'info@starschema.com',
        tableau_tracker_wdc_page : "https://your-tableau-tracker/wdc",
        starschema_privacy_policy_link : "https://starschema.com/privacy-policy/",
        tableau_tracker_extension_gallery_link : "https://extensiongallery.tableau.com/products/24",
        tableau_tracker_prod_page : "https://tableau-tracker-trial.starschema.com/",

        // relative path of the example workbook from the main page
        trust_example_workbook: "example/Tableau_Tracker_Demo.twbx",
        // relative path of the example workbook from the "help pages"
        trust_example_workbook_from_help: "../example/Tableau_Tracker_Demo.twbx",
    },

    fillLinks: function () {
        let refIds = Object.keys(config.links);
        refIds.forEach(function (rawRefId) {
            let refId = rawRefId.replace(/_/gi,"-");
            let link = $("#" + refId);

            if(rawRefId.endsWith('_page')){
                link.prop("href", config.links[rawRefId]);
                link.html(config.links[rawRefId])
            } else if(rawRefId.endsWith('_email')){
                link.prop("href", 'mailto:' + config.links[rawRefId]);
                link.html(config.links[rawRefId])
            } else if (rawRefId.endsWith('_logo')) {
                $(".header > ." + refId).prop("href", config.links[rawRefId]);
            } else {
                link.prop("href", config.links[rawRefId]);
            }
        });
    }
};
