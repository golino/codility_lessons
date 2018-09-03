var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
/// <reference path="../../../../../../../../out/typescriptapis/DiagShared/inc/TS-1.8.10/JSTreeGridControl.d.ts" />
/// <reference path="../../../../../../../../out/typescriptapis/bptoob/inc/1.8/Plugin.d.ts" />
//
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ExternalReferences.ts" />
var IntelliTrace;
(function (IntelliTrace) {
    var CustomEvents = (function () {
        function CustomEvents() {
        }
        CustomEvents.NestedGridControlHeightChanged = "nestedgridcontrolheightchangedevent";
        CustomEvents.NestedGridControlHasMouseDown = "nestedgridcontrolhasmousedownevent";
        return CustomEvents;
    }());
    IntelliTrace.CustomEvents = CustomEvents;
    /// <summary>
    /// The base class for grids on detail page.
    /// </summary>
    var CustomGridControl = (function (_super) {
        __extends(CustomGridControl, _super);
        function CustomGridControl(root, options) {
            _super.call(this, root, options);
            this._rowTops = [];
        }
        /// <summary>
        /// Create a cell with a tree icon at the left.
        /// </summary>
        /* protected */ CustomGridControl.prototype.createTreeIconCell = function (expandedState, level, column, value, valueTooltip, iconClass, iconTooltip, iconAlt) {
            // Get Column Width
            var cellElement = this.createElementWithClass("div", this.options().cellClass);
            cellElement.style.width = String(column.width) + "px";
            // Add a tree-sign in front of the text
            if (level > 0) {
                _super.prototype.addTreeIconWithIndent.call(this, cellElement, expandedState, level, column);
            }
            // Add an extra icon before text
            var indent = _super.prototype.getColumnPixelIndent.call(this, level);
            if (iconClass && iconClass !== "") {
                var methodIcon = this.createElementWithClass("div", "icon grid-icon " + iconClass);
                methodIcon.style.left = String(indent) + "px";
                methodIcon.setAttribute("role", "img");
                methodIcon.setAttribute("aria-label", iconAlt);
                cellElement.appendChild(methodIcon);
                // Add additional indent for icon
                indent += CustomGridControl.IconWidth; // add 2px buffer to make sure the width is enough for icon
                if (iconTooltip != null && iconTooltip !== "") {
                    this.setTooltip(methodIcon, iconTooltip);
                }
            }
            var textElement = this.createElementWithClass("div", CustomGridControl.TreeCellSelectionClass);
            textElement.innerText = value;
            if (valueTooltip != null && valueTooltip !== "") {
                this.setTooltip(textElement, valueTooltip);
            }
            cellElement.appendChild(textElement);
            cellElement.style.textIndent = String(indent) + "px";
            // Calculate column's indentOffset
            column.indentOffset = Math.max(column.indentOffset, indent);
            return cellElement;
        };
        CustomGridControl.prototype.getRowTop = function (rowIndex) {
            if (rowIndex < 0 || rowIndex >= this.getExpandedCount()) {
                return 0;
            }
            return this._rowTops[rowIndex];
        };
        CustomGridControl.prototype.getTotalDataHeight = function () {
            var rowCount = this.getExpandedCount();
            var lastRowIndex = rowCount - 1;
            var lastRowHeight = this.getRowHeight(lastRowIndex);
            var lastRowTop = this.getRowTop(lastRowIndex);
            return lastRowTop + lastRowHeight;
        };
        /// <summary>
        /// Get the range of row indices that are in the view.
        /// </summary>
        /// <param name="top"> The vertical offset of the top of the viewport.</param>
        /// <param name="bottom"> The vertical offset of the bottom of the viewport.</param>
        /// <return>Return a key-value data in the form {first: value, last: value }. {first: -1, last: -1} is returned when there no such rows are visible.
        /// When <paramref name="top"/> is larger than <paramref name="bottom"/>, {first: -1, last: -1} is also returned.
        /// </return>
        CustomGridControl.prototype.calculateVisibleRowIndices = function (top, bottom) {
            var firstVisible = -1;
            var lastVisible = -1;
            if (top > bottom) {
                return { first: -1, last: -1 };
            }
            var totalCount = this.getExpandedCount();
            for (var i = 0; i < totalCount; ++i) {
                if (this.getRowTop(i) >= bottom) {
                    break;
                }
                if (this.getRowBottom(i) < top) {
                    continue;
                }
                if (firstVisible === -1) {
                    firstVisible = i;
                }
                lastVisible = i;
            }
            return {
                first: firstVisible,
                last: lastVisible
            };
        };
        /* protected */ CustomGridControl.prototype.getMultilineTextHeight = function (value) {
            var measure = this.getMeasurements();
            // Not sure whether the new line is "\r\n" or "\n". However, we only need to know the number of lines. Matching "\n" should be enough.
            var matches = value.match(/\n/g);
            if (matches) {
                // (multiline text height) = (single line text height -- with row border) + (one line text height) * (number of line break)
                return measure.rowHeight + measure.textLineHeight * matches.length;
            }
            else {
                return measure.rowHeight;
            }
        };
        /* protected */ CustomGridControl.prototype.calcRowTops = function (startRowIndex) {
            // create new array since row count may changed
            var count = _super.prototype.getExpandedCount.call(this);
            for (var i = startRowIndex; i < count; ++i) {
                var newTop = this.getRowBottom(i - 1);
                this._rowTops[i] = newTop;
            }
        };
        /* protected */ CustomGridControl.prototype.getRowHeight = function (rowIndex) {
            throw new Error("getRowHeight() is an abstract class. It must be implemented by sub classes.");
        };
        /* protected */ CustomGridControl.prototype.getRowBottom = function (rowIndex) {
            return this.getRowTop(rowIndex) + this.getRowHeight(rowIndex);
        };
        /* protected */ CustomGridControl.prototype.setActiveOnSelectedRow = function () {
            var selectedDataIndex = this.getSelectedDataIndex();
            var selectedRowInfo = this.getRowInfo(selectedDataIndex);
            if (selectedRowInfo != null) {
                this.checkUpdateActive(selectedRowInfo);
            }
        };
        /// <summary>This is especially necessary for screen readers to read each
        /// row when the selection changes. </summary>
        /* protected */ CustomGridControl.prototype._updateAriaAttribute = function () {
            var dataIndex = this.getSelectedDataIndex();
            if (dataIndex != null) {
                // Getting row info using data index
                var rowInfo = this.getRowInfo(dataIndex);
                if (!rowInfo || !rowInfo.row) {
                    _super.prototype._updateAriaAttribute.call(this);
                }
                else {
                    // Don't check whether the id of selected row is the same as _activeAriaId.
                    // This check is in the base class but is removed here.
                    // With it, if the row doesn't have any children (expanded or not). The screen reader won't read the row.
                    // The reason is uncleared.
                    // Setting active element attribute
                    var ariaLabel = this._getAriaLabelForRow(rowInfo);
                    rowInfo.row.setAttribute("aria-label", ariaLabel);
                    try {
                        this.updateActive(rowInfo.row);
                    }
                    catch (err) {
                    }
                }
            }
        };
        /* protected */ CustomGridControl.prototype._onExpandedCollapsed = function (isExpanded, dataIndex) {
            if (dataIndex != null) {
                var rowIndex = this._getRowIndex(dataIndex);
                this.calcRowTops(rowIndex);
            }
            else {
                this.calcRowTops(0);
            }
            this.fireCustomEvent(this.getElement(), Common.Controls.Grid.GridControl.EVENT_ROW_EXPANDED_COLLAPSED, [{ isExpanded: isExpanded, dataIndex: dataIndex }]);
        };
        // Executes the given event listener if the mouse button for the given
        // event is equal to the given button.
        /* protected */ CustomGridControl.prototype._addMouseUpListener = function (element, button, listener) {
            element.addEventListener("mouseup", function (e) {
                if (e && (e.button == button)) {
                    listener(e);
                }
            });
        };
        /* protected */ CustomGridControl.prototype.setTooltip = function (element, tooltip) {
            if (!element || !tooltip || tooltip === "") {
                return;
            }
            element.setAttribute(CustomGridControl.TooltipAttribute, JSON.stringify({ content: tooltip }));
        };
        // Add tooltip for element when not all the content of the element is visible
        /* protected */ CustomGridControl.prototype.addTooltipWhenObscured = function (element) {
            if (!element) {
                return;
            }
            if (!element.hasAttribute(CustomGridControl.TooltipAttribute) && (element.scrollWidth > element.offsetWidth)) {
                this.setTooltip(element, element.innerText.replace(/\r?\n|\r/g, "<br/>"));
            }
        };
        // find all the elements of specified class and add tooltip when element content is only partly visible
        /* protected */ CustomGridControl.prototype.addTooltipForClasses = function () {
            var _this = this;
            var classes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                classes[_i - 0] = arguments[_i];
            }
            if (!classes) {
                return;
            }
            classes.forEach(function (className) {
                var nodes = _this.rootElement.getElementsByClassName(className);
                if (!nodes) {
                    return;
                }
                for (var i = 0; i < nodes.length; ++i) {
                    _this.addTooltipWhenObscured(nodes[i]);
                }
            });
        };
        CustomGridControl.IconWidth = 16;
        CustomGridControl.TooltipAttribute = "data-plugin-vs-tooltip";
        CustomGridControl.TreeCellSelectionClass = "tree-cell-for-selection";
        return CustomGridControl;
    }(Common.Controls.Grid.GridControl));
    IntelliTrace.CustomGridControl = CustomGridControl;
})(IntelliTrace || (IntelliTrace = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
var IntelliTrace;
(function (IntelliTrace) {
    // Data field names for a stack frame, these strings need to match with the public properties defined in VS side
    var StackFrameDataFields = (function () {
        function StackFrameDataFields() {
        }
        StackFrameDataFields.Signature = "Signature";
        StackFrameDataFields.Description = "Description";
        StackFrameDataFields.TotalTime = "TotalTime";
        StackFrameDataFields.StartTime = "StartTime";
        StackFrameDataFields.EndTime = "EndTime";
        StackFrameDataFields.SelfTime = "SelfTime";
        StackFrameDataFields.Highlight = "Highlight";
        StackFrameDataFields.HasParameters = "HasParameters";
        StackFrameDataFields.HasAction = "HasAction";
        return StackFrameDataFields;
    }());
    IntelliTrace.StackFrameDataFields = StackFrameDataFields;
    // Data field names for a parameter, these strings need to match with the public properties defined in VS side
    var ParameterDataFields = (function () {
        function ParameterDataFields() {
        }
        ParameterDataFields.Name = "Name";
        ParameterDataFields.Value = "Value";
        ParameterDataFields.Type = "Type";
        ParameterDataFields.HasAction = "HasAction";
        ParameterDataFields.ToolTip = "ToolTip";
        return ParameterDataFields;
    }());
    IntelliTrace.ParameterDataFields = ParameterDataFields;
    // Method/Event names exposed from VS side
    var AdapterCalls;
    (function (AdapterCalls) {
        // methods/actions
        AdapterCalls.GetStackFrames = "GetStackFrames";
        AdapterCalls.StartDebugging = "StartDebugging";
        AdapterCalls.GetParameters = "GetParameters";
        AdapterCalls.ExecuteAction = "ExecuteAction";
        // events
        AdapterCalls.ExpandItemInExecutionTreeEvent = "ExpandItemInExecutionTreeEvent";
        AdapterCalls.StartDebugCurrentSelectionEvent = "StartDebugCurrentSelectionEvent";
    })(AdapterCalls = IntelliTrace.AdapterCalls || (IntelliTrace.AdapterCalls = {}));
})(IntelliTrace || (IntelliTrace = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ExternalReferences.ts" />
/// <reference path="CustomGridControl.ts" />
/// <reference path="CallDurationTree.ts" />
/// <reference path="ViewModelContracts.ts" />
var IntelliTrace;
(function (IntelliTrace) {
    // Grid control used in method details expansion for parameter data
    var NestedGridControl = (function (_super) {
        __extends(NestedGridControl, _super);
        function NestedGridControl(adaptor, root, dataSource, parentCallDurationTree, totalWidth, outterDataIndex, hasAction) {
            var _this = this;
            var fieldColumn = new Common.Controls.Grid.ColumnInfo(IntelliTrace.ParameterDataFields.Name, Microsoft.Plugin.Resources.getString("ParameterNameColumnHeader"), Microsoft.Plugin.Resources.getString("ParameterNameColumnHeaderTooltip"), 0, false);
            var valueColumn = new Common.Controls.Grid.ColumnInfo(IntelliTrace.ParameterDataFields.Value, Microsoft.Plugin.Resources.getString("ParameterValueColumnHeader"), Microsoft.Plugin.Resources.getString("ParameterValueColumnHeaderTooltip"), 0, false);
            var typeColumn = new Common.Controls.Grid.ColumnInfo(IntelliTrace.ParameterDataFields.Type, Microsoft.Plugin.Resources.getString("ParameterTypeColumnHeader"), Microsoft.Plugin.Resources.getString("ParameterTypeColumnHeaderTooltip"), 0, false);
            fieldColumn.getCellContents = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                return _this.createTreeIconCell(expandedState, level, column, _super.prototype.getColumnText.call(_this, dataIndex, column, 0), null, "method-detail-variable-icon", null, Microsoft.Plugin.Resources.getString("MethodDetailVariableAltText"));
            };
            valueColumn.getCellContents = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
                return _this.drawValueCell(rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder);
            };
            // The base class constructor will use these two variables, so initialize them before the base constructor.
            var options = new Common.Controls.Grid.GridOptions(null, [fieldColumn, valueColumn, typeColumn], null, null);
            options.canvasClass = "nested-grid-canvas";
            options.rowClass = "grid-row-no-hover";
            options.headerElementClass = "nested-grid-header";
            options.headerColumnElementClass = "nested-grid-header-column";
            // no visual affect for selection in nested grid control
            options.rowSelectedClass = "grid-row-selected-no-hover";
            // use smaller cell padding for nested grid
            options.cellClass = "nested-grid-cell";
            options.focusable = true;
            if (dataSource) {
                options.source = dataSource.RowViewModels;
                options.expandStates = dataSource.ExpandStates;
            }
            options.ariaLabel = Microsoft.Plugin.Resources.getString("ParameterGrid");
            _super.call(this, root, options);
            this.fieldColumn = fieldColumn;
            this.valueColumn = valueColumn;
            this._rowHeights = [];
            this.updateColumnWidths(totalWidth);
            this._adapter = adaptor;
            this._hasAction = hasAction;
            this._parentCallDurationTree = parentCallDurationTree;
            this._outerDataIndex = outterDataIndex;
            this._wrappedTextIndex = this.getWrappedTextIndex();
        }
        Object.defineProperty(NestedGridControl.prototype, "isSelectedFromParent", {
            get: function () {
                return this._isSelectedFromParent;
            },
            set: function (value) {
                this._isSelectedFromParent = value;
                if (this._isSelectedFromParent) {
                    this.setFocusOnSelectedRow();
                }
                // no selection style will apply to this gridControl when it's not selected
                this._updateSelectionStyles();
            },
            enumerable: true,
            configurable: true
        });
        /// <summary>
        /// Get the index of the first element that need wrapping. Only expect one or none. -1 is returned when no element need wrapping.
        /// </summary>
        NestedGridControl.prototype.getWrappedTextIndex = function () {
            var source = this.options().source;
            for (var i = 0; i < source.length; ++i) {
                if (this.isParameterActionable(i)) {
                    return i;
                }
            }
            return -1;
        };
        /*protected*/ NestedGridControl.prototype._onThemeChanged = function (e) {
            this._rowHeights = [];
            _super.prototype._onThemeChanged.call(this, e);
        };
        /*protected*/ NestedGridControl.prototype._attachEvents = function () {
            var _this = this;
            _super.prototype._attachEvents.call(this);
            this.addEventListenerToCanvas("dblclick", this, this.onDbClick);
            var element = this.getElement();
            element.addEventListener("columnresize", function (e) {
                _this._onColumnResizeEvent(e.customData, true);
            });
        };
        NestedGridControl.prototype._onColumnResizeEvent = function (columns, fireEvent) {
            if (columns.length === 1 && columns[0] !== this.options().columns[1]) {
                // when manually set the column width but that is not the column value.
                return;
            }
            if (this._wrappedTextIndex !== -1 || this._rowHeights.length === 0) {
                if (this._rowHeights.length === 0) {
                    this.calcRowTops(0);
                }
                else {
                    var width = this.getLinkElementWidth(this.options().columns[1].width);
                    this.calculateRowHeight(this._wrappedTextIndex, width);
                    var rowIndex = this._getRowIndex(this._wrappedTextIndex);
                    this.calcRowTops(rowIndex);
                }
                if (fireEvent) {
                    this.fireCustomEvent(this.getCanvas(), IntelliTrace.CustomEvents.NestedGridControlHeightChanged, [this._outerDataIndex]);
                }
            }
        };
        NestedGridControl.prototype.onDbClick = function (e) {
            if (this.isSelectedActionable()) {
                this.executeAction();
            }
        };
        /*protected*/ NestedGridControl.prototype._onRowMouseDown = function (e) {
            e.stopPropagation(); // stop scrolling to the nested grid top.
            _super.prototype._onRowMouseDown.call(this, e);
            this.fireCustomEvent(this.getCanvas(), IntelliTrace.CustomEvents.NestedGridControlHasMouseDown, [this._outerDataIndex]);
        };
        NestedGridControl.prototype.updateColumnWidths = function (totalWidth) {
            var options = _super.prototype.options.call(this);
            if (totalWidth <= 0) {
                return;
            }
            options.columns[0].width = totalWidth * NestedGridControl.ParameterNameColumnWidthRatio;
            options.columns[1].width = totalWidth * NestedGridControl.ParameterValueColumnWidthRatio;
            options.columns[2].width = totalWidth * NestedGridControl.ParameterTypeColumnWidthRatio;
            this._onColumnResizeEvent(options.columns, false);
        };
        NestedGridControl.prototype.setFocusOnSelectedRow = function () {
            var selectedDataIndex = this.getSelectedDataIndex();
            var selectedRowInfo = this.getRowInfo(selectedDataIndex);
            if (selectedRowInfo != null) {
                selectedRowInfo.row.focus();
            }
        };
        /// <summary>
        /// Set the selected row active if the current grid control is selected from the parent control.
        /// </summary>
        NestedGridControl.prototype.setActiveRow = function () {
            if (this.isSelectedFromParent) {
                this.setActiveOnSelectedRow();
            }
        };
        /*protected*/ NestedGridControl.prototype._onContainerResize = function (e) {
            // do nothing, nested gridControl don't need to response to window resize event and re-layout itself
        };
        // Return true if the keyboard event is not processed
        /*protected*/ NestedGridControl.prototype._onKeyDown = function (e) {
            return false;
        };
        NestedGridControl.prototype.handleKeyDownEventInOuterGrid = function (e) {
            var bounds = { lo: -1, hi: -1 };
            var expandedCount = _super.prototype.getExpandedCount.call(this);
            if (expandedCount > 0) {
                bounds = { lo: 0, hi: expandedCount - 1 };
            }
            var selectedRowIndex = this.getSelectedRowIndex();
            if (selectedRowIndex < 0) {
                _super.prototype._addSelection.call(this, bounds.lo);
            }
            var selectedRowExpandState = 0;
            if (selectedRowIndex >= 0) {
                selectedRowExpandState = this._getExpandState(this._getDataIndex(selectedRowIndex));
            }
            // When selection is the last and trying to move down,
            // or when selection is the first and trying to move up, 
            // let the parent grid control handle this event
            if (((e.keyCode == Common.KeyCodes.ARROW_DOWN) && (selectedRowIndex == bounds.hi)) ||
                ((e.keyCode == Common.KeyCodes.ARROW_UP) && (selectedRowIndex == bounds.lo)) ||
                ((e.keyCode == Common.KeyCodes.ARROW_RIGHT) && (selectedRowExpandState >= 0) && (selectedRowIndex == bounds.hi)) ||
                ((e.keyCode == Common.KeyCodes.ARROW_LEFT) && (selectedRowExpandState <= 0) && (selectedRowIndex == bounds.lo))) {
                return true;
            }
            if (e.keyCode == Common.KeyCodes.ENTER) {
                if (this.isSelectedActionable()) {
                    this.executeAction();
                }
                return false;
            }
            return _super.prototype._onKeyDown.call(this, e);
        };
        /*protected*/ NestedGridControl.prototype._updateRowSelectionStyle = function (rowInfo, selectedRows, focusIndex) {
            var rowIndex = rowInfo.rowIndex;
            var rowElement = rowInfo.row;
            var options = _super.prototype.options.call(this);
            rowElement.classList.remove(options.rowSelectedClass);
            rowElement.classList.remove(options.rowSelectedBlurClass);
            rowElement.classList.remove(options.rowCurrentClass);
            rowElement.setAttribute("aria-selected", "false");
            if (rowIndex === focusIndex) {
                rowElement.classList.add(options.rowCurrentClass);
            }
            var isSelected = (this.isSelectedFromParent && selectedRows && selectedRows.hasOwnProperty(rowIndex));
            var isActive = this.isActive();
            if (isSelected) {
                rowElement.setAttribute("aria-selected", "true");
                if (isActive) {
                    rowElement.classList.add(options.rowSelectedClass);
                }
                else {
                    rowElement.classList.add(options.rowSelectedBlurClass);
                }
            }
            var linkNodes = rowElement.getElementsByClassName(NestedGridControl.paramLinkSelectionClass);
            if (linkNodes.length > 0) {
                var linkElement = linkNodes[0];
                this.removeHyperlinkStyle(linkElement);
                if (isSelected) {
                    if (isActive) {
                        this.addHyperlinkToActiveSelectedStyle(linkElement);
                    }
                    else {
                        this.addHyperlinkToInactiveSelectedStyle(linkElement);
                    }
                }
                else {
                    this.addHyperlinkToUnselectedStyle(linkElement);
                }
            }
        };
        // Nested grid control never has it's own scroll and the default getSelectedRowIntoView() won't have effect on nested grid;
        // this function will bring the selected row in nested grid into the visible area of parent control.
        NestedGridControl.prototype.getSelectedRowIntoView = function (force) {
            return this.getRowIntoParentView(this.getSelectedRowIndex());
        };
        /*protected*/ NestedGridControl.prototype._drawRows = function (visibleRange, includeNonDirtyRows) {
            _super.prototype._drawRows.call(this, visibleRange, includeNonDirtyRows);
            this.addTooltipForClasses(IntelliTrace.CustomGridControl.TreeCellSelectionClass, NestedGridControl.ValueCellSelectionClass);
        };
        // Bring certain row of nested grid into the visible area of parent control.
        NestedGridControl.prototype.getRowIntoParentView = function (rowIndex) {
            if (rowIndex === -1) {
                return;
            }
            // Get top/bottom of nested grid's canvas relative to outer canvas.
            // To do this we get the nested grid top relative to outer canvas, then add the nested grid header height
            var nestedCanvasTop = this.getOffsetTopToParentCanvas() + this.getHeaderHeight();
            // Get the visible scroll area of outer grid canvas
            var outerCanvas = this._parentCallDurationTree.getCanvas();
            var outerCanvasTop = outerCanvas.scrollTop;
            var outerCanvasHeight = outerCanvas.clientHeight;
            var outerCanvasBottom = outerCanvas.scrollTop + outerCanvasHeight;
            var rowTopOfSelectedRow = this.getRowTop(rowIndex);
            var expectedScrollTop = rowTopOfSelectedRow + nestedCanvasTop;
            var rowHeightOfSelectedRow = this.getRowHeight(rowIndex);
            if (expectedScrollTop < outerCanvasTop) {
                outerCanvas.scrollTop = expectedScrollTop;
            }
            else if (expectedScrollTop + rowHeightOfSelectedRow >= outerCanvasBottom) {
                var offset = rowHeightOfSelectedRow - outerCanvasHeight;
                if (offset > 0) {
                    offset = 0;
                }
                outerCanvas.scrollTop = expectedScrollTop + offset;
            }
            return false;
        };
        NestedGridControl.prototype.getOffsetTopToParentCanvas = function () {
            var element = this.rootElement;
            var parentCanvas = this._parentCallDurationTree.getCanvas();
            var offsetTop = 0;
            do {
                offsetTop += element.offsetTop;
                element = element.offsetParent;
            } while (element && element !== parentCanvas);
            return offsetTop;
        };
        NestedGridControl.prototype.drawValueCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
            var width = column.width || 20, href;
            var options = this.options();
            var cellElement = this.createElementWithClass("div", options.cellClass + " " + NestedGridControl.ValueCellSelectionClass);
            cellElement.style.width = isNaN(width) ? String(width) : width + "px";
            var value = this.getColumnText(dataIndex, column, columnOrder);
            var rowHeight = this.getRowHeight(rowInfo.rowIndex);
            if (value) {
                var customDrawn = false;
                if (this._hasAction) {
                    var parameterName = _super.prototype.getColumnText.call(this, dataIndex, this.fieldColumn, 0);
                    if (this.isParameterActionable(dataIndex)) {
                        var isSelected = (dataIndex === this.getSelectedDataIndex());
                        var valueTooltip = this.getColumnValue(dataIndex, IntelliTrace.ParameterDataFields.ToolTip, 0);
                        var linkContainerElement = this.createLinkElement(parameterName, value, isSelected, valueTooltip);
                        linkContainerElement.style.height = String(rowHeight - 4) + "px"; // 4 is the height of the padding in the cell element.
                        cellElement.appendChild(linkContainerElement);
                        customDrawn = true;
                    }
                }
                if (!customDrawn) {
                    cellElement.innerText = value;
                }
            }
            else {
                // add non-breaking whitespace to ensure the cell has the same height as non-empty cells
                cellElement.innerHTML = "&nbsp;";
            }
            if (columnOrder === indentIndex && level > 0) {
                this.addTreeIconWithIndent(cellElement, expandedState, level, column);
            }
            if (column.getCellCSSClass) {
                var dataSource = options.source;
                var cellStyle = column.getCellCSSClass(dataIndex, column.index, columnOrder, dataSource);
                if (cellStyle) {
                    var styles = cellStyle.trim().split(" ");
                    for (var index = 0; index < styles.length; index++) {
                        cellElement.classList.add(styles[index]);
                    }
                }
            }
            if (column.rowCss) {
                cellElement.classList.add(column.rowCss);
            }
            rowInfo.row.style.height = String(this.getRowHeight(rowInfo.rowIndex)) + "px";
            return cellElement;
        };
        /* protected */ NestedGridControl.prototype.getRowHeight = function (rowIndex) {
            if ((this.options().source == null) || (rowIndex < 0) || (this.getExpandedCount() <= rowIndex)) {
                return 0;
            }
            var dataIndex = this._getDataIndex(rowIndex);
            if (this._rowHeights.length === 0) {
                var width = this.getLinkElementWidth(this.options().columns[1].width);
                var source = this.options().source;
                for (var i = dataIndex; i < source.length; ++i) {
                    this.calculateRowHeight(i, width);
                }
            }
            return this._rowHeights[dataIndex];
        };
        NestedGridControl.prototype._getAriaLabelForRow = function (rowInfo) {
            var ariaLabel = "";
            var dataIndex = rowInfo.dataIndex;
            var columns = _super.prototype.options.call(this).columns;
            for (var i = 0, l = columns.length; i < l; i++) {
                var column = columns[i];
                if (column.hidden) {
                    continue;
                }
                var columnText = this.getColumnText(dataIndex, column, i);
                var cellText = column.text +
                    ", " +
                    ((column === this.valueColumn && this.isParameterActionable(dataIndex)) ?
                        Microsoft.Plugin.Resources.getString("ParameterHyperlinkScreenreaderIndicator", columnText) :
                        columnText);
                if (ariaLabel) {
                    ariaLabel += ", ";
                }
                ariaLabel += cellText;
            }
            return ariaLabel;
        };
        NestedGridControl.prototype.calculateRowHeight = function (dataIndex, width) {
            var value = this.getColumnValue(dataIndex, IntelliTrace.ParameterDataFields.Value, 0);
            if (this.isParameterActionable(dataIndex)) {
                // 4 is the heights of paddings in the cell element..
                this._rowHeights[dataIndex] = this.measureParamValueSize(value, width).height + 4;
            }
            else {
                this._rowHeights[dataIndex] = this.getMultilineTextHeight(value);
            }
        };
        /// <summary>
        /// Get the width of the element which holds the link in column value. <paramref name="width"/> is the width of the cell element of the column value.
        /// </summary>
        NestedGridControl.prototype.getLinkElementWidth = function (width) {
            return width - 8; // 8 pixel for the padding in the cell element
        };
        NestedGridControl.prototype.createLinkElement = function (parameterName, value, isSelected, valueTooltip) {
            var _this = this;
            if (isSelected != null && isSelected) {
                linkContainerClass = NestedGridControl.paramHyperlinkSelected + " ";
                if (this.isSelectedFromParent) {
                    linkContainerClass += NestedGridControl.DottedBorderClass + " ";
                }
                else {
                    linkContainerClass += NestedGridControl.BorderPlaceHolderClass + " ";
                }
            }
            else {
                var linkContainerClass = NestedGridControl.paramHyperlinkNotSelected + " ";
            }
            linkContainerClass += NestedGridControl.paramLinkSelectionClass + " text-wrapping";
            var linkContainerElement = this.createElementWithClass("div", linkContainerClass);
            var linkElement = this.createElementWithClass("a");
            linkElement.innerText = value;
            this._addMouseUpListener(linkElement, 0, function (e) { _this.executeAction(parameterName); });
            if (valueTooltip != null && valueTooltip !== "") {
                linkElement.setAttribute("data-plugin-vs-tooltip", JSON.stringify({ content: valueTooltip }));
            }
            linkContainerElement.appendChild(linkElement);
            return linkContainerElement;
        };
        /// <summary>
        /// Measure and return the height of a div element which will be holding the <paramref name="value"/>. The width of the div element is set
        /// by <param name="width"/>.
        /// Note the result is the offsetHeight of the div element. It includes the height of the border.
        /// </summary>
        NestedGridControl.prototype.measureParamValueSize = function (value, width) {
            if (width === void 0) { width = 0; }
            var measurementContainer = this.createElementWithClass("div");
            measurementContainer.style.position = "absolute";
            measurementContainer.style.left = "-5000px";
            measurementContainer.style.top = "-5000px";
            measurementContainer.style.width = "1000px";
            measurementContainer.style.height = "500px";
            document.body.appendChild(measurementContainer);
            var linkContainerElement = this.createLinkElement(null, value);
            if (width > 0) {
                // element width is specified, measure the height of multi-line text
                linkContainerElement.style.width = String(width) + "px";
            }
            else {
                // element width isn't specified, make element float to left therefore we can get the necessary width for the text
                linkContainerElement.classList.add("floatleft");
            }
            measurementContainer.appendChild(linkContainerElement);
            var width = linkContainerElement.offsetWidth;
            var height = linkContainerElement.offsetHeight;
            // Remove the hidden element
            document.body.removeChild(measurementContainer);
            return new Common.Controls.Grid.Size(width, height);
        };
        NestedGridControl.prototype.getSelectedParameterName = function () {
            var dataIndex = this.getSelectedDataIndex();
            var parameterName = this.getColumnText(dataIndex, this.fieldColumn, 0);
            return parameterName;
        };
        NestedGridControl.prototype.getSelectedParameterValue = function () {
            var dataIndex = this.getSelectedDataIndex();
            var parameterValue = this.getColumnText(dataIndex, this.valueColumn, 0);
            return parameterValue;
        };
        NestedGridControl.prototype.isSelectedActionable = function () {
            var dataIndex = this.getSelectedDataIndex();
            return this.isParameterActionable(dataIndex);
        };
        NestedGridControl.prototype.isParameterActionable = function (index) {
            return this.getColumnValue(index, IntelliTrace.ParameterDataFields.HasAction, 0);
        };
        NestedGridControl.prototype.removeHyperlinkStyle = function (element) {
            if (element != null) {
                element.classList.remove(NestedGridControl.BorderPlaceHolderClass);
                element.classList.remove(NestedGridControl.DottedBorderClass);
                element.classList.remove(NestedGridControl.paramHyperlinkNotSelected);
                element.classList.remove(NestedGridControl.paramHyperlinkSelected);
            }
        };
        NestedGridControl.prototype.addHyperlinkToActiveSelectedStyle = function (element) {
            if (element != null) {
                element.classList.add(NestedGridControl.DottedBorderClass);
                element.classList.add(NestedGridControl.paramHyperlinkSelected);
            }
        };
        NestedGridControl.prototype.addHyperlinkToInactiveSelectedStyle = function (element) {
            if (element != null) {
                element.classList.add(NestedGridControl.BorderPlaceHolderClass);
                element.classList.add(NestedGridControl.paramHyperlinkSelected);
            }
        };
        NestedGridControl.prototype.addHyperlinkToUnselectedStyle = function (element) {
            if (element != null) {
                element.classList.add(NestedGridControl.BorderPlaceHolderClass);
                element.classList.add(NestedGridControl.paramHyperlinkNotSelected);
            }
        };
        NestedGridControl.prototype.executeAction = function (parameterName) {
            if (parameterName === void 0) { parameterName = null; }
            if (!parameterName) {
                parameterName = this.getSelectedParameterName();
            }
            // get the binding rectangle for action link element
            var elementRect = this.getSelectedLinkElementRect();
            // get the actual width of the link text, since the link element width will always be column width
            var parameterValue = this.getSelectedParameterValue();
            var textWidth = this.measureParamValueSize(parameterValue).width;
            textWidth = Math.min(textWidth, elementRect.width);
            if (elementRect && textWidth) {
                this._adapter._call(IntelliTrace.AdapterCalls.ExecuteAction, this._outerDataIndex, parameterName, elementRect.left, elementRect.top, textWidth, elementRect.height);
            }
            else {
                this._adapter._call(IntelliTrace.AdapterCalls.ExecuteAction, this._outerDataIndex, parameterName, 0, 0, 0, 0);
            }
        };
        // Get the bounding rect for selected row's action link
        NestedGridControl.prototype.getSelectedLinkElementRect = function () {
            var dataIndex = this.getSelectedDataIndex();
            var rowInfo = this.getRowInfo(dataIndex);
            var element = rowInfo.row.querySelector("." + NestedGridControl.paramLinkSelectionClass);
            if (element) {
                return element.getBoundingClientRect();
            }
            else {
                return null;
            }
        };
        NestedGridControl.ParameterNameColumnWidthRatio = 0.2;
        NestedGridControl.ParameterValueColumnWidthRatio = 0.45;
        NestedGridControl.ParameterTypeColumnWidthRatio = 0.35;
        NestedGridControl.paramLinkSelectionClass = "param-link-for-selection";
        NestedGridControl.BorderPlaceHolderClass = "border-placeholder";
        NestedGridControl.DottedBorderClass = "dotted-border";
        NestedGridControl.paramHyperlinkNotSelected = "hyperlink";
        NestedGridControl.paramHyperlinkSelected = "calltree-hyperlink-selected";
        NestedGridControl.ValueCellSelectionClass = "value-cell-for-selection";
        return NestedGridControl;
    }(IntelliTrace.CustomGridControl));
    IntelliTrace.NestedGridControl = NestedGridControl;
})(IntelliTrace || (IntelliTrace = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ExternalReferences.ts" />
/// <reference path="CustomGridControl.ts" />
/// <reference path="NestedGridControl.ts" />
/// <reference path="ViewModelContracts.ts" />
var IntelliTrace;
(function (IntelliTrace) {
    (function (EventHandlingResult) {
        EventHandlingResult[EventHandlingResult["COMPLETE"] = 0] = "COMPLETE";
        EventHandlingResult[EventHandlingResult["PARTIAL"] = 1] = "PARTIAL";
        EventHandlingResult[EventHandlingResult["NONE"] = 2] = "NONE";
    })(IntelliTrace.EventHandlingResult || (IntelliTrace.EventHandlingResult = {}));
    var EventHandlingResult = IntelliTrace.EventHandlingResult;
    var MethodDetail = (function () {
        function MethodDetail() {
            this.isExpanded = false;
            this.parameterData = null;
            this.isDataReady = false;
            this.detailElement = null;
            this.detailElementHeight = 0;
            this.callDurationElement = null;
            this.descriptionElement = null;
            this.signatureElement = null;
            this.signatureHeight = 0;
            this.gridControl = null;
            this.isDirty = false;
        }
        return MethodDetail;
    }());
    IntelliTrace.MethodDetail = MethodDetail;
    var CallDurationTree = (function (_super) {
        __extends(CallDurationTree, _super);
        function CallDurationTree(adapter, root) {
            // construction sequence:
            // base class sets up the states and two timers: one for attaching
            // events, the other for layout.
            // These two timers are fired (possibly) before we got data.
            // Then init() is called to setup the grid columns and request
            // data. After the data is returned, we set the data source to the
            // grid and then relayout.
            var options = new Common.Controls.Grid.GridOptions(null, null, null, null);
            options.rowClass = "grid-row-no-hover";
            options.rowSelectedClass = "grid-row-selected-no-hover";
            options.rowSelectedBlurClass = options.rowSelectedClass;
            options.coreCssClass += " not-passthrough-pointer-events";
            options.ariaLabel = Microsoft.Plugin.Resources.getString("CallDurationTree");
            _super.call(this, root, options);
            this._adapter = adapter;
            this._frameNameHeight = [];
            this._methodDetails = {};
            this._stopAutoResizing = false;
            this._dataIndexOfHoveredRow = CallDurationTree.InvalidDataIndexForSelection;
            this._pendingLayout = false;
            this._pendingLayoutTimeoutId = 0;
            this._debugEventLinkWidth = -1;
            this._debugEventLinkWidthAdjustment = 15;
            this._selectedSlowestNodeDataIndex = CallDurationTree.InvalidDataIndexForSelection;
            this._lastSelectedDataIndex = CallDurationTree.InvalidDataIndexForSelection;
        }
        Object.defineProperty(CallDurationTree.prototype, "selectedNestedGrid", {
            get: function () {
                return this._selectedNestedGrid;
            },
            set: function (value) {
                if (this.selectedNestedGrid === value) {
                    return;
                }
                if (this._selectedNestedGrid) {
                    this._selectedNestedGrid.isSelectedFromParent = false;
                }
                this._selectedNestedGrid = value;
                if (this._selectedNestedGrid) {
                    this._selectedNestedGrid.isSelectedFromParent = true;
                    // If no row is selected in nested grid, select the first row, otherwise keep the current selection
                    if (this._selectedNestedGrid.getSelectedRowIndex() < 0) {
                        this.selectedNestedGrid._addSelection(0);
                    }
                }
                // no selection style will be applied when nested grid is selected
                // update selection style to make sure all selection styles are removed
                this._updateSelectionStyles();
            },
            enumerable: true,
            configurable: true
        });
        CallDurationTree.prototype.init = function (done) {
            var _this = this;
            // Initialize grid control columns
            // Custom draw the first column to add icon and text color
            this._callDurationColumn = new Common.Controls.Grid.ColumnInfo(IntelliTrace.StackFrameDataFields.TotalTime, Microsoft.Plugin.Resources.getString("TotalTimeColumnHeader"), Microsoft.Plugin.Resources.getString("TotalTimeColumnHeaderTooltip"), CallDurationTree.DefaultTotalTimeColumnWidth, false);
            this._callDurationColumn.getCellContents = this.drawCallDurationCell.bind(this);
            // Custom draw the second column to enable method detail expand
            this._frameNameColumn = new Common.Controls.Grid.ColumnInfo(IntelliTrace.StackFrameDataFields.Signature, Microsoft.Plugin.Resources.getString("MethodNameColumnHeader"), Microsoft.Plugin.Resources.getString("MethodNameColumnHeaderTooltip"), CallDurationTree.DefaultMethodNameColumnWidth, false);
            this._frameNameColumn.getCellContents = this.drawStackFrameCell.bind(this);
            var columns = [this._callDurationColumn, this._frameNameColumn];
            this._adapter.addEventListener(IntelliTrace.AdapterCalls.ExpandItemInExecutionTreeEvent, function (eventArgs) {
                var expandItemEventArgs = eventArgs;
                if (expandItemEventArgs != null) {
                    var dataIndex = expandItemEventArgs.DataIndex;
                    _this.expandItemByDataIndex(dataIndex);
                }
            });
            this._adapter._call(IntelliTrace.AdapterCalls.GetStackFrames).done(function (result) {
                var itemsSource = (result);
                var selectedDataIndex = itemsSource.SelectedDataIndex;
                // use data index to initialize members
                for (var i = 0; i < itemsSource.RowViewModels.length; ++i) {
                    var rowViewModel = itemsSource.RowViewModels[i];
                    var description = rowViewModel[IntelliTrace.StackFrameDataFields.Description];
                    // create method detail when has parameter or description string 
                    if (rowViewModel[IntelliTrace.StackFrameDataFields.HasParameters] || (description && (description !== ""))) {
                        _this._methodDetails[i] = new MethodDetail();
                        if (!rowViewModel[IntelliTrace.StackFrameDataFields.HasParameters]) {
                            // If the method doesn't have parameters at all, we have all the needed data when description is available.
                            _this._methodDetails[i].isDataReady = true;
                        }
                    }
                }
                // Don't set the selected row index. There is no row yet and it's hard to predict the row index from data index now.
                _this.setDataSource(itemsSource.RowViewModels, itemsSource.ExpandStates, columns, null);
                // Initialize row tops
                _this.calcRowTops(0);
                _this.expandItemByDataIndex(selectedDataIndex);
                done();
            });
            this._adapter.addEventListener(IntelliTrace.AdapterCalls.StartDebugCurrentSelectionEvent, function () {
                var selectedDataIndex = _super.prototype.getSelectedDataIndex.call(_this);
                if (selectedDataIndex >= 0) {
                    _this._adapter._call(IntelliTrace.AdapterCalls.StartDebugging, selectedDataIndex);
                }
            });
        };
        /*protected*/ CallDurationTree.prototype._onContainerResize = function (e) {
            /*
             * HTML page usually won't receive a size change event on window initialize.
             * This happens to work in our scenario only because VS tool window resize itself on initialize.
             */
            if (!this._stopAutoResizing) {
                var headerWidth = this.getVisibleWidth();
                this._callDurationColumn.width = headerWidth * 0.1;
                if (this._callDurationColumn.width > CallDurationTree.MaxTotalTimeColumnWidth) {
                    this._callDurationColumn.width = CallDurationTree.MaxTotalTimeColumnWidth;
                }
                else if (this._callDurationColumn.width < CallDurationTree.MinTotalTimeColumnWidth) {
                    this._callDurationColumn.width = CallDurationTree.MinTotalTimeColumnWidth;
                }
                this.adjustWidth(headerWidth, this._callDurationColumn.width);
            }
            _super.prototype._onContainerResize.call(this, e);
        };
        /// <summary>Custom drawing of the call duration cell with method icon and highlighted text
        /// </summary>
        /// <param name="rowInfo" type="Object">The information about grid row that is being rendered.</param>
        /// <param name="dataIndex" type="Number">The index of the row.</param>
        /// <param name="expandedState" type="Number">Number of children in the tree under this row recursively.</param>
        /// <param name="level" type="Number">The hierarchy level of the row.</param>
        /// <param name="column" type="Object">Information about the column that is being rendered.</param>
        /// <param name="indentIndex" type="Number">Index of the column that is used for the indentation.</param>
        /// <param name="columnOrder" type="Number">The display order of the column.</param>
        /// <returns>Returns html element representing the requested grid cell. The first returned element will be appended
        /// to the row (unless the function returns <c>null</c> or <c>undefined</c>).</returns>
        CallDurationTree.prototype.drawCallDurationCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
            // Get Column text
            var value = _super.prototype.getColumnText.call(this, dataIndex, column, 0);
            if (!value || value === "") {
                value = "0"; // show "0 ms" when the call duration isn't available
            }
            value = Microsoft.Plugin.Resources.getString("CallDurationCellText", value);
            var flameIconClass = "icon-placeholder";
            var flameIconTooltip = "";
            var flameIconAltText = "";
            if (dataIndex === this._selectedSlowestNodeDataIndex) {
                // Special case for the slowest node. This slowest node is still in the hot path.
                flameIconClass = "large-flame-icon";
                flameIconTooltip = Microsoft.Plugin.Resources.getString("SlowestNodeTooltip");
                flameIconAltText = Microsoft.Plugin.Resources.getString("SlowestNodeAltText");
            }
            else if (this.isInHotPath(dataIndex, Math.abs(expandedState))) {
                flameIconClass = "small-flame-icon";
                flameIconTooltip = Microsoft.Plugin.Resources.getString("HotpathTooltip");
                flameIconAltText = Microsoft.Plugin.Resources.getString("HotpathNodeAltText");
            }
            // Get tooltip
            var startTime = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.StartTime, columnOrder);
            var endTime = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.EndTime, columnOrder);
            var totalTime = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.TotalTime, columnOrder);
            var selfTime = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.SelfTime, columnOrder);
            var valueTooltip = Microsoft.Plugin.Resources.getString("TotalTimeColumnTooltip", startTime, endTime, totalTime, selfTime);
            var cellElement = this.createTreeIconCell(expandedState, level, column, value, valueTooltip, flameIconClass, flameIconTooltip, flameIconAltText);
            cellElement.classList.add(CallDurationTree.DurationCellSelectionClass);
            cellElement.style.height = String(this.getFrameNameHeight(dataIndex) - CallDurationTree.RowBorderHeight) + "px";
            if (cellElement.innerText !== "") {
                var highlight = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Highlight, columnOrder);
                if (highlight) {
                    // The text highlight needs to be turned off when the row is selected. HighlightCellClass is
                    // added so later we can use getElementsByClassName() to find the cell element from the row.                    
                    cellElement.classList.add(CallDurationTree.HighlightCellClass);
                    cellElement.classList.add(CallDurationTree.HighlightTextClass);
                }
                var selectedDataIndex = this.getSelectedDataIndex();
                if (dataIndex === this._dataIndexOfHoveredRow && dataIndex !== selectedDataIndex) {
                    // show the hover effect.
                    if (highlight) {
                        //If a row is highlighted, we should still color it red
                        cellElement.classList.add(CallDurationTree.HighlightHoverClass);
                    }
                    else {
                        cellElement.classList.add(CallDurationTree.RowHoverClass);
                    }
                }
            }
            if (this._methodDetails.hasOwnProperty(dataIndex)) {
                this._methodDetails[dataIndex].callDurationElement = cellElement;
            }
            return cellElement;
        };
        /*protected*/ CallDurationTree.prototype._drawRows = function (visibleRange, includeNonDirtyRows) {
            var dirtyMethodDetails = [];
            // super._drawRows() will set row element's innerHTML = "" which will destroy all its descendents.
            // We need to temporarily move methodDetail element to a new parent and avoid getting destroyed.
            for (var i = 0; i < visibleRange.length; ++i) {
                var dataIndex = visibleRange[i].dataIndex;
                if (this._methodDetails.hasOwnProperty(dataIndex) && this._methodDetails[dataIndex].detailElement) {
                    var methodDetail = this._methodDetails[dataIndex];
                    if (methodDetail.isDirty && methodDetail.gridControl) {
                        dirtyMethodDetails.push(methodDetail);
                    }
                    var rowIndex = visibleRange[i].rowIndex;
                    var row = _super.prototype.getRowInfo.call(this, dataIndex);
                    if (row && (row.rowIndex !== rowIndex || row.isDirty || includeNonDirtyRows) && methodDetail.detailElement.parentElement) {
                        // It's expensive to draw a nested gridControl so we want to reuse the HTMLElement once created.
                        // However gridControl will destroy old row's all descendent elements on redraw and this will destroy 
                        // the nested gridControl as well. remove detailElement from row's descendent tree and avoid 
                        // getting destroyed
                        methodDetail.detailElement.parentElement.removeChild(methodDetail.detailElement);
                    }
                }
            }
            _super.prototype._drawRows.call(this, visibleRange, includeNonDirtyRows);
            this.addTooltipForClasses(CallDurationTree.DescriptionTextElementSelectionClass, CallDurationTree.SignatureElementSelectionClass);
            // Now parent gridControl already finished drawing the row elements. We need to re-draw the dirty nested grids
            // this can't be done earlier since the parent row element isn't ready yet and nested gridControl will have 0 
            // canvas height
            // TODO: We may need to review this. In drawing rows
            // (super._drawRows) in the outer grid control, some
            // states may be changed in the nested grid control
            // (e.g. checkUpdateActive may try to set the selected
            // row in the nested grid control active).
            for (var j = 0; j < dirtyMethodDetails.length; ++j) {
                dirtyMethodDetails[j].isDirty = false;
                dirtyMethodDetails[j].gridControl.layout();
            }
        };
        /// <summary>Custom drawing of the stack frame cell, it will fallback to default drawing if the stack frame is not expandable.
        /// Otherwise it will draw a cell with nested grid control
        /// </summary>
        /// <param name="rowInfo" type="Object">The information about grid row that is being rendered.</param>
        /// <param name="dataIndex" type="Number">The index of the row.</param>
        /// <param name="expandedState" type="Number">Number of children in the tree under this row recursively.</param>
        /// <param name="level" type="Number">The hierarchy level of the row.</param>
        /// <param name="column" type="Object">Information about the column that is being rendered.</param>
        /// <param name="indentIndex" type="Number">Index of the column that is used for the indentation.</param>
        /// <param name="columnOrder" type="Number">The display order of the column.</param>
        /// <returns>Returns html element representing the requested grid cell. The first returned element will be appended
        /// to the row (unless the function returns <c>null</c> or <c>undefined</c>).</returns>
        CallDurationTree.prototype.drawStackFrameCell = function (rowInfo, dataIndex, expandedState, level, column, indentIndex, columnOrder) {
            // Get Column text and expand state
            var signature = _super.prototype.getColumnText.call(this, dataIndex, column, columnOrder);
            var description = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Description, columnOrder);
            var hasParameter = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.HasParameters, columnOrder);
            var descriptionHeight = this.getFrameNameHeight(dataIndex);
            var nestedGridHeight = 0;
            var cellElement = null;
            var descriptionElement = null;
            var descriptionTextElement = null;
            var maxDescriptionTextElementWidth = 0;
            var debugEventLinkElementExtraClass = null;
            var selectedDataIndex = this.getSelectedDataIndex();
            // Use custom drawing only when data is ready, and data contains parameter or description 
            if (signature && signature !== "" && (hasParameter || (description && (description !== "")))) {
                // create the main cell element
                cellElement = _super.prototype.createElementWithClass.call(this, "div", "method-detail-grid-cell");
                cellElement.style.width = String(column.width) + "px";
                // create the element to hold the stack frame text, tree icon and the link.
                descriptionElement = _super.prototype.createElementWithClass.call(this, "div", CallDurationTree.BorderPlaceHolderClass);
                descriptionElement.style.width = String(column.width) + "px";
                descriptionElement.style.height = String(descriptionHeight - CallDurationTree.RowBorderHeight) + "px";
                // Add a tree-sign in front of the text and leave space for the expand icon
                var treeIcon = this.createElementWithClass("div", "icon floatleft " + CallDurationTree.MethodDetailExpandIconClass);
                treeIcon.setAttribute("role", "button");
                treeIcon.setAttribute("aria-label", Microsoft.Plugin.Resources.getString("ShowMethodDetailsButton"));
                descriptionElement.appendChild(treeIcon);
                descriptionTextElement = _super.prototype.createElementWithClass.call(this, "div", "grid-cell-nested-text floatleft " + CallDurationTree.DescriptionTextElementSelectionClass);
                descriptionTextElement.innerText = (description && description !== "") ? description : signature;
                descriptionTextElement.style.marginLeft = String(IntelliTrace.CustomGridControl.IconWidth) + "px";
                maxDescriptionTextElementWidth = column.width - IntelliTrace.CustomGridControl.IconWidth;
                descriptionElement.appendChild(descriptionTextElement);
                cellElement.appendChild(descriptionElement);
                debugEventLinkElementExtraClass = "grid-cell-action-div ";
                // It's possible that the data is not returned from the view model before layout begins.
                // This happens especially when there is a mouse over event on the row. That will trigger a layout.
                if (this._methodDetails.hasOwnProperty(dataIndex) && this._methodDetails[dataIndex].isExpanded && this._methodDetails[dataIndex].isDataReady) {
                    treeIcon.classList.add("method-detail-expanded");
                    treeIcon.setAttribute("aria-pressed", "true");
                    // ensure nested method detail element is created
                    this.ensureMethodDetailElementCreated(dataIndex);
                    var detailElement = this._methodDetails[dataIndex].detailElement;
                    cellElement.appendChild(detailElement);
                    nestedGridHeight = this._methodDetails[dataIndex].detailElementHeight;
                    cellElement.setAttribute("aria-expanded", "true");
                }
                else {
                    treeIcon.classList.add("method-detail-collapsed");
                    treeIcon.setAttribute("aria-pressed", "false");
                    cellElement.setAttribute("aria-expanded", "false");
                }
            }
            else {
                descriptionElement = this.createElementWithClass("div", this.options().cellClass + " " + CallDurationTree.BorderPlaceHolderClass);
                descriptionElement.style.width = String(column.width) + "px";
                descriptionElement.style.height = String(descriptionHeight) + "px";
                descriptionTextElement = this.createElementWithClass("div", "floatleft show-ellipsis " + CallDurationTree.DescriptionTextElementSelectionClass);
                maxDescriptionTextElementWidth = column.width;
                if (signature) {
                    descriptionTextElement.innerText = signature;
                }
                descriptionElement.appendChild(descriptionTextElement);
                cellElement = descriptionElement;
                debugEventLinkElementExtraClass = " ";
            }
            if (dataIndex === selectedDataIndex || dataIndex === this._dataIndexOfHoveredRow) {
                debugEventLinkElementExtraClass += CallDurationTree.VisibleElementClass;
            }
            else {
                debugEventLinkElementExtraClass += CallDurationTree.InvisibleElementClass;
            }
            var debugEventLinkElement = this.createDebugEventLinkElement(dataIndex, debugEventLinkElementExtraClass, dataIndex === selectedDataIndex);
            descriptionElement.appendChild(debugEventLinkElement);
            if (dataIndex === selectedDataIndex || dataIndex === this._dataIndexOfHoveredRow) {
                // The descriptionElement layout is float from left to right, then from top to bottom.
                // The child elements need to be on the same line. Without _debugEventLinkWidthAdjustment, the descriptionTextElement will be too
                // wide and push debugEventLinkElement to the next line.
                maxDescriptionTextElementWidth -= this.getDebugEventLinkWidth() + this._debugEventLinkWidthAdjustment;
                if (dataIndex === this._dataIndexOfHoveredRow && dataIndex !== selectedDataIndex) {
                    // show the hover effect.
                    descriptionElement.classList.add(CallDurationTree.RowHoverClass);
                }
            }
            descriptionTextElement.style.maxWidth = String(maxDescriptionTextElementWidth) + "px";
            if (this._methodDetails.hasOwnProperty(dataIndex)) {
                this._methodDetails[dataIndex].descriptionElement = descriptionElement;
            }
            rowInfo.row.style.height = String(descriptionHeight + nestedGridHeight) + "px";
            return cellElement;
        };
        /*protected*/ CallDurationTree.prototype._attachEvents = function () {
            var _this = this;
            _super.prototype._attachEvents.call(this);
            this.addEventListenerToCanvas("dblclick", this, this.onDbClick);
            this.addEventListenerToCanvas("mouseover", this, this.onMouseOver);
            // mouseleave event is IE only.
            this.addEventListenerToCanvas("mouseleave", this, this.onMouseLeave);
            this.addEventListenerToCanvas(IntelliTrace.CustomEvents.NestedGridControlHeightChanged, this, this.onNestedGridControlHeightChanged);
            this.addEventListenerToCanvas(IntelliTrace.CustomEvents.NestedGridControlHasMouseDown, this, this.onNestedGridControlMouseDown);
            var element = this.getElement();
            element.addEventListener("columnresize", function (e) {
                _this._onColumnResizeEvent(e.customData);
            });
        };
        CallDurationTree.prototype.onNestedGridControlHeightChanged = function (e) {
            var dataIndex = e.customData[0];
            this.handleNestedGridControlHeightChanged(dataIndex);
        };
        CallDurationTree.prototype.onNestedGridControlMouseDown = function (e) {
            var dataIndex = e.customData[0];
            var rowIndex = this._getRowIndex(dataIndex);
            this._clearSelection();
            this._addSelection(rowIndex, dataIndex);
            var methodDetail = this._methodDetails[dataIndex];
            if (methodDetail != null && methodDetail.isExpanded && methodDetail.gridControl != null) {
                this.selectedNestedGrid = methodDetail.gridControl;
                if (this._shouldSetFocusAfterMouseLeave) {
                    this.selectedNestedGrid.setFocusOnSelectedRow();
                    this._shouldSetFocusAfterMouseLeave = false;
                }
            }
        };
        CallDurationTree.prototype._onColumnResizeEvent = function (columns) {
            for (var i = 0; i < columns.length; ++i) {
                var column = columns[i];
                if (column === this._frameNameColumn) {
                    // get visible row range to decide whether we need to relayout the whole tree
                    var visibleIndices = _super.prototype.getVisibleRowIndices.call(this);
                    var firstIndex = visibleIndices.first;
                    var lastIndex = visibleIndices.last;
                    // magic number 3, peek the upper and lower rows and get the max indent
                    var predictedFirstIndex = Math.max(0, firstIndex - 3);
                    var maxIndex = _super.prototype.getExpandedCount.call(this);
                    var predictedLastIndex = Math.min(maxIndex, lastIndex + 3);
                    var needUpdate = false;
                    var minDataIndexToCalculateRowTops = -1; // -1 means not to calculate.
                    for (var j = 0; j < maxIndex; ++j) {
                        var dataIndex = _super.prototype._getDataIndex.call(this, j);
                        var methodDetail = this._methodDetails[dataIndex];
                        if (methodDetail && methodDetail.detailElement) {
                            methodDetail.detailElement.style.width = String(column.width) + "px";
                            if (methodDetail.gridControl) {
                                var parameterGridWidth = this.getParameterGridWidth();
                                methodDetail.gridControl.updateColumnWidths(parameterGridWidth);
                                methodDetail.isDirty = true;
                                // At this point, the nested grid control may not attach to the outer grid control.
                                // Instead of relying on the event NestedGridControlHeightChanged for re-calculation, 
                                // we need to calculate the height and row tops. That event will go nowhere since the nested grid control isn't in the DOM yet.
                                this.adjustMethodDetailElementHeight(dataIndex);
                                if (minDataIndexToCalculateRowTops === -1) {
                                    minDataIndexToCalculateRowTops = dataIndex;
                                }
                            }
                            if (methodDetail.isExpanded && j >= predictedFirstIndex && j <= predictedLastIndex) {
                                needUpdate = true;
                            }
                        }
                    }
                    if (minDataIndexToCalculateRowTops !== -1) {
                        var rowIndex = this._getRowIndex(minDataIndexToCalculateRowTops);
                        this.calcRowTops(rowIndex);
                    }
                    if (needUpdate) {
                        // need to redraw. Otherwise, the nested grid control will have scroll bar when the column shrinks.
                        _super.prototype.layout.call(this);
                    }
                }
            }
        };
        /*protected*/ CallDurationTree.prototype._onThemeChanged = function (e) {
            var _this = this;
            // Daytona has changed the CSS values when this event happens. IE may apply the change to DOM in later render pass.
            // While we redraw and relayout, we need to calculate the width of "Debug This Call" link.
            // The way we do it is create a div element, append it to DOM, and measure the width of the element.
            // we use a time out and hope the new CSS values are applied to DOM.
            setTimeout(function () {
                // reset these values so that they're recalculated after the theme is changed.
                _this._frameNameHeight = [];
                _this._debugEventLinkWidth = -1;
                _super.prototype._onThemeChanged.call(_this, e);
                _this.layoutAfterHeightChanged(0);
            }, 100);
        };
        /*protected*/ CallDurationTree.prototype.checkUpdateActive = function (rowInfo) {
            if (this.isSelectedGridHandleFocus()) {
                this.selectedNestedGrid.setActiveRow();
                return;
            }
            _super.prototype.checkUpdateActive.call(this, rowInfo);
        };
        /* protected */ CallDurationTree.prototype._onFocus = function (e) {
            if (!this.isSelectedGridHandleFocus()) {
                return _super.prototype._onFocus.call(this, e);
            }
        };
        /* protected */ CallDurationTree.prototype._onRowElementFocus = function (e) {
            if (!this.isSelectedGridHandleFocus()) {
                return _super.prototype._onRowElementFocus.call(this, e);
            }
        };
        /*protected*/ CallDurationTree.prototype._onBlur = function (e) {
            _super.prototype._onBlur.call(this, e);
            this.removeMouseHoverOnHoveredRow();
        };
        /* protected */ CallDurationTree.prototype._updateAriaAttribute = function () {
            if (!this.isSelectedGridHandleFocus()) {
                _super.prototype._updateAriaAttribute.call(this);
            }
        };
        /*protected*/ CallDurationTree.prototype._onRowMouseDown = function (e) {
            this._lastClickOnTreeIcon = false;
            this._shouldSetFocusAfterMouseLeave = false;
            var rowInfo = this.getRowInfoFromEvent(e, "." + this.options().rowClass);
            if (rowInfo) {
                var targetElement = e.target;
                if (e.which === 1) {
                    if (targetElement.classList.contains(CallDurationTree.MethodDetailExpandIconClass)) {
                        this._lastClickOnTreeIcon = true;
                        this.toggleMethodDetail(rowInfo);
                    }
                    else if (targetElement.classList.contains("grid-tree-icon")) {
                        this._lastClickOnTreeIcon = true;
                    }
                    else {
                        this.selectedNestedGrid = null;
                    }
                    _super.prototype._onRowMouseDown.call(this, e);
                }
            }
        };
        CallDurationTree.prototype.onMouseOver = function (e) {
            var rowInfo = this.getRowInfoFromEvent(e, "." + this.options().rowClass);
            if (rowInfo) {
                if (this._dataIndexOfHoveredRow !== rowInfo.dataIndex) {
                    var previousDataIndexOfHoveredRow = this._dataIndexOfHoveredRow;
                    this._dataIndexOfHoveredRow = rowInfo.dataIndex;
                    if (previousDataIndexOfHoveredRow !== this.getSelectedDataIndex()) {
                        this.removeMouseHoverAtDataIndex(previousDataIndexOfHoveredRow);
                    }
                    if (this._dataIndexOfHoveredRow !== this.getSelectedDataIndex()) {
                        this.addMouseHoverOnRow(rowInfo);
                    }
                    else {
                        // There is not hovered row, reset the index.
                        this._dataIndexOfHoveredRow = CallDurationTree.InvalidDataIndexForSelection;
                    }
                }
            }
        };
        CallDurationTree.prototype.onMouseLeave = function (e) {
            this.removeMouseHoverOnHoveredRow();
            this._shouldSetFocusAfterMouseLeave = true;
        };
        // start debugging on double clicking an item
        CallDurationTree.prototype.onDbClick = function (e) {
            if (this._lastClickOnTreeIcon) {
                // Inadvertly double clicking on tree glyph and causing debugging proved to be a confusing experience
                // To workaround this, if the last click is on tree glyph, ignore this double click
                this._lastClickOnTreeIcon = false;
            }
            else {
                var rowInfo = this.getRowInfoFromEvent(e, "." + this.options().rowClass);
                if (rowInfo) {
                    var methodDetail = this._methodDetails[rowInfo.dataIndex];
                    var detailElement = this.findClosestElement(e.target, ".grid-method-detail");
                    if (methodDetail != null && detailElement === methodDetail.detailElement) {
                    }
                    else {
                        this._adapter._call(IntelliTrace.AdapterCalls.StartDebugging, rowInfo.dataIndex);
                    }
                }
            }
        };
        CallDurationTree.prototype.toggleMethodDetail = function (rowInfo) {
            var _this = this;
            var methodDetail = this._methodDetails[rowInfo.dataIndex];
            if (methodDetail) {
                // toggle method detail expand state when clicking on the expand icon
                methodDetail.isExpanded = !methodDetail.isExpanded;
                if (methodDetail.isExpanded) {
                    // redraw when method detail data is ready
                    this.fetchMethodDetailAndRedraw(rowInfo.dataIndex, function () {
                        _this.layoutAfterHeightChanged(rowInfo.rowIndex);
                    });
                }
                else {
                    this.layoutAfterHeightChanged(rowInfo.rowIndex);
                }
            }
        };
        // Return true if the keyboard event is not processed
        /*protected*/ CallDurationTree.prototype._onKeyDown = function (e) {
            // Let the base class handle tabbing, so that we can tab out of the tree.
            if (e.keyCode == Common.KeyCodes.TAB) {
                return _super.prototype._onKeyDown.call(this, e);
            }
            e.preventDefault(); // especially preventing space bar scrolling the view.
            this._shouldSetFocusAfterMouseLeave = false;
            if ((this.getSelectedRowIndex() < 0) && (this.getExpandedCount() > 0)) {
                _super.prototype._addSelection.call(this, 0);
            }
            if ((e.keyCode === Common.KeyCodes.PAGE_DOWN) || (e.keyCode === Common.KeyCodes.PAGE_UP)) {
                this.handlePageUpPageDown(e);
                return false;
            }
            // If selected item has details space will toggle expand
            if (e.keyCode == Common.KeyCodes.SPACE) {
                this.handleKeyCodeSpace();
                return false;
            }
            if (e.keyCode === Common.KeyCodes.ENTER && this.selectedNestedGrid == null) {
                this._adapter._call(IntelliTrace.AdapterCalls.StartDebugging, this.getSelectedDataIndex());
                return false;
            }
            var handledResult = EventHandlingResult.NONE;
            // Up/Down key may navigate from outer grid into nested grid
            if ((e.keyCode == Common.KeyCodes.ARROW_UP) || (e.keyCode == Common.KeyCodes.ARROW_DOWN)) {
                handledResult = this.handleKeyCodeUpDown(e);
            }
            // Ask whether a nested grid wants to handle the event
            if (handledResult === EventHandlingResult.NONE
                && ((e.keyCode == Common.KeyCodes.ARROW_UP) || (e.keyCode == Common.KeyCodes.ARROW_DOWN)
                    || (e.keyCode == Common.KeyCodes.ARROW_LEFT) || (e.keyCode == Common.KeyCodes.ARROW_RIGHT)
                    || (e.keyCode == Common.KeyCodes.ENTER))) {
                handledResult = this.handleByNestedGrid(e);
            }
            var result = false;
            switch (handledResult) {
                case EventHandlingResult.NONE:
                    this._updateSelectionStyles();
                    result = _super.prototype._onKeyDown.call(this, e);
                    break;
                case EventHandlingResult.COMPLETE:
                    result = true;
                    break;
                case EventHandlingResult.PARTIAL:
                    if (this._selectedNestedGrid === null) {
                        var rowInfo = this.getRowInfo(this.getSelectedDataIndex());
                        this.checkUpdateActive(rowInfo);
                        this._updateSelectionStyles();
                        this.getSelectedRowIntoView();
                    }
                    result = true;
                    break;
                default:
                    result = false;
                    break;
            }
            return result;
        };
        // Handle SPACE keyboard events
        // Return true if the keyboard event is handled
        CallDurationTree.prototype.handleKeyCodeSpace = function () {
            var selectedDataIndex = this.getSelectedDataIndex();
            if (selectedDataIndex < 0) {
                return false;
            }
            if (this._methodDetails.hasOwnProperty(selectedDataIndex)) {
                var methodDetail = this._methodDetails[selectedDataIndex];
                this.toggleMethodDetail(_super.prototype.getRowInfo.call(this, selectedDataIndex));
                // Set selection to nested grid control
                if (methodDetail.isExpanded && methodDetail.gridControl) {
                    this.selectedNestedGrid = methodDetail.gridControl;
                }
                else {
                    this.selectedNestedGrid = null;
                    var rowInfo = this.getRowInfo(selectedDataIndex);
                    this.checkUpdateActive(rowInfo);
                }
                return true;
            }
            return false;
        };
        // If there is no nested grid selected, UP/DOWN key may cause one getting selected
        // Return true if the keyboard event is handled
        CallDurationTree.prototype.handleKeyCodeUpDown = function (e) {
            if (this.selectedNestedGrid) {
                return EventHandlingResult.NONE;
            }
            var selectedRowIndex = this.getSelectedRowIndex();
            var selectedDataIndex = this.getSelectedDataIndex();
            if ((selectedRowIndex < 0) || (selectedDataIndex < 0)) {
                return EventHandlingResult.NONE;
            }
            if ((e.keyCode == Common.KeyCodes.ARROW_DOWN) && this._methodDetails.hasOwnProperty(selectedDataIndex)) {
                // If ARROW_DOWN and the nested grid of current row is expanded
                var methodDetail = this._methodDetails[selectedDataIndex];
                if (methodDetail.isExpanded && methodDetail.gridControl) {
                    this.selectedNestedGrid = methodDetail.gridControl;
                    this.selectedNestedGrid._clearSelection();
                    this.selectedNestedGrid._addSelection(0);
                    this.selectedNestedGrid.getSelectedRowIntoView();
                    return EventHandlingResult.COMPLETE;
                }
            }
            else if ((e.keyCode == Common.KeyCodes.ARROW_UP) && (selectedRowIndex > 0)) {
                var previousDataIndex = this._getDataIndex(selectedRowIndex - 1);
                if (previousDataIndex >= 0 && this._methodDetails.hasOwnProperty(previousDataIndex)) {
                    // If ARROW_UP and the nested grid of previous row is expanded
                    var methodDetail = this._methodDetails[previousDataIndex];
                    if (methodDetail.isExpanded && methodDetail.gridControl) {
                        this._clearSelection();
                        this._addSelection(selectedRowIndex - 1);
                        this.selectedNestedGrid = methodDetail.gridControl;
                        this.selectedNestedGrid._clearSelection();
                        this.selectedNestedGrid._addSelection(this.selectedNestedGrid.getExpandedCount() - 1);
                        this.selectedNestedGrid.getSelectedRowIntoView();
                        return EventHandlingResult.COMPLETE;
                    }
                }
            }
            return EventHandlingResult.NONE;
        };
        // If a nested grid is selected, let it handle ARROW_LEFT, ARROW_RIGHT, ARROW_UP, ARROW_DOWN keyboard events
        // Return true if the keyboard event is handled
        CallDurationTree.prototype.handleByNestedGrid = function (e) {
            var selectedDataIndex = this.getSelectedDataIndex();
            if (selectedDataIndex < 0) {
                return EventHandlingResult.NONE;
            }
            // If there is already a selected nested grid, check whether it should handle the event
            if (this.selectedNestedGrid && this._methodDetails.hasOwnProperty(selectedDataIndex)) {
                var methodDetail = this._methodDetails[selectedDataIndex];
                if (methodDetail.isExpanded && methodDetail.gridControl && (methodDetail.gridControl == this.selectedNestedGrid))
                    if (methodDetail.gridControl.handleKeyDownEventInOuterGrid(e)) {
                        if ((e.keyCode === Common.KeyCodes.ARROW_UP) || (e.keyCode === Common.KeyCodes.ARROW_LEFT)) {
                            // currently it always because keyboard trying to navigate out of nested grid
                            this.selectedNestedGrid = null;
                            // If keyboard is going up, keep current item selected and return.
                            // (and selection style will go from nested grid to method name)
                            return EventHandlingResult.PARTIAL;
                        }
                        else {
                            // (e.keyCode === Common.KeyCodes.ARROW_DOWN || (e.keyCode === Common.KeyCodes.ARROW_RIGHT))
                            // if the selectedNestedGrid is at the last row of the outer grid, return COMPLETE so that the outer grid doesn't handle
                            // this event. If the outer grid handles the event in this case, it will select the same row which is the last row
                            // and highlight the descriptionElement. This causes the cycling effect: the highlighting is going from the last row
                            // back to the beginning.
                            var selectedRowIndex = this._getRowIndex(selectedDataIndex);
                            if (selectedRowIndex === this.getExpandedCount() - 1) {
                                return EventHandlingResult.COMPLETE;
                            }
                            else {
                                // it's navigating out of the nested grid.
                                this.selectedNestedGrid = null;
                                return EventHandlingResult.NONE;
                            }
                        }
                    }
                    else {
                        // Nested grid handled the keyboard event
                        return EventHandlingResult.COMPLETE;
                    }
            }
            return EventHandlingResult.NONE;
        };
        CallDurationTree.prototype.handlePageUpPageDown = function (e) {
            if (e.shiftKey || e.ctrlKey) {
            }
            var newScrollTop = this.getCanvas().scrollTop;
            var clientHeight = this.getCanvas().clientHeight;
            var newSelectedRowIndex = 0;
            if (e.keyCode === Common.KeyCodes.PAGE_DOWN) {
                newScrollTop += clientHeight;
                var totalHeight = this.getTotalDataHeight();
                if (newScrollTop > totalHeight - clientHeight) {
                    newScrollTop = totalHeight - clientHeight;
                }
                var currentSelectedRowIndex = this.getSelectedRowIndex();
                newSelectedRowIndex = currentSelectedRowIndex;
                for (var i = currentSelectedRowIndex; i < this.getExpandedCount(); ++i) {
                    if (this.getRowBottom(i) >= newScrollTop) {
                        newSelectedRowIndex = i;
                        break;
                    }
                }
            }
            else {
                newScrollTop -= clientHeight;
                if (newScrollTop < 0) {
                    newScrollTop = 0;
                }
                var currentSelectedRowIndex = this.getSelectedRowIndex();
                newSelectedRowIndex = currentSelectedRowIndex;
                for (var i = currentSelectedRowIndex; i >= 0; --i) {
                    if (this.getRowTop(i) <= newScrollTop) {
                        newSelectedRowIndex = i;
                        break;
                    }
                }
            }
            var currentSelectedRowIndex = this.getSelectedRowIndex();
            if (newSelectedRowIndex !== currentSelectedRowIndex) {
                this._clearSelection();
                this._addSelection(newSelectedRowIndex);
                this.selectedNestedGrid = null;
            }
            if (this.getCanvas().scrollTop != newScrollTop) {
                this.getCanvas().scrollTop = newScrollTop;
            }
        };
        /// <param name="dataIndex">The dataIndex for the row where debug event link element is in</param>
        /// <param name="extraClass">Extra CSS class to the new created debug event link element</param>
        /// <param name="isSelected">Whether <paramref="dataIndex"/> is selected</param>
        CallDurationTree.prototype.createDebugEventLinkElement = function (dataIndex, extraClass, isSelected) {
            var _this = this;
            var debugLinkContainerElement = this.createElementWithClass("div");
            if (extraClass === null) {
                extraClass = "";
            }
            debugLinkContainerElement.className = extraClass + " debug-link-offset floatleft " + CallDurationTree.DebugLinkSelectionClass;
            if (isSelected != null && isSelected) {
                // When dataIndex is selected but selectedNestedGrid is null, the descriptionElement is selected. We'll use the class calltree-hyperlink-selected.
                // Otherwise we'll use hyperlink.
                if (this.selectedNestedGrid == null) {
                    debugLinkContainerElement.classList.add(CallDurationTree.DottedBorder);
                    debugLinkContainerElement.classList.add(CallDurationTree.SelectedLinkClass);
                }
                else {
                    debugLinkContainerElement.classList.add(CallDurationTree.BorderPlaceHolderClass);
                    debugLinkContainerElement.classList.add(CallDurationTree.NonSelectedLinkClass);
                }
            }
            else {
                debugLinkContainerElement.classList.add(CallDurationTree.BorderPlaceHolderClass);
                debugLinkContainerElement.classList.add(CallDurationTree.MouseOverLinkClass);
            }
            var linkElement = this.createElementWithClass("a");
            linkElement.innerText = Microsoft.Plugin.Resources.getString("DebugThisCall");
            debugLinkContainerElement.appendChild(linkElement);
            this._addMouseUpListener(linkElement, 0, function (e) { _this._adapter._call(IntelliTrace.AdapterCalls.StartDebugging, dataIndex); });
            return debugLinkContainerElement;
        };
        /* protect */ CallDurationTree.prototype.getRowHeight = function (rowIndex) {
            if ((rowIndex < 0) || (this.getExpandedCount() <= rowIndex)) {
                return 0;
            }
            var dataIndex = this._getDataIndex(rowIndex);
            var height = this.getFrameNameHeight(dataIndex);
            if (this._methodDetails.hasOwnProperty(dataIndex)) {
                var methodDetail = this._methodDetails[dataIndex];
                if (methodDetail.isExpanded) {
                    height += this._methodDetails[dataIndex].detailElementHeight;
                }
            }
            return height;
        };
        /*protected*/ CallDurationTree.prototype._updateViewport = function (includeNonDirtyRows) {
            // Try to widen the total time column if necessary
            if (!this._stopAutoResizing && (CallDurationTree.MaxTotalTimeColumnWidth > this._callDurationColumn.width)) {
                var maxWidth = this.getTotalTimeColumnMaxVisibleWidth();
                var visibleMaxWidth = maxWidth.visible;
                var predictedMaxWidth = maxWidth.predicted;
                if (visibleMaxWidth > this._callDurationColumn.width) {
                    var headerWidth = this.getVisibleWidth();
                    this._callDurationColumn.width = Math.min(predictedMaxWidth, CallDurationTree.MaxTotalTimeColumnWidth);
                    this.adjustWidth(headerWidth, this._callDurationColumn.width);
                    this.scheduleLayout();
                    // scheduleLayout() will remove everything and draw the
                    // view again. Don't need to continue to update the view
                    // port this time.
                    return;
                }
            }
            _super.prototype._updateViewport.call(this, includeNonDirtyRows);
        };
        CallDurationTree.prototype.selectedIndexChanged = function (selectedRowIndex, selectedDataIndex) {
            if (this._methodDetails != null
                && (!this._methodDetails.hasOwnProperty(selectedDataIndex)
                    || this._methodDetails[selectedDataIndex].gridControl !== this.selectedNestedGrid)) {
                this.selectedNestedGrid = null;
            }
            var hiddenElement = this.hideDebugLinkAtDataIndex(this._lastSelectedDataIndex);
            this.removeHyperlinkStyle(hiddenElement);
            if (this._dataIndexOfHoveredRow === selectedDataIndex) {
                // When it's caused by mouse, it's possible there is a mouse
                // over event before mouse down. Remove the mouse hovered
                // style.
                this.removeMouseHoverAtDataIndex(this._dataIndexOfHoveredRow);
                this._dataIndexOfHoveredRow = CallDurationTree.InvalidDataIndexForSelection;
            }
            var shownElement = this.showDebugLinkAtDataIndex(selectedDataIndex);
            this.addHyperlinkStyle(shownElement, this.isActive(), true, false);
            this._lastSelectedDataIndex = selectedDataIndex;
        };
        /*protected*/ CallDurationTree.prototype._applyColumnSizing = function (columnIndex, initialWidth, finish) {
            this._stopAutoResizing = true;
            _super.prototype._applyColumnSizing.call(this, columnIndex, initialWidth, finish);
        };
        // For rows with method detail expanded, we have different selection style
        /*protected*/ CallDurationTree.prototype._updateRowSelectionStyle = function (rowInfo, selectedRows, focusIndex) {
            var dataIndex = rowInfo.dataIndex;
            var row = rowInfo.row;
            if (row == null) {
                return;
            }
            row.setAttribute("aria-selected", "false");
            var debugLinkElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DebugLinkSelectionClass);
            if (debugLinkElement != null) {
                this.removeHyperlinkStyle(debugLinkElement);
                var isSelected = ((dataIndex === this.getSelectedDataIndex()) && (this.selectedNestedGrid === null));
                var isActive = this.isActive();
                var isHover = (dataIndex === this._dataIndexOfHoveredRow);
                this.addHyperlinkStyle(debugLinkElement, isActive, isSelected, isHover);
            }
            // The highlighted text should use normal text color when row is selected
            var highlight = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Highlight, 0);
            if (highlight) {
                var cellElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.HighlightCellClass);
                if (cellElement != null) {
                    cellElement.classList.remove(CallDurationTree.HighlightTextClass);
                    cellElement.classList.remove(CallDurationTree.HighlightTextClassSelected);
                    if (selectedRows && selectedRows.hasOwnProperty(rowInfo.rowIndex)) {
                        cellElement.classList.add(CallDurationTree.HighlightTextClassSelected);
                    }
                    else {
                        cellElement.classList.add(CallDurationTree.HighlightTextClass);
                    }
                }
            }
            if (!this._methodDetails.hasOwnProperty(dataIndex)) {
                // call default row selection style
                _super.prototype._updateRowSelectionStyle.call(this, rowInfo, selectedRows, focusIndex);
            }
            else {
                var rowIndex = rowInfo.rowIndex;
                var isSelected = selectedRows && selectedRows.hasOwnProperty(rowIndex) && (!this.selectedNestedGrid);
                var isChildSelected = this._methodDetails[dataIndex].gridControl && (this._methodDetails[dataIndex].gridControl === this.selectedNestedGrid);
                if (isSelected || isChildSelected) {
                    row.setAttribute("aria-selected", "true");
                }
                // There are 2 areas need to be styled separately
                // 1) call duration cell
                var callDurationElement = this._methodDetails[dataIndex].callDurationElement;
                if (callDurationElement) {
                    callDurationElement.classList.remove(this.options().rowSelectedClass);
                    callDurationElement.classList.remove(CallDurationTree.BorderPlaceHolderClass);
                    callDurationElement.classList.remove("call-duration-child-selected");
                    if (isSelected) {
                        callDurationElement.classList.add(this.options().rowSelectedClass);
                    }
                    else if (isChildSelected) {
                        callDurationElement.classList.add("call-duration-child-selected");
                    }
                    else {
                        callDurationElement.classList.add(CallDurationTree.BorderPlaceHolderClass);
                    }
                }
                // 2) The top area of the name cell
                var nameElement = this._methodDetails[dataIndex].descriptionElement;
                if (nameElement) {
                    nameElement.classList.remove(this.options().rowSelectedClass);
                    nameElement.classList.remove(CallDurationTree.BorderPlaceHolderClass);
                    nameElement.classList.remove("frame-name-child-selected");
                    if (isSelected) {
                        nameElement.classList.add(this.options().rowSelectedClass);
                    }
                    else if (isChildSelected) {
                        nameElement.classList.add("frame-name-child-selected");
                    }
                    else {
                        nameElement.classList.add(CallDurationTree.BorderPlaceHolderClass);
                    }
                }
            }
        };
        CallDurationTree.prototype.getSelectedRowIntoView = function (force) {
            var selectedRowIndex = this.getSelectedRowIndex();
            var canvas = this.getCanvas();
            if (force) {
                // update view port will be called when scrolling happen
                var index = Math.max(0, Math.min(selectedRowIndex || 0, this.getExpandedCount() - 1));
                canvas.scrollTop = this.getRowTop(index);
                return true;
            }
            var viewportTop = canvas.scrollTop;
            var viewportHeight = canvas.clientHeight;
            var viewportBottom = viewportTop + viewportHeight;
            var rowTopOfSelectedRow = this.getRowTop(selectedRowIndex);
            var rowHeightOfSelectedRow = this.getRowHeight(selectedRowIndex);
            // If partial row is in the view, will try to bring the top of the row into view to show more information.
            if (rowTopOfSelectedRow < viewportTop) {
                canvas.scrollTop = rowTopOfSelectedRow;
            }
            else if (rowTopOfSelectedRow + rowHeightOfSelectedRow >= viewportBottom) {
                // Try to show the selected row as the last visible row in the view. Align the bottom of the row with the bottom of the view.
                // If the row is taller than the view height, align the top of the row with the top of the view. 
                var offset = rowHeightOfSelectedRow - viewportHeight;
                if (offset > 0) {
                    offset = 0;
                }
                canvas.scrollTop = rowTopOfSelectedRow + offset;
            }
        };
        CallDurationTree.prototype.collapseAllNodes = function () {
            var isCollapsed = _super.prototype.collapseAllNodes.call(this);
            var count = this.getExpandStates().length;
            for (var i = 0; i < count; ++i) {
                var methodDetail = this._methodDetails[i];
                if (methodDetail != null) {
                    methodDetail.isExpanded = false;
                }
            }
            this.calcRowTops(0);
            return isCollapsed;
        };
        CallDurationTree.prototype.expandAll = function () {
            _super.prototype.expandAll.call(this);
            this.getSelectedRowIntoView();
        };
        /* protected */ CallDurationTree.prototype._getAriaLabelForRow = function (rowInfo) {
            var rowIndex = rowInfo.rowIndex;
            var dataIndex = rowInfo.dataIndex;
            var columns = this.getColumns();
            var ariaLabel = columns[0].text + ", " + this.getColumnText(dataIndex, columns[0], null) + ", ";
            var description = this.getColumnValue(dataIndex, IntelliTrace.StackFrameDataFields.Description, null);
            var hasDescription = (description != null) && (description !== "");
            if (hasDescription) {
                var descriptionTitle = Microsoft.Plugin.Resources.getString("FrameDescription");
                ariaLabel += descriptionTitle + ", " + description + ", ";
            }
            else {
                ariaLabel += columns[1].text + ", " + this.getColumnText(dataIndex, columns[1], null) + ", ";
            }
            if (this._methodDetails.hasOwnProperty(dataIndex)) {
                var parameterGridTitle = Microsoft.Plugin.Resources.getString("ParameterGrid");
                if (this._methodDetails[dataIndex].isExpanded) {
                    if (hasDescription) {
                        ariaLabel += columns[1].text + ", " + this.getColumnText(dataIndex, columns[1], null) + ", ";
                    }
                    var expanded = Microsoft.Plugin.Resources.getString("ParameterGridExpanded");
                    ariaLabel += parameterGridTitle + ", " + expanded + ", ";
                }
                else {
                    var collapsed = Microsoft.Plugin.Resources.getString("ParameterGridCollapsed");
                    ariaLabel += parameterGridTitle + ", " + collapsed + ", ";
                }
            }
            ariaLabel += Microsoft.Plugin.Resources.getString("DebugThisCall") + ", " + Microsoft.Plugin.Resources.getString("Link");
            return ariaLabel;
        };
        /// Make item with dataIndex visible, which expand all the items on the path from tree root to dataIndex, 
        /// expand the first level of parameter for dataIndex, and bring item into the center of the view
        CallDurationTree.prototype.expandItemByDataIndex = function (dataIndex) {
            var _this = this;
            var expandStates = _super.prototype.getExpandStates.call(this);
            var totalCount = expandStates.length;
            var needUpdate = false;
            this.focus(0); // move the focus to CallDurationTree.
            var bringIntoCenter = function () {
                _super.prototype.setSelectedDataIndex.call(_this, dataIndex, false);
                // Always highlight the description even though one row in the nested grid is selected. This makes it obvious that the method is
                // selected when the user clicks "Find in Tree".
                _this.selectedNestedGrid = null;
                _this.getSelectedRowIntoViewCenter();
            };
            if (dataIndex >= 0 && dataIndex < totalCount) {
                if (this._selectedSlowestNodeDataIndex !== dataIndex) {
                    this._selectedSlowestNodeDataIndex = dataIndex;
                    needUpdate = true;
                }
                var minDataIndexForRecalculation = -1; // -1 means no need to recalculate.
                for (var i = 0; i < dataIndex; ++i) {
                    if ((Math.abs(expandStates[i]) + i) >= dataIndex) {
                        if (expandStates[i] < 0) {
                            this.expandNode(i);
                            needUpdate = true;
                        }
                    }
                    else if (expandStates[i] > 0) {
                        this.collapseNode(i);
                        needUpdate = true;
                    }
                    var toCollapsedMethodDetail = this._methodDetails[i];
                    if (toCollapsedMethodDetail != null && toCollapsedMethodDetail.isExpanded) {
                        toCollapsedMethodDetail.isExpanded = false;
                        if (minDataIndexForRecalculation === -1) {
                            minDataIndexForRecalculation = i;
                        }
                    }
                }
                if (minDataIndexForRecalculation !== -1) {
                    var rowIndex = this._getRowIndex(minDataIndexForRecalculation);
                    this.calcRowTops(rowIndex);
                    needUpdate = true;
                }
                this.selectedNestedGrid = null; // No rows in nested grid should be selected.
                // expand the first level of method detail
                var methodDetail = this._methodDetails[dataIndex];
                if (methodDetail && !methodDetail.isExpanded) {
                    methodDetail.isExpanded = true;
                    // can't call getRowInfo(DataIndex) since the row may not be generated yet
                    this.fetchMethodDetailAndRedraw(dataIndex, function () {
                        var rowIndex = _this._getRowIndex(dataIndex);
                        _this.layoutAfterHeightChanged(rowIndex);
                        bringIntoCenter();
                    });
                }
                else {
                    if (needUpdate) {
                        this.layout();
                    }
                    bringIntoCenter();
                }
            }
        };
        ///
        /// Start Private Helpers
        ///
        /// Helper function to create a custom drawing cell element with specified icon, tree icon, indent and text
        CallDurationTree.prototype.createMethodDetailGridControl = function (dataIndex, root) {
            var _this = this;
            var dataSource = this._methodDetails[dataIndex].parameterData;
            var outterGridRowData = this.getRowData(dataIndex);
            var hasAction = outterGridRowData[IntelliTrace.StackFrameDataFields.HasAction];
            var gridWidth = this.getParameterGridWidth();
            var control = new IntelliTrace.NestedGridControl(this._adapter, root, dataSource, this, gridWidth, dataIndex, hasAction);
            root.addEventListener(Common.Controls.Grid.GridControl.EVENT_ROW_EXPANDED_COLLAPSED, function (e) {
                if (e) {
                    var rowInfo = _super.prototype.getRowInfoFromEvent.call(_this, e, "." + _this.options().rowClass);
                    if (rowInfo) {
                        var dataIndex = rowInfo.dataIndex;
                        _this.handleNestedGridControlHeightChanged(dataIndex);
                    }
                    // stop the event from bubbling to parent treegrid
                    e.cancelBubble = true;
                }
            });
            return control;
        };
        CallDurationTree.prototype.adjustMethodDetailElementHeight = function (dataIndex) {
            var methodDetail = this._methodDetails[dataIndex];
            if (methodDetail) {
                var methodDetailElement = this._methodDetails[dataIndex].detailElement;
                if (methodDetailElement) {
                    var signatureHeight = 0;
                    var gridHeight = 0;
                    // create description message
                    var signature = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Signature, 0);
                    var signatureElement = this._methodDetails[dataIndex].signatureElement;
                    if (signatureElement && signature && signature != "") {
                        signatureHeight = this.getMultilineTextHeight(signature);
                        signatureElement.style.height = String(signatureHeight) + "px";
                    }
                    var hasParameter = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.HasParameters, 0);
                    var nestedGridControl = this._methodDetails[dataIndex].gridControl;
                    if (typeof hasParameter === "boolean" && hasParameter && nestedGridControl) {
                        gridHeight = nestedGridControl.getTotalDataHeight() + _super.prototype.getHeaderHeight.call(this) + 4; // 4 for grid border and padding;
                        nestedGridControl.rootElement.style.height = String(gridHeight) + "px";
                    }
                    this._methodDetails[dataIndex].signatureHeight = signatureHeight;
                    var detailElementHeight = signatureHeight + gridHeight;
                    this._methodDetails[dataIndex].detailElementHeight = detailElementHeight;
                    methodDetailElement.style.height = String(detailElementHeight) + "px";
                }
            }
        };
        CallDurationTree.prototype.fetchMethodDetailAndRedraw = function (dataIndex, redraw) {
            var _this = this;
            if (this._methodDetails.hasOwnProperty(dataIndex)) {
                var hasParameter = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.HasParameters, 0);
                if (hasParameter && !this._methodDetails[dataIndex].parameterData) {
                    this._adapter._call(IntelliTrace.AdapterCalls.GetParameters, dataIndex).done(function (result) {
                        _this._methodDetails[dataIndex].parameterData = (result);
                        _this._methodDetails[dataIndex].isDataReady = true;
                        if (result) {
                            _this.ensureMethodDetailElementCreated(dataIndex);
                            _this._methodDetails[dataIndex].isDirty = true;
                            if (redraw) {
                                redraw();
                            }
                        }
                    });
                }
                else {
                    this.ensureMethodDetailElementCreated(dataIndex);
                    this._methodDetails[dataIndex].isDirty = true;
                    if (redraw) {
                        redraw();
                    }
                }
            }
        };
        CallDurationTree.prototype.ensureMethodDetailElementCreated = function (dataIndex) {
            if (this._methodDetails.hasOwnProperty(dataIndex) && this._methodDetails[dataIndex].isDataReady) {
                var methodDetail = this._methodDetails[dataIndex];
                if (methodDetail) {
                    if (!methodDetail.detailElement) {
                        var detailElement = _super.prototype.createElementWithClass.call(this, "div", "grid-method-detail");
                        detailElement.style.width = String(this._frameNameColumn.width) + "px";
                        // create description message
                        var description = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Description, 0);
                        var signature = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.Signature, 0);
                        var signatureElement = null;
                        if (description && description !== "" && signature && signature !== "") {
                            // show signature in method detail when description exist
                            signatureElement = _super.prototype.createElementWithClass.call(this, "div", "grid-cell-nested-text " + CallDurationTree.SignatureElementSelectionClass);
                            signatureElement.innerText = signature;
                            detailElement.appendChild(signatureElement);
                        }
                        // create nested grid
                        var hasParameter = _super.prototype.getColumnValue.call(this, dataIndex, IntelliTrace.StackFrameDataFields.HasParameters, 0);
                        var gridControl = null;
                        if (typeof hasParameter === "boolean" && hasParameter) {
                            var gridElement = _super.prototype.createElementWithClass.call(this, "div");
                            gridControl = this.createMethodDetailGridControl(dataIndex, gridElement);
                            detailElement.appendChild(gridElement);
                        }
                        this._methodDetails[dataIndex].detailElement = detailElement;
                        this._methodDetails[dataIndex].signatureElement = signatureElement;
                        this._methodDetails[dataIndex].gridControl = gridControl;
                    }
                    this.adjustMethodDetailElementHeight(dataIndex);
                }
            }
        };
        CallDurationTree.prototype.getElementStyleHeight = function (element) {
            return element ? parseInt(element.style.height.slice(0, -2)) : 0;
        };
        CallDurationTree.prototype.layoutAfterHeightChanged = function (rowIndex) {
            this.calcRowTops(rowIndex);
            this.layout();
        };
        // Get the max desired width of the total time column for visible rows
        // This function will calculate 2 max column width values; one only includes all the visible rows, and the other includes additional 
        // upper/lower 3 rows plus the visible rows, this cache will decrease the frequency of re-layout when user scrolling through the rows
        CallDurationTree.prototype.getTotalTimeColumnMaxVisibleWidth = function () {
            var maxIndex = _super.prototype.getExpandedCount.call(this);
            var visibleIndices = _super.prototype.getVisibleRowIndices.call(this);
            var firstIndex = visibleIndices.first;
            var lastIndex = visibleIndices.last;
            // magic number 3, peek the upper and lower rows and get the max indent
            var predictedFirstIndex = Math.max(0, firstIndex - 3);
            var predictedLastIndex = Math.min(maxIndex, lastIndex + 3);
            var maxIndentLevel = 0;
            var predictedMaxIndentLevel = 0;
            for (var i = predictedFirstIndex; i <= predictedLastIndex; ++i) {
                var dataIndex = _super.prototype._getDataIndex.call(this, i);
                var indent = _super.prototype.indentLevel.call(this, dataIndex);
                if (predictedMaxIndentLevel < indent) {
                    predictedMaxIndentLevel = indent;
                }
                if ((maxIndentLevel < indent) && (i > firstIndex) && (i <= lastIndex)) {
                    maxIndentLevel = indent;
                }
            }
            return {
                visible: this.calcTotalTimeColumnWidth(maxIndentLevel),
                predicted: this.calcTotalTimeColumnWidth(predictedMaxIndentLevel)
            };
        };
        CallDurationTree.prototype.calcTotalTimeColumnWidth = function (indentLevel) {
            // This width should make the tree icon and total time visible
            return _super.prototype.getColumnPixelIndent.call(this, indentLevel) + 80; // magic number, should be enough for most total time string
        };
        CallDurationTree.prototype.scheduleLayout = function () {
            var _this = this;
            if (this._pendingLayout) {
                this._pendingLayout = false;
                window.clearTimeout(this._pendingLayoutTimeoutId);
            }
            this._pendingLayout = true;
            this._pendingLayoutTimeoutId = window.setTimeout(function () { _super.prototype.layout.call(_this); }, 100);
        };
        CallDurationTree.prototype.getDebugEventLinkWidth = function () {
            if (this._debugEventLinkWidth === -1) {
                var measurementContainer = this.createElementWithClass("div");
                measurementContainer.style.position = "absolute";
                measurementContainer.style.left = "-5000px";
                measurementContainer.style.top = "-5000px";
                measurementContainer.style.width = "1000px";
                measurementContainer.style.height = "500px";
                document.body.appendChild(measurementContainer);
                // Create the row and cell
                var linkElement = this.createDebugEventLinkElement(-1);
                measurementContainer.appendChild(linkElement);
                this._debugEventLinkWidth = linkElement.offsetWidth + linkElement.offsetLeft;
                // Remove the hidden element
                document.body.removeChild(measurementContainer);
            }
            return this._debugEventLinkWidth;
        };
        CallDurationTree.prototype.getVisibleWidth = function () {
            var headerWidth = window.innerWidth - 8; // 8 is the padding/borders of all the parent element of grid header.
            return headerWidth;
        };
        CallDurationTree.prototype.adjustWidth = function (totalWidth, preAllocatedWidth) {
            this._frameNameColumn.width = totalWidth - preAllocatedWidth;
            this._frameNameColumn.width -= this.getMeasurements().scrollbarWidth; // grid-canvas scrollbar width.
            if (this._frameNameColumn.width < CallDurationTree.MinMethodNameColumnWidth) {
                this._frameNameColumn.width = CallDurationTree.MinMethodNameColumnWidth;
            }
            this._onColumnResizeEvent(this.getColumns());
        };
        CallDurationTree.prototype.getParameterGridWidth = function () {
            // this._frameNameColumn should be created and is not null.
            var parameterGridWidth = this._frameNameColumn.width + CallDurationTree.ParameterGridWidthAdjustment;
            return parameterGridWidth;
        };
        CallDurationTree.prototype.handleNestedGridControlHeightChanged = function (dataIndex) {
            var methodDetail = this._methodDetails[dataIndex];
            if (methodDetail) {
                this.adjustMethodDetailElementHeight(dataIndex);
                var rowIndex = this._getRowIndex(dataIndex);
                this.calcRowTops(rowIndex);
                methodDetail.isDirty = true;
            }
            this.scheduleLayout();
        };
        CallDurationTree.prototype.removeHyperlinkStyle = function (element) {
            if (element != null) {
                element.classList.remove(CallDurationTree.DottedBorder);
                element.classList.remove(CallDurationTree.BorderPlaceHolderClass);
                element.classList.remove(CallDurationTree.SelectedLinkClass);
                element.classList.remove(CallDurationTree.MouseOverLinkClass);
                element.classList.remove(CallDurationTree.NonSelectedLinkClass);
            }
        };
        CallDurationTree.prototype.addHyperlinkStyle = function (element, isActive, isSelected, isHover) {
            if (element == null) {
                return;
            }
            if (isSelected) {
                if (isActive) {
                    element.classList.add(CallDurationTree.DottedBorder);
                    element.classList.add(CallDurationTree.SelectedLinkClass);
                }
                else {
                    element.classList.add(CallDurationTree.BorderPlaceHolderClass);
                    element.classList.add(CallDurationTree.SelectedLinkClass);
                }
            }
            else if (isHover) {
                element.classList.add(CallDurationTree.BorderPlaceHolderClass);
                element.classList.add(CallDurationTree.MouseOverLinkClass);
            }
            else {
                element.classList.add(CallDurationTree.BorderPlaceHolderClass);
                element.classList.add(CallDurationTree.NonSelectedLinkClass);
            }
        };
        CallDurationTree.prototype.isInHotPath = function (dataIndex, descendentCount) {
            return ((dataIndex < this._selectedSlowestNodeDataIndex) && (descendentCount + dataIndex >= this._selectedSlowestNodeDataIndex));
        };
        CallDurationTree.prototype.addMouseHoverOnRow = function (rowInfo) {
            var row = rowInfo.row;
            if (row != null) {
                var shownElement = this.showDebugLinkOnRow(row);
                this.addHyperlinkStyle(shownElement, this.isActive(), false, true);
                shownElement.parentNode.classList.add(CallDurationTree.RowHoverClass);
                var cellElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DurationCellSelectionClass);
                if (cellElement != null) {
                    var highlight = _super.prototype.getColumnValue.call(this, rowInfo.dataIndex, IntelliTrace.StackFrameDataFields.Highlight, null);
                    if (highlight) {
                        //If a row is highlighted, we should still color it red
                        cellElement.classList.add(CallDurationTree.HighlightHoverClass);
                    }
                    else {
                        cellElement.classList.add(CallDurationTree.RowHoverClass);
                    }
                }
            }
        };
        CallDurationTree.prototype.removeMouseHoverOnHoveredRow = function () {
            if (this._dataIndexOfHoveredRow !== CallDurationTree.InvalidDataIndexForSelection) {
                if (this._dataIndexOfHoveredRow !== this.getSelectedDataIndex()) {
                    this.removeMouseHoverAtDataIndex(this._dataIndexOfHoveredRow);
                }
                this._dataIndexOfHoveredRow = CallDurationTree.InvalidDataIndexForSelection;
            }
        };
        CallDurationTree.prototype.removeMouseHoverAtDataIndex = function (dataIndex) {
            var rowInfo = this.getRowInfo(dataIndex);
            if (rowInfo != null) {
                this.removeMouseHoverOnRow(rowInfo);
            }
        };
        CallDurationTree.prototype.removeMouseHoverOnRow = function (rowInfo) {
            var row = rowInfo.row;
            if (row != null) {
                var hiddenElement = this.hideDebugLinkOnRow(rowInfo.row);
                this.removeHyperlinkStyle(hiddenElement);
                hiddenElement.parentNode.classList.remove(CallDurationTree.RowHoverClass);
                var cellElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DurationCellSelectionClass);
                if (cellElement != null) {
                    cellElement.classList.remove(CallDurationTree.RowHoverClass);
                    cellElement.classList.remove(CallDurationTree.HighlightHoverClass);
                }
            }
        };
        CallDurationTree.prototype.hideDebugLinkAtDataIndex = function (dataIndex) {
            var row = this.getRowElementAt(dataIndex);
            if (row != null) {
                return this.hideDebugLinkOnRow(row);
            }
            return null;
        };
        CallDurationTree.prototype.hideDebugLinkOnRow = function (row) {
            var debugLinkElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DebugLinkSelectionClass);
            if (debugLinkElement != null) {
                debugLinkElement.classList.remove(CallDurationTree.VisibleElementClass);
                debugLinkElement.classList.add(CallDurationTree.InvisibleElementClass);
                var maxDescriptionTextElementWidth = this.calculateDescriptionTextElementMaxWidth(row, false);
                this.setDescriptionTextElementMaxWidth(row, maxDescriptionTextElementWidth);
            }
            return debugLinkElement;
        };
        CallDurationTree.prototype.showDebugLinkAtDataIndex = function (dataIndex) {
            var row = this.getRowElementAt(dataIndex);
            if (row != null) {
                return this.showDebugLinkOnRow(row);
            }
            return null;
        };
        CallDurationTree.prototype.showDebugLinkOnRow = function (row) {
            var debugLinkElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DebugLinkSelectionClass);
            if (debugLinkElement != null) {
                debugLinkElement.classList.remove(CallDurationTree.InvisibleElementClass);
                debugLinkElement.classList.add(CallDurationTree.VisibleElementClass);
                var maxDescriptionTextElementWidth = this.calculateDescriptionTextElementMaxWidth(row, true);
                this.setDescriptionTextElementMaxWidth(row, maxDescriptionTextElementWidth);
            }
            return debugLinkElement;
        };
        CallDurationTree.prototype.calculateDescriptionTextElementMaxWidth = function (row, hasDebugLink) {
            var maxDescriptionTextElementWidth = this._frameNameColumn.width;
            if (this.hasMethodDetailExpandIconOnRow(row)) {
                maxDescriptionTextElementWidth -= IntelliTrace.CustomGridControl.IconWidth;
            }
            if (hasDebugLink) {
                maxDescriptionTextElementWidth -= this.getDebugEventLinkWidth() + this._debugEventLinkWidthAdjustment;
            }
            return maxDescriptionTextElementWidth;
        };
        CallDurationTree.prototype.setDescriptionTextElementMaxWidth = function (row, maxWidth) {
            var textElement = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.DescriptionTextElementSelectionClass);
            if (textElement != null) {
                textElement.style.maxWidth = String(maxWidth) + "px";
                textElement.removeAttribute(IntelliTrace.CustomGridControl.TooltipAttribute);
                this.addTooltipWhenObscured(textElement);
            }
        };
        CallDurationTree.prototype.hasMethodDetailExpandIconOnRow = function (row) {
            var treeIcon = CallDurationTree.getFirstElementByClassName(row, CallDurationTree.MethodDetailExpandIconClass);
            return treeIcon != null;
        };
        CallDurationTree.prototype.getRowElementAt = function (dataIndex) {
            if (!this.isValidDataIndex(dataIndex)) {
                return null;
            }
            var rowInfo = this.getRowInfo(dataIndex);
            if (rowInfo != null) {
                return rowInfo.row;
            }
            return null;
        };
        CallDurationTree.getFirstElementByClassName = function (parentElement, className) {
            var childrenNode = parentElement.getElementsByClassName(className);
            if (childrenNode != null && childrenNode.length > 0) {
                return childrenNode[0];
            }
            return null;
        };
        CallDurationTree.prototype.isValidDataIndex = function (dataIndex) {
            var expandState = this.getExpandStates();
            if (expandState != null) {
                return (dataIndex >= 0) && (dataIndex < expandState.length);
            }
            return false;
        };
        CallDurationTree.prototype.isSelectedGridHandleFocus = function () {
            return (this.selectedNestedGrid != null) && (this.selectedNestedGrid.isSelectedFromParent);
        };
        CallDurationTree.prototype.getFrameNameHeight = function (dataIndex) {
            // use data index to initialize members
            if (dataIndex < 0 || dataIndex >= this.getExpandStates().length) {
                return 0;
            }
            if (this._frameNameHeight[dataIndex] == null) {
                var rowViewModel = this.getRowData(dataIndex);
                var description = rowViewModel[IntelliTrace.StackFrameDataFields.Description];
                // initialize frame name height 
                if ((description && description !== "")) {
                    this._frameNameHeight[dataIndex] = this.getMultilineTextHeight(description);
                }
                else {
                    this._frameNameHeight[dataIndex] = this.getMultilineTextHeight(rowViewModel[IntelliTrace.StackFrameDataFields.Signature]);
                }
            }
            return this._frameNameHeight[dataIndex];
        };
        ///
        /// End Private Helpers
        ///
        /// Expose members for testing purpose
        CallDurationTree.prototype.getMethodDetails = function () {
            return this._methodDetails;
        };
        CallDurationTree.RowBorderHeight = 2;
        CallDurationTree.DefaultTotalTimeColumnWidth = 150;
        CallDurationTree.MinTotalTimeColumnWidth = 75;
        CallDurationTree.MaxTotalTimeColumnWidth = 600;
        CallDurationTree.DefaultMethodNameColumnWidth = 800;
        CallDurationTree.MinMethodNameColumnWidth = 400;
        CallDurationTree.ParameterGridWidthAdjustment = -3;
        CallDurationTree.HighlightCellClass = "highlighted-cell";
        CallDurationTree.HighlightTextClass = "highlight-duration-text";
        CallDurationTree.HighlightTextClassSelected = "highlight-duration-text-selected";
        CallDurationTree.HighlightHoverClass = "highlight-hover";
        CallDurationTree.BorderPlaceHolderClass = "border-placeholder";
        CallDurationTree.DebugLinkSelectionClass = "debug-link-for-selection";
        CallDurationTree.DescriptionTextElementSelectionClass = "description-text-element-for-selection";
        CallDurationTree.SignatureElementSelectionClass = "signature-element-for-selection";
        CallDurationTree.DurationCellSelectionClass = "duration-cell-for-selection";
        CallDurationTree.InvisibleElementClass = "invisible-element";
        CallDurationTree.VisibleElementClass = "visible-element";
        CallDurationTree.MethodDetailExpandIconClass = "method-detail-expand-icon";
        CallDurationTree.RowHoverClass = "row-hover";
        CallDurationTree.DottedBorder = "dotted-border";
        CallDurationTree.SelectedLinkClass = "calltree-hyperlink-selected";
        CallDurationTree.MouseOverLinkClass = "calltree-hyperlink";
        CallDurationTree.NonSelectedLinkClass = "hyperlink";
        CallDurationTree.InvalidDataIndexForSelection = -1;
        return CallDurationTree;
    }(IntelliTrace.CustomGridControl));
    IntelliTrace.CallDurationTree = CallDurationTree;
})(IntelliTrace || (IntelliTrace = {}));
// 
// Copyright (C) Microsoft. All rights reserved.
//
/// <reference path="ExternalReferences.ts" />
/// <reference path="CallDurationTree.ts" />
//--- alert("debug me");
var IntelliTrace;
(function (IntelliTrace) {
    var CallDurationView = (function () {
        function CallDurationView() {
            var _this = this;
            this._callDurationView = document.getElementById("callDurationView");
            this._callDurationView.className = "callDurationView";
            // Initialize the call duration tree
            this._callDurationTree = document.createElement("div");
            this._callDurationTree.className = "callDurationTree";
            this._callDurationTree.setAttribute("aria-label", ""); // clear the value otherwise the whole grid text will be used.
            var adapter = Microsoft.Plugin.Utilities.JSONMarshaler.attachToPublishedObject("Microsoft.VisualStudio.TraceLogPackage.SummaryPage.CallDurationViewModelMarshaler", {}, true);
            this._gridControl = new IntelliTrace.CallDurationTree(adapter, this._callDurationTree);
            this._gridControl.init(function () {
                _this.initExpandAllButton();
                _this._callDurationTree.setAttribute("tabindex", "-1");
                _this._callDurationView.appendChild(_this._callDurationTree);
            });
        }
        CallDurationView.prototype.initExpandAllButton = function () {
            var _this = this;
            var expandStatus = this._gridControl.getExpandStates();
            if (!expandStatus.every(function (value, index, array) { return (value === 0); })) {
                // Only add the expand all button when there is expandable/collapsable item
                this._expandAllButton = document.createElement("a");
                this._expandAllButton.className = "expand-all-text hyperlink";
                this._expandAllButton.id = CallDurationView.idExpandCollapseAll;
                this._expandAllButton.setAttribute("tabindex", "0");
                this._callDurationView.appendChild(this._expandAllButton);
                if (expandStatus.every(function (value, index, array) { return (value >= 0); })) {
                    this.setupExpandAllButton(false);
                }
                else {
                    this.setupExpandAllButton(true);
                }
                // May need to switch between "expand all" and "collapse all" when user manually expand or collapse
                this._callDurationTree.addEventListener(Common.Controls.Grid.GridControl.EVENT_ROW_EXPANDED_COLLAPSED, function (e) {
                    if (e && e.customData && e.customData.length > 0) {
                        var isExpanded = e.customData[0].isExpanded;
                        if (isExpanded && _this._isShowingExpandAll && expandStatus.every(function (value, index, array) { return (value >= 0); })) {
                            // everything is expanded, show collapse all
                            _this.setupExpandAllButton(false);
                        }
                        else if (!isExpanded && !_this._isShowingExpandAll) {
                            // something is expandable, show expand all
                            _this.setupExpandAllButton(true);
                        }
                    }
                });
            }
            else {
                // Remove the space for expand all button
                this._callDurationTree.style.paddingTop = "0px";
            }
        };
        // The button will show "Expand All" if expandAll parameter is true, otherwise it will show "Collapse All".
        CallDurationView.prototype.setupExpandAllButton = function (expandAll) {
            var _this = this;
            var linkElement = document.getElementById(CallDurationView.idExpandCollapseAll);
            // clear the old event listener
            if (this._expandAllEventListener) {
                linkElement.removeEventListener("click", this._expandAllEventListener);
                linkElement.removeEventListener("keydown", this._expandAllKeyDownEventListener);
            }
            var text = Microsoft.Plugin.Resources.getString(expandAll ? "ExpandAllButtonText" : "CollapseAllButtonText");
            linkElement.innerText = text;
            linkElement.setAttribute("aria-label", text);
            this._isShowingExpandAll = expandAll;
            if (expandAll) {
                this._expandAllEventListener = function () {
                    _this._gridControl.expandAll();
                };
                this._expandAllKeyDownEventListener = function (e) {
                    if (e.keyCode == Common.KeyCodes.ENTER) {
                        _this._gridControl.expandAll();
                    }
                };
            }
            else {
                this._expandAllEventListener = function () {
                    _this._gridControl.collapseAll();
                };
                this._expandAllKeyDownEventListener = function (e) {
                    if (e.keyCode == Common.KeyCodes.ENTER) {
                        _this._gridControl.collapseAll();
                    }
                };
            }
            linkElement.addEventListener("click", this._expandAllEventListener);
            linkElement.addEventListener("keydown", this._expandAllKeyDownEventListener);
        };
        CallDurationView.idExpandCollapseAll = "expandCollapseAll";
        return CallDurationView;
    }());
    //==========================================================================================================================================================
    // Register the GUI
    Microsoft.Plugin.addEventListener("pluginready", function () {
        CallDurationView.s_instance = new CallDurationView();
    });
})(IntelliTrace || (IntelliTrace = {}));

