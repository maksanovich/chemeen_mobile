import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { TabBarIcon } from '@/components/ThemedIcon';
import { navigateBackWithFlow } from '@/utils/navigationHelper';

interface ThemedBackButtonProps {
  onPress?: () => void;
  style?: any;
  iconColor?: string;
  iconSize?: number;
}

const ThemedBackButton: React.FC<ThemedBackButtonProps> = ({ 
  onPress, 
  style, 
  iconColor = '#fff',
  iconSize = 24 
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if(pathname === '/product') {
        router.replace('/')
      } else {
        // Use logical flow navigation
        navigateBackWithFlow(pathname);
      }
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.backButton, style]} 
      onPress={handlePress}
    >
      <TabBarIcon name="chevron-back-outline" color={iconColor} size={iconSize} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default ThemedBackButton;
