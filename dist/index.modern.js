import React, { useMemo, useContext, useRef, useState, useCallback, useLayoutEffect, useEffect } from 'react';
import { Animated, PanResponder, View, Easing, Platform, FlatList } from 'react-native';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (e.includes(n)) continue;
    t[n] = r[n];
  }
  return t;
}

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator"))) : "@@iterator";

const _asyncIteratorSymbol = /*#__PURE__*/ typeof Symbol !== "undefined" ? (Symbol.asyncIterator || (Symbol.asyncIterator = Symbol("Symbol.asyncIterator"))) : "@@asyncIterator";

// Asynchronously await a promise and pass the result to a finally continuation
function _finallyRethrows(body, finalizer) {
	try {
		var result = body();
	} catch (e) {
		return finalizer(true, e);
	}
	if (result && result.then) {
		return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
	}
	return finalizer(false, result);
}

var DragListContext = React.createContext(undefined);
function DragListProvider(_ref) {
  var activeData = _ref.activeData,
    keyExtractor = _ref.keyExtractor,
    pan = _ref.pan,
    panIndex = _ref.panIndex,
    layouts = _ref.layouts,
    horizontal = _ref.horizontal,
    children = _ref.children,
    dataGen = _ref.dataGen;
  var value = useMemo(function () {
    return {
      activeData: activeData,
      keyExtractor: keyExtractor,
      pan: pan,
      panIndex: panIndex,
      layouts: layouts,
      horizontal: horizontal,
      dataGen: dataGen
    };
  }, [activeData, keyExtractor, pan, panIndex, layouts, horizontal, dataGen]);
  return React.createElement(DragListContext.Provider, {
    value: value
  }, children);
}
function useDragListContext() {
  var value = useContext(DragListContext);
  if (!value) {
    throw new Error("useDragListContext must be called within DragListProvider");
  }
  return value;
}

var _excluded = ["containerStyle", "data", "keyExtractor", "onDragBegin", "onDragEnd", "onScroll", "onLayout", "renderItem", "CustomFlatList"],
  _excluded2 = ["item", "index", "children", "onLayout"];