// SIG // Begin signature block
// SIG // MIIj6wYJKoZIhvcNAQcCoIIj3DCCI9gCAQExDzANBglg
// SIG // hkgBZQMEAgEFADB3BgorBgEEAYI3AgEEoGkwZzAyBgor
// SIG // BgEEAYI3AgEeMCQCAQEEEBDgyQbOONQRoqMAEEvTUJAC
// SIG // AQACAQACAQACAQACAQAwMTANBglghkgBZQMEAgEFAAQg
// SIG // kcQqqJTbCmA1Ndq0FXv2Wm5I8tGynnjZUGguL8v5xn+g
// SIG // gg2DMIIGATCCA+mgAwIBAgITMwAAAMTpifh6gVDp/wAA
// SIG // AAAAxDANBgkqhkiG9w0BAQsFADB+MQswCQYDVQQGEwJV
// SIG // UzETMBEGA1UECBMKV2FzaGluZ3RvbjEQMA4GA1UEBxMH
// SIG // UmVkbW9uZDEeMBwGA1UEChMVTWljcm9zb2Z0IENvcnBv
// SIG // cmF0aW9uMSgwJgYDVQQDEx9NaWNyb3NvZnQgQ29kZSBT
// SIG // aWduaW5nIFBDQSAyMDExMB4XDTE3MDgxMTIwMjAyNFoX
// SIG // DTE4MDgxMTIwMjAyNFowdDELMAkGA1UEBhMCVVMxEzAR
// SIG // BgNVBAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1v
// SIG // bmQxHjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlv
// SIG // bjEeMBwGA1UEAxMVTWljcm9zb2Z0IENvcnBvcmF0aW9u
// SIG // MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA
// SIG // iIq4JMMHj5qAeRX8JmD8cogs+vSjl4iWRrejy1+JLzoz
// SIG // Lh6RePp8qR+CAbV6yxq8A8pG68WZ9/sEHfKFCv8ibqHy
// SIG // Zz3FJxjlKB/1BJRBY+zjuhWM7ROaNd44cFRvO+ytRQkw
// SIG // ScG+jzCZDMt2yfdzlRZ30Yu7lMcIhSDtHqg18XHC4HQA
// SIG // S4rS3JHr1nj+jfqtYIg9vbkfrmKXv8WEsZCu1q8r01T7
// SIG // NdrNcZLmHv/scWvLfwh2dOAQUUjU8QDISEyjBzXlWQ39
// SIG // fJzI5lrjhfXWmg8fjqbkhBfB1sqfHQHH/UinE5IzlyFI
// SIG // MvjCJKIAsr5TyoNuKVuB7zhugPO77BML6wIDAQABo4IB
// SIG // gDCCAXwwHwYDVR0lBBgwFgYKKwYBBAGCN0wIAQYIKwYB
// SIG // BQUHAwMwHQYDVR0OBBYEFMvWYoTPYDnq/2fCXNLIu6u3
// SIG // wxOYMFIGA1UdEQRLMEmkRzBFMQ0wCwYDVQQLEwRNT1BS
// SIG // MTQwMgYDVQQFEysyMzAwMTIrYzgwNGI1ZWEtNDliNC00
// SIG // MjM4LTgzNjItZDg1MWZhMjI1NGZjMB8GA1UdIwQYMBaA
// SIG // FEhuZOVQBdOCqhc3NyK1bajKdQKVMFQGA1UdHwRNMEsw
// SIG // SaBHoEWGQ2h0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9w
// SIG // a2lvcHMvY3JsL01pY0NvZFNpZ1BDQTIwMTFfMjAxMS0w
// SIG // Ny0wOC5jcmwwYQYIKwYBBQUHAQEEVTBTMFEGCCsGAQUF
// SIG // BzAChkVodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtp
// SIG // b3BzL2NlcnRzL01pY0NvZFNpZ1BDQTIwMTFfMjAxMS0w
// SIG // Ny0wOC5jcnQwDAYDVR0TAQH/BAIwADANBgkqhkiG9w0B
// SIG // AQsFAAOCAgEABhYf21fCUMgjT6JReNft+P3NvdXA8fkb
// SIG // Vu1TyGlHBdXEy+zi/JlblV8ROCjABUUT4Jp5iLxmq9u7
// SIG // 6wJVI7c9I3hBba748QBalJmKHMwJldCaHEQwqaUWx7pH
// SIG // W/UrNIufj1g3w04cryLKEM3YghCpNfCuIsiPJKaBi98n
// SIG // HORmHYk+Lv9XA03BboOgMuu0sy9QVl0GsRWMyB1jt3MM
// SIG // 49Z6Jg8qlkWnMoM+lj5XSXcjif6xEMeK5QgVUcUrWjFb
// SIG // OWqWqKSIa5Yob/HEruq9RRfMYk6BtVQaR46YpW3AbifG
// SIG // +CcfyO0gqQux8c4LmpTiap1pg6E2120g/oXV/8O4lzYJ
// SIG // /j0UwZgUqcCGzO+CwatVJEMYtUiFeIbQ+dKdPxnZFInn
// SIG // jZ9oJIhoO6nHgE4m5wghTGP9nJMVTTO1VmBP10q5OI7/
// SIG // Lt2xX6RDa8l4z7G7a4+DbIdyquql+5/dGtY5/GTJbT4I
// SIG // 5XyDsa28o7p7z5ZWpHpYyxJHYtIh7/w8xDEL9y8+ZKU3
// SIG // b2BQP7dEkE+gC4u+flj2x2eHYduemMTIjMtvR+HALpTt
// SIG // sfawMG3sakmo6ZZ2yL0IxP479a5zNwayVs8Z1Lv1lMqH
// SIG // HPKAagFPthuBc7PTWyI/OlgY34juZ8RJpy/cJYs9XtDs
// SIG // NESRHbyRDHaCPu/E2C2hBAKOSPnv3QLPA6Iwggd6MIIF
// SIG // YqADAgECAgphDpDSAAAAAAADMA0GCSqGSIb3DQEBCwUA
// SIG // MIGIMQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMTIwMAYDVQQDEylN
// SIG // aWNyb3NvZnQgUm9vdCBDZXJ0aWZpY2F0ZSBBdXRob3Jp
// SIG // dHkgMjAxMTAeFw0xMTA3MDgyMDU5MDlaFw0yNjA3MDgy
// SIG // MTA5MDlaMH4xCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xKDAmBgNV
// SIG // BAMTH01pY3Jvc29mdCBDb2RlIFNpZ25pbmcgUENBIDIw
// SIG // MTEwggIiMA0GCSqGSIb3DQEBAQUAA4ICDwAwggIKAoIC
// SIG // AQCr8PpyEBwurdhuqoIQTTS68rZYIZ9CGypr6VpQqrgG
// SIG // OBoESbp/wwwe3TdrxhLYC/A4wpkGsMg51QEUMULTiQ15
// SIG // ZId+lGAkbK+eSZzpaF7S35tTsgosw6/ZqSuuegmv15ZZ
// SIG // ymAaBelmdugyUiYSL+erCFDPs0S3XdjELgN1q2jzy23z
// SIG // OlyhFvRGuuA4ZKxuZDV4pqBjDy3TQJP4494HDdVceaVJ
// SIG // KecNvqATd76UPe/74ytaEB9NViiienLgEjq3SV7Y7e1D
// SIG // kYPZe7J7hhvZPrGMXeiJT4Qa8qEvWeSQOy2uM1jFtz7+
// SIG // MtOzAz2xsq+SOH7SnYAs9U5WkSE1JcM5bmR/U7qcD60Z
// SIG // I4TL9LoDho33X/DQUr+MlIe8wCF0JV8YKLbMJyg4JZg5
// SIG // SjbPfLGSrhwjp6lm7GEfauEoSZ1fiOIlXdMhSz5SxLVX
// SIG // PyQD8NF6Wy/VI+NwXQ9RRnez+ADhvKwCgl/bwBWzvRvU
// SIG // VUvnOaEP6SNJvBi4RHxF5MHDcnrgcuck379GmcXvwhxX
// SIG // 24ON7E1JMKerjt/sW5+v/N2wZuLBl4F77dbtS+dJKacT
// SIG // KKanfWeA5opieF+yL4TXV5xcv3coKPHtbcMojyyPQDdP
// SIG // weGFRInECUzF1KVDL3SV9274eCBYLBNdYJWaPk8zhNqw
// SIG // iBfenk70lrC8RqBsmNLg1oiMCwIDAQABo4IB7TCCAekw
// SIG // EAYJKwYBBAGCNxUBBAMCAQAwHQYDVR0OBBYEFEhuZOVQ
// SIG // BdOCqhc3NyK1bajKdQKVMBkGCSsGAQQBgjcUAgQMHgoA
// SIG // UwB1AGIAQwBBMAsGA1UdDwQEAwIBhjAPBgNVHRMBAf8E
// SIG // BTADAQH/MB8GA1UdIwQYMBaAFHItOgIxkEO5FAVO4eqn
// SIG // xzHRI4k0MFoGA1UdHwRTMFEwT6BNoEuGSWh0dHA6Ly9j
// SIG // cmwubWljcm9zb2Z0LmNvbS9wa2kvY3JsL3Byb2R1Y3Rz
// SIG // L01pY1Jvb0NlckF1dDIwMTFfMjAxMV8wM18yMi5jcmww
// SIG // XgYIKwYBBQUHAQEEUjBQME4GCCsGAQUFBzAChkJodHRw
// SIG // Oi8vd3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01p
// SIG // Y1Jvb0NlckF1dDIwMTFfMjAxMV8wM18yMi5jcnQwgZ8G
// SIG // A1UdIASBlzCBlDCBkQYJKwYBBAGCNy4DMIGDMD8GCCsG
// SIG // AQUFBwIBFjNodHRwOi8vd3d3Lm1pY3Jvc29mdC5jb20v
// SIG // cGtpb3BzL2RvY3MvcHJpbWFyeWNwcy5odG0wQAYIKwYB
// SIG // BQUHAgIwNB4yIB0ATABlAGcAYQBsAF8AcABvAGwAaQBj
// SIG // AHkAXwBzAHQAYQB0AGUAbQBlAG4AdAAuIB0wDQYJKoZI
// SIG // hvcNAQELBQADggIBAGfyhqWY4FR5Gi7T2HRnIpsLlhHh
// SIG // Y5KZQpZ90nkMkMFlXy4sPvjDctFtg/6+P+gKyju/R6mj
// SIG // 82nbY78iNaWXXWWEkH2LRlBV2AySfNIaSxzzPEKLUtCw
// SIG // /WvjPgcuKZvmPRul1LUdd5Q54ulkyUQ9eHoj8xN9ppB0
// SIG // g430yyYCRirCihC7pKkFDJvtaPpoLpWgKj8qa1hJYx8J
// SIG // aW5amJbkg/TAj/NGK978O9C9Ne9uJa7lryft0N3zDq+Z
// SIG // KJeYTQ49C/IIidYfwzIY4vDFLc5bnrRJOQrGCsLGra7l
// SIG // stnbFYhRRVg4MnEnGn+x9Cf43iw6IGmYslmJaG5vp7d0
// SIG // w0AFBqYBKig+gj8TTWYLwLNN9eGPfxxvFX1Fp3blQCpl
// SIG // o8NdUmKGwx1jNpeG39rz+PIWoZon4c2ll9DuXWNB41sH
// SIG // nIc+BncG0QaxdR8UvmFhtfDcxhsEvt9Bxw4o7t5lL+yX
// SIG // 9qFcltgA1qFGvVnzl6UJS0gQmYAf0AApxbGbpT9Fdx41
// SIG // xtKiop96eiL6SJUfq/tHI4D1nvi/a7dLl+LrdXga7Oo3
// SIG // mXkYS//WsyNodeav+vyL6wuA6mk7r/ww7QRMjt/fdW1j
// SIG // kT3RnVZOT7+AVyKheBEyIXrvQQqxP/uozKRdwaGIm1dx
// SIG // Vk5IRcBCyZt2WwqASGv9eZ/BvW1taslScxMNelDNMYIV
// SIG // wDCCFbwCAQEwgZUwfjELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEo
// SIG // MCYGA1UEAxMfTWljcm9zb2Z0IENvZGUgU2lnbmluZyBQ
// SIG // Q0EgMjAxMQITMwAAAMTpifh6gVDp/wAAAAAAxDANBglg
// SIG // hkgBZQMEAgEFAKCBrjAZBgkqhkiG9w0BCQMxDAYKKwYB
// SIG // BAGCNwIBBDAcBgorBgEEAYI3AgELMQ4wDAYKKwYBBAGC
// SIG // NwIBFTAvBgkqhkiG9w0BCQQxIgQgtWBTAnvlx0vqKxwW
// SIG // 7cvxArI+JZHGbS6188LV2EDOzNYwQgYKKwYBBAGCNwIB
// SIG // DDE0MDKgFIASAE0AaQBjAHIAbwBzAG8AZgB0oRqAGGh0
// SIG // dHA6Ly93d3cubWljcm9zb2Z0LmNvbTANBgkqhkiG9w0B
// SIG // AQEFAASCAQB1ljjFBlx5TYXATrgo3QAChXZ+h2LiM4Qi
// SIG // XofYXR4y+NAikJi4pRAE6DVCukkDWkW/YXBuj8wsqzvg
// SIG // /43IqaedRp3U5NwdKqSvk3hDyeeibobeWV4VEf62tqMk
// SIG // zgpOHwmSVOGwndw4f+j18Rp8W4g7M4Yxgwaj3pFFL0tG
// SIG // Fu+Umxm7vd3XeQAIJ0tZRXfbc/+KLiVihueu7HhvmJ8e
// SIG // fKzfTF2OMQ8jXmNgqUQEeHCZS84rgmZRyWWhOd2kuEej
// SIG // s13ZYwVyIiu+ibcIQ/xtmNN0ZjBPSxDlDYX+iBMP0zZM
// SIG // OBoHohOvA3aFBaP7F3HKwgCQuFvrrtI8c9OZah5rlGvf
// SIG // oYITSjCCE0YGCisGAQQBgjcDAwExghM2MIITMgYJKoZI
// SIG // hvcNAQcCoIITIzCCEx8CAQMxDzANBglghkgBZQMEAgEF
// SIG // ADCCAT0GCyqGSIb3DQEJEAEEoIIBLASCASgwggEkAgEB
// SIG // BgorBgEEAYRZCgMBMDEwDQYJYIZIAWUDBAIBBQAEILW4
// SIG // Szd/XsikHg5rzELdR9DWXfxOCv3ZO8aqpcifVwzJAgZb
// SIG // KpF+Z/4YEzIwMTgwNzAyMDMwMTM3LjE3NFowBwIBAYAC
// SIG // AfSggbmkgbYwgbMxCzAJBgNVBAYTAlVTMRMwEQYDVQQI
// SIG // EwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4w
// SIG // HAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xDTAL
// SIG // BgNVBAsTBE1PUFIxJzAlBgNVBAsTHm5DaXBoZXIgRFNF
// SIG // IEVTTjo1ODQ3LUY3NjEtNEY3MDElMCMGA1UEAxMcTWlj
// SIG // cm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaCCDs0wggTa
// SIG // MIIDwqADAgECAhMzAAAAszm71BKTFan+AAAAAACzMA0G
// SIG // CSqGSIb3DQEBCwUAMHwxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // JjAkBgNVBAMTHU1pY3Jvc29mdCBUaW1lLVN0YW1wIFBD
// SIG // QSAyMDEwMB4XDTE2MDkwNzE3NTY1OFoXDTE4MDkwNzE3
// SIG // NTY1OFowgbMxCzAJBgNVBAYTAlVTMRMwEQYDVQQIEwpX
// SIG // YXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25kMR4wHAYD
// SIG // VQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24xDTALBgNV
// SIG // BAsTBE1PUFIxJzAlBgNVBAsTHm5DaXBoZXIgRFNFIEVT
// SIG // Tjo1ODQ3LUY3NjEtNEY3MDElMCMGA1UEAxMcTWljcm9z
// SIG // b2Z0IFRpbWUtU3RhbXAgU2VydmljZTCCASIwDQYJKoZI
// SIG // hvcNAQEBBQADggEPADCCAQoCggEBAJ42eXjeuC/MHUn9
// SIG // fikiWJr2Ylp7yzldveklaHAmd8soj1xvNY6raNcUqYB4
// SIG // Ag9qssERi19kp2s7RBL3l4qWhD3fqn9haaKIBs4J9Inm
// SIG // hmZBhJQzwdYi81RYANo9Xv6wo4mmZ+yNPW7TLIF/aIvd
// SIG // 5UhMQ8kObht+DQLGugVqWwLUDnsrDfOqV5OcEkPxBfJY
// SIG // LY741QZMTcbLK1G8yWSE8PaVapWwM1hT1A5udRUivriz
// SIG // zWBbBA0JXphdAAsLAHFyd6YR4jLQ07bdqlUFg8aHQXw+
// SIG // GuoiFBAc6M7wkq7L+4x3oevEx9798fA8EDGm8H0SyGZa
// SIG // lbEjJss19jQYS6kiubUCAwEAAaOCARswggEXMB0GA1Ud
// SIG // DgQWBBTTXe3WW0qpaL5VZmRJh3PrF/AicDAfBgNVHSME
// SIG // GDAWgBTVYzpcijGQ80N7fEYbxTNoWoVtVTBWBgNVHR8E
// SIG // TzBNMEugSaBHhkVodHRwOi8vY3JsLm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NybC9wcm9kdWN0cy9NaWNUaW1TdGFQQ0Ff
// SIG // MjAxMC0wNy0wMS5jcmwwWgYIKwYBBQUHAQEETjBMMEoG
// SIG // CCsGAQUFBzAChj5odHRwOi8vd3d3Lm1pY3Jvc29mdC5j
// SIG // b20vcGtpL2NlcnRzL01pY1RpbVN0YVBDQV8yMDEwLTA3
// SIG // LTAxLmNydDAMBgNVHRMBAf8EAjAAMBMGA1UdJQQMMAoG
// SIG // CCsGAQUFBwMIMA0GCSqGSIb3DQEBCwUAA4IBAQAiV3uj
// SIG // VO9S7REMoDNF5DZ9GHJuELMAz2V1Gfb1gosbquVJTEFc
// SIG // e/9AO2gRa5aTVAVw4WzKAGNwOGsyzMybI8qI3yM7JHBD
// SIG // k1ni7fmpVW+nwxMgxQ5BMRwJphXdRltC6YUZwXWzVpn8
// SIG // cIleq9uuypIIL6EbTwICbjhvtuDzaVDfnizJvMclLGnZ
// SIG // tSavxDDupLOIwWu27IcS7eQUcgLEY2LBAOfKnLoTzZ55
// SIG // Q7imoSF7i16lFvrVXFKOK2Mg1Rsi4EJhVVnwkNXLc7W6
// SIG // B3p3aW2Y1zeZa1nbbt7vqGC0NM9t0mZUUwyKmuAiEIzA
// SIG // wzCZ3eQ5MuSLmNoqNiD5TBlmzynLMIIGcTCCBFmgAwIB
// SIG // AgIKYQmBKgAAAAAAAjANBgkqhkiG9w0BAQsFADCBiDEL
// SIG // MAkGA1UEBhMCVVMxEzARBgNVBAgTCldhc2hpbmd0b24x
// SIG // EDAOBgNVBAcTB1JlZG1vbmQxHjAcBgNVBAoTFU1pY3Jv
// SIG // c29mdCBDb3Jwb3JhdGlvbjEyMDAGA1UEAxMpTWljcm9z
// SIG // b2Z0IFJvb3QgQ2VydGlmaWNhdGUgQXV0aG9yaXR5IDIw
// SIG // MTAwHhcNMTAwNzAxMjEzNjU1WhcNMjUwNzAxMjE0NjU1
// SIG // WjB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2FzaGlu
// SIG // Z3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UEChMV
// SIG // TWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQDEx1N
// SIG // aWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMDCCASIw
// SIG // DQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKkdDbx3
// SIG // EYo6IOz8E5f1+n9plGt0VBDVpQoAgoX77XxoSyxfxcPl
// SIG // YcJ2tz5mK1vwFVMnBDEfQRsalR3OCROOfGEwWbEwRA/x
// SIG // YIiEVEMM1024OAizQt2TrNZzMFcmgqNFDdDq9UeBzb8k
// SIG // YDJYYEbyWEeGMoQedGFnkV+BVLHPk0ySwcSmXdFhE24o
// SIG // xhr5hoC732H8RsEnHSRnEnIaIYqvS2SJUGKxXf13Hz3w
// SIG // V3WsvYpCTUBR0Q+cBj5nf/VmwAOWRH7v0Ev9buWayrGo
// SIG // 8noqCjHw2k4GkbaICDXoeByw6ZnNPOcvRLqn9NxkvaQB
// SIG // wSAJk3jN/LzAyURdXhacAQVPIk0CAwEAAaOCAeYwggHi
// SIG // MBAGCSsGAQQBgjcVAQQDAgEAMB0GA1UdDgQWBBTVYzpc
// SIG // ijGQ80N7fEYbxTNoWoVtVTAZBgkrBgEEAYI3FAIEDB4K
// SIG // AFMAdQBiAEMAQTALBgNVHQ8EBAMCAYYwDwYDVR0TAQH/
// SIG // BAUwAwEB/zAfBgNVHSMEGDAWgBTV9lbLj+iiXGJo0T2U
// SIG // kFvXzpoYxDBWBgNVHR8ETzBNMEugSaBHhkVodHRwOi8v
// SIG // Y3JsLm1pY3Jvc29mdC5jb20vcGtpL2NybC9wcm9kdWN0
// SIG // cy9NaWNSb29DZXJBdXRfMjAxMC0wNi0yMy5jcmwwWgYI
// SIG // KwYBBQUHAQEETjBMMEoGCCsGAQUFBzAChj5odHRwOi8v
// SIG // d3d3Lm1pY3Jvc29mdC5jb20vcGtpL2NlcnRzL01pY1Jv
// SIG // b0NlckF1dF8yMDEwLTA2LTIzLmNydDCBoAYDVR0gAQH/
// SIG // BIGVMIGSMIGPBgkrBgEEAYI3LgMwgYEwPQYIKwYBBQUH
// SIG // AgEWMWh0dHA6Ly93d3cubWljcm9zb2Z0LmNvbS9QS0kv
// SIG // ZG9jcy9DUFMvZGVmYXVsdC5odG0wQAYIKwYBBQUHAgIw
// SIG // NB4yIB0ATABlAGcAYQBsAF8AUABvAGwAaQBjAHkAXwBT
// SIG // AHQAYQB0AGUAbQBlAG4AdAAuIB0wDQYJKoZIhvcNAQEL
// SIG // BQADggIBAAfmiFEN4sbgmD+BcQM9naOhIW+z66bM9TG+
// SIG // zwXiqf76V20ZMLPCxWbJat/15/B4vceoniXj+bzta1RX
// SIG // CCtRgkQS+7lTjMz0YBKKdsxAQEGb3FwX/1z5Xhc1mCRW
// SIG // S3TvQhDIr79/xn/yN31aPxzymXlKkVIArzgPF/UveYFl
// SIG // 2am1a+THzvbKegBvSzBEJCI8z+0DpZaPWSm8tv0E4XCf
// SIG // Mkon/VWvL/625Y4zu2JfmttXQOnxzplmkIz/amJ/3cVK
// SIG // C5Em4jnsGUpxY517IW3DnKOiPPp/fZZqkHimbdLhnPkd
// SIG // /DjYlPTGpQqWhqS9nhquBEKDuLWAmyI4ILUl5WTs9/S/
// SIG // fmNZJQ96LjlXdqJxqgaKD4kWumGnEcua2A5HmoDF0M2n
// SIG // 0O99g/DhO3EJ3110mCIIYdqwUB5vvfHhAN/nMQekkzr3
// SIG // ZUd46PioSKv33nJ+YWtvd6mBy6cJrDm77MbL2IK0cs0d
// SIG // 9LiFAR6A+xuJKlQ5slvayA1VmXqHczsI5pgt6o3gMy4S
// SIG // KfXAL1QnIffIrE7aKLixqduWsqdCosnPGUFN4Ib5Kpqj
// SIG // EWYw07t0MkvfY3v1mYovG8chr1m1rtxEPJdQcdeh0sVV
// SIG // 42neV8HR3jDA/czmTfsNv11P6Z0eGTgvvM9YBS7vDaBQ
// SIG // NdrvCScc1bN+NR4Iuto229Nfj950iEkSoYIDdjCCAl4C
// SIG // AQEwgeOhgbmkgbYwgbMxCzAJBgNVBAYTAlVTMRMwEQYD
// SIG // VQQIEwpXYXNoaW5ndG9uMRAwDgYDVQQHEwdSZWRtb25k
// SIG // MR4wHAYDVQQKExVNaWNyb3NvZnQgQ29ycG9yYXRpb24x
// SIG // DTALBgNVBAsTBE1PUFIxJzAlBgNVBAsTHm5DaXBoZXIg
// SIG // RFNFIEVTTjo1ODQ3LUY3NjEtNEY3MDElMCMGA1UEAxMc
// SIG // TWljcm9zb2Z0IFRpbWUtU3RhbXAgU2VydmljZaIlCgEB
// SIG // MAkGBSsOAwIaBQADFQC++cH02g8VP/CQAwO+eKWa2orc
// SIG // uaCBwjCBv6SBvDCBuTELMAkGA1UEBhMCVVMxEzARBgNV
// SIG // BAgTCldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQx
// SIG // HjAcBgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEN
// SIG // MAsGA1UECxMETU9QUjEnMCUGA1UECxMebkNpcGhlciBO
// SIG // VFMgRVNOOjRERTktMEM1RS0zRTA5MSswKQYDVQQDEyJN
// SIG // aWNyb3NvZnQgVGltZSBTb3VyY2UgTWFzdGVyIENsb2Nr
// SIG // MA0GCSqGSIb3DQEBBQUAAgUA3uOGaDAiGA8yMDE4MDcw
// SIG // MjAwNTcxMloYDzIwMTgwNzAzMDA1NzEyWjB0MDoGCisG
// SIG // AQQBhFkKBAExLDAqMAoCBQDe44ZoAgEAMAcCAQACAggi
// SIG // MAcCAQACAhgKMAoCBQDe5NfoAgEAMDYGCisGAQQBhFkK
// SIG // BAIxKDAmMAwGCisGAQQBhFkKAwGgCjAIAgEAAgMW42Ch
// SIG // CjAIAgEAAgMHoSAwDQYJKoZIhvcNAQEFBQADggEBAKMj
// SIG // At6I32AaqQ056hCzDOeD8LecW/ywXzHR1ZrkpsT+31IB
// SIG // Wm2x1Kp7UMATJVtUAC/xVv5Mu06RnoMtGv1GLdpAgUcI
// SIG // ZYjoc97UbP2mRJBovApgGVkVIOQkVZMvoTPbD5f+rR1A
// SIG // 34lyZdN7ggwx9EL79ClL2icXaKw1j2wob6v4PxfOkzfx
// SIG // iEXpphGoqjVtbF1SGhk9i8UCPXCb6ct/t/wgQTPWu3f0
// SIG // v+zRFXpVbLPsdpDL0q6GvLv759Y6fbb6bqLPcq9PJH19
// SIG // 3ZaQRZT1c9NEqustD4xfMNpXcDmtchl013e43wFVJqhR
// SIG // gcXGckW6jEPTCRZSJEsH+rjppzPEZnAxggL1MIIC8QIB
// SIG // ATCBkzB8MQswCQYDVQQGEwJVUzETMBEGA1UECBMKV2Fz
// SIG // aGluZ3RvbjEQMA4GA1UEBxMHUmVkbW9uZDEeMBwGA1UE
// SIG // ChMVTWljcm9zb2Z0IENvcnBvcmF0aW9uMSYwJAYDVQQD
// SIG // Ex1NaWNyb3NvZnQgVGltZS1TdGFtcCBQQ0EgMjAxMAIT
// SIG // MwAAALM5u9QSkxWp/gAAAAAAszANBglghkgBZQMEAgEF
// SIG // AKCCATIwGgYJKoZIhvcNAQkDMQ0GCyqGSIb3DQEJEAEE
// SIG // MC8GCSqGSIb3DQEJBDEiBCAEZDCy6lLBhN2EDFrNnL3I
// SIG // M4jcLm/Qkx+yYI9YLZcbyzCB4gYLKoZIhvcNAQkQAgwx
// SIG // gdIwgc8wgcwwgbEEFL75wfTaDxU/8JADA754pZraity5
// SIG // MIGYMIGApH4wfDELMAkGA1UEBhMCVVMxEzARBgNVBAgT
// SIG // Cldhc2hpbmd0b24xEDAOBgNVBAcTB1JlZG1vbmQxHjAc
// SIG // BgNVBAoTFU1pY3Jvc29mdCBDb3Jwb3JhdGlvbjEmMCQG
// SIG // A1UEAxMdTWljcm9zb2Z0IFRpbWUtU3RhbXAgUENBIDIw
// SIG // MTACEzMAAACzObvUEpMVqf4AAAAAALMwFgQUtoP1GCHI
// SIG // PhbKkOWfMXlzzoHGDHAwDQYJKoZIhvcNAQELBQAEggEA
// SIG // GW7jcbdC3vV9wd8x52OfV57bnR2ypOYTIq53Cdxato8d
// SIG // c5NmhPcpngOsUeXGyP/htKqO+FOqY3gFApe2V12gNs6R
// SIG // rqmhRbg0G1nB/DOB3gH6k4TlfO9/rnLEH3wv5Pmpessh
// SIG // rYatlrSHrBkFUX2zfwQjJUc65PSvALmahIr4X9mu+VzG
// SIG // UmKLOtF5genQiy6zdqUMc1/h21Ri+1NtRe6rW3BAq1MS
// SIG // NPTFhRpI1Oa0XHWhyTH89cmclGj1T3v8gjN7dT54SVKW
// SIG // OIaN6UJf8iwTB23JPlYm5LPRew4OD1fO/jev923DaJFg
// SIG // DtGA0OeZnT2P8nrX2CckeaZw9FaYQAiBSQ==
// SIG // End signature block
