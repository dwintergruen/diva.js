/*
Test coverage: pretty much complete
*/

QUnit.module("Public functions", { beforeEach: clearTempDiva });

QUnit.test("getItemTitle()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(this.getItemTitle(), "Beromunster", "The title should be Beromunster");
        done();
    });

    $.tempDiva({});
});

QUnit.test("gotoPageByNumber() and getCurrentPage()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(this.getCurrentPageIndex(), 0, "Initial page should be 0");
        this.gotoPageByNumber(500); // Go to page number 500 (index: 499)
        assert.strictEqual(this.getCurrentPageIndex(), 499, "The page index should now be 499");

        // Reset it to the first page
        this.gotoPageByNumber(0);
        done();
    });

    $.tempDiva({});
});

QUnit.test("getCurrentPageIndex()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(this.getCurrentPageIndex(), 0, "Initial page should be 0");
        this.gotoPageByIndex(300);
        assert.strictEqual(this.getCurrentPageIndex(), 300, "The page index should now be 300");

        // Reset it to the first page
        this.gotoPageByIndex(0);
        assert.strictEqual(this.getCurrentPageIndex(), 0, "The page index should now be 0");
        done();
    });

    $.tempDiva({});
});

QUnit.test("get/setZoomLevel(), zoomIn() and zoomOut()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(this.getZoomLevel(), 2, "Initial zoom level should be 2");
        assert.ok(this.zoomOut(), "It should be possible to zoom out once");
        assert.strictEqual(this.getZoomLevel(), 1, "Zoom level should now be 1");
        assert.ok(!this.zoomOut(), "It should not be possible to zoom out again");
        assert.strictEqual(this.getZoomLevel(), 1, "Zoom level should still be 1");

        assert.ok(this.zoomIn(), "It should be possible to zoom in");
        assert.strictEqual(this.getZoomLevel(), 2, "Zoom level should now be 2");
        assert.ok(this.zoomIn(), "Zooming in again");
        assert.strictEqual(this.getZoomLevel(), 3, "Zoom level should now be 3");
        assert.ok(!this.zoomIn(), "It should not be possible to zoom in again (hit max)");
        assert.strictEqual(this.getZoomLevel(), 3, "Zoom level should still be 3");

        assert.ok(!this.setZoomLevel(5), "Setting zoom level to 5 should fail");
        assert.strictEqual(this.getZoomLevel(), 3, "Zoom level should still be 3");

        assert.ok(this.setZoomLevel(2), "Setting zoom level to 2 should be fine");
        assert.strictEqual(this.getZoomLevel(), 2, "Zoom level should now be 2");
        done();
    });

    $.tempDiva({
        zoomLevel: 2,
        minZoomLevel: 1,
        maxZoomLevel: 3
    });
});

QUnit.test("enable/disableScrollable()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        this.setZoomLevel(2);

        // should be able to zoom by double click
        var event = $.Event("dblclick");
        event.pageX = 1000;
        event.pageY = 500;
        $(settings.selector + 'page-0').trigger(event);
        assert.strictEqual(settings.zoomLevel, 3, "Should be able to zoom by double click, zoom level should now be 3");

        // should be able to scroll by dragging
        var initScroll = settings.outerObject.scrollTop();
        // simulate drag downwards
        $('.diva-dragger').simulate('drag', { dx: 0, dy: -500 });
        var finalScroll = settings.outerObject.scrollTop();

        assert.ok(finalScroll > initScroll, "Should have scrolled down before disableScrollable()");

        this.disableScrollable();

        // should not be able to zoom by double click
        event = $.Event("dblclick");
        event.pageX = 1000;
        event.pageY = 500;
        $(settings.selector + 'page-0').trigger(event);
        assert.strictEqual(settings.zoomLevel, 3, "Should not be able to zoom by double click after disableScrollable(), zoom level should still be 3");

        // should not be able to drag
        // store previous scroll in initScroll
        initScroll = settings.outerObject.scrollTop();
        $('.diva-dragger').simulate('drag', { dx: 0, dy: -500 });
        finalScroll = settings.outerObject.scrollTop();
        assert.ok(finalScroll === initScroll, "Should not have scrolled down after disableScrollable()");

        this.enableScrollable();

        // should be able to zoom by double click
        event = $.Event("dblclick");
        event.pageX = 1000;
        event.pageY = 500;
        $(settings.selector + 'page-0').trigger(event);
        assert.strictEqual(settings.zoomLevel, 4, "Should be able to zoom by double click after enableScrollable(), zoom level should now be 4");

        // should be able to scroll by dragging
        initScroll = settings.outerObject.scrollTop();
        // simulate drag downwards
        $('.diva-dragger').simulate('drag', { dx: 0, dy: -500 });
        finalScroll = settings.outerObject.scrollTop();

        assert.ok(finalScroll > initScroll, "Should have scrolled down after enableScrollable()");

        done();
    });

    $.tempDiva({});
});