function DragListImpl(props, _ref) {
  var _activeDataRef$curren, _activeDataRef$curren2;
  var containerStyle = props.containerStyle,
    data = props.data,
    keyExtractor = props.keyExtractor,
    onDragBegin = props.onDragBegin,
    onDragEnd = props.onDragEnd,
    onScroll = props.onScroll,
    onLayout = props.onLayout,
    _props$CustomFlatList = props.CustomFlatList,
    CustomFlatList = _props$CustomFlatList === void 0 ? FlatList : _props$CustomFlatList,
    rest = _objectWithoutPropertiesLoose(props, _excluded);
  var activeDataRef = useRef(null);
  var isReorderingRef = useRef(false);
  var panIndex = useRef(-1);
  var _useState = useState({
      activeKey: (_activeDataRef$curren = (_activeDataRef$curren2 = activeDataRef.current) === null || _activeDataRef$curren2 === void 0 ? void 0 : _activeDataRef$curren2.key) != null ? _activeDataRef$curren : null,
      panIndex: -1
    }),
    extra = _useState[0],
    setExtra = _useState[1];
  var layouts = useRef({}).current;
  var panGrantedRef = useRef(false);
  var grantScrollPosRef = useRef(0);
  var grantActiveCenterOffsetRef = useRef(0);
  var autoScrollTimerRef = useRef(null);
  var hoverRef = useRef(props.onHoverChanged);
  hoverRef.current = props.onHoverChanged;
  var reorderRef = useRef(props.onReordered);
  reorderRef.current = props.onReordered;
  var keyExtractorRef = useRef(keyExtractor);
  keyExtractorRef.current = keyExtractor;
  var dataRef = useRef(data);
  dataRef.current = data;
  var lastDataRef = useRef(data);
  var dataGenRef = useRef(0);
  var flatRef = useRef(null);
  var flatWrapRef = useRef(null);
  var flatWrapLayout = useRef({
    pos: 0,
    extent: 1
  });
  var flatWrapRefPosUpdatedRef = useRef(false);
  var scrollPos = useRef(0);
  var pan = useRef(new Animated.Value(0)).current;
  var setPan = useCallback(function (value) {
    Animated.timing(pan, {
      duration: 0,
      toValue: value,
      useNativeDriver: true
    }).start();
  }, [pan]);
  var shouldCapturePan = useCallback(function () {
    return !!activeDataRef.current && !isReorderingRef.current;
  }, []);
  var onPanResponderGrant = useCallback(function (_, gestate) {
    var _flatWrapRef$current;
    grantScrollPosRef.current = scrollPos.current;
    setPan(0);
    panGrantedRef.current = true;
    flatWrapRefPosUpdatedRef.current = false;
    (_flatWrapRef$current = flatWrapRef.current) === null || _flatWrapRef$current === void 0 ? void 0 : _flatWrapRef$current.measure(function (_x, _y, _width, _height, pageX, pageY) {
      flatWrapLayout.current = _extends({}, flatWrapLayout.current, {
        pos: props.horizontal ? pageX : pageY
      });
      if (activeDataRef.current && layouts.hasOwnProperty(activeDataRef.current.key)) {
        var itemLayout = layouts[activeDataRef.current.key];
        var screenPos = props.horizontal ? gestate.x0 : gestate.y0;
        var clientViewPos = screenPos - flatWrapLayout.current.pos;
        var clientPos = clientViewPos + scrollPos.current;
        var posOnActiveItem = clientPos - itemLayout.pos;
        grantActiveCenterOffsetRef.current = itemLayout.extent / 2 - posOnActiveItem;
      } else {
        grantActiveCenterOffsetRef.current = 0;
      }
      flatWrapRefPosUpdatedRef.current = true;
    });
    onDragBegin === null || onDragBegin === void 0 ? void 0 : onDragBegin();
  }, []);
  var onPanResponderMove = useCallback(function (_, gestate) {
    clearAutoScrollTimer();
    if (!flatWrapRefPosUpdatedRef.current || !activeDataRef.current || !layouts.hasOwnProperty(activeDataRef.current.key)) {
      return;
    }
    var posOrigin = props.horizontal ? gestate.x0 : gestate.y0;
    var pos = props.horizontal ? gestate.dx : gestate.dy;
    var wrapPos = posOrigin + pos - flatWrapLayout.current.pos;
    function updateRendering() {
      var movedAmount = props.horizontal ? gestate.dx : gestate.dy;
      var panAmount = scrollPos.current - grantScrollPosRef.current + movedAmount;
      setPan(panAmount);
      var clientPos = wrapPos + scrollPos.current;
      var curIndex = 0;
      var key;
      while (curIndex < dataRef.current.length && layouts.hasOwnProperty(key = keyExtractorRef.current(dataRef.current[curIndex], curIndex)) && layouts[key].pos + layouts[key].extent < clientPos + grantActiveCenterOffsetRef.current) {
        curIndex++;
      }
      if (panIndex.current != curIndex) {
        var _hoverRef$current;
        setExtra(_extends({}, extra, {
          panIndex: curIndex
        }));
        (_hoverRef$current = hoverRef.current) === null || _hoverRef$current === void 0 ? void 0 : _hoverRef$current.call(hoverRef, curIndex);
        panIndex.current = curIndex;
      }
    }
    var dragItemExtent = layouts[activeDataRef.current.key].extent;
    var leadingEdge = wrapPos - dragItemExtent / 2;
    var trailingEdge = wrapPos + dragItemExtent / 2;
    var offset = 0;
    if (leadingEdge < 0) {
      offset = -dragItemExtent;
    } else if (trailingEdge > flatWrapLayout.current.extent) {
      offset = dragItemExtent;
    }
    if (offset !== 0) {
      var scrollOnce = function scrollOnce(distance) {
        var _flatRef$current;
        (_flatRef$current = flatRef.current) === null || _flatRef$current === void 0 ? void 0 : _flatRef$current.scrollToOffset({
          animated: true,
          offset: Math.max(0, scrollPos.current + distance)
        });
        updateRendering();
      };
      scrollOnce(offset);
      autoScrollTimerRef.current = setInterval(function () {
        scrollOnce(offset);
      }, AUTO_SCROLL_MILLIS);
    } else {
      updateRendering();
    }
  }, []);
  var onPanResponderRelease = useCallback(function (_, _gestate) {
    try {
      var _activeDataRef$curren3;
      var activeIndex = (_activeDataRef$curren3 = activeDataRef.current) === null || _activeDataRef$curren3 === void 0 ? void 0 : _activeDataRef$curren3.index;
      clearAutoScrollTimer();
      onDragEnd === null || onDragEnd === void 0 ? void 0 : onDragEnd();
      var _temp2 = function () {
        if (activeIndex != null && activeIndex !== panIndex.current && !(activeIndex === dataRef.current.length - 1 && panIndex.current > activeIndex)) {
          var _temp = _finallyRethrows(function () {
            var _reorderRef$current;
            isReorderingRef.current = true;
            return Promise.resolve((_reorderRef$current = reorderRef.current) === null || _reorderRef$current === void 0 ? void 0 : _reorderRef$current.call(reorderRef, activeIndex, panIndex.current)).then(function () {});
          }, function (_wasThrown, _result) {
            isReorderingRef.current = false;
            if (_wasThrown) throw _result;
            return _result;
          });
          if (_temp && _temp.then) return _temp.then(function () {});
        } else {
          reset();
        }
      }();
      return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  }, []);
  var panResponder = useRef(PanResponder.create({
    onStartShouldSetPanResponderCapture: shouldCapturePan,
    onStartShouldSetPanResponder: shouldCapturePan,
    onMoveShouldSetPanResponder: shouldCapturePan,
    onMoveShouldSetPanResponderCapture: shouldCapturePan,
    onPanResponderGrant: onPanResponderGrant,
    onPanResponderMove: onPanResponderMove,
    onPanResponderRelease: onPanResponderRelease
  })).current;
  var clearAutoScrollTimer = useCallback(function () {
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current);
      autoScrollTimerRef.current = null;
    }
  }, []);
  var reset = useCallback(function (shouldSetExtra) {
    if (shouldSetExtra === void 0) {
      shouldSetExtra = true;
    }
    activeDataRef.current = null;
    panIndex.current = -1;
    if (shouldSetExtra) {
      setExtra({
        activeKey: null,
        panIndex: -1,
        detritus: Math.random().toString()
      });
    }
    panGrantedRef.current = false;
    grantActiveCenterOffsetRef.current = 0;
    clearAutoScrollTimer();
  }, []);
  if (lastDataRef.current !== data) {
    lastDataRef.current = data;
    dataGenRef.current++;
    reset(false);
  }
  useLayoutEffect(function () {
    setPan(0);
  }, [data]);
  var renderDragItem = useCallback(function (info) {
    var _activeDataRef$curren4;
    var key = keyExtractorRef.current(info.item, info.index);
    var isActive = key === ((_activeDataRef$curren4 = activeDataRef.current) === null || _activeDataRef$curren4 === void 0 ? void 0 : _activeDataRef$curren4.key);
    var onDragStart = function onDragStart() {
      if (data.length > 1) {
        activeDataRef.current = {
          index: info.index,
          key: key
        };
        panIndex.current = info.index;
        setExtra({
          activeKey: key,
          panIndex: info.index
        });
      }
    };
    var onDragEnd = function onDragEnd() {
      if (activeDataRef.current && !panGrantedRef.current) {
        reset();
      }
    };
    return props.renderItem(_extends({}, info, {
      onDragStart: onDragStart,
      onStartDrag: onDragStart,
      onDragEnd: onDragEnd,
      onEndDrag: onDragEnd,
      isActive: isActive
    }));
  }, [props.renderItem, data.length]);
  var onDragScroll = useCallback(function (event) {
    scrollPos.current = props.horizontal ? event.nativeEvent.contentOffset.x : event.nativeEvent.contentOffset.y;
    if (onScroll) {
      onScroll(event);
    }
  }, [onScroll]);
  var onDragLayout = useCallback(function (evt) {
    var _flatWrapRef$current2;
    (_flatWrapRef$current2 = flatWrapRef.current) === null || _flatWrapRef$current2 === void 0 ? void 0 : _flatWrapRef$current2.measure(function (_x, _y, width, height, pageX, pageY) {
      flatWrapLayout.current = props.horizontal ? {
        pos: pageX,
        extent: width
      } : {
        pos: pageY,
        extent: height
      };
    });
    if (onLayout) {
      onLayout(evt);
    }
  }, [onLayout]);
  return React.createElement(DragListProvider, {
    activeData: activeDataRef.current,
    keyExtractor: keyExtractorRef.current,
    pan: pan,
    panIndex: panIndex.current,
    layouts: layouts,
    horizontal: props.horizontal,
    dataGen: dataGenRef.current
  }, React.createElement(View, Object.assign({
    ref: flatWrapRef,
    style: containerStyle
  }, panResponder.panHandlers, {
    onLayout: onDragLayout
  }), React.createElement(CustomFlatList, Object.assign({
    ref: function ref(r) {
      flatRef.current = r;
      if (!!_ref) {
        if (typeof _ref === "function") {
          _ref(r);
        } else {
          _ref.current = r;
        }
      }
    },
    data: data,
    renderItem: renderDragItem,
    CellRendererComponent: CellRendererComponent,
    extraData: extra,
    scrollEnabled: !activeDataRef.current,
    onScroll: onDragScroll,
    scrollEventThrottle: 16,
    removeClippedSubviews: false
  }, rest))));
}
var SLIDE_MILLIS = 200;
var AUTO_SCROLL_MILLIS = 200;
var ANIM_VALUE_ZERO = new Animated.Value(0);
var ANIM_VALUE_ONE = new Animated.Value(1);
var ANIM_VALUE_NINER = new Animated.Value(999);
function CellRendererComponent(props) {
  var item = props.item,
    index = props.index,
    children = props.children,
    onLayout = props.onLayout,
    rest = _objectWithoutPropertiesLoose(props, _excluded2);
  var _useDragListContext = useDragListContext(),
    keyExtractor = _useDragListContext.keyExtractor,
    activeData = _useDragListContext.activeData,
    pan = _useDragListContext.pan,
    panIndex = _useDragListContext.panIndex,
    layouts = _useDragListContext.layouts,
    horizontal = _useDragListContext.horizontal,
    dataGen = _useDragListContext.dataGen;
  var cellRef = useRef(null);
  var key = keyExtractor(item, index);
  var isActive = key === (activeData === null || activeData === void 0 ? void 0 : activeData.key);
  var anim = useRef(new Animated.Value(0)).current;
  var style = useMemo(function () {
    return [props.style, isActive ? {
      elevation: ANIM_VALUE_ONE,
      zIndex: ANIM_VALUE_NINER,
      transform: [horizontal ? {
        translateX: pan
      } : {
        translateY: pan
      }]
    } : {
      elevation: ANIM_VALUE_ZERO,
      zIndex: ANIM_VALUE_ZERO,
      transform: [horizontal ? {
        translateX: anim
      } : {
        translateY: anim
      }]
    }];
  }, [props.style, isActive, horizontal, pan, anim]);
  var onCellLayout = useCallback(function (evt) {
    if (onLayout) {
      onLayout(evt);
    }
    var layout = evt.nativeEvent.layout;
    layouts[key] = horizontal ? {
      pos: layout.x,
      extent: layout.width
    } : {
      pos: layout.y,
      extent: layout.height
    };
  }, [onLayout, horizontal, key, layouts]);
  useEffect(function () {
    if (activeData != null) {
      var activeKey = activeData.key;
      var activeIndex = activeData.index;
      if (!isActive && layouts.hasOwnProperty(activeKey)) {
        if (index >= panIndex && index <= activeIndex) {
          return Animated.timing(anim, {
            duration: SLIDE_MILLIS,
            easing: Easing.inOut(Easing.linear),
            toValue: layouts[activeKey].extent,
            useNativeDriver: true
          }).start();
        } else if (index >= activeIndex && index <= panIndex) {
          return Animated.timing(anim, {
            duration: SLIDE_MILLIS,
            easing: Easing.inOut(Easing.linear),
            toValue: -layouts[activeKey].extent,
            useNativeDriver: true
          }).start();
        }
      }
    }
    return Animated.timing(anim, {
      duration: activeData !== null && activeData !== void 0 && activeData.key ? SLIDE_MILLIS : 0,
      easing: Easing.inOut(Easing.linear),
      toValue: 0,
      useNativeDriver: true
    }).start();
  }, [index, panIndex, activeData]);
  useLayoutEffect(function () {
    Animated.timing(anim, {
      duration: 0,
      toValue: 0,
      useNativeDriver: true
    }).start();
  }, [dataGen]);
  if (Platform.OS == "web") {
    useEffect(function () {
      var _cellRef$current;
      (_cellRef$current = cellRef.current) === null || _cellRef$current === void 0 ? void 0 : _cellRef$current.measure(function (x, y, w, h) {
        layouts[key] = horizontal ? {
          pos: x,
          extent: w
        } : {
          pos: y,
          extent: h
        };
      });
    }, [index]);
  }
  return React.createElement(Animated.View, Object.assign({}, rest, {
    style: style,
    onLayout: onCellLayout,
    ref: cellRef,
    key: key
  }), children);
}
var DragList = React.forwardRef(DragListImpl);

export default DragList;
//# sourceMappingURL=index.modern.js.map
