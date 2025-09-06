import React from "react";
import { Animated } from "react-native";
export interface PosExtent {
    pos: number;
    extent: number;
}
export interface LayoutCache {
    [key: string]: PosExtent;
}
export interface ActiveData {
    key: string;
    index: number;
}
declare type ContextProps<T> = {
    activeData: ActiveData | null;
    keyExtractor: (item: T, index: number) => string;
    pan: Animated.Value;
    panIndex: number;
    layouts: LayoutCache;
    horizontal: boolean | null | undefined;
    children: React.ReactNode;
    dataGen: number;
};
export declare function DragListProvider<T>({ activeData, keyExtractor, pan, panIndex, layouts, horizontal, children, dataGen, }: ContextProps<T>): React.JSX.Element;
export declare function useDragListContext<T>(): Pick<ContextProps<T>, "activeData" | "keyExtractor" | "pan" | "panIndex" | "layouts" | "horizontal" | "dataGen">;
export {};
