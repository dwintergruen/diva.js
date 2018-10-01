import parseLabelValue from "../utils/label-value-parser";

/**
 * A simple plugin that implements a download button for individual images. Plugins
 * should register themselves as a class in the global Diva namespace, e.g., global.Diva.DownloadPlugin.
 * Plugins are then included as *uninstantiated* references within a plugin configuration. To enable them, simply include
 * plugins: [Diva.DownloadPlugin] when creating a Diva instance.
 * When the viewer is instantiated it will also instantiate the plugin, which
 * will then configure itself.
 *
 * Plugin constructors should take one argument, which is an instance of a ViewerCore object.
 *
 *
 * Plugins should implement the following interface:
 *
 * {boolean} isPageTool - Added to the class prototype. Whether the plugin icon should be included for each page as a page tool
 * {string} pluginName - Added to the class prototype. Defines the name for the plugin.
 *
 * @method createIcon - A div representing the icon. This *should* be implemented using SVG.
 * @method handleClick - The click handler for the icon.
 *
 *
 **/
export default class SearchPlugin
{
    constructor (core)
    {
        this.core = core;
        this.toolbarIcon;
        this.toolbarSide = 'right';
        this.toc;

         // helpers for handleClick
        this.firstClick = true;
        this.isVisible = false;
    }

    /**
    * Open a new window with the page image.
    *
    **/
    handleClick ()
    {
        // if first click create div elements
        let metadataDiv = document.getElementById("metadataDiv")
        //let metadata = this.core.viewerState.manifest.metadata;

        if (true) {
            var searchString = $("#searchString").val();
            if (searchString == "") {
                return
            }

            if (!metadataDiv) {
                metadataDiv = document.createElement('div');
                metadataDiv.id = 'metadataDiv';
                metadataDiv.className = 'diva-modal';
            }

            let title = document.getElementById("metadataTitle");
            if (!title) {
                title = document.createElement('h2');
            }
            title.innerText = 'Search:' + searchString;
            title.id = 'metadataTitle';

            let closeButton = document.getElementById("closeMetadata");
            if (!closeButton) {
            closeButton = document.createElement('button');
            }
            closeButton.innerHTML = '&#10006';
            closeButton.id = 'closeMetadata';
            closeButton.onclick = () => {
                metadataDiv.style.display = 'none';
                this.isVisible = false;
            };

            let contentDiv = document.getElementById("contentDiv");
            if (!contentDiv) {
                contentDiv = document.createElement('div')
            }

            contentDiv.id = 'contentDiv';

            metadataDiv.appendChild(closeButton);
            metadataDiv.appendChild(title);
            metadataDiv.appendChild(contentDiv);
            document.body.appendChild(metadataDiv);
            var searchString = $("#searchString").val();
             var qobj =
                 {query: "text:" + searchString,
                     params: {"hl.fl":"text",hl:"on","fl":"id"}
                 }


             var django_id=$("#srcId").html();
             //var akte_django_id=$(this).parent().find("input").attr("akte_django_id");
             //var splitted=django_id.split(".");
             var id = django_id;
            qobj["filter"]=["django_ct:documents.page","type:img","sources:"+id];
            qobj["limit"]=30;
            $.getJSON("/ds/solr/query","remove_not_text_query=1&json="+JSON.stringify(qobj),function(data,status,txt){

            if (status !== "success") {var res =-1}
            else {
            var res = data["response"]["numFound"];
            }

            res="<span onclick=$('.child',this).toggle()>"+res+'</span>';
            var frag='<td>&nbsp</td><td><table class="child">';
            for (var k in data["highlighting"]) {
            	var splitted=k.split(".");
                var akte_id = splitted[splitted.length-1]
                var record = data["highlighting"][k];
                    frag+="<tr><td><a onclick=Diva.SearchPlugin.goto('"+akte_id+"')>"+diva.toc[akte_id]+ "</a></td><td>"
                    frag+=record["text"]+"</td></tr>";
            }

            contentDiv.innerHTML = frag+"</table></td>"


            });
            this.firstClick = false;
        }
        else
        {
            metadataDiv = document.getElementById('metadataDiv');
        }

        if (this.isVisible)
        {
            metadataDiv.style.display = 'none';
            this.isVisible = false;
        }
        else
        {
            metadataDiv.style.display = 'block';
            this.isVisible = true;
        }

        // attach drag listeners
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        metadataDiv.onmousedown = (e) =>
        {
            pos3 = e.clientX;
            pos4 = e.clientY;

            document.onmousemove = (e) =>
            {
                pos1 = pos3 - e.clientX;
                pos2 = pos4 - e.clientY;
                pos3 = e.clientX;
                pos4 = e.clientY;
                metadataDiv.style.top = (metadataDiv.offsetTop - pos2) + 'px';
                metadataDiv.style.left = (metadataDiv.offsetLeft - pos1) + 'px';
            };

            document.onmouseup = () =>
            {
                document.onmouseup = null;
                document.onmousemove = null;
            };
        };
    }