QUnit.test("inViewport()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        // Can only do fairly simple checks
        assert.ok(this.inViewport(1, 100, 200, 100, 150));
        assert.ok(!this.inViewport(1, 100, -200, 100, 100));
        assert.ok(!this.inViewport(40, 100, 50, 100, 200));

        done();
    });

    $.tempDiva({
        viewportMargin: 0
    });
});

QUnit.test("toggleFullscreenMode(), enterFullscreen(), leaveFullscreen()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.ok(!settings.inFullscreen, "Should not be in fullscreen initially");
        this.toggleFullscreenMode();
        assert.ok(settings.inFullscreen, "Should now be in fullscreen");
        assert.ok(!this.enterFullscreenMode(), "Should not be possible to enter fullscreen");
        assert.ok(settings.inFullscreen, "Should still be in fullscreen");
        assert.ok(this.leaveFullscreenMode(), "Should be possible to exit fullscreen");
        assert.ok(!settings.inFullscreen, "No longer in fullscreen");
        assert.ok(!this.leaveFullscreenMode(), "Should not be possible to exit fullscreen");
        assert.ok(!settings.inFullscreen, "Still not in fullscreen");
        assert.ok(this.enterFullscreenMode(), "Should be possible to enter fullscreen");
        this.toggleFullscreenMode();
        assert.ok(!settings.inFullscreen, "Should now be out of fullscreen");
        done();
    });

    $.tempDiva({});
});

QUnit.test("enterGridView(), leaveGridView()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
            assert.ok(!settings.inGrid, "Should not be in grid initially");
            this.enterGridView();
            assert.ok(settings.inGrid, "Should now be in grid");
            assert.ok(!this.enterGridView(), "Should not be possible to enter grid");
            assert.ok(settings.inGrid, "Should still be in grid");
            assert.ok(this.leaveGridView(), "Should be possible to exit grid");
            assert.ok(!settings.inGrid, "No longer in grid");
            assert.ok(!this.leaveGridView(), "Should not be possible to exit grid");
            assert.ok(!settings.inGrid, "Still not in grid");
            assert.ok(this.enterGridView(), "Should be possible to enter grid");
            done();
    });

    $.tempDiva({});
});

QUnit.skip("gotoPageByName()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(settings.currentPageIndex, 0, "Initial page number should be 1");
        assert.ok(!this.gotoPageByName('bm_000.tif'), "It should not find anything for bm_000.tif");
        assert.ok(this.gotoPageByName('bm_002.tif', "right", "center"), "It should find the page index for bm_002.tif");
        assert.strictEqual(settings.currentPageIndex, 1, "Now the page number should be 2");
        done();

        /*
         so this is confusing. this tests the internal getX/YOffset anchor points.
         1) gotoPageByName above is called with "right" and "top" anchors, two non-default values
         2) the last line in this function subscribes the scroll motion to centerRightChecker
         3) centerRightChecker checks center right, then scrolls to bottom left and calls bottom left
         4) bottomLeftChecker checks bottom left and de-subscribes all
         */
        function bottomLeftChecker(a)
        {
            var pageSelector = "#" + this.getSettings().ID + "page-1";
            assert.strictEqual($(pageSelector).offset().top, 1888, "Testing bottom anchor point on gotoPageByName.");
            assert.strictEqual($(pageSelector).offset().left, 20, "Testing left anchor point on gotoPageByName.");

            diva.Events.unsubscribe(["ViewerDidScroll", bottomLeftChecker]);
        }

        function centerRightChecker(a)
        {
            var pageSelector = "#" + this.getSettings().ID + "page-1";
            assert.strictEqual($(pageSelector).offset().top, 2081, "Testing center anchor point on gotoPageByName.");
            assert.strictEqual($(pageSelector).offset().left, 307, "Testing right anchor point on gotoPageByName.");

            diva.Events.unsubscribe(["ViewerDidScroll", centerRightChecker]);
            assert.ok(this.gotoPageByName('bm_002.tif', "left", "bottom"), "Going to the same page; offset should change as position is being changed");
            diva.Events.subscribe("ViewerDidScroll", bottomLeftChecker);
        }

        diva.Events.subscribe("ViewerDidScroll", centerRightChecker);
    });

    $.tempDiva({});
});

