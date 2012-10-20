////////////////////////////////////////////////////////////////////////////////
/**
 *  @author     Shibukawa Yoshiki
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////

// Core Package
var Class      = require('../../../../NGCore/Client/Core/Class').Class;
// UI Package
var Button     = require('../../../../NGCore/Client/UI/Button').Button;
var Label      = require('../../../../NGCore/Client/UI/Label').Label;
var ProgressBar= require('../../../../NGCore/Client/UI/ProgressBar').ProgressBar;
var ScrollView = require('../../../../NGCore/Client/UI/ScrollView').ScrollView;
var Gravity    = require('../../../../NGCore/Client/UI/ViewGeometry').Gravity;


// NGGo
var DebugMenuPage = require('./DebugMenuPage').DebugMenuPage;
var jasmine       = require('./jasmine');

var global_ = jasmine.jasmine.getGlobal();

global_.spyOn      = jasmine.spyOn;
global_.it         = jasmine.it;
global_.xit        = jasmine.xit;
global_.expect     = jasmine.expect;
global_.runs       = jasmine.runs;
global_.waits      = jasmine.waits;
global_.waitsFor   = jasmine.waitsFor;
global_.beforeEach = jasmine.beforeEach;
global_.afterEach  = jasmine.afterEach;
global_.describe   = jasmine.describe;
global_.xdescribe  = jasmine.xdescribe;


/** @private */
var _Log = Class.subclass(
{
    initialize: function()
    {
        this._log = [];
        this._view = undefined;
    },
    write: function(style, text)
    {
        this._log.push(style, text);
    },
    reset: function()
    {
        this._log = [];
    },
    connect: function(view)
    {
    }
});


var _unittestLog = new _Log();
var _testSceneLog = new _Log();


/** @private */
var NGGoUnitTestReporter = Class.subclass(
{
    classname: "NGGoUnitTestReporter",
    initialize: function(reportpage, all)
    {
        this._reportpage = reportpage;
        this._progressbar = reportpage.progressbar;
        this._all = all;
    },
    _write: function(vspace, indent, color, text)
    {
        this._reportpage.write(vspace, indent, color, text);
    },
    reportRunnerResults: function(runner)
    {
        var dur = (new Date()).getTime() - this._startTime;
        var failed = this._executedSpecs - this._passedSpecs;
        var specStr = this._executedSpecs + (this._executedSpecs === 1 ? " spec, " : " specs, ");
        var failStr = failed + (failed === 1 ? " failure in " : " failures in ");
        var resultText = specStr + failStr + (dur/1000) + "s.";

        var color = "00FF00";
        if (failed)
        {
            color = "FF0000";
        }
        console.log("Jasmine Test Runner Finished.");
        this._write(0, 0, color, "Jasmine Test Runner Finished.");
        console.log(resultText);
        this._write(0, 15, color, resultText);

        var suites = runner.suites();
        var i;
        for (i in suites)
        {
            if (suites.hasOwnProperty(i))
            {
                if (!suites[i].parentSuite)
                {
                    this._suiteResults(suites[i], 0);
                }
            }
        }

        var self = this;

        setTimeout(function()
        {
            self._reportpage.finish();
        }, 10);
    },
    reportRunnerStarting: function(runner)
    {
        this._startTime = (new Date()).getTime();
        this._executedSpecs = 0;
        this._passedSpecs = 0;
        this._specCount = 0;

        var suites = runner.suites();
        var i;
        for (i in suites)
        {
            if (suites.hasOwnProperty(i))
            {
                if (!suites[i].parentSuite)
                {
                    this._specCount += this._suiteCount(suites[i], 0);
                }
            }
        }
    },
    reportSpecResults: function(spec)
    {
        if (spec.results().passed())
        {
            this._passedSpecs++;
            console.log("   Passed.");
        }
        else
        {
            this._progressbar.setProgressGradient(
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "00000000 0.0","00000000 1.0" ]
            });
            console.log("   Failed.");
        }
        var progress = this._executedSpecs / this._specCount;
        this._progressbar.setProgress(progress, progress);
    },
    reportSpecStarting: function(spec)
    {
        this._executedSpecs++;
        console.log("@@ " + spec.suite.description + ' : ' + spec.description + ' ... ');
    },
    reportSuiteResults: function(suite)
    {
        var results = suite.results();
        console.log(suite.description + ": " + results.passedCount + " of " + results.totalCount + " passed.");
    },
    log: function(str)
    {
        console.log("unittest log: " + str);
    },
    _suiteCount: function(suite)
    {
        var count = suite.specs().length;
        var suites = suite.suites();
        var i;
        for (i in suites)
        {
            if (suites.hasOwnProperty(i))
            {
                count += this._suiteCount(suites[i]);
            }
        }
        return count;
    },
    _isSuiteSuccess: function(suite)
    {
        var i;
        var specs = suite.specs();
        for (i in specs)
        {
            if (specs.hasOwnProperty(i))
            {
                if (!specs[i].results().passed())
                {
                    return false;
                }
            }
        }
        var suites = suite.suites();
        var j;
        for (j in suites)
        {
            if (suites.hasOwnProperty(j))
            {
                if (!this._isSuiteSuccess(suites[j]))
                {
                    return false;
                }
            }
        }
        return true;
    },
    _suiteResults: function(suite, indent)
    {
        if (this._isSuiteSuccess(suite) && !this._all)
        {
            return;
        }
        this._write(10, indent, "B3B3FF", suite.description);
        var specs = suite.specs();
        var i, j;
        for (i in specs)
        {
            if (specs.hasOwnProperty(i))
            {
                this._specResults(specs[i], indent);
            }
        }
        var suites = suite.suites();
        for (j in suites)
        {
            if (suites.hasOwnProperty(j))
            {
                this._suiteResults(suites[j], indent+30);
            }
        }
    },
    _specResults: function(spec, indent)
    {
        var results = spec.results();
        if (results.passed())
        {
            if (!this._all)
            {
                return;
            }
            this._write(3, indent+20, "B3FFB3", spec.description);
        }
        else
        {
            this._write(3, indent+20, "FFB3B3", spec.description);
        }
        var items = results.getItems();
        var k;
        for (k in items)
        {
            if (items.hasOwnProperty(k))
            {
                this._itemResults(items[k], indent+20);
            }
        }
    },
    _itemResults: function(item, indent)
    {
        if (item.passed && !item.passed())
        {
            console.log(item.trace.stack);
            this._write(0, indent+20, "FF7777", String(item.trace.stack));
        }
    }
});