    static goto (k)
    {
        diva.gotoPageByIndex(diva.toc[k])
    }

    createIcon ()
    {
        /*
        * See img/download.svg for the standalone source code for this.
        * */

        const toolBarIcon = document.createElement('span');
        //toolBarIcon.classList.add('diva-download-icon','diva-button');

        let root = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        root.setAttribute("viewBox", "0 0 20 20");
        root.setAttribute('style', 'display: block; padding: 7%');
        root.id = `${this.core.settings.selector}search-icon`;

        let g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.id = `${this.core.settings.selector}search-icon-glyph`;
        g.setAttribute("transform", "matrix(1, 0, 0, 1, -11.5, -11.5)");
        g.setAttribute("class", "diva-toolbar-icon");

        let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M36.25,24c0,6.755-5.495,12.25-12.25,12.25S11.75,30.755,11.75,24S17.245,11.75,24,11.75S36.25,17.245,36.25,24z M33,24c0-4.963-4.037-9-9-9s-9,4.037-9,9s4.037,9,9,9S33,28.963,33,24z M29.823,23.414l-5.647,7.428c-0.118,0.152-0.311,0.117-0.428-0.035L18.1,23.433C17.982,23.28,18.043,23,18.235,23H21v-4.469c0-0.275,0.225-0.5,0.5-0.5h5c0.275,0,0.5,0.225,0.5,0.5V23h2.688C29.879,23,29.941,23.263,29.823,23.414z");
        //path.setAttribute("d", "M5.379,0.681 L5.289,0.771 L5.255,0.736 C4.401,-0.118 2.98,-0.082 2.082,0.816 L1.827,1.07 C0.931,1.967 0.894,3.388 1.749,4.243 L1.783,4.277 L1.619,4.442 C0.846,5.214 0.818,6.441 1.559,7.18 L9.884,15.508 C10.626,16.248 11.851,16.22 12.626,15.447 L16.384,11.689 C17.156,10.916 17.185,9.69 16.445,8.95 L8.117,0.622 C7.377,-0.118 6.15,-0.091 5.379,0.681 L5.379,0.681 Z M4.523,5.108 C3.645,5.108 2.931,4.393 2.931,3.508 C2.931,2.627 3.645,1.911 4.523,1.911 C5.404,1.911 6.115,2.627 6.119,3.508 C6.115,4.395 5.404,5.108 4.523,5.108 L4.523,5.108 Z");

        g.appendChild(path);
        root.appendChild(g);

        //toolBarIcon.appendChild(root);


        const toolBarSearch = document.createElement("span")
        toolBarSearch.setAttribute("class","diva-label")
        toolBarSearch.innerText = "Search:"
        const toolBarSearchInput = document.createElement("input")

        toolBarSearchInput.setAttribute("onchange","diva.divaState.viewerCore.viewerState.pluginInstances[0].handleClick()")
        toolBarSearchInput.setAttribute("id","searchString")
        toolBarSearch.appendChild(toolBarSearchInput)
        toolBarIcon.appendChild(toolBarSearch)
        return toolBarIcon;
    }
}

SearchPlugin.prototype.pluginName = "search";
SearchPlugin.prototype.isPageTool = false;

/**
 * Make this plugin available in the global context
 * as part of the 'Diva' namespace.
 **/
(function (global)
{
    global.Diva.SearchPlugin = SearchPlugin;
})(window);
