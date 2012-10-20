////////////////////////////////////////////////////////////////////////////////
/**
 *  @author:    Shamas S
 *  Website:    https://developer.mobage.com/
 *  Copyright:  (C) 2011-2012 ngmoco:) inc. All rights reserved.
 */
////////////////////////////////////////////////////////////////////////////////
var Vector = require('../../NGCore/Client/Core/Vector').Vector;
var Root = require('../../NGCore/Client/GL2/Root').Root;
var ScrollView = require('./ScrollView').ScrollView;
exports.ListView = ScrollView.subclass( /** @lends GLUI.ListView.prototype */
{
    classname: 'ListView',
    /**
     * @class The <code>ListView</code> class constructs objects that contain <code>{@link GLUI.ListViewItem}</code> and <code>{@link GLUI.ListViewSection}</code> objects.
     * These objects handle and render scrolling lists in an application.
     * A <code>ListView</code> object can contain potentially thousands of items,
     * in sections, that use a pool of reusable views to display content.
     * @name GLUI.ListView
     * @constructs
     * @augments GLUI.ScrollView
     */
    ScrollDirection: {
        Horizontal: 1,
        Vertical: 2
    },
    initialize: function (properties)
    {
        this._myFrame = null;
        this._reusableViewsPool = [];
        this._viewsPool = [];
        this._completeItemsList = null;
        this._isSetSection = false;
        if (properties)
        {
            this.setAttributes(properties);
        }
    },
    /**
     * @name GLUI.ListView#setSections
     * @description Set the list of sections that this <code>ListView</code> contains.
     * @example var sections = [];
     * var section = new GLUI.ListViewSection;
     * ...
     * var items = [];
     * for(news in News)
     * {
     *  var item = new ListItem.ListItem();
     *  item.game = News[news];
     *  items.push(item);
     * }
     *
     * section.setItems(items);
     * sections.push(section);
     *
     * gameNews.setSections(sections);
     * @param {Object} newSections A new aray of section IDs.
     * @see GLUI.ListView#getSections
     * @function
     * @status  Android
     */
    setSections: function (sectArray)
    {
        this._momentum = {
            x: 0,
            y: 0
        };
        this.setScrollPosition([0, 0]);
        if (!this._myFrame)
        {
            throw new Error("ListView expects setFrame([x,y,w,h]) to be called before setSections(sections)");
        }
        if (sectArray instanceof Array)
        {
            if (this._viewsPool)
            {
                var key, j;
                for (key in this._viewsPool)
                {
                    if (this._viewsPool.hasOwnProperty(key))
                    {
                        var individualArr = this._viewsPool[key];
                        for (j = 0; j < individualArr.length; j++)
                        {
                            if (individualArr[j]._listItem)
                            {
                                this._addToReUsableViewsArray(individualArr[j], individualArr[j]._listItem._reusableID);
                            }
                        }
                    }
                }
                this._completeItemsList = [];
                this._sectionsArray = sectArray;
                this._isSetSection = true;
            }
        }
        else
        {
            throw new Error(this.classname + "expects Array in setSections(), getting object of " + sectArray.type);
        }
    },
    /**
     * @name GLUI.ListView#getSections
     * @description Retrieve all contained sections by this <code>ListView</code>.
     * @returns {Object} The current section list as an array of section IDs.
     * @param {}
     * @see GLUI.ListView#setSections
     * @function
     * @status Android
     */
    getSections: function ()
    {
        return this._sectionsArray;
    },
    /**
     * @name GLUI.ListView#reloadData
     * @description Clear this <code>ListView</code> and reload all list data.
     * @see GLUI.ListViewItem,
     * @see GLUI.ListViewSection
     * @status Javascript, Android, Flash
     * @function
     */
    reloadData: function ()
    {
        var i = 0;
        for (i = 0; i < this._sectionsArray.length; i++)
        {
            this._sectionsArray[i].flush();
        }
        this.setSections(this._sectionsArray);
    },
    /**
     * @name GLUI.ListView#setHeader
     * @description Set the value for the <code>header</code> property. This string is used as a header for the <code>ListView</code>.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var section = new GLUI.ListViewSection;
     * ...
     * friendHeader.setHeader('This is a header');
     * @param {String} header The new header.
     * @see GLUI.ListView#getHeader
     * @function
     * @status  Android
     */
    setHeader: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation:  setHeader()  in ' + this.classname);
    },
    /**
     * @name GLUI.ListView#getHeader
     * @description Retrieve the value of the <code>header</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {String} The current header.
     * @see GLUI.ListView#setHeader
     * @function
     * @status Android
     */
    getHeader: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation:  getHeader() in ' + this.classname);
    },
    /**
     * @name GLUI.ListView#setFooter
     * @description Set the value for the <code>footer</code> This string is used as a footer for the <code>ListView.</code>
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @example var section = new GLUI.ListViewSection;
     * ...
     * friendHeader.setFooter('This is a footer');
     * @param {String} footer The new footer.
     * @see GLUI.ListView#getFooter
     * @function
     * @status  Android
     */
    setFooter: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation:  setFooter() in ' + this.classname);
    },
    /**
     * @name GLUI.ListView#getFooter
     * @description Retrieve the value of the <code>footer</code> property.
     * <br /><b>Note:<b> <b><i><u>WARNING</u></i></b> This method is not implemented due to GL2 limitation.
     * @returns {String} The current footer.
     * @see GLUI.ListView#setFooter
     * @function
     * @status Android
     */
    getFooter: function ()
    {
        console.log('<NGGo> WARNING This method is not implemented due to GL2 limitation:  getFooter() in ' + this.classname);
    },
    /**
     * @private
     * */
    _registerSetters: function ($super)
    {
        $super();
        this._setters['sections'] = this.setSections.bind(this);
    },
    /**
     * @private 
     * */
    _registerGetters: function ($super)
    {
        $super();
        this._getters['sections'] = this.getSections.bind(this);
    },
    /**
     * @private
     * @status Android
     * */
    _flushSection: function (sectionObject)
    {
        var indexOfSection = this._sectionsArray.indexOf(sectionObject);
        if (indexOfSection < 0)
        {
            return;
        }
        var indexedSection = this._sectionsArray[indexOfSection];
        var sectionItemsArray = indexedSection.getItems();
        var i = 0;
        for (i = 0; i < sectionItemsArray.length; i++)
        {
            var sectionItem = sectionItemsArray[i];
            if (sectionItem._glView)
            {
                this._addToReUsableViewsArray(sectionItem._glView, sectionItem._reusableID);
            }
        }
    },
    /**
     * @private
     * @status Android
     */
    _evaluateItemPositions: function ()
    {
        var i = 0;
        var itemObject = null;
        var startingPos = 0;
        var currentPos = 0;
        for (i = 0; i < this._sectionsArray.length; i++)
        {
            var indexedSectArray = this._sectionsArray[i];
            indexedSectArray._parentListView = this;
            indexedSectArray._updateHeight();
            var j = 0;
            var itemsArray = indexedSectArray.getItems();
            var titleView = indexedSectArray.getTitleView();
            var titleWidthHeight = 0;
            if (titleView)
            {
                if (this._scroll === this.ScrollDirection.Horizontal)
                {
                    if (titleView.getFrame())
                    {
                        titleView.setFrame([currentPos, 0, titleView._frame[2], this._frame[3]]);
                        titleView._prevPos = new Vector(currentPos, 0);
                        indexedSectArray._startingPos = currentPos;
                        titleWidthHeight = titleView._frame[2];
                        titleView._isOnTop = false;
                        titleView._hasBeenPlaced = false;
                    }
                }
                else
                {
                    if (titleView.getFrame())
                    {
                        titleView.setFrame([0, currentPos, this._frame[2], titleView._frame[3]]);
                        titleView._prevPos = new Vector(0, currentPos);
                        indexedSectArray._startingPos = currentPos;
                        titleWidthHeight = titleView._frame[3];
                        titleView._isOnTop = false;
                        titleView._hasBeenPlaced = false;
                    }
                }
                this.addChild(titleView);
            }
            currentPos += titleWidthHeight;
            for (j = 0; j < itemsArray.length; j++)
            {
                itemObject = itemsArray[j];
                this._completeItemsList.push(itemObject);
                var posVect = null;
                if (this._scroll === this.ScrollDirection.Horizontal)
                {
                    posVect = new Vector(currentPos, 0);
                    itemObject._locationVector = posVect;
                    itemObject._scrollDirection = this._scroll;
                    itemObject._effectiveMeasure = this._frame[3];
                    if (indexedSectArray._rowHeightWidth > 0)
                    {
                        currentPos += indexedSectArray._rowHeightWidth;
                    }
                    else
                    {
                        currentPos += itemObject.getHeight();
                    }
                }
                else
                {
                    posVect = new Vector(0, currentPos);
                    itemObject._locationVector = posVect;
                    itemObject._scrollDirection = this._scroll;
                    itemObject._effectiveMeasure = this._frame[2];
                    if (indexedSectArray._rowHeightWidth > 0)
                    {
                        currentPos += indexedSectArray._rowHeightWidth;
                    }
                    else
                    {
                        currentPos += itemObject.getHeight();
                    }
                }
            }
            indexedSectArray._endingPos = currentPos;
        }
        if (this._scroll === this.ScrollDirection.Horizontal)
        {
            this.setContentSize([currentPos - startingPos, this._frame[3]]);
        }
        else
        {
            this.setContentSize([this._frame[2], currentPos - startingPos]);
        }
        this._scrollbar.updateSize(this._scroll, this._myFrame, this._contentSize);
        this._evaluateMarginalLimits();
        this._updateListItems();
        this._updateSectionTitles();
    },
    /**
     * @private
     * @status  Android
     */
    _sortArray: function (arg1, arg2)
    {
        return (arg2._rowHeight - arg1._rowHeight);
    },
    /**
     * @private
     * @status  Android
     */
    _evaluateMarginalLimits: function ()
    {
        if (!this._frame || !this._completeItemsList)
        {
            return;
        }
        var lengthArray = this._completeItemsList.slice(0);
        lengthArray.sort(this._sortArray);
        var margin = 0;
        if (lengthArray.length >= 1)
        {
            margin = lengthArray[0]._rowHeight;
        }
        var origin = this._myFrame.getOrigin();
        var size = this._myFrame.getSize();
        if (this._scroll === this.ScrollDirection.Horizontal)
        {
            this._leftTopLimit = origin.getX() - (2 * margin);
            this._rightBottLimit = origin.getX() + size.getWidth() + (2 * margin);
        }
        else if (this._scroll === this.ScrollDirection.Vertical)
        {
            this._leftTopLimit = origin.getY() - (2 * margin);
            this._rightBottLimit = origin.getY() + size.getHeight() + (2 * margin);
        }
    },
    /**
     * @private
     * @status Android
     */
    _updateListItems: function ()
    {
        var i;
        if (!this._completeItemsList)
        {
            return;
        }
        for (i = 0; i < this._completeItemsList.length; i++)
        {
            var listItem = this._completeItemsList[i];
            if (this._isInsideScreen(listItem))
            {
                if (!listItem._glView)
                {
                    var reusableGLView = this._fetchFromReUsableArray(listItem);
                    if (reusableGLView)
                    {
                        listItem.__onSetView(reusableGLView, [listItem._locationVector.getX(), listItem._locationVector.getY()]);
                        this._addToVisibleViews(reusableGLView);
                        reusableGLView.setVisible(true);
                        reusableGLView._listItem = listItem;
                        listItem._glView = reusableGLView;
                    }
                }
            }
            else
            {
                if (listItem._glView)
                {
                    this._removeFromVisibleViews(listItem._glView);
                    this._addToReUsableViewsArray(listItem._glView, listItem._reusableID);
                }
            }
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _addToVisibleViews: function (glView)
    {
        var itemIndex = this._visibleArray.indexOf(glView);
        if (itemIndex === -1)
        {
            this._visibleArray.splice(0, 0, glView);
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _removeFromVisibleViews: function (glView)
    {
        var itemIndex = this._visibleArray.indexOf(glView);
        if (itemIndex !== -1)
        {
            this._visibleArray.splice(itemIndex, 1);
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _updateSectionTitles: function ()
    {
        if (!this._sectionsArray)
        {
            return;
        }
        var i = 0;
        for (i = 0; i < this._sectionsArray.length; i++)
        {
            var indexedSection = this._sectionsArray[i];
            var titleView = indexedSection.getTitleView();
            if (titleView)
            {
                var yPos = this._content.getPosition().getY();
                var titlePos = titleView._prevPos.getY() + yPos;
                var endPos = indexedSection._endingPos - titleView._frame[3] + yPos;
                if (typeof (titlePos) !== "number" || typeof (endPos) !== "number")
                {
                    return;
                }
                if (!titleView._isOnTop && Math.round(titlePos) < 0)
                {
                    titleView._isOnTop = true;
                }
                else if (titleView._isOnTop && Math.round(titlePos) > 0)
                {
                    titleView._isOnTop = false;
                    titleView.setFrame([titleView._prevPos.getX(), titleView._prevPos.getY(), this._frame[2], titleView._frame[3]]);
                }
                if (titleView._isOnTop)
                {
                    if (endPos < 0)
                    {
                        if ((endPos + titleView._frame[3]) >= 0)
                        {
                            titleView.setFrame([0, endPos - yPos, this._frame[2], titleView._frame[3]]);
                            titleView._hasBeenPlaced = false;
                        }
                        else if (!titleView._hasBeenPlaced)
                        {
                            titleView.setFrame([0, endPos - yPos, this._frame[2], titleView._frame[3]]);
                            titleView._hasBeenPlaced = true;
                        }
                    }
                    else
                    {
                        titleView.setFrame([0, -yPos, this._frame[2], titleView._frame[3]]);
                    }
                }
            }
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _evaluateScrollDirection: function ()
    {
        this.setScrollDirection(this.ScrollDirection.Vertical);
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _onUpdate: function ($super, delta)
    {
        var theRoot = null;
        var theGLRoot = null;
        if (this._isSetSection)
        {
            theRoot = this.getRoot();
            theGLRoot = this._getGLRoot();
        }
        if ((theRoot && theRoot.type === "document") || (theGLRoot && theGLRoot === Root))
        {
            this._evaluateItemPositions();
            this._isSetSection = false;
        }
        $super(delta);
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _updateScrollingView: function ()
    {
        if (this._needEvaluateMarginalLimits)
        {
            this._evaluateMarginalLimits();
            this._needEvaluateMarginalLimits = false;
        }
        this._updateListItems();
        this._updateSectionTitles();
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _isInsideScreen: function (listItem)
    {
        var listItemPos = listItem._locationVector;
        var convertedPos = this._content.localToScreen(listItemPos);
        if (convertedPos === null || convertedPos === undefined)
        {
            return false;
        }
        if (this._scroll === this.ScrollDirection.Horizontal)
        {
            if (convertedPos.getX() > this._leftTopLimit && convertedPos.getX() < this._rightBottLimit)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            if (convertedPos.getY() > this._leftTopLimit && convertedPos.getY() < this._rightBottLimit)
            {
                return true;
            }
            else
            {
                return false;
            }
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _addToReUsableViewsArray: function (glView, index)
    {
        if (glView)
        {
            var requiredReusableArray = this._reusableViewsPool[index];
            requiredReusableArray.push(glView);
            glView.setVisible(false);
            glView._listItem._glView = null;
            glView._listItem = null;
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _addToViewsPool: function (view, index)
    {
        var viewsArray = this._viewsPool[index];
        if (!viewsArray)
        {
            this._viewsPool[index] = [];
            viewsArray = this._viewsPool[index];
        }
        viewsArray.push(view);
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    addChild: function ($super, childNode, index, isInternal)
    {
        if (isInternal)
        {
            $super(childNode, index);
        }
        else
        {
            $super(childNode);
            this._visibleArray.push(childNode);
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    removeChild: function ($super, childNode, isInternal)
    {
        $super(childNode);
        if (!isInternal)
        {
            var index = this._visibleArray.indexOf(childNode);
            if (index !== -1)
            {
                this._visibleArray.splice(index, 1);
            }
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    _fetchFromReUsableArray: function (listItem)
    {
        var i;
        var newReusableView = null;
        var requiredReusableArray = this._reusableViewsPool[listItem._reusableID];
        if (!requiredReusableArray)
        {
            this._reusableViewsPool[listItem._reusableID] = [];
            requiredReusableArray = this._reusableViewsPool[listItem._reusableID];
            newReusableView = listItem._onCreateView();
            this.addChild(newReusableView, 0, true);
            this._addToViewsPool(newReusableView, listItem._reusableID);
            return newReusableView;
        }
        if (requiredReusableArray.length > 0)
        {
            var returnView = requiredReusableArray.pop();
            returnView.setVisible(true);
            return returnView;
        }
        else
        {
            var viewsArray = this._viewsPool[listItem._reusableID];
            for (i = 0; i < viewsArray.length; i++)
            {
                var glView = viewsArray[i];
                var convertedPos = this._content.localToScreen(glView.getGLObject().getPosition().clone());
                if (convertedPos.getX() < this._leftTopLimit || convertedPos.getX() > this._rightBottLimit)
                {
                    this._addToReUsableViewsArray(glView, listItem._reusableID);
                }
            }
        }
        // check again if we have been able to round up some available views..
        if (this._reusableViewsArray && this._reusableViewsArray.length > 0)
        {
            return this._reusableViewsArray.pop();
        }
        else
        {
            newReusableView = listItem._onCreateView();
            this.addChild(newReusableView, 0, true);
            this._addToViewsPool(newReusableView, listItem._reusableID);
            return newReusableView;
        }
    },
    /**
     * @private
     * @status Javascript, iOS, Android, Flash
     */
    destroy: function ()
    {
        var key;
        var j, i = 0;
        if (this._sectionsArray)
        {
            for (i = 0; i < this._sectionsArray.length; i++)
            {
                var indexedSection = this._sectionsArray[i];
                var titleView = indexedSection.getTitleView();
                if (titleView)
                {
                    titleView._prevPos = null;
                }
                indexedSection._parentListView = null;
                indexedSection._startingPos = null;
                indexedSection._endingPos = null;
            }
            this._sectionsArray = null;
        }
        if (this._completeItemsList)
        {
            for (i = 0; i < this._completeItemsList.length; i++)
            {
                this._completeItemsList[i]._locationVector = null;
                this._completeItemsList[i]._scrollDirection = 0;
                this._completeItemsList[i]._effectiveMeasure = 0;
                this._completeItemsList[i]._glView = null;
                this._completeItemsList[i]._rowHeight = 0;
            }
            this._completeItemsList.length = 0;
            this._completeItemsList = null;
        }
        if (this._viewsPool)
        {
            for (key in this._viewsPool)
            {
                if (this._viewsPool.hasOwnProperty(key))
                {
                    var individualArr = this._viewsPool[key];
                    for (j = 0; j < individualArr.length; j++)
                    {
                        individualArr[j]._listItem = null;
                        individualArr[j].destroy();
                    }
                }
            }
            this._viewsPool.length = 0;
            this._viewsPool = null;
        }
        if (this._reusableViewsPool)
        {
            this._reusableViewsPool.length = 0;
            this._reusableViewsPool = null;
        }
        this._isSetSection = null;
    }
});