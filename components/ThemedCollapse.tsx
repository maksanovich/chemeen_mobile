import React, { useState } from "react";
import { LayoutChangeEvent, View, Text } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export const ThemedCollapse = ({
    children,
    expanded,
}: {
    children: React.ReactNode;
    expanded: boolean;
}) => {
    const [height, setHeight] = useState(0);
    const animatedHeight = useSharedValue(0);

    const onLayout = (event: LayoutChangeEvent) => {
        const onLayoutHeight = event.nativeEvent.layout.height;

        if (onLayoutHeight > 0 && height !== onLayoutHeight) {
            setHeight(onLayoutHeight);
        }
    };

    const collapsableStyle = useAnimatedStyle(() => {
        animatedHeight.value = expanded ? withTiming(height) : withTiming(0);

        return {
            height: animatedHeight.value,
        };
    }, [expanded]);

    return (
        <Animated.View style={[collapsableStyle, { overflow: "hidden" }]}>
            <View style={{ position: "absolute", width: '100%' }} onLayout={onLayout}>
                {children}
            </View>
        </Animated.View>
    );
};