/** @private */
exports.UnitTestPage = DebugMenuPage.subclass({
    classname: "UnitTestPage",
    mode: 1,
    destroy: function()
    {
        this._resetText();
    },
    _resetText: function()
    {
        var i;
        for (i=0;i<this._texts.length;++i)
        {
            this._texts[i].destroy();
        }
        this._texts = [];
        this._contentRectHeight = 0;
        this._consoleRect = this._screen.getFullScreenRect().inset(0, 10, 0, 0);
    },
    write: function(vspace, indent, color, text)
    {
        this._consoleRect.sliceVertical(vspace);
        var textRect = this._consoleRect.sliceVertical(20);
        textRect.sliceHorizontal(indent);
        var label = new Label(
        {
            frame: textRect.array(),
            text: text,
            textGravity: Gravity.Left,
            textColor: color,
            textSize: this._screen.convertNumber(16)
        });
        this._scrollView.addChild(label);
        this._texts.push(label);
        this._contentRectHeight += this._screen.convertNumber(20+vspace);
    },
    finish: function()
    {
        this.filterButton.setEnabled(true);
        this._scrollView.setContentSize(this._screen.convert([this._contentRectWidth, this._contentRectHeight]));
    },
    onDrawPage: function(window, pageFrame, contentRectWidth)
    {
        this._all = false;
        this._contentRectWidth = contentRectWidth;
        this._contentRectHeight = 0;
        this._texts = [];

        var progressRect = pageFrame.sliceVertical(this._screen.convertNumber(30));
        progressRect.inset(0, 30);
        var buttonRect = progressRect.sliceHorizontal(this._screen.convertNumber(40));
        this.progressbar = new ProgressBar(
        {
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "00000000 0.0", "00000000 1.0" ]
            },
            progressGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FFe4ffe4 0.0","FF88ff88 1.0" ]
            },
            secondaryGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FFffe4e4 0.0","FFff8888 1.0" ]
            },
            frame: progressRect.array()
        });
        this.elems.push(this.progressbar);
        window.addChild(this.progressbar);

        var self = this;
        this.filterButton = new Button(
        {
            textGravity: Gravity.Center,
            gradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FF000000 0.0", "FF000000 1.0" ]
            },
            highlightedGradient:
            {
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FF6666FF 0.0", "FF333388 1.0" ]
            },
            frame: buttonRect.inset(0, 5).array(),
            text: "All",
            textSize: 14,
            normalTextColor: "FFFFFF",
            highlightedTextColor: "FFFFFF",
            enabled: false,
            onClick: function()
            {
                self.onFilterResult();
            }
        });
        this.elems.push(this.filterButton);
        window.addChild(this.filterButton);

        this._scrollView = new ScrollView(
        {
            frame: pageFrame.array()
        });
        this.elems.push(this._scrollView);
        window.addChild(this._scrollView);

        this._itemRect = this._screen.getFullScreenRect().inset(0, 10, 0, 0);

        if (this._param !== undefined)
        {
            setTimeout(function()
            {
                self._runUnitTest();
            }, 100);
        }
    },
    onFilterResult: function()
    {
        this.filterButton.setEnabled(false);
        if (!this._all)
        {
            this._all = true;
            this.filterButton.setGradient({
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FFFFFFFF 0.0", "FFFFFFFF 1.0" ]
            });
            this.filterButton.setTextColor("FF000000");
        }
        else
        {
            this._all = false;
            this.filterButton.setGradient({
                corners: '8 8 8 8',
                outerLine: "FFFFFF 1.5",
                gradient: [ "FF000000 0.0", "FF000000 1.0" ]
            });
            this.filterButton.setTextColor("FFFFFFFF");
        }
        this._runUnitTest();
    },
    _runUnitTest: function()
    {
        var test = jasmine;
        this._resetText();
        jasmine.jasmine.currentEnv_ = new jasmine.jasmine.Env();
        var reporter = new NGGoUnitTestReporter(this, this._all);
        jasmine.jasmine.getEnv().addReporter(reporter);
        var i;
        for(i=0;i<this._param.length;++i)
        {
            this._param[i]();
        }
        jasmine.jasmine.getEnv().execute();
    }
});
