(function (global) {
    getUrlParameter = function getUrlParameter(sParam, defaultValue) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }

        }
        return defaultValue;
    }

})();


(function (global) {
        showtext = function showtext(pageindex, filename) {
            var searchString = $("#searchString").val();
            var scaleText = $("#scaleText").val();
            if (searchString == "" || !searchString) {
                searchString = getUrlParameter("searchWord");
            };
             if (scaleText == "" || !scaleText) {
                scaleText = getUrlParameter("scale");
            };

            //alert("/docs/altoText/" + $("#srcId").html() +"/" + pageindex);
            $("#textView").load(Diva.altoUrl + $("#srcId").html() + "/" + pageindex + "?searchWord=" + searchString +"&scale=" + scaleText);
        }
    }
)();


(function (global) {
    showtextString = function showtextString(pageindex, filename, searchString, scaleText) {
           if (scaleText == "" || !scaleText) {
                scaleText = getUrlParameter("scale");
            };
            if (searchString == "" || !searchString) {
                searchString = getUrlParameter("searchWord");
            };
        $("#textView").load(Diva.altoUrl + $("#srcId").html() + "/" + pageindex + "?searchWord=" + searchString +"&scale=" + scaleText);
    }
}
) ();


var myHandle = Diva.Events.subscribe("VisiblePageDidChange", showtext);