QUnit.test("getPageIndex()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        assert.strictEqual(this.getPageIndex('bm_002.tif'), 1, "Valid filename");
        assert.strictEqual(this.getPageIndex('bm_lol.tif'), -1, "Invalid filename");

        done();
    });

    $.tempDiva({});
});

// Can't really test the getCurrentURL function

// Can't really test getURLHash easily either
// Since it relies on getState, we can test the public version of that instead

QUnit.test("getState()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        var viewportHeight = 700;
        var scrollbarWidth = $.getScrollbarWidth();
        var pageDimens = this.getCurrentPageDimensionsAtCurrentZoomLevel();

        var expected = {
            f: false,
            v: 'd',
            i: 'bm_001.tif',
            n: 5,
            p: false,
            x: pageDimens.width / 2,
            y: (viewportHeight - scrollbarWidth) / 2,
            z: 2
        };

        var actual = this.getState();

        // Sanity check
        assert.propEqual(Object.keys(actual).sort(), Object.keys(expected).sort(), 'State shape should be as expected');

        Object.keys(expected).forEach(function (key)
        {
            if (key === 'x' || key === 'y')
                assert.close(actual[key], expected[key], 1, "State key '" + key + "'");
            else
                assert.strictEqual(actual[key], expected[key], "State key '" + key + "'");
        });

        done();
    });

    $.tempDiva({});
});

QUnit.skip("setState()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        var state = {
            f: true,
            v: 'd',
            i: "bm_005.tif",
            n: 3,
            p: false,
            x: 500,
            y: 300,
            z: 3
        };
        this.setState(state);
        assert.ok(settings.inFullscreen, "Should now be in fullscreen");
        assert.ok(!settings.inGrid, "Should not be in grid");
        assert.ok(!settings.inBookLayout, "Should not be in book view");
        assert.strictEqual(settings.currentPageIndex, 4, "Current page should be 5 (index of 4)");
        assert.strictEqual(settings.pagesPerRow, 3, "Pages per row should be 3");
        assert.strictEqual(settings.zoomLevel, 3, "Zoom level should be 3");

        // Have to leave fullscreen to test dimension-related things
        this.leaveFullscreenMode();

        assert.strictEqual(settings.outerObject.scrollTop(), 8591, "Scroll from top should be default top for bm_005 after leaving fullscreen");
        assert.strictEqual(settings.outerObject.scrollLeft(), 627, "Scroll from left should be 500 more");

        state = {
            f: false,
            v: 'g',
            i: "bm_500.tif",
            n: 4,
            p: true,
            x: 100,
            y: 200,
            z: 4
        };

        this.setState(state);
        assert.ok(!settings.inFullscreen, "Should not be in fullscreen");
        assert.ok(settings.inGrid, "Should be in grid");
        assert.strictEqual(settings.currentPageIndex, 498, "Current page should be 500 (index of 499)");
        assert.strictEqual(settings.pagesPerRow, 4, "Pages per row should be 4");
        assert.strictEqual(settings.zoomLevel, 4, "Zoom level should be 4");

        done();
    });

    $.tempDiva({});
});

