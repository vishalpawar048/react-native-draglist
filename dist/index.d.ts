import React from "react";
import { FlatList, FlatListProps, LayoutChangeEvent, ListRenderItemInfo, NativeScrollEvent, NativeSyntheticEvent, StyleProp, ViewStyle } from "react-native";
export interface DragListRenderItemInfo<T> extends ListRenderItemInfo<T> {
    /**
     * Call this function whenever you detect a drag motion starting.
     */
    onDragStart: () => void;
    /**
     * Call this function whenever a drag motion ends (e.g. onPressOut)
     */
    onDragEnd: () => void;
    /**
     * @deprecated Use onDragStart instead
     * @see onDragStart
     */
    onStartDrag: () => void;
    /**
     * @deprecated Use onDragEnd instead
     * @see onDragEnd
     */
    onEndDrag: () => void;
    /**
     * Whether the item is being dragged at the moment.
     */
    isActive: boolean;
}
interface Props<T> extends Omit<FlatListProps<T>, "renderItem"> {
    data: T[];
    keyExtractor: (item: T, index: number) => string;
    renderItem: (info: DragListRenderItemInfo<T>) => React.ReactElement | null;
    containerStyle?: StyleProp<ViewStyle>;
    onDragBegin?: () => void;
    onDragEnd?: () => void;
    onHoverChanged?: (hoverIndex: number) => Promise<void> | void;
    onReordered?: (fromIndex: number, toIndex: number) => Promise<void> | void;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onLayout?: (e: LayoutChangeEvent) => void;
    CustomFlatList?: typeof FlatList;
}
declare const DragList: <T>(props: Props<T> & {
    ref?: ((instance: FlatList<T> | null) => void) | React.MutableRefObject<FlatList<T> | null> | null | undefined;
}) => React.ReactElement;
export default DragList;
