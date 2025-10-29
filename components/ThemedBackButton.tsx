import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { TabBarIcon } from '@/components/ThemedIcon';
import { navigateBackWithFlow } from '@/utils/navigationHelper';
import axiosInstance from '@/utils/axiosInstance';
import { showWarning } from '@/utils/alertHelper';
import { useSelector } from '@/store';

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
  const selectedPI: any = useSelector((state) => state.selectedPI.data);

  const validateBAREntries = async (): Promise<boolean> => {
    try {
      // Get all codes from Code List that should have BAR entries
      const codeListResponse = await axiosInstance.get(`product/codeList?type=BAR&PIId=${selectedPI.PIId}`);
      const allCodes = codeListResponse.data.map((item: any) => item.code);
      
      // Get existing BAR entries
      const barResponse = await axiosInstance.get(`product/bar/${selectedPI.PIId}`);
      const existingBARCodes = barResponse.data.map((item: any) => item.code).filter((code: any) => code && code.trim() !== '');
      
      // Find missing codes
      const missingCodes = allCodes.filter((code: any) => !existingBARCodes.includes(code));
      
      if (missingCodes.length > 0) {
        showWarning(
          'Missing BAR Entries',
          `The following codes are missing BAR details:\n\n${missingCodes.join('\n')}\n\nPlease add BAR entries for all codes before exiting.`
        );
        return false; // Prevent navigation
      }
      
      return true; // Allow navigation
    } catch (error) {
      console.error('Error validating missing BAR entries:', error);
      return true; // Allow navigation if validation fails
    }
  };

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    // Validate BAR entries if on BAR edit page
    if (pathname?.includes('/product/bar/edit')) {
      const canNavigate = await validateBAREntries();
      if (!canNavigate) {
        return;
      }
    }

    // Navigate back
    navigateBackWithFlow(pathname);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress} 
      style={[styles.container, style]}
    >
      <TabBarIcon name="arrow-back" color={iconColor} size={iconSize} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
});

export default ThemedBackButton;