QUnit.test("translateFromMaxZoomLevel()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        var state = {
            f: true,
            v: 'd',
            i: "bm_005.tif",
            n: 3,
            p: false,
            x: 500,
            y: 300,
            z: this.getMaxZoomLevel()
        };

        this.setState(state);

        var boxOnMaxPage = {x: 100, y: 100, width:1234, height:1324};

        // first check to make sure the box on the max zoom level is the same as the box we feed in.
        assert.strictEqual(this.translateFromMaxZoomLevel(100), boxOnMaxPage.x);
        assert.strictEqual(this.translateFromMaxZoomLevel(100), boxOnMaxPage.y);
        assert.strictEqual(this.translateFromMaxZoomLevel(1234), boxOnMaxPage.width);
        assert.strictEqual(this.translateFromMaxZoomLevel(1324), boxOnMaxPage.height);

            // reset the state to a different zoom level
            state = {
                f: true,
                v: 'd',
                i: "bm_005.tif",
                n: 3,
                p: false,
                x: 500,
                y: 300,
                z: 2
            };
            this.setState(state);

        // check that the box translation has changed accordingly.
        assert.strictEqual(this.translateFromMaxZoomLevel(boxOnMaxPage.x), 25);
        assert.strictEqual(this.translateFromMaxZoomLevel(boxOnMaxPage.y), 25);
        assert.strictEqual(this.translateFromMaxZoomLevel(boxOnMaxPage.width), 308.5);
        assert.strictEqual(this.translateFromMaxZoomLevel(boxOnMaxPage.height), 331);

        done();
    });

    $.tempDiva({});
});

QUnit.test("translateToMaxZoomLevel()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        var state = {
            f: true,
            v: 'd',
            i: "bm_005.tif",
            n: 3,
            p: false,
            x: 500,
            y: 300,
            z: this.getMaxZoomLevel()
        };

        this.setState(state);

        var boxOnThisPage = {x: 10, y: 10, width:123, height:132};

        // first check to make sure the box on the max zoom level is the same as the box we feed in.
        assert.strictEqual(this.translateToMaxZoomLevel(10), boxOnThisPage.x);
        assert.strictEqual(this.translateToMaxZoomLevel(10), boxOnThisPage.y);
        assert.strictEqual(this.translateToMaxZoomLevel(123), boxOnThisPage.width);
        assert.strictEqual(this.translateToMaxZoomLevel(132), boxOnThisPage.height);

            // reset the state to a different zoom level
            state = {
                f: true,
                v: 'd',
                i: "bm_005.tif",
                n: 3,
                p: false,
                x: 500,
                y: 300,
                z: 2
            };
            this.setState(state);

        // console.log(this.translateToMaxZoomLevel(boxOnThisPage.x));
        // check that the box translation has changed accordingly. This assumes that
        // the co-ordinate we want to translate is on the current zoom level (2), and we want
        // to get it on the max page. Thus: 123 * (4-2)^2 = 984
        assert.strictEqual(this.translateToMaxZoomLevel(boxOnThisPage.x), 40);
        assert.strictEqual(this.translateToMaxZoomLevel(boxOnThisPage.y), 40);
        assert.strictEqual(this.translateToMaxZoomLevel(boxOnThisPage.width), 492);
        assert.strictEqual(this.translateToMaxZoomLevel(boxOnThisPage.height), 528);

        done();
    });

    $.tempDiva({});
});

QUnit.skip("getPageIndexForPageXYValues()", function (assert)
{
    var done = assert.async();

    diva.Events.subscribe('ViewerDidLoad', function(settings)
    {
        var outerObj = $("#" + settings.ID + "outer");
        $('.diva-dragger').simulate('drag', { dx: 0, dy: -100000 });
        outerObj.scroll();

        assert.strictEqual(this.getPageIndexForPageXYValues(500, 5000), 93, "scrolled to a later page, click should register on a page");
        assert.strictEqual(this.getPageIndexForPageXYValues(10, 10), false, "click should be outside diva-outer and thus return false");

        done();
    });

    $.tempDiva({});
});
